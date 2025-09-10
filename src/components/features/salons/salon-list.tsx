'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, CheckCircle, Eye, Ban, TrendingUp } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils/format'

type Salon = Database['public']['Tables']['salons']['Row'] & {
  profiles?: {
    email: string
    full_name: string | null
  } | null
  _count?: {
    appointments: number
    customers: number
    staff: number
  }
}

export function SalonsList() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchSalons = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('salons')
        .select(`
          *,
          profiles!salons_created_by_fkey(
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch counts for each salon
      const salonsWithCounts = await Promise.all((data || []).map(async (salon) => {
        const [appointments, customers, staff] = await Promise.all([
          supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('salon_id', salon.id),
          supabase.from('customers').select('id', { count: 'exact', head: true }).eq('salon_id', salon.id),
          supabase.from('staff_profiles').select('id', { count: 'exact', head: true }).eq('salon_id', salon.id)
        ])

        return {
          ...salon,
          _count: {
            appointments: appointments.count || 0,
            customers: customers.count || 0,
            staff: staff.count || 0
          }
        }
      }))

      setSalons(salonsWithCounts as Salon[])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching salons:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSalons()
  }, [fetchSalons])

  async function toggleSalonStatus(salonId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('salons')
        .update({ is_active: !currentStatus })
        .eq('id', salonId)

      if (error) throw error
      await fetchSalons()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating salon status:', error)
      }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registered Salons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading salons...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Salons ({salons.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Salon</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salons.map((salon) => (
              <TableRow key={salon.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{salon.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {salon.phone || 'No phone'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{salon.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{salon.profiles?.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{salon.address?.split(',')[0] || 'No address'}</p>
                    <p className="text-xs text-muted-foreground">
                      {salon.address?.substring(0, 30) || 'N/A'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-xs">
                    <div>{salon._count?.appointments || 0} appointments</div>
                    <div>{salon._count?.customers || 0} customers</div>
                    <div>{salon._count?.staff || 0} staff</div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(salon.created_at)}
                </TableCell>
                <TableCell>
                  <Badge variant={salon.is_active ? 'default' : 'secondary'}>
                    {salon.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleSalonStatus(salon.id, salon.is_active)}
                      >
                        {salon.is_active ? (
                          <>
                            <Ban className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}