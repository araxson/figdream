import { createClient } from "@/lib/supabase/server";
import type {
  SchedulesFilter,
  schedulesResponse,
  DateRange,
  StaffAvailability,
  AvailableSlot,
  ScheduleConflict,
  WorkingHours,
  DayOfWeek,
  SchedulingCriteria
} from "./schedules-types";

// ===============================
// CORE AVAILABILITY CALCULATION
// ===============================

/**
 * Calculate comprehensive staff availability with conflict detection
 */
export async function getStaffAvailability(
  staffId: string,
  dateRange: DateRange
): Promise<StaffAvailability> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    // Get staff working hours
    const workingHours = await getStaffWorkingHours(staffId, dateRange);

    // Get existing appointments in date range
    const existingAppointments = await getStaffAppointments(staffId, dateRange);

    // Get blocked times (time off, breaks, etc.)
    const blockedTimes = await getStaffBlockedTimes(staffId, dateRange);

    // Get time off requests
    const timeOffRequests = await getApprovedTimeOff(staffId, dateRange);

    // Calculate available slots for each day
    const availableSlots: AvailableSlot[] = [];
    const conflicts: ScheduleConflict[] = [];

    let totalHours = 0;
    let bookedHours = 0;
    let breakHours = 0;

    const currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      const dayOfWeek = getDayOfWeek(currentDate);
      const dayWorkingHours = workingHours.find(wh => wh.day === dayOfWeek);

      if (dayWorkingHours && dayWorkingHours.isWorking) {
        const daySlots = calculateDayAvailability(
          currentDate,
          dayWorkingHours,
          existingAppointments,
          blockedTimes,
          timeOffRequests,
          staffId
        );

        availableSlots.push(...daySlots.availableSlots);
        conflicts.push(...daySlots.conflicts);

        totalHours += daySlots.totalHours;
        bookedHours += daySlots.bookedHours;
        breakHours += daySlots.breakHours;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      staffId,
      date: dateRange.start,
      availableSlots,
      totalHours,
      bookedHours,
      breakHours,
      isAvailable: availableSlots.length > 0,
      conflicts
    };
  } catch (error) {
    console.error('Error calculating staff availability:', error);
    throw new Error('Failed to calculate availability');
  }
}

/**
 * Detect schedule conflicts for a proposed appointment
 */
export async function detectScheduleConflicts(
  appointmentData: {
    staffId: string;
    startTime: Date;
    endTime: Date;
    serviceId: string;
    salonId: string;
  }
): Promise<ScheduleConflict[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const conflicts: ScheduleConflict[] = [];
  const { staffId, startTime, endTime, salonId } = appointmentData;

  try {
    // Check for double bookings
    const doubleBookings = await checkDoubleBookings(staffId, startTime, endTime);
    if (doubleBookings.length > 0) {
      conflicts.push({
        id: crypto.randomUUID(),
        type: "double_booking",
        severity: "critical",
        staffId,
        appointmentIds: doubleBookings,
        timeRange: { start: startTime, end: endTime },
        description: `Staff member has ${doubleBookings.length} conflicting appointments`,
        suggestedResolutions: await generateDoubleBookingResolutions(doubleBookings, appointmentData),
        autoResolvable: false,
        createdAt: new Date()
      });
    }

    // Check working hours violations
    const workingHoursConflict = await checkWorkingHoursViolation(staffId, startTime, endTime);
    if (workingHoursConflict) {
      conflicts.push(workingHoursConflict);
    }

    // Check time off conflicts
    const timeOffConflicts = await checkTimeOffConflicts(staffId, startTime, endTime);
    conflicts.push(...timeOffConflicts);

    // Check break time conflicts
    const breakConflicts = await checkBreakTimeConflicts(staffId, startTime, endTime);
    conflicts.push(...breakConflicts);

    // Check resource conflicts (if applicable)
    const resourceConflicts = await checkResourceConflicts(salonId, startTime, endTime);
    conflicts.push(...resourceConflicts);

    return conflicts;
  } catch (error) {
    console.error('Error detecting conflicts:', error);
    throw new Error('Failed to detect schedule conflicts');
  }
}

/**
 * Suggest optimal appointment slots based on criteria
 */
export async function suggestOptimalSlots(
  criteria: SchedulingCriteria
): Promise<AvailableSlot[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    // Get all staff members for the salon
    const { data: staffMembers } = await supabase
      .from('staff_profiles')
      .select('user_id, id')
      .eq('salon_id', criteria.salonId)
      .eq('is_active', true)
      .eq('is_bookable', true);

    if (!staffMembers?.length) {
      return [];
    }

    const allSlots: AvailableSlot[] = [];

    // Get availability for each staff member
    for (const staff of staffMembers) {
      const staffId = staff.user_id || staff.id;
      if (staffId) {
        const availability = await getStaffAvailability(staffId, criteria.dateRange);
        allSlots.push(...availability.availableSlots);
      }
    }

    // Apply optimization criteria
    const optimizedSlots = await optimizeSlotSelection(allSlots, criteria);

    // Sort by optimization score
    return optimizedSlots.sort((a, b) =>
      calculateSlotScore(b, criteria) - calculateSlotScore(a, criteria)
    );
  } catch (error) {
    console.error('Error suggesting optimal slots:', error);
    throw new Error('Failed to suggest optimal slots');
  }
}

// ===============================
// HELPER FUNCTIONS
// ===============================

async function getStaffWorkingHours(staffId: string, dateRange: DateRange): Promise<WorkingHours[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .eq('is_active', true)
    .or(`effective_from.is.null,effective_from.lte.${dateRange.start.toISOString().split('T')[0]}`)
    .or(`effective_until.is.null,effective_until.gte.${dateRange.end.toISOString().split('T')[0]}`);

  return (data || []).map(schedule => ({
    day: schedule.day_of_week as DayOfWeek,
    start: schedule.start_time || '09:00',
    end: schedule.end_time || '17:00',
    breakStart: schedule.break_start || undefined,
    breakEnd: schedule.break_end || undefined,
    isWorking: schedule.is_active !== false
  }));
}

async function getStaffAppointments(staffId: string, dateRange: DateRange) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('appointments')
    .select('id, start_time, end_time, status')
    .eq('staff_id', staffId)
    .gte('start_time', dateRange.start.toISOString())
    .lte('end_time', dateRange.end.toISOString())
    .not('status', 'eq', 'cancelled');

  return data || [];
}

async function getStaffBlockedTimes(staffId: string, dateRange: DateRange) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('blocked_times')
    .select('*')
    .eq('staff_id', staffId)
    .eq('is_active', true)
    .gte('start_time', dateRange.start.toISOString())
    .lte('end_time', dateRange.end.toISOString());

  return data || [];
}

async function getApprovedTimeOff(staffId: string, dateRange: DateRange) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('time_off_requests')
    .select('*')
    .eq('staff_id', staffId)
    .eq('status', 'approved')
    .gte('start_date', dateRange.start.toISOString().split('T')[0])
    .lte('end_date', dateRange.end.toISOString().split('T')[0]);

  return data || [];
}

function calculateDayAvailability(
  date: Date,
  workingHours: WorkingHours,
  appointments: Array<Record<string, unknown>>,
  blockedTimes: Array<Record<string, unknown>>,
  timeOffRequests: Array<Record<string, unknown>>,
  staffId: string
) {
  const availableSlots: AvailableSlot[] = [];
  const conflicts: ScheduleConflict[] = [];

  // Check if day is blocked by time off
  const dateStr = date.toISOString().split('T')[0];
  const hasTimeOff = timeOffRequests.some(timeOff =>
    dateStr >= timeOff.start_date && dateStr <= timeOff.end_date
  );

  if (hasTimeOff) {
    return { availableSlots: [], conflicts: [], totalHours: 0, bookedHours: 0, breakHours: 0 };
  }

  // Calculate total working hours
  const startTime = new Date(`${dateStr}T${workingHours.start}`);
  const endTime = new Date(`${dateStr}T${workingHours.end}`);
  const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

  // Calculate break hours
  let breakHours = 0;
  if (workingHours.breakStart && workingHours.breakEnd) {
    const breakStart = new Date(`${dateStr}T${workingHours.breakStart}`);
    const breakEnd = new Date(`${dateStr}T${workingHours.breakEnd}`);
    breakHours = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
  }

  // Get day's appointments and blocked times
  const dayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.start_time).toISOString().split('T')[0];
    return aptDate === dateStr;
  });

  const dayBlockedTimes = blockedTimes.filter(bt => {
    const btDate = new Date(bt.start_time).toISOString().split('T')[0];
    return btDate === dateStr;
  });

  // Calculate booked hours
  const bookedHours = dayAppointments.reduce((total, apt) => {
    const aptStart = new Date(apt.start_time);
    const aptEnd = new Date(apt.end_time);
    return total + (aptEnd.getTime() - aptStart.getTime()) / (1000 * 60 * 60);
  }, 0);

  // Generate available slots (simplified - would need more complex logic for real implementation)
  const slotDuration = 30; // 30-minute slots
  let currentSlot = new Date(startTime);

  while (currentSlot < endTime) {
    const slotEnd = new Date(currentSlot.getTime() + slotDuration * 60 * 1000);

    // Check if slot conflicts with appointments or blocked times
    const hasConflict = dayAppointments.some(apt =>
      (currentSlot >= new Date(apt.start_time) && currentSlot < new Date(apt.end_time)) ||
      (slotEnd > new Date(apt.start_time) && slotEnd <= new Date(apt.end_time))
    ) || dayBlockedTimes.some(bt =>
      (currentSlot >= new Date(bt.start_time) && currentSlot < new Date(bt.end_time)) ||
      (slotEnd > new Date(bt.start_time) && slotEnd <= new Date(bt.end_time))
    );

    if (!hasConflict) {
      availableSlots.push({
        start: new Date(currentSlot),
        end: new Date(slotEnd),
        duration: slotDuration,
        staffId,
        bufferBefore: 15,
        bufferAfter: 15
      });
    }

    currentSlot = new Date(currentSlot.getTime() + slotDuration * 60 * 1000);
  }

  return { availableSlots, conflicts, totalHours, bookedHours, breakHours };
}

function getDayOfWeek(date: Date): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

async function checkDoubleBookings(staffId: string, startTime: Date, endTime: Date): Promise<string[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('appointments')
    .select('id')
    .eq('staff_id', staffId)
    .not('status', 'eq', 'cancelled')
    .or(`start_time.lt.${endTime.toISOString()},end_time.gt.${startTime.toISOString()}`);

  return (data || []).map(apt => apt.id ?? '').filter(id => id !== '');
}

function checkWorkingHoursViolation(_staffId: string, _startTime: Date, _endTime: Date): Promise<ScheduleConflict | null> {
  // Implementation would check if appointment falls outside working hours
  return Promise.resolve(null);
}

function checkTimeOffConflicts(_staffId: string, _startTime: Date, _endTime: Date): Promise<ScheduleConflict[]> {
  // Implementation would check against approved time off
  return Promise.resolve([]);
}

function checkBreakTimeConflicts(_staffId: string, _startTime: Date, _endTime: Date): Promise<ScheduleConflict[]> {
  // Implementation would check against scheduled breaks
  return Promise.resolve([]);
}

function checkResourceConflicts(_salonId: string, _startTime: Date, _endTime: Date): Promise<ScheduleConflict[]> {
  // Implementation would check for room/chair/station conflicts
  return Promise.resolve([]);
}

function generateDoubleBookingResolutions(_conflictingAppointments: string[], _appointmentData: Record<string, unknown>) {
  // Implementation would generate resolution suggestions
  return [];
}

function optimizeSlotSelection(slots: AvailableSlot[], _criteria: SchedulingCriteria): Promise<AvailableSlot[]> {
  // Implementation would apply optimization criteria
  return Promise.resolve(slots);
}

function calculateSlotScore(_slot: AvailableSlot, _criteria: SchedulingCriteria): number {
  // Implementation would calculate optimization score for slot
  return Math.random(); // Placeholder
}

// ===============================
// LEGACY COMPATIBILITY
// ===============================

export async function getScheduless(
  filter: SchedulesFilter = {},
): Promise<schedulesResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return {
    data: [],
    total: 0,
    page: filter.page || 1,
    pageSize: filter.pageSize || 50,
  };
}

export async function getSchedulesById(_id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return null;
}
