'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CollectPaymentForm } from '@/components/features/appointments/forms/collect-payment-form'

interface AppointmentRevenue {
  appointment_id: string
  appointment_date: string
  total_amount: number
  tip_amount: number
  total_revenue: number
  payment_collected: boolean
  payment_method: string | null
  is_walk_in: boolean
  customer?: {
    first_name: string | null
    last_name: string | null
  }
  staff?: {
    profiles?: {
      first_name: string | null
      last_name: string | null
    }
  }
  services?: Array<{
    name: string
    price: number
  }>
}

interface RevenueData {
  appointment_id: string | null
  appointment_date: string | null
  total_amount: number | null
  tip_amount: number | null
  total_revenue: number | null
  payment_collected: boolean | null
  payment_method: string | null
  is_walk_in: boolean | null
  appointments?: {
    customers?: {
      first_name: string | null
      last_name: string | null
    } | null
    staff_profiles?: {
      profiles?: {
        first_name: string | null
        last_name: string | null
      } | null
    } | null
    appointment_services?: Array<{
      services?: {
        name: string | null
        price: number | null
      } | null
    }> | null
  } | null
}

interface AppointmentsRevenueTableProps {
  salonId: string
  dateRange?: { start: Date; end: Date }
}

export function AppointmentsRevenueTable({ salonId, dateRange }: AppointmentsRevenueTableProps) {
  const [revenues, setRevenues] = useState<AppointmentRevenue[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchRevenues = useCallback(async () => {
    try {
      let query = supabase
        .from('revenue_summary')
        .select(`
          appointment_id,
          appointment_date,
          total_amount,
          tip_amount,
          total_revenue,
          payment_collected,
          payment_method,
          is_walk_in,
          appointments!inner(
            customers(first_name, last_name),
            staff_profiles(
              profiles(first_name, last_name)
            ),
            appointment_services(
              services(name, price)
            )
          )
        `)
        .eq('salon_id', salonId)
        .order('appointment_date', { ascending: false })
        .limit(100)

      if (dateRange) {
        query = query
          .gte('appointment_date', format(dateRange.start, 'yyyy-MM-dd'))
          .lte('appointment_date', format(dateRange.end, 'yyyy-MM-dd'))
      }

      const { data, error } = await query

      if (error) throw error
      
      // Transform the data and filter out invalid entries
      const transformedData = (data as RevenueData[] | null)?.map((item) => ({
        appointment_id: item.appointment_id || '',
        appointment_date: item.appointment_date || '',
        total_amount: item.total_amount || 0,
        tip_amount: item.tip_amount || 0,
        total_revenue: item.total_revenue || 0,
        payment_collected: item.payment_collected || false,
        payment_method: item.payment_method,
        is_walk_in: item.is_walk_in || false,
        customer: item.appointments?.customers || { first_name: 'Customer', last_name: '' },
        staff: item.appointments?.staff_profiles || { profiles: { first_name: 'Staff', last_name: '' } },
        services: item.appointments?.appointment_services?.map((as) => ({
          name: as.services?.name || 'Service',
          price: as.services?.price || 0
        })) || []
      })).filter((item) => 
        item.appointment_id !== '' && item.appointment_date !== ''
      ) as AppointmentRevenue[] || []
      
      setRevenues(transformedData)
    } catch (error) {
      console.error('Error fetching revenues:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, salonId, dateRange])

  useEffect(() => {
    fetchRevenues()
  }, [fetchRevenues])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading revenue data...</p>
      </div>
    )
  }

  if (revenues.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No revenue data available for the selected period.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Services</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Tips</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {revenues.map((revenue) => {
            const customerName = revenue.customer
              ? `${revenue.customer.first_name || ''} ${revenue.customer.last_name || ''}`.trim() || 'Customer'
              : revenue.is_walk_in ? 'Walk-in' : 'Customer'
            
            const staffName = revenue.staff?.profiles
              ? `${revenue.staff.profiles.first_name || ''} ${revenue.staff.profiles.last_name || ''}`.trim()
              : '-'
            
            const servicesList = revenue.services?.map(s => s.name).filter(Boolean).join(', ') || 'Services'
            
            return (
              <TableRow key={revenue.appointment_id}>
                <TableCell className="font-medium">
                  {format(new Date(revenue.appointment_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {customerName}
                    {revenue.is_walk_in && (
                      <Badge variant="secondary" className="text-xs">Walk-in</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={servicesList}>
                  {servicesList}
                </TableCell>
                <TableCell>{staffName}</TableCell>
                <TableCell>{formatCurrency(revenue.total_amount)}</TableCell>
                <TableCell>{revenue.tip_amount ? formatCurrency(revenue.tip_amount) : '-'}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(revenue.total_revenue)}</TableCell>
                <TableCell>
                  {revenue.payment_method ? (
                    <Badge variant="outline">
                      {revenue.payment_method.replace('_', ' ')}
                    </Badge>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={revenue.payment_collected ? "default" : "secondary"}>
                    {revenue.payment_collected ? 'Collected' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {!revenue.payment_collected && (
                    <CollectPaymentForm
                      appointmentId={revenue.appointment_id}
                      customerName={customerName}
                      services={revenue.services || []}
                      existingAmount={revenue.total_amount}
                      existingTip={revenue.tip_amount}
                      isCollected={revenue.payment_collected}
                    />
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}