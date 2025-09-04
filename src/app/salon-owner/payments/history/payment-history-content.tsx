'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { Download, Filter, Search, DollarSign, CreditCard, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

interface PaymentRecord {
  id: string
  customer_id: string
  staff_id: string
  service_amount: number
  tip_amount: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_method: string
  payment_status: string
  payment_date: string
  notes?: string
  customer?: {
    id: string
    full_name: string
    email: string
    phone?: string
  }
  staff?: {
    id: string
    full_name: string
  }
  appointment?: {
    id: string
    service_name?: string
  }
}

interface PaymentHistoryContentProps {
  payments: PaymentRecord[]
  totalCount: number
  currentPage: number
  pageSize: number
  salonName: string
  staff: Array<{ id: string; full_name: string }>
  customers: Array<{ id: string; full_name: string; email: string }>
  searchParams: Record<string, string | undefined>
}

export function PaymentHistoryContent({
  payments,
  totalCount,
  currentPage,
  pageSize,
  salonName,
  staff,
  customers,
  searchParams,
}: PaymentHistoryContentProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.search || '',
    startDate: searchParams.startDate || '',
    endDate: searchParams.endDate || '',
    staffId: searchParams.staffId || '',
    customerId: searchParams.customerId || '',
    paymentMethod: searchParams.paymentMethod || '',
  })

  // Calculate statistics
  const totalRevenue = payments.reduce((sum, p) => sum + (p.total_amount || 0), 0)
  const totalTips = payments.reduce((sum, p) => sum + (p.tip_amount || 0), 0)
  const averageTransaction = payments.length > 0 ? totalRevenue / payments.length : 0

  const totalPages = Math.ceil(totalCount / pageSize)

  const updateSearchParams = useCallback((newFilters: typeof filters) => {
    const params = new URLSearchParams()
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    
    router.push(`/salon-owner/payments/history?${params.toString()}`)
  }, [router])

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const applyFilters = () => {
    updateSearchParams(filters)
    setShowFilters(false)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      startDate: '',
      endDate: '',
      staffId: '',
      customerId: '',
      paymentMethod: '',
    }
    setFilters(clearedFilters)
    updateSearchParams(clearedFilters)
  }

  const exportToCSV = () => {
    // Create CSV content
    const headers = ['Date', 'Customer', 'Staff', 'Service Amount', 'Tip', 'Tax', 'Discount', 'Total', 'Payment Method', 'Status']
    const rows = payments.map(p => [
      format(new Date(p.payment_date), 'yyyy-MM-dd'),
      p.customer?.full_name || 'Unknown',
      p.staff?.full_name || 'Unknown',
      p.service_amount.toFixed(2),
      p.tip_amount.toFixed(2),
      p.tax_amount.toFixed(2),
      p.discount_amount.toFixed(2),
      p.total_amount.toFixed(2),
      p.payment_method,
      p.payment_status,
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payment-history-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="h-4 w-4" />
      case 'card':
        return <CreditCard className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'bg-green-100 text-green-800'
      case 'card':
        return 'bg-blue-100 text-blue-800'
      case 'check':
        return 'bg-purple-100 text-purple-800'
      case 'gift_card':
        return 'bg-pink-100 text-pink-800'
      case 'store_credit':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">
            View and manage payment records for {salonName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => router.push('/salon-owner/payments/record')}>
            Record Payment
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {payments.length} transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTips.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalRevenue > 0 ? `${((totalTips / totalRevenue) * 100).toFixed(1)}% of revenue` : 'N/A'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageTransaction.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per payment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer name, staff, or amount..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="pl-9"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>
            Showing {payments.length} of {totalCount} payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <p className="text-muted-foreground">No payment records found</p>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.customer?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.customer?.email || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{payment.staff?.full_name || 'Unknown'}</TableCell>
                    <TableCell>${payment.service_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {payment.tip_amount > 0 ? `$${payment.tip_amount.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${payment.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentMethodColor(payment.payment_method)}>
                        <span className="flex items-center gap-1">
                          {getPaymentMethodIcon(payment.payment_method)}
                          {payment.payment_method}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={payment.payment_status === 'completed' ? 'default' : 'secondary'}>
                        {payment.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => {
                    const params = new URLSearchParams(urlSearchParams)
                    params.set('page', String(currentPage - 1))
                    router.push(`/salon-owner/payments/history?${params.toString()}`)
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    const params = new URLSearchParams(urlSearchParams)
                    params.set('page', String(currentPage + 1))
                    router.push(`/salon-owner/payments/history?${params.toString()}`)
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters Dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Filter Payments</DialogTitle>
            <DialogDescription>
              Apply filters to narrow down payment records
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Staff Member</Label>
              <Select
                value={filters.staffId}
                onValueChange={(value) => handleFilterChange('staffId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All staff</SelectItem>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select
                value={filters.customerId}
                onValueChange={(value) => handleFilterChange('customerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.full_name} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={filters.paymentMethod}
                onValueChange={(value) => handleFilterChange('paymentMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="gift_card">Gift Card</SelectItem>
                  <SelectItem value="store_credit">Store Credit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button onClick={applyFilters}>Apply Filters</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Details Dialog */}
      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Transaction from {format(new Date(selectedPayment.payment_date), 'MMMM d, yyyy')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Customer</Label>
                  <p className="font-medium">{selectedPayment.customer?.full_name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayment.customer?.email || '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Staff Member</Label>
                  <p className="font-medium">{selectedPayment.staff?.full_name || 'Unknown'}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Label className="text-xs text-muted-foreground">Payment Breakdown</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Service Amount:</span>
                    <span>${selectedPayment.service_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tip Amount:</span>
                    <span>${selectedPayment.tip_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax Amount:</span>
                    <span>${selectedPayment.tax_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount:</span>
                    <span>-${selectedPayment.discount_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${selectedPayment.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Payment Method</Label>
                  <Badge className={`${getPaymentMethodColor(selectedPayment.payment_method)} mt-1`}>
                    {selectedPayment.payment_method}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge
                    variant={selectedPayment.payment_status === 'completed' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {selectedPayment.payment_status}
                  </Badge>
                </div>
              </div>
              
              {selectedPayment.notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <p className="mt-1 text-sm">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}