'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  Phone,
  Ban,
  Users,
  UserCheck,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface Customer {
  id: string
  email: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  appointments?: Array<{
    id: string
    start_time: string
    status: string
    total_price: number
  }>
  reviews?: Array<{
    id: string
    rating: number
    created_at: string
  }>
  favorites?: Array<{
    id: string
    salon_id: string
  }>
}

interface CustomersManagementClientProps {
  customers: Customer[]
  counts: {
    total: number
    active: number
    newThisMonth: number
    withAppointments: number
  }
}

export function CustomersManagementClient({ 
  customers: initialCustomers, 
  counts
}: CustomersManagementClientProps) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchQuery || 
      customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const handleSuspend = async (customer: Customer) => {
    try {
      const response = await fetch(`/api/admin/users/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false })
      })
      
      if (!response.ok) throw new Error('Failed to suspend customer')
      
      setCustomers(prev => prev.map(c => 
        c.id === customer.id ? { ...c, is_active: false } : c
      ))
      toast.success('Customer suspended successfully')
    } catch (error) {
      console.error('Error suspending customer:', error)
      toast.error('Failed to suspend customer')
    }
  }

  const handleReactivate = async (customer: Customer) => {
    try {
      const response = await fetch(`/api/admin/users/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true })
      })
      
      if (!response.ok) throw new Error('Failed to reactivate customer')
      
      setCustomers(prev => prev.map(c => 
        c.id === customer.id ? { ...c, is_active: true } : c
      ))
      toast.success('Customer reactivated successfully')
    } catch (error) {
      console.error('Error reactivating customer:', error)
      toast.error('Failed to reactivate customer')
    }
  }

  const getCustomerStats = (customer: Customer) => {
    const totalAppointments = customer.appointments?.length || 0
    const completedAppointments = customer.appointments?.filter(a => a.status === 'completed').length || 0
    const totalSpent = customer.appointments?.reduce((sum, a) => sum + (a.total_price || 0), 0) || 0
    const avgRating = customer.reviews?.length 
      ? (customer.reviews.reduce((sum, r) => sum + r.rating, 0) / customer.reviews.length).toFixed(1)
      : 'N/A'
    
    return { totalAppointments, completedAppointments, totalSpent, avgRating }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers Management</h1>
          <p className="text-muted-foreground">
            View and manage all platform customers
          </p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
            <p className="text-xs text-muted-foreground">
              All registered customers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently active accounts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.newThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Joined this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.withAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Have bookings this month
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Customers</CardTitle>
                <CardDescription>
                  View customer details and booking history
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {filteredCustomers.length} customers
              </Badge>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Appointments</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No customers found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => {
                    const stats = getCustomerStats(customer)
                    return (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={customer.avatar_url || ''} />
                              <AvatarFallback>
                                {customer.full_name?.split(' ').map(n => n[0]).join('') || 
                                 customer.email?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {customer.full_name || 'Unnamed'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {customer.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{stats.completedAppointments} completed</div>
                            <div className="text-muted-foreground">
                              {stats.totalAppointments} total
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          ${stats.totalSpent.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            ⭐ {stats.avgRating}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(customer.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                            {customer.is_active ? 'Active' : 'Suspended'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {customer.is_active ? (
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleSuspend(customer)}
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Suspend Account
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => handleReactivate(customer)}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Reactivate Account
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}