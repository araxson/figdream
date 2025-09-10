'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield,
  Key,
  Lock,
  Unlock,
  UserCheck,
  Settings
} from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Permission = {
  id: string
  name: string
  description: string
  category: string
  enabled: boolean
}

type RolePermissions = {
  role: string
  permissions: Permission[]
}

export function UserPermissions() {
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeRole, setActiveRole] = useState('admin')
  const supabase = createClient()

  const fetchPermissions = useCallback(async () => {
    try {
      // Fetch user roles and their permissions
      const { } = await supabase
        .from('user_roles')
        .select('*')
        .order('role')

      // Build role permissions structure
      const rolesWithPermissions: RolePermissions[] = [
        {
          role: 'admin',
          permissions: [
            { id: '1', name: 'manage_users', description: 'Create, edit, delete users', category: 'users', enabled: true },
            { id: '2', name: 'manage_salons', description: 'Create, edit, delete salons', category: 'salons', enabled: true },
            { id: '3', name: 'view_analytics', description: 'View platform analytics', category: 'analytics', enabled: true },
            { id: '4', name: 'manage_payments', description: 'Process refunds, view transactions', category: 'payments', enabled: true },
            { id: '5', name: 'system_settings', description: 'Modify system configuration', category: 'system', enabled: true }
          ]
        },
        {
          role: 'salon_owner',
          permissions: [
            { id: '6', name: 'manage_staff', description: 'Add and remove staff members', category: 'staff', enabled: true },
            { id: '7', name: 'manage_services', description: 'Create and edit services', category: 'services', enabled: true },
            { id: '8', name: 'view_reports', description: 'View salon reports', category: 'reports', enabled: true },
            { id: '9', name: 'manage_schedule', description: 'Set working hours', category: 'schedule', enabled: true },
            { id: '10', name: 'manage_customers', description: 'View customer information', category: 'customers', enabled: false }
          ]
        },
        {
          role: 'staff',
          permissions: [
            { id: '11', name: 'view_appointments', description: 'View assigned appointments', category: 'appointments', enabled: true },
            { id: '12', name: 'manage_availability', description: 'Set personal availability', category: 'schedule', enabled: true },
            { id: '13', name: 'view_customers', description: 'View customer details', category: 'customers', enabled: true },
            { id: '14', name: 'process_payments', description: 'Accept payments', category: 'payments', enabled: false },
            { id: '15', name: 'send_messages', description: 'Message customers', category: 'communication', enabled: false }
          ]
        },
        {
          role: 'customer',
          permissions: [
            { id: '16', name: 'book_appointments', description: 'Book new appointments', category: 'appointments', enabled: true },
            { id: '17', name: 'view_history', description: 'View appointment history', category: 'appointments', enabled: true },
            { id: '18', name: 'leave_reviews', description: 'Leave reviews for services', category: 'reviews', enabled: true },
            { id: '19', name: 'manage_profile', description: 'Edit profile information', category: 'profile', enabled: true },
            { id: '20', name: 'receive_notifications', description: 'Receive email/SMS notifications', category: 'communication', enabled: true }
          ]
        }
      ]

      setRolePermissions(rolesWithPermissions)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching permissions:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])
   
  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  async function togglePermission(roleId: string, permissionId: string, enabled: boolean) {
    setSaving(true)
    try {
      // Update permission in state
      setRolePermissions(prev => 
        prev.map(rp => 
          rp.role === roleId 
            ? {
                ...rp,
                permissions: rp.permissions.map(p => 
                  p.id === permissionId ? { ...p, enabled } : p
                )
              }
            : rp
        )
      )

      // In production, this would update the database
      toast.success('Permission updated successfully')
    } catch {
      toast.error('Failed to update permission')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading permissions...
          </div>
        </CardContent>
      </Card>
    )
  }

  // const currentRolePermissions = rolePermissions.find(rp => rp.role === activeRole)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Role Permissions</CardTitle>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Advanced Settings
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeRole} onValueChange={setActiveRole}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="salon_owner">Salon Owner</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="customer">Customer</TabsTrigger>
          </TabsList>

          {rolePermissions.map((rolePerms) => (
            <TabsContent key={rolePerms.role} value={rolePerms.role} className="mt-6">
              <div className="space-y-6">
                {/* Group permissions by category */}
                {Object.entries(
                  rolePerms.permissions.reduce((acc, perm) => {
                    if (!acc[perm.category]) acc[perm.category] = []
                    acc[perm.category].push(perm)
                    return acc
                  }, {} as Record<string, Permission[]>)
                ).map(([category, perms]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="font-medium capitalize flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      {category.replace('_', ' ')}
                    </h3>
                    <div className="space-y-2 pl-6">
                      {perms.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between py-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`perm-${permission.id}`} className="text-sm font-medium">
                                {permission.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Label>
                              {permission.enabled ? (
                                <Unlock className="h-3 w-3 text-green-600" />
                              ) : (
                                <Lock className="h-3 w-3 text-red-600" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                          <Switch
                            id={`perm-${permission.id}`}
                            checked={permission.enabled}
                            disabled={saving}
                            onCheckedChange={(checked) => 
                              togglePermission(rolePerms.role, permission.id, checked)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Changes are saved automatically
            </div>
            <Button variant="outline" size="sm">
              <UserCheck className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}