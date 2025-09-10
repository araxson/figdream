'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Database } from '@/types/database.types'
import { InvitationForm, type InvitationFormData } from './invitation-form'

type StaffInvitation = Database['public']['Tables']['staff_invitations']['Row']

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: InvitationFormData
  onFormChange: (data: InvitationFormData) => void
  onSubmit: () => void
  isLoading: boolean
}

export function InviteDialog({ 
  open, 
  onOpenChange, 
  formData, 
  onFormChange, 
  onSubmit, 
  isLoading 
}: InviteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Staff Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your salon. They&apos;ll receive an email with instructions to create their account.
          </DialogDescription>
        </DialogHeader>
        <InvitationForm
          formData={formData}
          onChange={onFormChange}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}

interface CancelDialogProps {
  invitation: StaffInvitation | null
  onConfirm: () => void
  onCancel: () => void
}

export function CancelInvitationDialog({ invitation, onConfirm, onCancel }: CancelDialogProps) {
  if (!invitation) return null
  
  return (
    <AlertDialog open={!!invitation} onOpenChange={() => onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Invitation?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel the invitation sent to {invitation.email}? 
            This action cannot be undone and they will no longer be able to join using this invitation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Keep Invitation</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Cancel Invitation</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}