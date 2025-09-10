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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Eye, Power, Trash } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils/format'

type Salon = Database['public']['Tables']['salons']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row']
  staff_count?: number
}

export function SalonsTable() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchSalons = useCallback(async () => {
    try {
      // Get all salons with owner info
      const { data: salonsData, error } = await supabase
        .from('salons')
        .select(`
          *,
          profiles!salons_created_by_fkey(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get staff counts for each salon
      const salonsWithCounts = await Promise.all(
        (salonsData || []).map(async (salon) => {
          const { count } = await supabase
            .from('staff_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('salon_id', salon.id)

          return {
            ...salon,
            staff_count: count || 0
          }
        })
      )

      setSalons(salonsWithCounts as Salon[])
    } catch (error) {
      console.error('Error fetching salons:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])
   
  useEffect(() => {
    fetchSalons()
  }, [fetchSalons])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Salons</CardTitle>
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
        <CardTitle>All Salons</CardTitle>
      </CardHeader>
      <CardContent>
        {salons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No salons found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Salon Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
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
                        {salon.address || 'No address'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {salon.profiles?.full_name || salon.profiles?.email || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{salon.email || 'No email'}</p>
                      <p className="text-muted-foreground">{salon.phone || 'No phone'}</p>
                    </div>
                  </TableCell>
                  <TableCell>{salon.staff_count || 0}</TableCell>
                  <TableCell>
                    <Badge variant={salon.is_active ? 'default' : 'secondary'}>
                      {salon.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(salon.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Salon
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Power className="mr-2 h-4 w-4" />
                          {salon.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Salon
                        </DropdownMenuItem>
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