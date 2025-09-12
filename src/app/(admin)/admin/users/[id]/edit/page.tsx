import { requireRole } from '@/lib/api/dal/auth'
import { USER_ROLES } from '@/lib/auth/constants'
import { EditUserForm } from '@/components/features/platform/users/edit-user-form'

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  await requireRole([USER_ROLES.SUPER_ADMIN])
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="text-muted-foreground">
          Update user account information
        </p>
      </div>
      
      <EditUserForm userId={params.id} />
    </div>
  )
}