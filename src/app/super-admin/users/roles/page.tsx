import { Metadata } from 'next'
import { RoleAssignmentDialog } from '@/components/super-admin/users/roles/role-assignment-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { createClient } from '@/lib/database/supabase/server'

export const metadata: Metadata = {
  title: 'Role Management',
  description: 'Manage user roles and permissions',
}

export default async function RolesPage() {
  // Fetch salons for the role assignment dialog
  const supabase = await createClient()
  const { data: salons } = await supabase
    .from('salons')
    .select('id, name')
    .eq('is_active', true)
    .order('name')
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
        <p className="text-muted-foreground">
          Manage user roles and permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
          <CardDescription>
            Assign and manage user roles across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleAssignmentDialog 
            salons={salons || []} 
            mode="create" 
          />
        </CardContent>
      </Card>
    </div>
  )
}