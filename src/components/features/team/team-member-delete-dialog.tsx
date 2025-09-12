'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Database } from '@/types/database.types'
import { deleteTeamMemberAction } from '@/lib/actions/team-members'
import { toast } from 'sonner'

type TeamMember = Database['public']['Tables']['team_members']['Row']

interface TeamMemberDeleteDialogProps {
  member: TeamMember
  onClose: () => void
  onSuccess: (deletedId: string) => void
}

export function TeamMemberDeleteDialog({ 
  member, 
  onClose, 
  onSuccess 
}: TeamMemberDeleteDialogProps) {
  const handleDelete = async () => {
    try {
      const result = await deleteTeamMemberAction(member.id)
      if (result.success) {
        onSuccess(member.id)
        toast.success('Team member deleted successfully')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete team member')
    }
  }

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {member.name}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}