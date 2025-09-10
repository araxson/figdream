import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { requireAuth } from './auth'

type Tables = Database['public']['Tables']
type AppointmentService = Tables['appointment_services']['Row']
type AppointmentServiceInsert = Tables['appointment_services']['Insert']
type AppointmentServiceUpdate = Tables['appointment_services']['Update']

export interface AppointmentServiceDTO {
  id: string
  appointment_id: string
  service_id: string
  staff_id: string | null
  duration_minutes: number
  price: number
  discount_amount: number | null
  discount_percent: number | null
  notes: string | null
  created_at: string
}

function toAppointmentServiceDTO(service: AppointmentService): AppointmentServiceDTO {
  return {
    id: service.id,
    appointment_id: service.appointment_id,
    service_id: service.service_id,
    staff_id: null, // staff_id is not in appointment_services table
    duration_minutes: service.duration_minutes || 60,
    price: service.price || 0,
    discount_amount: null, // These fields don't exist in the table
    discount_percent: null, // These fields don't exist in the table
    notes: null, // This field doesn't exist in the table
    created_at: service.created_at || new Date().toISOString()
  }
}

export const getAppointmentServices = cache(async (
  appointmentId: string
): Promise<AppointmentServiceDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointment_services')
    .select('*')
    .eq('appointment_id', appointmentId)
    .order('created_at')
  
  if (error) {
    console.error('Error fetching appointment services:', error)
    return []
  }
  
  return (data || []).map(toAppointmentServiceDTO)
})

export const getServicesByAppointmentIds = cache(async (
  appointmentIds: string[]
): Promise<AppointmentServiceDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointment_services')
    .select('*')
    .in('appointment_id', appointmentIds)
    .order('appointment_id, created_at')
  
  if (error) {
    console.error('Error fetching appointment services:', error)
    return []
  }
  
  return (data || []).map(toAppointmentServiceDTO)
})

export async function createAppointmentService(
  service: AppointmentServiceInsert
): Promise<AppointmentServiceDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointment_services')
    .insert(service)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating appointment service:', error)
    throw new Error('Failed to create appointment service')
  }
  
  return data ? toAppointmentServiceDTO(data) : null
}

export async function bulkCreateAppointmentServices(
  services: AppointmentServiceInsert[]
): Promise<AppointmentServiceDTO[]> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointment_services')
    .insert(services)
    .select()
  
  if (error) {
    console.error('Error creating appointment services:', error)
    throw new Error('Failed to create appointment services')
  }
  
  return (data || []).map(toAppointmentServiceDTO)
}

export async function updateAppointmentService(
  id: string,
  updates: AppointmentServiceUpdate
): Promise<AppointmentServiceDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointment_services')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating appointment service:', error)
    throw new Error('Failed to update appointment service')
  }
  
  return data ? toAppointmentServiceDTO(data) : null
}

export async function deleteAppointmentService(id: string): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('appointment_services')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting appointment service:', error)
    throw new Error('Failed to delete appointment service')
  }
  
  return true
}

export async function deleteAppointmentServices(
  appointmentId: string
): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('appointment_services')
    .delete()
    .eq('appointment_id', appointmentId)
  
  if (error) {
    console.error('Error deleting appointment services:', error)
    throw new Error('Failed to delete appointment services')
  }
  
  return true
}