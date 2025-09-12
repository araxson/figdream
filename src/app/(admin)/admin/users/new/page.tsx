import { requireRole } from '@/lib/api/dal/auth'
import { USER_ROLES } from '@/lib/auth/constants'
import { CreateUserForm } from '@/components/features/platform/users/create-user-form'

export default async function CreateUserPage() {
  await requireRole([USER_ROLES.SUPER_ADMIN])
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
        <p className="text-muted-foreground">
          Add a new user to the platform
        </p>
      </div>
      
      <CreateUserForm />
    </div>
  )
}