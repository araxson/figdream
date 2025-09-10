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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  MoreHorizontal, 
  Edit, 
  Shield, 
  Ban, 
  Mail, 
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  UserCheck,
  UserX,
  Users
} from 'lucide-react'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { cn } from '@/lib/utils'

type Profile = Database['public']['Tables']['profiles']['Row']

type SortField = 'email' | 'role' | 'created_at' | 'full_name'
type SortOrder = 'asc' | 'desc'

export function UsersTable() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const supabase = createClient()

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])
   
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

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
      let aValue: any = a[sortField] || ''
      let bValue: any = b[sortField] || ''
      
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive'
      case 'salon_owner':
        return 'default'
      case 'staff':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getRoleLabel = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className={cn("ml-2 h-4 w-4 text-muted-foreground")} />
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className={cn("ml-2 h-4 w-4")} />
      : <ArrowDown className={cn("ml-2 h-4 w-4")} />
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage platform users and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn("space-y-4")}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={cn("flex items-center space-x-4")}>
                <Skeleton className={cn("h-12 w-12 rounded-full")} />
                <div className={cn("space-y-2 flex-1")}>
                  <Skeleton className={cn("h-4 w-[250px]")} />
                  <Skeleton className={cn("h-4 w-[200px]")} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
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
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className={cn("flex items-center gap-3")}>
                        <Avatar className={cn("h-10 w-10")}>
                          <AvatarImage src={user.avatar_url || ''} />
                          <AvatarFallback>
                            {user.full_name?.split(' ').map(n => n[0]).join('') || user.email?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className={cn("font-medium")}>
                            {user.full_name || 'Unnamed User'}
                          </div>
                          <div className={cn("text-sm text-muted-foreground")}>
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={cn("flex items-center gap-2")}>
                        <Mail className={cn("h-4 w-4 text-muted-foreground")} />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role || 'customer')}>
                        {getRoleLabel(user.role || 'customer')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={cn("text-sm")}>
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("gap-1")}>
                        <UserCheck className={cn("h-3 w-3")} />
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className={cn("text-right")}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className={cn("h-8 w-8")}>
                            <MoreHorizontal className={cn("h-4 w-4")} />
                            <span className={cn("sr-only")}>Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={cn("w-48")}>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className={cn("mr-2 h-4 w-4")} />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className={cn("mr-2 h-4 w-4")} />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className={cn("mr-2 h-4 w-4")} />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className={cn("text-destructive")}>
                            <Ban className={cn("mr-2 h-4 w-4")} />
                            Suspend User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className={cn("flex items-center justify-between px-2 py-4")}>
            <div className={cn("text-sm text-muted-foreground")}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
            </div>
            <div className={cn("flex items-center gap-2")}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className={cn("h-4 w-4")} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className={cn("h-4 w-4")} />
              </Button>
              <div className={cn("flex items-center gap-1")}>
                <Input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value)
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page)
                    }
                  }}
                  className={cn("h-8 w-12 text-center")}
                  min={1}
                  max={totalPages}
                />
                <span className={cn("text-sm text-muted-foreground")}>
                  of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className={cn("h-4 w-4")} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className={cn("h-4 w-4")} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}