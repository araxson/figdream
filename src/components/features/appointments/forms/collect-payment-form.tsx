'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils/format'

interface CollectPaymentFormProps {
  appointmentId: string
  customerName?: string
  services?: Array<{
    name: string
    price: number
  }>
  existingAmount?: number
  existingTip?: number
  isCollected?: boolean
}

export function CollectPaymentForm({ 
  appointmentId, 
  customerName,
  services = [],
  existingAmount,
  existingTip,
  isCollected = false
}: CollectPaymentFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Calculate default amount from services
  const calculatedAmount = services.reduce((sum, service) => sum + (service.price || 0), 0)
  
  const [formData, setFormData] = useState({
    manual_total_amount: existingAmount?.toString() || calculatedAmount.toString(),
    manual_tip_amount: existingTip?.toString() || '0',
    payment_method: 'cash'
  })

  const handleSubmit = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const totalAmount = parseFloat(formData.manual_total_amount)
      const tipAmount = parseFloat(formData.manual_tip_amount || '0')

      // Update appointment with payment info
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({
          manual_total_amount: totalAmount,
          manual_tip_amount: tipAmount,
          payment_method: formData.payment_method,
          payment_collected: true,
          payment_collected_at: new Date().toISOString(),
          payment_collected_by: user.id
        })
        .eq('id', appointmentId)

      if (appointmentError) throw appointmentError

      // Also record in staff_earnings for reporting
      // First get appointment details
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          salon_id,
          staff_id,
          appointment_date,
          customer_id,
          customers(first_name, last_name)
        `)
        .eq('id', appointmentId)
        .single()

      if (appointment) {
        // Create entry in staff_earnings for tracking
        const { error: earningsError } = await supabase
          .from('staff_earnings')
          .insert({
            salon_id: appointment.salon_id,
            staff_id: appointment.staff_id,
            appointment_id: appointmentId,
            service_date: appointment.appointment_date,
            service_name: services.map(s => s.name).join(', ') || 'Appointment Services',
            service_amount: totalAmount,
            tip_amount: tipAmount,
            customer_name: customerName || 
              (appointment.customers && typeof appointment.customers === 'object' && 'first_name' in appointment.customers ? 
                `${(appointment.customers as { first_name?: string; last_name?: string }).first_name || ''} ${(appointment.customers as { first_name?: string; last_name?: string }).last_name || ''}`.trim() : 
                null),
            payment_method: formData.payment_method,
            category: 'service',
            recorded_by: user.id
          })

        if (earningsError) {
          console.error('Error recording earnings:', earningsError)
          // Don't throw - appointment payment is already recorded
        }
      }

      toast.success('Payment collected successfully')
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error collecting payment:', error)
      toast.error('Failed to collect payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant={isCollected ? "secondary" : "default"}
          disabled={isCollected}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          {isCollected ? 'Paid' : 'Collect Payment'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
          <DialogDescription>
            Record payment for {customerName ? `${customerName}'s` : 'this'} appointment
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {services.length > 0 && (
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Services</Label>
              {services.map((service, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{service.name}</span>
                  <span>{formatCurrency(service.price)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Subtotal</span>
                <span>{formatCurrency(calculatedAmount)}</span>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="amount">Total Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.manual_total_amount}
              onChange={(e) => setFormData({ ...formData, manual_total_amount: e.target.value })}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">
              Adjust if different from calculated amount
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tip">Tip Amount</Label>
            <Input
              id="tip"
              type="number"
              step="0.01"
              value={formData.manual_tip_amount}
              onChange={(e) => setFormData({ ...formData, manual_tip_amount: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="flex justify-between font-medium">
              <span>Grand Total</span>
              <span>
                {formatCurrency(
                  parseFloat(formData.manual_total_amount || '0') + 
                  parseFloat(formData.manual_tip_amount || '0')
                )}
              </span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Processing...' : 'Collect Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}