import { createClient } from "@/lib/supabase/server";
import type {
  ScheduleConflict,
  ConflictResolution,
} from "./schedules-types";
import { detectScheduleConflicts } from "./schedules-queries";

/**
 * Schedule Conflict Resolution - Advanced conflict handling
 */

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

// Helper functions for conflict resolution

async function rescheduleAppointment(parameters: { appointmentId: string; newTime: string; staffId?: string }): Promise<{ success: boolean; newConflicts: ScheduleConflict[] }> {
  const supabase = await createClient();

  try {
    const { appointmentId, newTime, staffId } = parameters;

    // Update appointment time
    const updateData: any = {
      start_time: newTime,
      updated_at: new Date().toISOString()
    };

    if (staffId) {
      updateData.staff_id = staffId;
    }

    const { error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", appointmentId);

    if (error) throw error;

    // Check for new conflicts after rescheduling
    const newConflicts = await detectScheduleConflicts(staffId || "", new Date(newTime));

    return { success: true, newConflicts };
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    return { success: false, newConflicts: [] };
  }
}

async function reassignStaff(parameters: { appointmentId: string; newStaffId: string }): Promise<{ success: boolean; newConflicts: ScheduleConflict[] }> {
  const supabase = await createClient();

  try {
    const { appointmentId, newStaffId } = parameters;

    const { error } = await supabase
      .from("appointments")
      .update({
        staff_id: newStaffId,
        updated_at: new Date().toISOString()
      })
      .eq("id", appointmentId);

    if (error) throw error;

    // Check for new conflicts with the new staff member
    const { data: appointment } = await supabase
      .from("appointments")
      .select("start_time")
      .eq("id", appointmentId)
      .single();

    const newConflicts = appointment
      ? await detectScheduleConflicts(newStaffId, new Date(appointment.start_time))
      : [];

    return { success: true, newConflicts };
  } catch (error) {
    console.error('Error reassigning staff:', error);
    return { success: false, newConflicts: [] };
  }
}

function splitAppointment(_parameters: Record<string, unknown>): Promise<{ success: boolean; newConflicts: ScheduleConflict[] }> {
  // TODO: Implement appointment splitting logic
  return Promise.resolve({ success: false, newConflicts: [] });
}

function extendWorkingHours(_parameters: Record<string, unknown>): Promise<{ success: boolean; newConflicts: ScheduleConflict[] }> {
  // TODO: Implement working hours extension logic
  return Promise.resolve({ success: false, newConflicts: [] });
}

function addStaffBreak(_parameters: Record<string, unknown>): Promise<{ success: boolean; newConflicts: ScheduleConflict[] }> {
  // TODO: Implement staff break addition logic
  return Promise.resolve({ success: false, newConflicts: [] });
}

async function cancelAppointment(parameters: { appointmentId: string; reason: string }): Promise<{ success: boolean; newConflicts: ScheduleConflict[] }> {
  const supabase = await createClient();

  try {
    const { appointmentId, reason } = parameters;

    const { error } = await supabase
      .from("appointments")
      .update({
        status: "cancelled",
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq("id", appointmentId);

    if (error) throw error;

    // Cancelling an appointment typically resolves conflicts rather than creates them
    return { success: true, newConflicts: [] };
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return { success: false, newConflicts: [] };
  }
}

function bookDifferentResource(_parameters: Record<string, unknown>): Promise<{ success: boolean; newConflicts: ScheduleConflict[] }> {
  // TODO: Implement different resource booking logic
  return Promise.resolve({ success: false, newConflicts: [] });
}