import { createClient } from '@/lib/database/supabase/server'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'
import { 
  Users, 
  Shield, 
  Building, 
  Store, 
  UserCheck,
  Settings,
  MoreVertical,
  Key,
  Lock,
  Activity
} from 'lucide-react'
import { RoleAssignmentDialog } from './role-assignment-dialog'
import type { Database } from '@/types/database.types'

type UserRole = Database['public']['Tables']['user_roles']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type UserRoleType = Database['public']['Enums']['user_role_type']

interface UserWithRoles extends Profile {
  user_roles: (UserRole & {
    salons?: {
      id: string
      name: string
    }
    salon_locations?: {
      id: string
      name: string
    }
  })[]
}

const roleInfo: Record<UserRoleType, { icon: any; color: string; description: string }> = {
  super_admin: {
    icon: Shield,
    color: 'text-purple-500',
    description: 'Full system access and control'
  },
  salon_owner: {
    icon: Building,
    color: 'text-blue-500',
    description: 'Manages salon operations and staff'
  },
  location_manager: {
    icon: Store,
    color: 'text-green-500',
    description: 'Manages specific salon location'
  },
  staff: {
    icon: UserCheck,
    color: 'text-orange-500',
    description: 'Provides services to customers'
  },
  customer: {
    icon: Users,
    color: 'text-gray-500',
    description: 'Books and receives services'
  }
}

export default async function UserRolesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login/super-admin')
  }

  // Verify super admin access
  const { data: adminRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'super_admin')
    .single()

  if (!adminRole) {
    redirect('/error-403')
  }

  // Fetch all users with their roles
  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles(
        *,
        salons(id, name),
        salon_locations(id, name)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
  }

  // Fetch all salons for assignment dialog
  const { data: allSalons } = await supabase
    .from('salons')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  // Calculate statistics
  const roleDistribution = users?.reduce((acc, user) => {
    user.user_roles.forEach(role => {
      acc[role.role] = (acc[role.role] || 0) + 1
    })
    return acc
  }, {} as Record<UserRoleType, number>) || {}

  const multiRoleUsers = users?.filter(u => u.user_roles.length > 1).length || 0
  const noRoleUsers = users?.filter(u => u.user_roles.length === 0).length || 0

  // Group users by primary role
  const usersByRole = users?.reduce((acc, user) => {
    const primaryRole = user.user_roles[0]?.role || 'customer'
    if (!acc[primaryRole]) {
      acc[primaryRole] = []
    }
    acc[primaryRole].push(user)
    return acc
  }, {} as Record<UserRoleType, UserWithRoles[]>) || {}

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Role Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions across the platform
          </p>
        </div>
        <RoleAssignmentDialog 
          salons={allSalons || []}
          mode="create"
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-8">
        {Object.entries(roleInfo).map(([role, info]) => {
          const Icon = info.icon
          const count = roleDistribution[role as UserRoleType] || 0
          
          return (
            <Card key={role}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {role.replace('_', ' ')}
                </CardTitle>
                <Icon className={`h-4 w-4 ${info.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                  Active users
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Multi-Role Users</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{multiRoleUsers}</div>
            <p className="text-xs text-muted-foreground">
              Users with multiple roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{noRoleUsers}</div>
            <p className="text-xs text-muted-foreground">
              Users without roles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users by Role */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="super_admin">Super Admins</TabsTrigger>
          <TabsTrigger value="salon_owner">Salon Owners</TabsTrigger>
          <TabsTrigger value="location_manager">Location Managers</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="customer">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Complete list of all users and their assigned roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users?.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback>
                          {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || 'Unknown User'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex gap-2 mt-2">
                          {user.user_roles.map((ur) => {
                            const info = roleInfo[ur.role]
                            const Icon = info.icon
                            return (
                              <Badge key={ur.id} variant="secondary" className="text-xs">
                                <Icon className={`h-3 w-3 mr-1 ${info.color}`} />
                                {ur.role.replace('_', ' ')}
                                {ur.salons && (
                                  <span className="ml-1">({ur.salons.name})</span>
                                )}
                              </Badge>
                            )
                          })}
                          {user.user_roles.length === 0 && (
                            <Badge variant="outline" className="text-xs">
                              No role assigned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <RoleAssignmentDialog
                          userId={user.id}
                          userName={user.full_name || 'User'}
                          currentRoles={user.user_roles}
                          salons={allSalons || []}
                          mode="edit"
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Shield className="h-4 w-4 mr-2" />
                              Manage Roles
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem>
                          <Activity className="h-4 w-4 mr-2" />
                          View Activity
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Lock className="h-4 w-4 mr-2" />
                          Suspend User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
                
                {(!users || users.length === 0) && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {Object.entries(roleInfo).map(([role, info]) => (
          <TabsContent key={role} value={role}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <info.icon className={`h-5 w-5 ${info.color}`} />
                  <CardTitle className="capitalize">{role.replace('_', ' ')}s</CardTitle>
                </div>
                <CardDescription>{info.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usersByRole[role as UserRoleType]?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={user.avatar_url || ''} />
                          <AvatarFallback>
                            {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.user_roles[0]?.salons && (
                            <p className="text-sm text-muted-foreground">
                              Salon: {user.user_roles[0].salons.name}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  ))}
                  
                  {(!usersByRole[role as UserRoleType] || usersByRole[role as UserRoleType].length === 0) && (
                    <div className="text-center py-8">
                      <info.icon className={`h-12 w-12 ${info.color} mx-auto mb-4 opacity-20`} />
                      <p className="text-muted-foreground">No {role.replace('_', ' ')}s found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}