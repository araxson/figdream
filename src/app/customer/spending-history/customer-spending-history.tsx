'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  DollarSign,
  TrendingUp,
  Award,
  Receipt,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { getCustomerPaymentHistory } from '@/app/_actions/payments'

interface PaymentRecord {
  id: string
  salon: {
    id: string
    name: string
  }
  staff: {
    id: string
    full_name: string
  }
  service_amount: number
  tip_amount: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_method: string
  payment_date: string
  appointment?: {
    id: string
    start_time: string
    service_name?: string
  }
}

interface CustomerSpendingHistoryProps {
  customerId: string
  initialPayments: PaymentRecord[]
  totalCount: number
}

export function CustomerSpendingHistory({
  customerId,
  initialPayments,
}: CustomerSpendingHistoryProps) {
  const [payments, setPayments] = useState(initialPayments)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate statistics
  const stats = payments.reduce(
    (acc, payment) => {
      acc.totalSpent += payment.total_amount
      acc.totalTips += payment.tip_amount
      acc.totalVisits += 1
      acc.totalSavings += payment.discount_amount

      // Track spending by salon
      if (!acc.salonSpending[payment.salon.id]) {
        acc.salonSpending[payment.salon.id] = {
          name: payment.salon.name,
          amount: 0,
          visits: 0,
        }
      }
      acc.salonSpending[payment.salon.id].amount += payment.total_amount
      acc.salonSpending[payment.salon.id].visits += 1

      return acc
    },
    {
      totalSpent: 0,
      totalTips: 0,
      totalVisits: 0,
      totalSavings: 0,
      salonSpending: {} as Record<string, { name: string; amount: number; visits: number }>,
    }
  )

  const averageSpending = stats.totalVisits > 0 ? stats.totalSpent / stats.totalVisits : 0

  // Get favorite salon
  const favoriteSalon = Object.entries(stats.salonSpending).sort(
    ([, a], [, b]) => b.visits - a.visits
  )[0]

  const fetchPayments = async (salonId?: string) => {
    setIsLoading(true)
    try {
      const { data } = await getCustomerPaymentHistory(customerId, {
        salonId: salonId || undefined,
        limit: 100,
      })
      setPayments(data)
    } catch {
      toast.error('Failed to load spending history')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    // Convert payments to CSV
    const headers = [
      'Date',
      'Salon',
      'Service',
      'Staff',
      'Service Amount',
      'Tip',
      'Tax',
      'Discount',
      'Total',
      'Payment Method',
    ]

    const rows = payments.map((payment) => [
      format(new Date(payment.payment_date), 'yyyy-MM-dd'),
      payment.salon.name,
      payment.appointment?.service_name || 'Service',
      payment.staff.full_name,
      payment.service_amount.toFixed(2),
      payment.tip_amount.toFixed(2),
      payment.tax_amount.toFixed(2),
      payment.discount_amount.toFixed(2),
      payment.total_amount.toFixed(2),
      payment.payment_method,
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spending-history-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success('Spending history exported successfully')
  }

  if (isLoading && payments.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Spending History</h1>
          <p className="text-muted-foreground">
            Track your spending across all salons and services
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export History
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.totalVisits} visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Per Visit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageSpending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per appointment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tips Given</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalTips.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalVisits > 0
                ? `Avg: $${(stats.totalTips / stats.totalVisits).toFixed(2)}`
                : 'No tips yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalSavings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">From discounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Favorite Salon */}
      {favoriteSalon && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Favorite Salon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-semibold">{favoriteSalon[1].name}</p>
                <p className="text-sm text-muted-foreground">
                  {favoriteSalon[1].visits} visits • ${favoriteSalon[1].amount.toFixed(2)} spent
                </p>
              </div>
              <Badge variant="default">Most Visited</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="by-salon">By Salon</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All your payments across different salons</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Salon</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Tip</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No payment history found
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(payment.payment_date), 'h:mm a')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{payment.salon.name}</TableCell>
                        <TableCell>
                          {payment.appointment?.service_name || (
                            <span className="text-muted-foreground">Service</span>
                          )}
                        </TableCell>
                        <TableCell>{payment.staff.full_name}</TableCell>
                        <TableCell className="text-right">
                          ${payment.service_amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.tip_amount > 0 ? (
                            <span className="text-green-600">
                              ${payment.tip_amount.toFixed(2)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${payment.total_amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {payment.payment_method.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-salon">
          <div className="grid gap-4">
            {Object.entries(stats.salonSpending).map(([salonId, data]) => (
              <Card key={salonId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{data.name}</CardTitle>
                      <CardDescription>
                        {data.visits} visits • Average: $
                        {(data.amount / data.visits).toFixed(2)} per visit
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${data.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Total spent</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchPayments(salonId)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}