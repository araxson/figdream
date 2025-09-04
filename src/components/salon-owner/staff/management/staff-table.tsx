'use client'

import { useState, useEffect, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/database/supabase/client'
import { toast } from 'sonner'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Mail,
  Phone
} from 'lucide-react'

export interface StaffTableProps {
  className?: string
  salonId?: string
}

interface StaffMember {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: string
  status: 'active' | 'inactive' | 'pending'
  hire_date: string
  hourly_rate: number | null
  commission_rate: number | null
  specialties: string[] | null
  avatar_url: string | null
}

export function StaffTable({ className, salonId }: StaffTableProps) {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStaffMembers()
  }, [salonId, fetchStaffMembers])

  const fetchStaffMembers = useCallback(async () => {
    try {
      const supabase = createClient()
      
      let query = supabase
        .from('staff_profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          role,
          status,
          hire_date,
          hourly_rate,
          commission_rate,
          specialties,
          avatar_url
        `)
        .order('full_name', { ascending: true })

      if (salonId) {
        query = query.eq('salon_id', salonId)
      }

      const { data, error } = await query

      if (error) {
        setError('Failed to load staff members')
        return
      }

      setStaffMembers(data || [])
    } catch (_err) {
      setError('Failed to load staff members')
    } finally {
      setLoading(false)
    }
  }, [salonId])

  async function updateStaffStatus(staffId: string, status: 'active' | 'inactive') {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('staff_profiles')
        .update({ status })
        .eq('id', staffId)

      if (error) {
        toast.error('Failed to update staff status')
        return
      }

      setStaffMembers(prev => 
        prev.map(staff => 
          staff.id === staffId 
            ? { ...staff, status }
            : staff
        )
      )

      toast.success(`Staff member ${status === 'active' ? 'activated' : 'deactivated'}`)
    } catch (_err) {
      toast.error('Failed to update staff status')
    }
  }

  async function deleteStaffMember(staffId: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('staff_profiles')
        .delete()
        .eq('id', staffId)

      if (error) {
        toast.error('Failed to delete staff member')
        return
      }

      setStaffMembers(prev => prev.filter(staff => staff.id !== staffId))
      toast.success('Staff member deleted successfully')
    } catch (_err) {
      toast.error('Failed to delete staff member')
    }
  }


  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            onClick={fetchStaffMembers}
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Staff Members</CardTitle>
          <Badge variant="outline">{staffMembers.length} total</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {staffMembers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No staff members found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffMembers.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {staff.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={staff.avatar_url}
                            alt={staff.full_name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {staff.full_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">{staff.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{staff.email}</span>
                      </div>
                      {staff.phone && (
                        <div className="flex items-center space-x-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{staff.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{staff.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={staff.status === 'active' ? 'default' : 'secondary'}
                      className={staff.status === 'active' ? 'bg-green-500' : ''}
                    >
                      {staff.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {staff.hourly_rate && (
                        <div>${staff.hourly_rate}/hr</div>
                      )}
                      {staff.commission_rate && (
                        <div className="text-muted-foreground">
                          {staff.commission_rate}% commission
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {staff.specialties && staff.specialties.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {staff.specialties.slice(0, 2).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {staff.specialties.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{staff.specialties.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStaffStatus(
                            staff.id, 
                            staff.status === 'active' ? 'inactive' : 'active'
                          )}
                        >
                          {staff.status === 'active' ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {staff.full_name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteStaffMember(staff.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
