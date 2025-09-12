'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserX,
  Users,
  Search,
  Filter
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { UsersPagination } from './users-table-pagination'
import { UsersTableRow } from './users-table-row'
import type { SortField, SortOrder, UsersTableProps } from '@/types/features/users-table-types'

export function UsersTableClient({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [_isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<typeof initialUsers[0] | null>(null)
  const [_isLoading, setIsLoading] = useState(false)
  const itemsPerPage = 10

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users]
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField] || ''
      let bValue: string | number = b[sortField] || ''
      
      if (sortField === 'created_at') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    return filtered
  }, [users, searchQuery, roleFilter, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className={cn("ml-2 h-4 w-4 text-muted-foreground")} />
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className={cn("ml-2 h-4 w-4")} />
      : <ArrowDown className={cn("ml-2 h-4 w-4")} />
  }

  const handleEditUser = (user: typeof initialUsers[0]) => {
    // Navigate to edit page
    window.location.href = `/admin/users/${user.id}/edit`
  }

  const handleChangeRole = async (user: typeof initialUsers[0], newRole: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      
      if (!response.ok) throw new Error('Failed to update role')
      
      const { user: updatedUser } = await response.json()
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u))
      toast.success('User role updated successfully')
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update user role')
    } finally {
      setIsLoading(false)
      setIsRoleDialogOpen(false)
    }
  }

  const handleDeleteUser = async (user: typeof initialUsers[0]) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete user')
      
      setUsers(prev => prev.filter(u => u.id !== user.id))
      toast.success('User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className={cn("flex flex-col gap-4")}>
          <div className={cn("flex items-center justify-between")}>
            <div>
              <CardTitle className={cn("text-2xl")}>All Users</CardTitle>
              <CardDescription>
                Manage platform users and their permissions
              </CardDescription>
            </div>
            <div className={cn("flex items-center gap-2")}>
              <Badge variant="outline" className={cn("gap-1")}>
                <Users className={cn("h-3 w-3")} />
                {filteredAndSortedUsers.length} users
              </Badge>
            </div>
          </div>
          
          {/* Filters */}
          <div className={cn("flex flex-col sm:flex-row gap-3")}>
            <div className={cn("relative flex-1")}>
              <Search className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4")} />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className={cn("pl-9")}
              />
            </div>
            <Select 
              value={roleFilter} 
              onValueChange={(value) => {
                setRoleFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className={cn("w-full sm:w-[200px]")}>
                <Filter className={cn("mr-2 h-4 w-4")} />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="salon_owner">Salon Owner</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("rounded-lg border")}>
          <Table>
            <TableHeader>
              <TableRow className={cn("hover:bg-transparent")}>
                <TableHead className={cn("w-[300px]")}>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('full_name')}
                    className={cn("h-8 p-0 font-medium hover:bg-transparent")}
                  >
                    User
                    <SortIcon field="full_name" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('email')}
                    className={cn("h-8 p-0 font-medium hover:bg-transparent")}
                  >
                    Email
                    <SortIcon field="email" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('role')}
                    className={cn("h-8 p-0 font-medium hover:bg-transparent")}
                  >
                    Role
                    <SortIcon field="role" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('created_at')}
                    className={cn("h-8 p-0 font-medium hover:bg-transparent")}
                  >
                    Joined
                    <SortIcon field="created_at" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className={cn("text-right")}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className={cn("h-24 text-center")}>
                    <div className={cn("flex flex-col items-center gap-2")}>
                      <UserX className={cn("h-8 w-8 text-muted-foreground")} />
                      <p className={cn("text-muted-foreground")}>No users found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <UsersTableRow 
                    key={user.id} 
                    user={user}
                    onEdit={handleEditUser}
                    onChangeRole={(user) => {
                      setSelectedUser(user)
                      setIsRoleDialogOpen(true)
                    }}
                    onSendEmail={(_user) => {
                      // TODO: Implement send email functionality
                      toast.info('Email functionality will be available soon')
                    }}
                    onSuspend={(user) => {
                      setSelectedUser(user)
                      setIsDeleteDialogOpen(true)
                    }}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <UsersPagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredAndSortedUsers.length}
            onPageChange={setCurrentPage}
          />
        )}
      </CardContent>
    </Card>

    {/* Role Change Dialog */}
    <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for {selectedUser?.full_name || selectedUser?.email}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select
            defaultValue={selectedUser?.role || 'customer'}
            onValueChange={(value) => {
              if (selectedUser) {
                handleChangeRole(selectedUser, value)
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="salon_owner">Salon Owner</SelectItem>
              <SelectItem value="salon_manager">Salon Manager</SelectItem>
              <SelectItem value="location_manager">Location Manager</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user
            &quot;{selectedUser?.full_name || selectedUser?.email}&quot; and remove all their data
            from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (selectedUser) {
                handleDeleteUser(selectedUser)
              }
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}