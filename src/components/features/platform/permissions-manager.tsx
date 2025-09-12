'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Key, Save } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Database } from '@/types/database.types'
import { updateRolePermissionAction } from '@/lib/actions/permissions'

type RolePermissionTemplate = Database['public']['Tables']['role_permission_templates']['Row']

interface PermissionsManagementProps {
  initialPermissions: RolePermissionTemplate[]
}

export function PermissionsManagement({ initialPermissions }: PermissionsManagementProps) {
  const [permissions, setPermissions] = useState(initialPermissions)
  const [saving, setSaving] = useState(false)
  const [activeRole, setActiveRole] = useState('admin')

  // Group permissions by role
  const permissionsByRole = permissions.reduce((acc, perm) => {
    if (!acc[perm.role_type]) {
      acc[perm.role_type] = []
    }
    acc[perm.role_type].push(perm)
    return acc
  }, {} as Record<string, RolePermissionTemplate[]>)

  const handleTogglePermission = async (permissionId: string, field: 'can_read' | 'can_create' | 'can_update' | 'can_delete', enabled: boolean) => {
    setSaving(true)
    try {
      const result = await updateRolePermissionAction(permissionId, { [field]: enabled })
      
      if (result.success && result.data) {
        setPermissions(prev => 
          prev.map(p => p.id === permissionId ? { ...p, [field]: enabled } : p)
        )
        toast({ title: 'Permission updated successfully' })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update permission',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const roles = Object.keys(permissionsByRole)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Role Permissions</CardTitle>
          </div>
          <Button size="sm" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'All changes auto-save'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeRole} onValueChange={setActiveRole}>
          <TabsList className={`grid w-full ${
            roles.length === 2 ? 'grid-cols-2' : 
            roles.length === 3 ? 'grid-cols-3' :
            roles.length === 4 ? 'grid-cols-4' :
            roles.length === 5 ? 'grid-cols-5' :
            'grid-cols-6'
          }`}>
            {roles.map(role => (
              <TabsTrigger key={role} value={role}>
                {role.replace('_', ' ').toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>

          {roles.map(role => (
            <TabsContent key={role} value={role} className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Configure permissions for {role.replace('_', ' ')} role
              </div>

              <div className="space-y-4">
                {permissionsByRole[role]?.map(permission => (
                  <div
                    key={permission.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <Label className="text-base font-medium">
                          {permission.permission_name.replace(/_/g, ' ').toUpperCase()}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {permission.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 pl-7">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${permission.id}-read`}
                          checked={permission.can_read || false}
                          onCheckedChange={(checked) => handleTogglePermission(permission.id, 'can_read', checked)}
                          disabled={saving}
                        />
                        <Label htmlFor={`${permission.id}-read`} className="text-sm">Read</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${permission.id}-create`}
                          checked={permission.can_create || false}
                          onCheckedChange={(checked) => handleTogglePermission(permission.id, 'can_create', checked)}
                          disabled={saving}
                        />
                        <Label htmlFor={`${permission.id}-create`} className="text-sm">Create</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${permission.id}-update`}
                          checked={permission.can_update || false}
                          onCheckedChange={(checked) => handleTogglePermission(permission.id, 'can_update', checked)}
                          disabled={saving}
                        />
                        <Label htmlFor={`${permission.id}-update`} className="text-sm">Update</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${permission.id}-delete`}
                          checked={permission.can_delete || false}
                          onCheckedChange={(checked) => handleTogglePermission(permission.id, 'can_delete', checked)}
                          disabled={saving}
                        />
                        <Label htmlFor={`${permission.id}-delete`} className="text-sm">Delete</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}