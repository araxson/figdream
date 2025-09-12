'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Mail,
  Ban,
  UserCheck,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Scissors
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface StaffMember {
  id: string
  user_id: string
  salon_id: string
  bio: string | null
  specialties: string[] | null
  certifications: string[] | null
  years_of_experience: number | null
  is_active: boolean
  availability_status: string | null
  rating: number | null
  created_at: string
  user?: {
    id: string
    email: string
    full_name: string | null
    first_name: string | null
    last_name: string | null
    phone: string | null
    avatar_url: string | null
    is_active: boolean
  }
  salon?: {
    id: string
    name: string
    address: string
  }
  appointments?: Array<{
    id: string
    start_time: string
    status: string
  }>
}

interface StaffManagementClientProps {
  staff: StaffMember[]
  counts: {
    total: number
    active: number
    available: number
    onLeave: number
  }
  salons: Array<{ id: string; name: string }>
}

export function StaffManagementClient({ 
  staff: initialStaff, 
  counts,
  salons
}: StaffManagementClientProps) {
  const [staff, setStaff] = useState(initialStaff)
  const [searchQuery, setSearchQuery] = useState('')
  const [salonFilter, setSalonFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter staff
  const filteredStaff = staff.filter(member => {
    const matchesSearch = !searchQuery || 
      member.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.specialties?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesSalon = salonFilter === 'all' || member.salon_id === salonFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && member.is_active) ||
      (statusFilter === 'inactive' && !member.is_active) ||
      (statusFilter === 'available' && member.availability_status === 'available')
    
    return matchesSearch && matchesSalon && matchesStatus
  })

  const handleToggleStatus = async (member: StaffMember) => {
    try {
      const response = await fetch(`/api/admin/staff/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !member.is_active })
      })
      
      if (!response.ok) throw new Error('Failed to update staff status')
      
      setStaff(prev => prev.map(s => 
        s.id === member.id ? { ...s, is_active: !member.is_active } : s
      ))
      toast.success(`Staff member ${member.is_active ? 'deactivated' : 'activated'} successfully`)
    } catch (error) {
      console.error('Error updating staff:', error)
      toast.error('Failed to update staff status')
    }
  }

  const getStaffStats = (member: StaffMember) => {
    const totalAppointments = member.appointments?.length || 0
    const completedAppointments = member.appointments?.filter(a => a.status === 'completed').length || 0
    const rating = member.rating ? member.rating.toFixed(1) : 'N/A'
    
    return { totalAppointments, completedAppointments, rating }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage all platform staff members and service providers
          </p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
            <p className="text-xs text-muted-foreground">
              All staff members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.available}</div>
            <p className="text-xs text-muted-foreground">
              Ready for appointments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.onLeave}</div>
            <p className="text-xs text-muted-foreground">
              Currently unavailable
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Staff Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Staff Members</CardTitle>
                <CardDescription>
                  View and manage service providers across all salons
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <Scissors className="h-3 w-3" />
                {filteredStaff.length} staff
              </Badge>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={salonFilter} onValueChange={setSalonFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Salons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Salons</SelectItem>
                  {salons.map(salon => (
                    <SelectItem key={salon.id} value={salon.id}>
                      {salon.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Salon</TableHead>
                  <TableHead>Specialties</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Appointments</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No staff members found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((member) => {
                    const stats = getStaffStats(member)
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.user?.avatar_url || ''} />
                              <AvatarFallback>
                                {member.user?.full_name?.split(' ').map(n => n[0]).join('') || 
                                 member.user?.email?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {member.user?.full_name || 'Unnamed'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {member.user?.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.salon?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {member.specialties?.slice(0, 2).map((specialty, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            )) || '-'}
                            {member.specialties && member.specialties.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{member.specialties.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.years_of_experience 
                            ? `${member.years_of_experience} years`
                            : '-'}
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
                          <Badge variant="outline">
                            ⭐ {stats.rating}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={member.is_active ? 'default' : 'secondary'}>
                              {member.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {member.availability_status && (
                              <Badge variant="outline" className="text-xs">
                                {member.availability_status}
                              </Badge>
                            )}
                          </div>
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
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(member)}
                              >
                                {member.is_active ? (
                                  <>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
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