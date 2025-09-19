import { toast } from 'sonner'
import {
  toggleUserStatusAction,
  suspendUserAction,
  resetUserPasswordAction,
  exportUsersAction
} from '../actions'

export async function handleUserAction(
  userId: string,
  action: string,
  router: any,
  onRefresh?: () => void
) {
  try {
    switch (action) {
      case 'view':
        router.push(`/admin/users/${userId}`)
        break
      case 'edit':
        router.push(`/admin/users/${userId}/edit`)
        break
      case 'suspend':
        await suspendUserAction(userId, 'Manual suspension by admin')
        toast.success('User suspended successfully')
        onRefresh?.()
        break
      case 'activate':
        await toggleUserStatusAction(userId, true)
        toast.success('User activated successfully')
        onRefresh?.()
        break
      case 'deactivate':
        await toggleUserStatusAction(userId, false)
        toast.success('User deactivated successfully')
        onRefresh?.()
        break
      case 'reset_password':
        await resetUserPasswordAction(userId)
        toast.success('Password reset email sent')
        break
      default:
        console.warn(`Unknown action: ${action}`)
    }
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to perform action')
  }
}

export async function handleExportUsers() {
  try {
    const result = await exportUsersAction()
    if (result.success) {
      toast.success('Users exported successfully')
      // Handle file download if result contains file data
    } else {
      throw new Error(result.error || 'Failed to export users')
    }
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to export users')
  }
}