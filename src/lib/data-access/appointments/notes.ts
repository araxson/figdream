'use server'

import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'

// Type definitions from database
type AppointmentNote = Database['public']['Tables']['appointment_notes']['Row']
type AppointmentNoteInsert = Database['public']['Tables']['appointment_notes']['Insert']
type AppointmentNoteUpdate = Database['public']['Tables']['appointment_notes']['Update']

/**
 * Get all notes for an appointment
 * @param appointmentId - The appointment ID
 * @returns Array of appointment notes
 */
export async function getAppointmentNotes(appointmentId: string): Promise<AppointmentNote[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointment_notes')
    .select('*')
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching appointment notes:', error)
    throw new Error('Failed to fetch appointment notes')
  }
  
  return data || []
}

/**
 * Create a new appointment note
 * @param note - The note data to create
 * @returns The created note
 */
export async function createAppointmentNote(note: AppointmentNoteInsert): Promise<AppointmentNote> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointment_notes')
    .insert(note)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating appointment note:', error)
    throw new Error('Failed to create appointment note')
  }
  
  return data
}

/**
 * Update an existing appointment note
 * @param id - The note ID
 * @param updates - The fields to update
 * @returns The updated note
 */
export async function updateAppointmentNote(
  id: string, 
  updates: AppointmentNoteUpdate
): Promise<AppointmentNote> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointment_notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating appointment note:', error)
    throw new Error('Failed to update appointment note')
  }
  
  return data
}

/**
 * Delete an appointment note
 * @param id - The note ID to delete
 */
export async function deleteAppointmentNote(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('appointment_notes')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting appointment note:', error)
    throw new Error('Failed to delete appointment note')
  }
}

/**
 * Get notes for an appointment with staff/customer visibility logic
 * @param appointmentId - The appointment ID
 * @param viewerType - 'staff' or 'customer'
 * @returns Filtered array of notes based on visibility
 */
export async function getVisibleAppointmentNotes(
  appointmentId: string,
  viewerType: 'staff' | 'customer'
): Promise<AppointmentNote[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('appointment_notes')
    .select('*')
    .eq('appointment_id', appointmentId)
  
  // Customers should only see non-private notes
  if (viewerType === 'customer') {
    query = query.eq('is_private', false)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching visible appointment notes:', error)
    throw new Error('Failed to fetch appointment notes')
  }
  
  return data || []
}

/**
 * Batch create appointment notes
 * @param notes - Array of notes to create
 * @returns Array of created notes
 */
export async function createAppointmentNotesBatch(
  notes: AppointmentNoteInsert[]
): Promise<AppointmentNote[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointment_notes')
    .insert(notes)
    .select()
  
  if (error) {
    console.error('Error creating appointment notes batch:', error)
    throw new Error('Failed to create appointment notes')
  }
  
  return data || []
}

/**
 * Get appointment notes by staff member
 * @param staffId - The staff member ID
 * @param limit - Maximum number of notes to return
 * @returns Array of appointment notes
 */
export async function getAppointmentNotesByStaff(
  staffId: string,
  limit = 50
): Promise<AppointmentNote[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointment_notes')
    .select('*')
    .eq('staff_id', staffId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching staff appointment notes:', error)
    throw new Error('Failed to fetch appointment notes')
  }
  
  return data || []
}