'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DollarSign, Users, Search } from 'lucide-react'
import { createPaymentRecord } from '@/app/_actions/payments'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PaymentRecordPageProps {
  salonId: string
  salonName: string
  customers: Array<{ id: string; full_name: string; email: string; phone?: string }>
  staff: Array<{ id: string; full_name: string }>
  userId: string
}

export function PaymentRecordPage({
  salonId,
  salonName,
  customers,
  staff,
  userId,
}: PaymentRecordPageProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchCustomer, setSearchCustomer] = useState('')
  const [searchStaff, setSearchStaff] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    customer_id: '',
    staff_id: '',
    service_amount: 0,
    tip_amount: 0,
    tax_amount: 0,
    discount_amount: 0,
    payment_method: 'card' as const,
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  // Quick payment templates
  const [quickPayments] = useState([
    { name: 'Haircut', amount: 45 },
    { name: 'Hair Color', amount: 85 },
    { name: 'Manicure', amount: 35 },
    { name: 'Pedicure', amount: 45 },
    { name: 'Facial', amount: 75 },
    { name: 'Massage (60 min)', amount: 90 },
  ])

  // Calculate total
  const totalAmount = 
    formData.service_amount +
    formData.tip_amount +
    formData.tax_amount -
    formData.discount_amount

  // Filter customers and staff based on search
  const filteredCustomers = customers.filter(
    (c) => c.full_name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
           c.email.toLowerCase().includes(searchCustomer.toLowerCase())
  )

  const filteredStaff = staff.filter(
    (s) => s.full_name.toLowerCase().includes(searchStaff.toLowerCase())
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.customer_id) {
      toast.error('Please select a customer')
      return
    }
    
    if (!formData.staff_id) {
      toast.error('Please select a staff member')
      return
    }
    
    if (formData.service_amount <= 0) {
      toast.error('Service amount must be greater than 0')
      return
    }

    setIsSubmitting(true)
    
    try {
      await createPaymentRecord({
        ...formData,
        salon_id: salonId,
        recorded_by: userId,
        payment_status: 'completed',
      })
      
      toast.success('Payment recorded successfully')
      
      // Reset form
      setFormData({
        customer_id: '',
        staff_id: '',
        service_amount: 0,
        tip_amount: 0,
        tax_amount: 0,
        discount_amount: 0,
        payment_method: 'card',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
      })
      
      // Optionally redirect to payment history
      router.push('/salon-owner/payments/history')
    } catch (error) {
      console.error('Failed to record payment:', error)
      toast.error('Failed to record payment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function applyQuickPayment(amount: number) {
    setFormData(prev => ({
      ...prev,
      service_amount: amount,
      tax_amount: amount * 0.08, // Assuming 8% tax
    }))
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Record Payment</h1>
          <p className="text-muted-foreground">
            Record customer payments for services at {salonName}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/salon-owner/payments/history')}
        >
          View History
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Payment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Enter the payment information for the completed service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="manual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    <TabsTrigger value="quick">Quick Payment</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="manual" className="space-y-4">
                    {/* Customer Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="customer-search"
                          placeholder="Search customers..."
                          value={searchCustomer}
                          onChange={(e) => setSearchCustomer(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select
                        value={formData.customer_id}
                        onValueChange={(value) =>
                          setFormData(prev => ({ ...prev, customer_id: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCustomers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {customer.full_name} ({customer.email})
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Staff Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="staff">Staff Member</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="staff-search"
                          placeholder="Search staff..."
                          value={searchStaff}
                          onChange={(e) => setSearchStaff(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select
                        value={formData.staff_id}
                        onValueChange={(value) =>
                          setFormData(prev => ({ ...prev, staff_id: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredStaff.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amount Fields */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="service-amount">Service Amount</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="service-amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="pl-9"
                            value={formData.service_amount}
                            onChange={(e) =>
                              setFormData(prev => ({
                                ...prev,
                                service_amount: parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tip-amount">Tip Amount</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="tip-amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="pl-9"
                            value={formData.tip_amount}
                            onChange={(e) =>
                              setFormData(prev => ({
                                ...prev,
                                tip_amount: parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tax-amount">Tax Amount</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="tax-amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="pl-9"
                            value={formData.tax_amount}
                            onChange={(e) =>
                              setFormData(prev => ({
                                ...prev,
                                tax_amount: parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="discount-amount">Discount Amount</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="discount-amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="pl-9"
                            value={formData.discount_amount}
                            onChange={(e) =>
                              setFormData(prev => ({
                                ...prev,
                                discount_amount: parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Method & Date */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="payment-method">Payment Method</Label>
                        <Select
                          value={formData.payment_method}
                          onValueChange={(value) =>
                            setFormData(prev => ({ ...prev, payment_method: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="gift_card">Gift Card</SelectItem>
                            <SelectItem value="store_credit">Store Credit</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="payment-date">Payment Date</Label>
                        <Input
                          id="payment-date"
                          type="date"
                          value={formData.payment_date}
                          onChange={(e) =>
                            setFormData(prev => ({ ...prev, payment_date: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any additional notes about this payment..."
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData(prev => ({ ...prev, notes: e.target.value }))
                        }
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="quick" className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Select a service to quickly apply the base amount
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {quickPayments.map((payment) => (
                        <Button
                          key={payment.name}
                          type="button"
                          variant="outline"
                          className="justify-between"
                          onClick={() => applyQuickPayment(payment.amount)}
                        >
                          <span>{payment.name}</span>
                          <span className="font-semibold">${payment.amount}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Submit Button */}
                <div className="flex items-center justify-between border-t pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/salon-owner/payments/history')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Recording...' : 'Record Payment'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Service Amount:</span>
                  <span>${formData.service_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tip Amount:</span>
                  <span>${formData.tip_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax Amount:</span>
                  <span>${formData.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <span>-${formData.discount_amount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tip Calculator */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Tip Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      tip_amount: prev.service_amount * 0.15,
                    }))
                  }
                >
                  15%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      tip_amount: prev.service_amount * 0.18,
                    }))
                  }
                >
                  18%
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      tip_amount: prev.service_amount * 0.20,
                    }))
                  }
                >
                  20%
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Payments</CardTitle>
              <CardDescription>Quick overview of today&apos;s transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Collected:</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Transactions:</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Average:</span>
                  <span className="font-semibold">$0.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}