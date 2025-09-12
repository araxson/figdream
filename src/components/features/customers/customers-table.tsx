'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Mail, Phone, Calendar, MoreHorizontal, Eye, Edit } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils/format'

type Customer = Database['public']['Tables']['customers']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row']
  appointments?: Database['public']['Tables']['appointments']['Row'][]
}

interface CustomersTableProps {
  salonId?: string
  limit?: number
}

export function CustomersTable({ salonId, limit = 50 }: CustomersTableProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchCustomers = useCallback(async () => {
    try {
      let query = supabase
        .from('customers')
        .select(`
          *,
          profiles(*),
          appointments(*)
        `)
        .order('created_at', { ascending: false })

      if (salonId) {
        query = query.eq('salon_id', salonId)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, salonId, limit])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading customers...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Total Visits</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {customer.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {customer.email && (
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.appointments?.length || 0} visits
                </TableCell>
                <TableCell>
                  {customer.appointments && customer.appointments.length > 0
                    ? formatDate(customer.appointments[0].created_at)
                    : 'Never'
                  }
                </TableCell>
                <TableCell>
                  <Badge variant="default">
                    Active
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
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
                        Edit Customer
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Appointment
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