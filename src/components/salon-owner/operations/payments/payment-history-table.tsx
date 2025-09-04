'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DollarSign,
  CreditCard,
  FileText,
  Download,
  Search,
  MoreVertical,
  Edit,
  Trash,
} from 'lucide-react'


interface PaymentRecord {
  id: string
  appointment_id?: string | null
  customer: {
    id: string
    full_name: string
    email: string
    phone?: string
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
  payment_status: string
  payment_date: string
  notes?: string | null
  appointment?: {
    id: string
    start_time: string
    service_name?: string
  }
}

interface PaymentHistoryTableProps {
  payments: PaymentRecord[]
  isLoading?: boolean
  onEdit?: (payment: PaymentRecord) => void
  onDelete?: (paymentId: string) => void
  onExport?: () => void
}

export function PaymentHistoryTable({
  payments,
  isLoading = false,
  onEdit,
  onDelete,
  onExport,
}: PaymentHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter and sort payments
  const filteredPayments = payments
    .filter((payment) => {
      const matchesSearch =
        payment.customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.staff.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesPaymentMethod =
        paymentMethodFilter === 'all' || payment.payment_method === paymentMethodFilter
      
      return matchesSearch && matchesPaymentMethod
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
          break
        case 'amount':
          comparison = a.total_amount - b.total_amount
          break
        case 'customer':
          comparison = a.customer.full_name.localeCompare(b.customer.full_name)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Calculate totals
  const totals = filteredPayments.reduce(
    (acc, payment) => ({
      services: acc.services + payment.service_amount,
      tips: acc.tips + payment.tip_amount,
      tax: acc.tax + payment.tax_amount,
      discounts: acc.discounts + payment.discount_amount,
      total: acc.total + payment.total_amount,
      count: acc.count + 1,
    }),
    { services: 0, tips: 0, tax: 0, discounts: 0, total: 0, count: 0 }
  )

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
        return 'bg-green-500/10 text-green-700 border-green-300'
      case 'card':
        return 'bg-blue-500/10 text-blue-700 border-blue-300'
      case 'check':
        return 'bg-purple-500/10 text-purple-700 border-purple-300'
      case 'gift_card':
        return 'bg-pink-500/10 text-pink-700 border-pink-300'
      case 'store_credit':
        return 'bg-orange-500/10 text-orange-700 border-orange-300'
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-300'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{totals.count} payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.services.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.tips.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tax
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.tax.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Discounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-${totals.discounts.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer or staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="gift_card">Gift Card</SelectItem>
              <SelectItem value="store_credit">Store Credit</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
        {onExport && (
          <Button onClick={onExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </div>

      {/* Payments Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Service</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Tip</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No payment records found
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
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
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{payment.customer.full_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {payment.customer.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{payment.staff.full_name}</TableCell>
                  <TableCell>
                    {payment.appointment?.service_name || (
                      <span className="text-muted-foreground">Walk-in</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">${payment.service_amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {payment.tip_amount > 0 ? (
                      <span className="text-green-600">${payment.tip_amount.toFixed(2)}</span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${payment.total_amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('capitalize', getPaymentMethodColor(payment.payment_method))}
                    >
                      <span className="flex items-center gap-1">
                        {getPaymentMethodIcon(payment.payment_method)}
                        {payment.payment_method.replace('_', ' ')}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={payment.payment_status === 'completed' ? 'default' : 'secondary'}
                    >
                      {payment.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(payment)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(payment.id)}
                            className="text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                        {payment.notes && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled>
                              <FileText className="mr-2 h-4 w-4" />
                              View Notes
                            </DropdownMenuItem>
                          </>
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
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}