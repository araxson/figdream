import { createClient } from "@/lib/supabase/server";
import type {
  AppointmentInsert,
  AppointmentUpdate,
  AppointmentServiceInsert,
  AppointmentStatus,
} from "./appointments-types";

/**
 * Create a new appointment
 */
export async function createAppointment(appointment: AppointmentInsert) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Generate confirmation code
  const confirmationCode = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      ...appointment,
      confirmation_code: confirmationCode,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an appointment
 */
export async function updateAppointment(
  id: string,
  updates: AppointmentUpdate,
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("appointments")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(id: string, reason?: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("appointments")
    .update({
      status: "cancelled" as AppointmentStatus,
      cancelled_at: new Date().toISOString(),
      cancelled_by: user.id,
      cancellation_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Confirm an appointment
 */
export async function confirmAppointment(id: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("appointments")
    .update({
      status: "confirmed" as AppointmentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Check in an appointment
 */
export async function checkInAppointment(id: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("appointments")
    .update({
      status: "checked_in" as AppointmentStatus,
      checked_in_at: new Date().toISOString(),
      checked_in_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Complete an appointment
 */
export async function completeAppointment(id: string, completionNotes?: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("appointments")
    .update({
      status: "completed" as AppointmentStatus,
      completed_at: new Date().toISOString(),
      completed_by: user.id,
      completion_notes: completionNotes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark appointment as no-show
 */
export async function noShowAppointment(id: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("appointments")
    .update({
      status: "no_show" as AppointmentStatus,
      marked_no_show_at: new Date().toISOString(),
      marked_no_show_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add services to an appointment
 */
export async function addAppointmentServices(
  appointmentId: string,
  services: AppointmentServiceInsert[],
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const servicesWithAppointmentId = services.map((service) => ({
    ...service,
    appointment_id: appointmentId,
  }));

  const { data, error } = await supabase
    .from("appointment_services")
    .insert(servicesWithAppointmentId)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Remove a service from an appointment
 */
export async function removeAppointmentService(appointmentId: string, serviceId: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("appointment_services")
    .delete()
    .eq("appointment_id", appointmentId)
    .eq("service_id", serviceId);

  if (error) throw error;
  return { success: true };
}

/**
 * Add a single service to an appointment
 */
export async function addAppointmentService(service: AppointmentServiceInsert) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("appointment_services")
    .insert(service)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Reschedule an appointment
 */
export async function rescheduleAppointment(
  id: string,
  data: { scheduled_at: string; staff_id?: string; duration_minutes?: number; reason?: string }
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const updates: any = {
    start_time: data.scheduled_at,
    duration_minutes: data.duration_minutes,
    staff_id: data.staff_id,
    status: "confirmed" as AppointmentStatus,
    notes: data.reason ? `Rescheduled: ${data.reason}` : "Rescheduled",
    updated_at: new Date().toISOString(),
  }

  const { data: appointmentData, error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return appointmentData;
}

/**
 * Update appointment payment status
 */
export async function updateAppointmentPayment(
  id: string,
  paymentStatus: string,
  paymentDetails?: any
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("appointments")
    .update({
      payment_status: paymentStatus as any, // Cast to any since the exact type enum may differ
      payment_details: paymentDetails,
      payment_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add note to appointment
 */
export async function addAppointmentNote(
  appointmentId: string,
  note: string,
  addedBy: string,
  isPrivate = false
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Update notes in appointments table since appointment_notes doesn't exist
  const { data: appointment } = await supabase
    .from("appointments")
    .select("notes")
    .eq("id", appointmentId)
    .single();

  const existingNotes = appointment?.notes || "";
  const timestamp = new Date().toISOString();
  const newNote = `[${timestamp}] ${isPrivate ? "[Private] " : ""}${note}`;
  const updatedNotes = existingNotes ? `${existingNotes}\n${newNote}` : newNote;

  const { data, error } = await supabase
    .from("appointments")
    .update({ notes: updatedNotes })
    .eq("id", appointmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
