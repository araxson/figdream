/**
 * Payment History Component for FigDream
 * Displays user's payment history with filtering and details
 */

'use client'

import { useState } from 'react'
import { 
  CreditCard, 
  Download, 
  Filter, 
  Receipt, 
  RefreshCw,
  Search,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Payment {
  id: string
  booking_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded' | 'cancelled'
  payment_method: string
  created_at: string
  processed_at?: string
  description?: string
  receipt_url?: string
  is_deposit?: boolean
  deposit_amount?: number
  refunded_amount?: number
  bookings?: {
    id: string
    salons: {
      name: string
    }
    locations: {
      name: string
    }
    booking_services: Array<{
      service_name: string
      price: number
    }>
  }
  payment_refunds?: Array<{
    id: string
    amount: number
    reason: string
    created_at: string
    status: string
  }>
}

interface PaymentHistoryProps {
  payments: Payment[]
  onRefresh?: () => void
  onExport?: () => void
}

export function PaymentHistory({ payments, onRefresh, onExport }: PaymentHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      if (
        !payment.id.toLowerCase().includes(search) &&
        !payment.description?.toLowerCase().includes(search) &&
        !payment.bookings?.salons.name.toLowerCase().includes(search)
      ) {
        return false
      }
    }

    // Status filter
    if (statusFilter !== 'all' && payment.status !== statusFilter) {
      return false
    }

    // Date range filter
    if (dateRange !== 'all') {
      const paymentDate = new Date(payment.created_at)
      const now = new Date()
      
      switch (dateRange) {
        case 'today':
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          if (paymentDate < today) return false
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (paymentDate < weekAgo) return false
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (paymentDate < monthAgo) return false
          break
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          if (paymentDate < yearAgo) return false
          break
      }
    }

    return true
  })

  // Calculate statistics
  const stats = {
    total: filteredPayments.reduce((sum, p) => 
      p.status === 'completed' ? sum + p.amount : sum, 0
    ),
    completed: filteredPayments.filter(p => p.status === 'completed').length,
    pending: filteredPayments.filter(p => p.status === 'pending').length,
    refunded: filteredPayments.reduce((sum, p) => 
      sum + (p.refunded_amount || 0), 0
    )
  }

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'refunded':
      case 'partially_refunded':
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: Payment['status']) => {
    const variants: Record<Payment['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      refunded: 'outline',
      partially_refunded: 'outline',
      cancelled: 'outline'
    }

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total)}</div>
              <p className="text-xs text-muted-foreground">
                From {stats.completed} completed payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Successful payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Refunded</CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.refunded)}</div>
              <p className="text-xs text-muted-foreground">Total refunds</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View and manage your payment transactions</CardDescription>
              </div>
              <div className="flex gap-2">
                {onRefresh && (
                  <Button variant="outline" size="sm" onClick={onRefresh}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                )}
                {onExport && (
                  <Button variant="outline" size="sm" onClick={onExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter Controls */}
            <div className="flex flex-col gap-4 mb-6 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payments Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <CreditCard className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No payments found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {new Date(payment.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(payment.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">
                              {payment.bookings?.salons.name || 'Payment'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {payment.description || payment.bookings?.locations.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">
                              {formatCurrency(payment.amount, payment.currency)}
                            </p>
                            {payment.is_deposit && (
                              <Badge variant="secondary" className="text-xs">Deposit</Badge>
                            )}
                            {payment.refunded_amount && payment.refunded_amount > 0 && (
                              <p className="text-xs text-red-600">
                                -{formatCurrency(payment.refunded_amount, payment.currency)} refunded
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(payment.status)}
                            {getStatusBadge(payment.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {payment.payment_method.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Payment Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedPayment(payment)
                                  setShowDetails(true)
                                }}
                              >
                                <Receipt className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {payment.receipt_url && (
                                <DropdownMenuItem asChild>
                                  <a 
                                    href={payment.receipt_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Receipt
                                  </a>
                                </DropdownMenuItem>
                              )}
                              {payment.booking_id && (
                                <DropdownMenuItem asChild>
                                  <a href={`/customer/bookings/${payment.booking_id}`}>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    View Booking
                                  </a>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Complete information about this payment transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="refunds">Refunds</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                      <p className="font-mono text-sm">{selectedPayment.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedPayment.status)}
                        {getStatusBadge(selectedPayment.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Amount</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                      <Badge variant="outline" className="capitalize mt-1">
                        {selectedPayment.payment_method.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created</p>
                      <p className="text-sm">
                        {new Date(selectedPayment.created_at).toLocaleString()}
                      </p>
                    </div>
                    {selectedPayment.processed_at && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Processed</p>
                        <p className="text-sm">
                          {new Date(selectedPayment.processed_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {selectedPayment.bookings && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Salon</p>
                      <p className="font-medium">{selectedPayment.bookings.salons.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPayment.bookings.locations.name}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="services" className="space-y-4">
                {selectedPayment.bookings?.booking_services && selectedPayment.bookings.booking_services.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPayment.bookings.booking_services.map((service, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                        <span className="font-medium">{service.service_name}</span>
                        <span className="font-semibold">
                          {formatCurrency(service.price, selectedPayment.currency)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-bold">
                        {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No service details available
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="refunds" className="space-y-4">
                {selectedPayment.payment_refunds && selectedPayment.payment_refunds.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPayment.payment_refunds.map((refund) => (
                      <div key={refund.id} className="p-4 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {formatCurrency(refund.amount, selectedPayment.currency)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {refund.reason}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(refund.created_at).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={refund.status === 'succeeded' ? 'default' : 'secondary'}>
                            {refund.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No refunds for this payment
                  </p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}