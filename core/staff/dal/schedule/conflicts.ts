import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { ScheduleConflict, ConflictResolution } from "../types";

type StaffSchedule = Database["public"]["Views"]["staff_schedules"]["Row"];
type TimeOffRequest = Database["public"]["Views"]["time_off_requests"]["Row"];

/**
 * Resolve a schedule conflict using the specified resolution strategy
 */
export async function resolveScheduleConflict(
  conflictId: string,
  resolution: ConflictResolution
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();

  try {
    switch (resolution.strategy) {
      case "reschedule":
        // Reschedule conflicting appointments
        const { error: rescheduleError } = await supabase
          .from("appointments")
          .update({
            appointment_date: resolution.newDate,
            start_time: resolution.newTime,
            status: "rescheduled"
          })
          .eq("id", resolution.appointmentId!);

        if (rescheduleError) throw rescheduleError;
        break;

      case "reassign":
        // Reassign to different staff member
        const { error: reassignError } = await supabase
          .from("appointments")
          .update({
            staff_id: resolution.newStaffId
          })
          .eq("id", resolution.appointmentId!);

        if (reassignError) throw reassignError;
        break;

      case "cancel":
        // Cancel the appointment
        const { error: cancelError } = await supabase
          .from("appointments")
          .update({
            status: "cancelled",
            cancellation_reason: resolution.reason
          })
          .eq("id", resolution.appointmentId!);

        if (cancelError) throw cancelError;
        break;

      case "override":
        // Override schedule with priority
        // Implementation depends on business rules
        break;

      default:
        throw new Error(`Unknown resolution strategy: ${resolution.strategy}`);
    }

    // Mark conflict as resolved
    const { error: resolveError } = await supabase
      .from("schedule_conflicts")
      .update({
        is_resolved: true,
        resolution_type: resolution.strategy,
        resolved_at: new Date().toISOString(),
        resolved_by: resolution.resolvedBy
      })
      .eq("id", conflictId);

    if (resolveError) throw resolveError;

    return { success: true };
  } catch (error) {
    console.error("Error resolving conflict:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to resolve conflict"
    };
  }
}

/**
 * Detect conflicts between schedules
 */
export async function detectScheduleConflicts(
  staffId: string,
  date: string
): Promise<ScheduleConflict[]> {
  const supabase = await createClient();

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select(`
      id,
      appointment_date,
      start_time,
      end_time,
      status,
      customer:profiles!customer_id(
        first_name,
        last_name
      )
    `)
    .eq("staff_id", staffId)
    .eq("appointment_date", date)
    .neq("status", "cancelled");

  if (error) throw error;

  const conflicts: ScheduleConflict[] = [];

  // Check for overlapping appointments
  for (let i = 0; i < appointments.length; i++) {
    for (let j = i + 1; j < appointments.length; j++) {
      const a1 = appointments[i];
      const a2 = appointments[j];

      if (isTimeOverlap(a1.start_time, a1.end_time, a2.start_time, a2.end_time)) {
        conflicts.push({
          id: `${a1.id}-${a2.id}`,
          type: "appointment_overlap",
          severity: "high",
          conflictingItems: [a1.id, a2.id],
          description: `Overlapping appointments`,
          suggestedResolutions: ["reschedule", "reassign", "cancel"]
        });
      }
    }
  }

  return conflicts;
}

function isTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 < end2 && start2 < end1;
}