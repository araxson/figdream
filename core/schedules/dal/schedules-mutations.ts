import { createClient } from "@/lib/supabase/server";
import type {
  schedulesData,
  ScheduleConflict,
  ConflictResolution,
  OptimizationResult,
  SchedulingCriteria,
  PendingAppointment,
  ScheduleChange,
  OptimizationMetrics,
  DateRange,
  StaffScheduleInsert,
  StaffScheduleUpdate,
  BlockedTimeInsert,
  BlockedTimeUpdate,
  TimeOffRequestInsert,
  TimeOffRequestUpdate
} from "./schedules-types";
import { detectScheduleConflicts } from "./schedules-queries";

// ===============================
// CONFLICT RESOLUTION ACTIONS
// ===============================

/**
 * Resolve a schedule conflict using the specified resolution strategy
 */
export async function resolveScheduleConflict(
  conflictId: string,
  resolution: ConflictResolution
): Promise<{ success: boolean; newConflicts: ScheduleConflict[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    let success = false;
    let newConflicts: ScheduleConflict[] = [];

    switch (resolution.type) {
      case "reschedule_appointment":
        const rescheduleResult = await rescheduleAppointment(resolution.parameters as { appointmentId: string; newTime: string; staffId?: string });
        success = rescheduleResult.success;
        newConflicts = rescheduleResult.newConflicts;
        break;

      case "reassign_staff":
        const reassignResult = await reassignStaff(resolution.parameters as { appointmentId: string; newStaffId: string });
        success = reassignResult.success;
        newConflicts = reassignResult.newConflicts;
        break;

      case "split_appointment":
        const splitResult = await splitAppointment(resolution.parameters);
        success = splitResult.success;
        newConflicts = splitResult.newConflicts;
        break;

      case "extend_working_hours":
        const extendResult = await extendWorkingHours(resolution.parameters);
        success = extendResult.success;
        newConflicts = extendResult.newConflicts;
        break;

      case "add_staff_break":
        const breakResult = await addStaffBreak(resolution.parameters);
        success = breakResult.success;
        newConflicts = breakResult.newConflicts;
        break;

      case "cancel_appointment":
        const cancelResult = await cancelAppointment(resolution.parameters);
        success = cancelResult.success;
        newConflicts = cancelResult.newConflicts;
        break;

      case "book_different_resource":
        const resourceResult = await bookDifferentResource(resolution.parameters);
        success = resourceResult.success;
        newConflicts = resourceResult.newConflicts;
        break;

      default:
        throw new Error(`Unknown resolution type: ${resolution.type}`);
    }

    return { success, newConflicts };
  } catch (error) {
    console.error('Error resolving conflict:', error);
    throw new Error('Failed to resolve schedule conflict');
  }
}

/**
 * Optimize schedule for a salon on a specific date range
 */
export async function optimizeSchedule(
  salonId: string,
  dateRange: DateRange,
  criteria?: SchedulingCriteria
): Promise<OptimizationResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const startTime = Date.now();

  try {
    // Use provided criteria or create default optimization criteria
    const optimizationCriteria: SchedulingCriteria = criteria || {
      salonId,
      dateRange,
      objectives: [
        { type: "maximize_utilization", weight: 0.3, target: 0.85 },
        { type: "minimize_wait_time", weight: 0.2, target: 15 },
        { type: "maximize_revenue", weight: 0.3 },
        { type: "balance_workload", weight: 0.2, target: 0.8 }
      ],
      constraints: [
        { type: "working_hours", mandatory: true, parameters: {} },
        { type: "minimum_break_time", mandatory: true, parameters: { minutes: 30 } }
      ],
      preferences: []
    };

    // Get current schedule state
    const currentMetrics = await calculateCurrentMetrics(salonId, dateRange);

    // Analyze current conflicts
    const conflicts = await getAllScheduleConflicts(salonId, dateRange);

    // Generate optimization suggestions
    const suggestedChanges = await generateOptimizationChanges(salonId, dateRange, optimizationCriteria);

    // Calculate potential improvements
    const improvements = await calculateOptimizationImprovements(
      currentMetrics,
      suggestedChanges,
      optimizationCriteria
    );

    // Calculate optimization score
    const score = calculateOptimizationScore(improvements, optimizationCriteria);

    const executionTime = Date.now() - startTime;

    return {
      success: true,
      score,
      improvements,
      suggestedChanges,
      metrics: currentMetrics,
      conflicts,
      executionTime
    };
  } catch (error) {
    console.error('Error optimizing schedule:', error);
    const executionTime = Date.now() - startTime;

    return {
      success: false,
      score: 0,
      improvements: [],
      suggestedChanges: [],
      metrics: await calculateCurrentMetrics(salonId, dateRange),
      conflicts: [],
      executionTime
    };
  }
}

/**
 * Auto-assign appointments to optimal staff and time slots
 */
export async function autoAssignAppointments(
  appointments: PendingAppointment[]
): Promise<{ assigned: ScheduleChange[]; failed: PendingAppointment[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const assigned: ScheduleChange[] = [];
  const failed: PendingAppointment[] = [];

  try {
    // Sort appointments by priority and flexibility
    const sortedAppointments = appointments.sort((a, b) => {
      // Higher priority first
      if (a.priority !== b.priority) return b.priority - a.priority;
      // Less flexible appointments first
      const flexibilityOrder = { none: 0, low: 1, medium: 2, high: 3 };
      return flexibilityOrder[a.flexibility] - flexibilityOrder[b.flexibility];
    });

    for (const appointment of sortedAppointments) {
      try {
        const assignment = await findOptimalAssignment(appointment);
        if (assignment) {
          assigned.push(assignment);
        } else {
          failed.push(appointment);
        }
      } catch (error) {
        console.error(`Failed to assign appointment ${appointment.id}:`, error);
        failed.push(appointment);
      }
    }

    return { assigned, failed };
  } catch (error) {
    console.error('Error auto-assigning appointments:', error);
    throw new Error('Failed to auto-assign appointments');
  }
}

// ===============================
// SCHEDULE MANAGEMENT MUTATIONS
// ===============================

/**
 * Create a new staff schedule
 */
export async function createStaffSchedule(data: StaffScheduleInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: schedule, error } = await supabase
    .from('staff_schedules')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return schedule;
}

/**
 * Update an existing staff schedule
 */
export async function updateStaffSchedule(id: string, data: StaffScheduleUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: schedule, error } = await supabase
    .from('staff_schedules')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return schedule;
}

/**
 * Create a blocked time period
 */
export async function createBlockedTime(data: BlockedTimeInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: blockedTime, error } = await supabase
    .from('blocked_times')
    .insert({ ...data, created_by: user.id })
    .select()
    .single();

  if (error) throw error;
  return blockedTime;
}

/**
 * Update a blocked time period
 */
export async function updateBlockedTime(id: string, data: BlockedTimeUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: blockedTime, error } = await supabase
    .from('blocked_times')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return blockedTime;
}

/**
 * Create a time off request
 */
export async function createTimeOffRequest(data: TimeOffRequestInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: timeOff, error } = await supabase
    .from('time_off_requests')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return timeOff;
}

/**
 * Update a time off request (approve/reject)
 */
export async function updateTimeOffRequest(id: string, data: TimeOffRequestUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const updateData = {
    ...data,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString()
  };

  const { data: timeOff, error } = await supabase
    .from('time_off_requests')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return timeOff;
}

// ===============================
// HELPER FUNCTIONS
// ===============================

async function rescheduleAppointment(parameters: { appointmentId: string; newTime: string; staffId?: string }): Promise<{ success: boolean; newConflicts: ScheduleConflict[] }> {
  const supabase = await createClient();
  const { appointmentId } = parameters;
  const newStartTime = parameters.newTime;
  const newEndTime = parameters.newTime; // Simplified for now

  try {
    // Update appointment time
    const { error } = await supabase
      .from('appointments')
      .update({
        start_time: newStartTime,
        end_time: newEndTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (error) throw error;

    // Check for new conflicts
    const appointment = await supabase
      .from('appointments')
      .select('staff_id, salon_id')
      .eq('id', appointmentId)
      .single();

    if (appointment.data) {
      const newConflicts = await detectScheduleConflicts({
        staffId: appointment.data.staff_id ?? '',
        startTime: new Date(newStartTime),
        endTime: new Date(newEndTime),
        serviceId: '', // Would need to get from appointment_services
        salonId: appointment.data.salon_id ?? ''
      });

      return { success: true, newConflicts };
    }

    return { success: true, newConflicts: [] };
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    return { success: false, newConflicts: [] };
  }
}

async function reassignStaff(parameters: { appointmentId: string; newStaffId: string }): Promise<{ success: boolean; newConflicts: ScheduleConflict[] }> {
  const supabase = await createClient();
  const { appointmentId, newStaffId } = parameters;

  try {
    // Update appointment staff
    const { error } = await supabase
      .from('appointments')
      .update({
        staff_id: newStaffId,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (error) throw error;

    // Check for new conflicts with new staff
    const appointment = await supabase
      .from('appointments')
      .select('start_time, end_time, salon_id')
      .eq('id', appointmentId)
      .single();

    if (appointment.data && appointment.data.start_time && appointment.data.end_time) {
      const newConflicts = await detectScheduleConflicts({
        staffId: newStaffId,
        startTime: new Date(appointment.data.start_time),
        endTime: new Date(appointment.data.end_time),
        serviceId: '', // Would need to get from appointment_services
        salonId: appointment.data.salon_id ?? ''
      });

      return { success: true, newConflicts };
    }

    return { success: true, newConflicts: [] };
  } catch (error) {
    console.error('Error reassigning staff:', error);
    return { success: false, newConflicts: [] };
  }
}

function splitAppointment(_parameters: Record<string, unknown>): Promise<{ success: boolean; newConflicts: ScheduleConflict[] }> {
  // Implementation for splitting appointments into multiple slots
  return Promise.resolve({ success: false, newConflicts: [] });
}

function extendWorkingHours(_parameters: Record<string, unknown>): Promise<{ success: boolean; newConflicts: ScheduleConflict[] }> {
  // Implementation for extending staff working hours
  return Promise.resolve({ success: false, newConflicts: [] });
}

function addStaffBreak(_parameters: Record<string, unknown>): Promise<{ success: boolean; newConflicts: ScheduleConflict[] }> {
  // Implementation for adding staff breaks
  return Promise.resolve({ success: false, newConflicts: [] });
}

async function cancelAppointment(parameters: { appointmentId: string; reason: string }): Promise<{ success: boolean; newConflicts: ScheduleConflict[] }> {
  const supabase = await createClient();
  const { appointmentId, reason } = parameters;

  try {
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (error) throw error;
    return { success: true, newConflicts: [] };
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return { success: false, newConflicts: [] };
  }
}

function bookDifferentResource(_parameters: Record<string, unknown>): Promise<{ success: boolean; newConflicts: ScheduleConflict[] }> {
  // Implementation for booking different resources (rooms, chairs, etc.)
  return Promise.resolve({ success: false, newConflicts: [] });
}

async function calculateCurrentMetrics(salonId: string, _dateRange: DateRange): Promise<OptimizationMetrics> {
  const supabase = await createClient();

  // Get salon staff
  const { data: staff } = await supabase
    .from('staff_profiles')
    .select('user_id')
    .eq('salon_id', salonId)
    .eq('is_active', true);

  const _staffCount = staff?.length || 0;

  // Calculate utilization, wait times, etc.
  // This is a simplified implementation
  return {
    utilizationRate: 0.75, // 75% utilization
    averageWaitTime: 10, // 10 minutes average wait
    revenueOptimization: 0, // No optimization yet
    workloadBalance: 0.8, // 80% balanced
    customerSatisfaction: 85, // 85% satisfaction
    conflictCount: 0
  };
}

function getAllScheduleConflicts(_salonId: string, _dateRange: DateRange): Promise<ScheduleConflict[]> {
  // Implementation would scan for all conflicts in the date range
  return Promise.resolve([]);
}

function generateOptimizationChanges(
  _salonId: string,
  _dateRange: DateRange,
  _criteria: SchedulingCriteria
): Promise<ScheduleChange[]> {
  // Implementation would generate suggested changes based on optimization criteria
  return Promise.resolve([]);
}

function calculateOptimizationImprovements(
  _currentMetrics: OptimizationMetrics,
  _changes: ScheduleChange[],
  _criteria: SchedulingCriteria
) {
  // Implementation would calculate potential improvements from suggested changes
  return [];
}

function calculateOptimizationScore(_improvements: unknown[], _criteria: SchedulingCriteria): number {
  // Implementation would calculate overall optimization score
  return Math.random() * 100; // Placeholder
}

function findOptimalAssignment(_appointment: PendingAppointment): Promise<ScheduleChange | null> {
  // Implementation would find the best staff and time slot for the appointment
  return Promise.resolve(null);
}

// ===============================
// LEGACY COMPATIBILITY
// ===============================

export async function createschedules(data: Partial<schedulesData>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return { ...data, id: crypto.randomUUID() } as schedulesData;
}

export async function updateschedules(
  id: string,
  data: Partial<schedulesData>,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return { ...data, id } as schedulesData;
}

export async function deleteschedules(_id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return;
}
