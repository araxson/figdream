"use client"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

import { useState } from "react"
import { 
  CreditCard, RefreshCw, AlertCircle, CheckCircle, 
  DollarSign, Clock,
  XCircle, FileText
} from "lucide-react"
interface Transaction {
  id: string
  salonName: string
  amount: number
  status: 'success' | 'pending' | 'failed' | 'refunded'
  method: string
  date: string
  reference: string
}
interface FailedPayment {
  id: string
  salonName: string
  amount: number
  failureReason: string
  attempts: number
  lastAttempt: string
  nextRetry: string
}
interface RefundRequest {
  id: string
  transactionId: string
  salonName: string
  originalAmount: number
  refundAmount: number
  reason: string
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  requestDate: string
}
export function PaymentProcessor() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [_isRetryDialogOpen, setIsRetryDialogOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState("")
  const [refundReason, setRefundReason] = useState("")
  const transactions: Transaction[] = [
    { id: "TXN-001", salonName: "Elegance Salon", amount: 299, status: 'success', method: "Credit Card", date: "2024-06-15 14:30", reference: "ch_1234567890" },
    { id: "TXN-002", salonName: "Beauty Haven", amount: 199, status: 'pending', method: "Bank Transfer", date: "2024-06-15 15:45", reference: "bnk_0987654321" },
    { id: "TXN-003", salonName: "Style Studio", amount: 399, status: 'failed', method: "Credit Card", date: "2024-06-15 16:20", reference: "ch_failed_123" },
    { id: "TXN-004", salonName: "Glamour Palace", amount: 599, status: 'refunded', method: "PayPal", date: "2024-06-14 10:15", reference: "pp_refund_456" },
    { id: "TXN-005", salonName: "Luxe Spa", amount: 899, status: 'success', method: "Credit Card", date: "2024-06-14 09:30", reference: "ch_success_789" }
  ]
  const failedPayments: FailedPayment[] = [
    { id: "FP-001", salonName: "Style Studio", amount: 399, failureReason: "Insufficient funds", attempts: 2, lastAttempt: "2024-06-15 16:20", nextRetry: "2024-06-16 16:20" },
    { id: "FP-002", salonName: "Modern Cuts", amount: 249, failureReason: "Card expired", attempts: 1, lastAttempt: "2024-06-15 12:00", nextRetry: "2024-06-17 12:00" },
    { id: "FP-003", salonName: "Urban Style", amount: 179, failureReason: "Invalid card number", attempts: 3, lastAttempt: "2024-06-14 18:30", nextRetry: "Manual review required" }
  ]
  const refundRequests: RefundRequest[] = [
    { id: "REF-001", transactionId: "TXN-004", salonName: "Glamour Palace", originalAmount: 599, refundAmount: 599, reason: "Service cancellation", status: 'completed', requestDate: "2024-06-14" },
    { id: "REF-002", transactionId: "TXN-010", salonName: "Elite Beauty", originalAmount: 799, refundAmount: 400, reason: "Partial refund - billing error", status: 'pending', requestDate: "2024-06-15" },
    { id: "REF-003", transactionId: "TXN-008", salonName: "Sunset Salon", originalAmount: 299, refundAmount: 299, reason: "Duplicate charge", status: 'approved', requestDate: "2024-06-15" }
  ]
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
      case 'approved':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      success: "default",
      completed: "default",
      pending: "secondary",
      approved: "secondary",
      failed: "destructive",
      rejected: "destructive",
      refunded: "outline"
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }
  const handleProcessPayment = () => {
    // Handle payment processing
    setIsProcessDialogOpen(false)
  }
  const handleRefund = () => {
    // Handle refund processing
    setIsRefundDialogOpen(false)
  }
  const handleRetryPayment = (_payment: FailedPayment) => {
    // Handle payment retry
    setIsRetryDialogOpen(false)
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Processor</h1>
          <p className="text-muted-foreground">Process payments and manage transactions</p>
        </div>
        <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <CreditCard className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Manual Payment</DialogTitle>
              <DialogDescription>
                Manually process a payment for a salon
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Salon</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select salon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salon1">Elegance Salon</SelectItem>
                    <SelectItem value="salon2">Beauty Haven</SelectItem>
                    <SelectItem value="salon3">Style Studio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount</Label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit Card</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Payment description" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleProcessPayment}>
                Process Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,456</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <Progress value={94.5} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <Badge variant="destructive" className="mt-2">Needs attention</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Refunds</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">$2,345 total</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="failed">Failed Payments</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Salon</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                      <TableCell>{transaction.salonName}</TableCell>
                      <TableCell className="font-medium">${transaction.amount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          {transaction.method}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          {getStatusBadge(transaction.status)}
                        </div>
                      </TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                          {transaction.status === 'success' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTransaction(transaction)
                                setIsRefundDialogOpen(true)
                              }}
                            >
                              Refund
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Payments</CardTitle>
              <CardDescription>Payments that need retry or manual review</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Salon</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Failure Reason</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Next Retry</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failedPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                      <TableCell>{payment.salonName}</TableCell>
                      <TableCell className="font-medium">${payment.amount}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{payment.failureReason}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.attempts} attempts</Badge>
                      </TableCell>
                      <TableCell>{payment.nextRetry}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleRetryPayment(payment)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry Now
                          </Button>
                          <Button size="sm" variant="outline">
                            Contact
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="refunds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Refund Management</CardTitle>
              <CardDescription>Process and track refund requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Refund ID</TableHead>
                    <TableHead>Salon</TableHead>
                    <TableHead>Original</TableHead>
                    <TableHead>Refund Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refundRequests.map((refund) => (
                    <TableRow key={refund.id}>
                      <TableCell className="font-mono text-sm">{refund.id}</TableCell>
                      <TableCell>{refund.salonName}</TableCell>
                      <TableCell>${refund.originalAmount}</TableCell>
                      <TableCell className="font-medium">${refund.refundAmount}</TableCell>
                      <TableCell>{refund.reason}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(refund.status)}
                          {getStatusBadge(refund.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {refund.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm">Approve</Button>
                            <Button size="sm" variant="outline">Reject</Button>
                          </div>
                        )}
                        {refund.status === 'approved' && (
                          <Button size="sm">Process</Button>
                        )}
                        {refund.status === 'completed' && (
                          <Button size="sm" variant="outline">View</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Refund for transaction {selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Original Amount</Label>
              <Input value={`$${selectedTransaction?.amount || 0}`} disabled />
            </div>
            <div>
              <Label>Refund Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea
                placeholder="Reason for refund"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefund}>
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}