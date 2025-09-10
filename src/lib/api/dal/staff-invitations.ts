import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { requireAuth } from './auth'

type Tables = Database['public']['Tables']
type StaffInvitation = Tables['staff_invitations']['Row']
type StaffInvitationInsert = Tables['staff_invitations']['Insert']

export interface StaffInvitationDTO {
  id: string
  salon_id: string
  email: string
  role: string
  invitation_token: string
  expires_at: string
  accepted_at: string | null
  created_by: string
  created_at: string
}

function toStaffInvitationDTO(invitation: StaffInvitation): StaffInvitationDTO {
  return {
    id: invitation.id,
    salon_id: invitation.salon_id,
    email: invitation.email,
    role: invitation.role || 'staff',
    invitation_token: invitation.invitation_token,
    expires_at: invitation.expires_at,
    accepted_at: invitation.accepted_at,
    created_by: invitation.invited_by,
    created_at: invitation.created_at || new Date().toISOString()
  }
}

export const getStaffInvitations = cache(async (
  salonId: string
): Promise<StaffInvitationDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_invitations')
    .select('*')
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching staff invitations:', error)
    return []
  }
  
  return (data || []).map(toStaffInvitationDTO)
})

export const getPendingInvitations = cache(async (
  salonId: string
): Promise<StaffInvitationDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('staff_invitations')
    .select('*')
    .eq('salon_id', salonId)
    .is('accepted_at', null)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching pending invitations:', error)
    return []
  }
  
  return (data || []).map(toStaffInvitationDTO)
})

export const getInvitationByToken = cache(async (
  token: string
): Promise<StaffInvitationDTO | null> => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_invitations')
    .select('*')
    .eq('invitation_token', token)
    .single()
  
  if (error) {
    console.error('Error fetching invitation by token:', error)
    return null
  }
  
  return data ? toStaffInvitationDTO(data) : null
})

export async function createStaffInvitation(
  invitation: Omit<StaffInvitationInsert, 'invitation_token' | 'expires_at'>
): Promise<StaffInvitationDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  // Generate secure token
  const token = crypto.randomUUID()
  
  // Set expiration to 7 days from now
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)
  
  const { data, error } = await supabase
    .from('staff_invitations')
    .insert({
      ...invitation,
      invitation_token: token,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating staff invitation:', error)
    throw new Error('Failed to create staff invitation')
  }
  
  return data ? toStaffInvitationDTO(data) : null
}

export async function acceptInvitation(
  token: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient()
  
  // First get the invitation
  const { data: invitation, error: fetchError } = await supabase
    .from('staff_invitations')
    .select('*')
    .eq('invitation_token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()
  
  if (fetchError || !invitation) {
    throw new Error('Invalid or expired invitation')
  }
  
  // Mark invitation as accepted
  const { error: updateError } = await supabase
    .from('staff_invitations')
    .update({
      accepted_at: new Date().toISOString()
    })
    .eq('id', invitation.id)
  
  if (updateError) {
    console.error('Error accepting invitation:', updateError)
    throw new Error('Failed to accept invitation')
  }
  
  // Create staff profile for the user
  const { error: profileError } = await supabase
    .from('staff_profiles')
    .insert({
      user_id: userId,
      salon_id: invitation.salon_id,
      employee_id: crypto.randomUUID(), // Generate unique employee ID
      location_id: invitation.location_id,
      is_active: true,
      is_bookable: true
    })
  
  if (profileError) {
    console.error('Error creating staff profile:', profileError)
    throw new Error('Failed to create staff profile')
  }
  
  return true
}

export async function resendInvitation(
  invitationId: string
): Promise<StaffInvitationDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  // Generate new token and expiration
  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)
  
  const { data, error } = await supabase
    .from('staff_invitations')
    .update({
      invitation_token: token,
      expires_at: expiresAt.toISOString(),
      accepted_at: null
    })
    .eq('id', invitationId)
    .select()
    .single()
  
  if (error) {
    console.error('Error resending invitation:', error)
    throw new Error('Failed to resend invitation')
  }
  
  return data ? toStaffInvitationDTO(data) : null
}

export async function cancelInvitation(id: string): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('staff_invitations')
    .delete()
    .eq('id', id)
    .is('accepted_at', null)
  
  if (error) {
    console.error('Error canceling invitation:', error)
    throw new Error('Failed to cancel invitation')
  }
  
  return true
}

export async function getInvitationsByEmail(
  email: string
): Promise<StaffInvitationDTO[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_invitations')
    .select('*')
    .eq('email', email)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching invitations by email:', error)
    return []
  }
  
  return (data || []).map(toStaffInvitationDTO)
}