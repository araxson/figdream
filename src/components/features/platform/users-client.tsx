'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Shield,
  Ban,
  Plus,
  Download,
  Mail,
  Phone,
  Calendar,
  Activity,
  UserCheck,
  UserX,
  Key,
  Send,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
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
import { USER_ROLES } from '@/lib/auth/constants'

interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  role: string
  avatar_url?: string
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
  last_login?: string
  salons?: Array<{ id: string; name: string }>
  staff_member?: Array<{
    id: string
    position: string
    salon?: { id: string; name: string }
  }>
  appointments_as_customer?: Array<{ count: number }>
  appointments_as_staff?: Array<{ count: number }>
}

interface UsersClientProps {
  users: User[]
  stats: {
    total: number
    active: number
    verified: number
    recentRegistrations: number
    roleDistribution: Record<string, number>
  }
  recentActivity: any[]
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  salon_owner: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  salon_manager: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  staff: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  customer: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

export function UsersClient({ users, stats, recentActivity }: UsersClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const itemsPerPage = 25

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    role: USER_ROLES.CUSTOMER,
    send_welcome: true,
    is_active: true
  })

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery)
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active) ||
      (statusFilter === 'verified' && user.email_verified) ||
      (statusFilter === 'unverified' && !user.email_verified)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleCreate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to create user')

      toast.success('User created successfully')
      if (formData.send_welcome) {
        toast.success('Welcome email sent')
      }
      setIsCreateOpen(false)
      resetForm()
      window.location.reload()
    } catch (error) {
      toast.error('Failed to create user')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingUser) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to update user')

      toast.success('User updated successfully')
      setIsEditOpen(false)
      setEditingUser(null)
      window.location.reload()
    } catch (error) {
      toast.error('Failed to update user')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteUserId) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${deleteUserId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete user')

      toast.success('User deleted successfully')
      setDeleteUserId(null)
      window.location.reload()
    } catch (error) {
      toast.error('Failed to delete user')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/toggle-status`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to toggle status')

      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`)
      window.location.reload()
    } catch (error) {
      toast.error('Failed to toggle user status')
      console.error(error)
    }
  }

  const handleResetPassword = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to reset password')

      toast.success('Password reset email sent')
    } catch (error) {
      toast.error('Failed to reset password')
      console.error(error)
    }
  }

  const handleVerifyEmail = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify-email`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to verify email')

      toast.success('Email verified successfully')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to verify email')
      console.error(error)
    }
  }

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Role', 'Status', 'Verified', 'Created', 'Last Login'],
      ...filteredUsers.map(user => [
        user.full_name || '',
        user.email,
        user.phone || '',
        user.role,
        user.is_active ? 'Active' : 'Inactive',
        user.email_verified ? 'Yes' : 'No',
        format(new Date(user.created_at), 'yyyy-MM-dd'),
        user.last_login ? format(new Date(user.last_login), 'yyyy-MM-dd') : 'Never'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      phone: '',
      role: USER_ROLES.CUSTOMER,
      send_welcome: true,
      is_active: true
    })
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role,
      send_welcome: false,
      is_active: user.is_active
    })
    setIsEditOpen(true)
  }

  const getUserInitials = (user: User) => {
    if (user.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return user.email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage platform users, roles, and permissions
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={USER_ROLES.SUPER_ADMIN}>Super Admin</SelectItem>
                      <SelectItem value={USER_ROLES.SALON_OWNER}>Salon Owner</SelectItem>
                      <SelectItem value={USER_ROLES.SALON_MANAGER}>Salon Manager</SelectItem>
                      <SelectItem value={USER_ROLES.STAFF}>Staff</SelectItem>
                      <SelectItem value={USER_ROLES.CUSTOMER}>Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="send-welcome">Send Welcome Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Send login credentials to the user
                    </p>
                  </div>
                  <Switch
                    id="send-welcome"
                    checked={formData.send_welcome}
                    onCheckedChange={(checked) => setFormData({ ...formData, send_welcome: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="active">Active Account</Label>
                    <p className="text-sm text-muted-foreground">
                      User can log in immediately
                    </p>
                  </div>
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isLoading || !formData.email}>
                {isLoading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Can access platform</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">Email confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentRegistrations}</div>
            <p className="text-xs text-muted-foreground">Recent signups</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.roleDistribution.super_admin || 0}</div>
            <p className="text-xs text-muted-foreground">Platform admins</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value={USER_ROLES.SUPER_ADMIN}>Super Admin</SelectItem>
                <SelectItem value={USER_ROLES.SALON_OWNER}>Salon Owner</SelectItem>
                <SelectItem value={USER_ROLES.SALON_MANAGER}>Salon Manager</SelectItem>
                <SelectItem value={USER_ROLES.STAFF}>Staff</SelectItem>
                <SelectItem value={USER_ROLES.CUSTOMER}>Customer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="unverified">Unverified Only</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                          <p className="text-xs text-muted-foreground">
                            ID: {user.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={ROLE_COLORS[user.role] || ''}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {user.email_verified ? (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.last_login ? (
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(user.last_login), 'MMM d')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                            <Key className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                          {!user.email_verified && (
                            <DropdownMenuItem onClick={() => handleVerifyEmail(user.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Verify Email
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                            {user.is_active ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteUserId(user.id)}
                            className="text-destructive"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage <= 3 ? i + 1 : currentPage + i - 2
              if (page > totalPages) return null
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={USER_ROLES.SUPER_ADMIN}>Super Admin</SelectItem>
                    <SelectItem value={USER_ROLES.SALON_OWNER}>Salon Owner</SelectItem>
                    <SelectItem value={USER_ROLES.SALON_MANAGER}>Salon Manager</SelectItem>
                    <SelectItem value={USER_ROLES.STAFF}>Staff</SelectItem>
                    <SelectItem value={USER_ROLES.CUSTOMER}>Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="edit-active">Active Account</Label>
                <p className="text-sm text-muted-foreground">
                  User can access the platform
                </p>
              </div>
              <Switch
                id="edit-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}