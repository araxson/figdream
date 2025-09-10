'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, Mail } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/ui/use-toast'
import { Database } from '@/types/database.types'
import { InviteDialog, CancelInvitationDialog } from './invitation-dialogs'
import { InvitationList } from './invitation-list'
import type { InvitationFormData } from './invitation-form'

type StaffInvitation = Database['public']['Tables']['staff_invitations']['Row']

export function StaffInvitationsManager() {
  const [invitations, setInvitations] = useState<StaffInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [sendingInvite, setSendingInvite] = useState(false)
  const [cancelingInvitation, setCancelingInvitation] = useState<StaffInvitation | null>(null)
  const [formData, setFormData] = useState<InvitationFormData>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'staff',
    message: ''
  })
  const supabase = createClient()
  const toast = useToast()

  const fetchInvitations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      const { data } = await supabase
        .from('staff_invitations')
        .select('*')
        .eq('salon_id', salon.id)
        .order('created_at', { ascending: false })

      setInvitations(data || [])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching invitations:', error)
      }
      toast.error('Failed to load invitations')
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations])

  const handleSendInvitation = async () => {
    setSendingInvite(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: salon } = await supabase
        .from('salons')
        .select('id, name')
        .eq('created_by', user.id)
        .single()

      if (!salon) throw new Error('Salon not found')

      const response = await fetch('/api/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          message: formData.message,
          salonId: salon.id,
          salonName: salon.name
        })
      })

      if (!response.ok) throw new Error('Failed to send invitation')

      toast.success(`Invitation sent to ${formData.email}`)

      setShowInviteDialog(false)
      setFormData({ email: '', firstName: '', lastName: '', role: 'staff', message: '' })
      await fetchInvitations()
    } catch {
      toast.error('Failed to send invitation')
    } finally {
      setSendingInvite(false)
    }
  }

  const handleResendInvitation = async (invitation: StaffInvitation) => {
    try {
      const response = await fetch('/api/staff/resend-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId: invitation.id })
      })

      if (!response.ok) throw new Error('Failed to resend')

      toast.success(`Invitation resent to ${invitation.email}`)

      await fetchInvitations()
    } catch {
      toast.error('Failed to resend invitation')
    }
  }

  const handleCancelInvitation = async () => {
    if (!cancelingInvitation) return

    try {
      const { error } = await supabase
        .from('staff_invitations')
        .delete()
        .eq('id', cancelingInvitation.id)

      if (error) throw error

      toast.success('The invitation has been cancelled')

      await fetchInvitations()
    } catch {
      toast.error('Failed to cancel invitation')
    } finally {
      setCancelingInvitation(null)
    }
  }

  const handleCopyInvitationLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/staff/join?token=${token}`
    navigator.clipboard.writeText(inviteUrl)
    toast.success('Invitation link copied to clipboard')
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Invitations</CardTitle>
              <CardDescription>
                Manage invitations sent to staff members
              </CardDescription>
            </div>
            <Button onClick={() => setShowInviteDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Staff
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Mail className="mr-2 h-4 w-4 animate-pulse" />
              Loading invitations...
            </div>
          ) : (
            <InvitationList
              invitations={invitations}
              onResend={handleResendInvitation}
              onCancel={setCancelingInvitation}
              onCopyLink={handleCopyInvitationLink}
            />
          )}
        </CardContent>
      </Card>

      <InviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSendInvitation}
        isLoading={sendingInvite}
      />

      <CancelInvitationDialog
        invitation={cancelingInvitation}
        onConfirm={handleCancelInvitation}
        onCancel={() => setCancelingInvitation(null)}
      />
    </>
  )
}