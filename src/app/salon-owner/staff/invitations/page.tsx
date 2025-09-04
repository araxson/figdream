import { Metadata } from 'next'
import { StaffInvitations } from '@/components/salon-owner/staff/staff-invitations'

export const metadata: Metadata = {
  title: 'Staff Invitations | FigDream',
  description: 'Manage staff invitations for your salon',
}

export default function StaffInvitationsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Staff Invitations</h1>
        <p className="text-muted-foreground">
          Invite new staff members to join your salon
        </p>
      </div>
      <StaffInvitations />
    </div>
  )
}