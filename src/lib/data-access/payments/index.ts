'use server'

/**
 * WARNING: This file references a 'payments' table that doesn't exist in the database.
 * The payment functionality is currently non-functional and needs to be reimplemented.
 * 
 * Options for fixing:
 * 1. Create a payments table in the database
 * 2. Use loyalty_transactions table for payment tracking
 * 3. Integrate with an external payment provider (Stripe, etc.)
 * 
 * All functions in this file will fail until the payments table is created.
 */

import { createClient } from '@/lib/database/supabase/server'
import type { Database } from '@/types/database.types'
import { getUserWithRole } from '../auth/verify'
import { canAccessAppointment } from '../auth/permissions'
import { hasMinimumRoleLevel } from '../auth/roles'

// TODO: payments table doesn't exist in database
// Using a temporary type until payment system is properly implemented
type Payment = {
  id: string
  appointment_id: string
  amount: number
  status: PaymentStatus
  payment_method: PaymentMethod | null
  transaction_id: string | null
  created_at: string
  updated_at: string
}
type PaymentInsert = Partial<Payment>
type PaymentUpdate = Partial<Payment>
type PaymentStatus = Database['public']['Enums']['payment_status']
type PaymentMethod = Database['public']['Enums']['payment_method']

export interface PaymentResult {
  data: Payment | null
  error: string | null
}

export interface PaymentsResult {
  data: Payment[] | null
  error: string | null
}

export interface PaymentWithAppointment extends Payment {
  appointment: {
    id: string
    customer_id: string
    total_amount: number
    appointment_date: string
    status: string
    customer: {
      first_name: string
      last_name: string
      email: string
    } | null
  } | null
}

export interface PaymentWithAppointmentResult {
  data: PaymentWithAppointment | null
  error: string | null
}

export interface PaymentsWithAppointmentResult {
  data: PaymentWithAppointment[] | null
  error: string | null
}

export interface PaymentCreateResult {
  data: Payment | null
  error: string | null
}

export interface PaymentUpdateResult {
  data: Payment | null
  error: string | null
}

export interface PaymentRefundResult {
  data: Payment | null
  error: string | null
}

/**
 * Get payment by ID (with permission check)
 */
export async function getPaymentById(paymentId: string): Promise<PaymentResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (paymentError) {
      return { data: null, error: 'Payment not found' }
    }

    // Check if user can access the related appointment
    const { allowed, error: permissionError } = await canAccessAppointment(payment.appointment_id)
    
    if (!allowed) {
      return { data: null, error: permissionError || 'Insufficient permissions' }
    }

    return { data: payment, error: null }
  } catch (error) {
    console.error('Error getting payment by ID:', error)
    return { data: null, error: 'Failed to get payment' }
  }
}

/**
 * Get payment with appointment details
 */
export async function getPaymentWithAppointment(paymentId: string): Promise<PaymentWithAppointmentResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        appointments (
          id,
          customer_id,
          total_price,
          appointment_date,
          status,
          customer:profiles!customer_id (first_name, last_name, email)
        )
      `)
      .eq('id', paymentId)
      .single()

    if (paymentError) {
      return { data: null, error: 'Payment not found' }
    }

    // Check if user can access the related appointment
    const { allowed, error: permissionError } = await canAccessAppointment(payment.appointment_id)
    
    if (!allowed) {
      return { data: null, error: permissionError || 'Insufficient permissions' }
    }

    const paymentWithAppointment: PaymentWithAppointment = {
      ...payment,
      appointment: payment.appointments as any
    }

    return { data: paymentWithAppointment, error: null }
  } catch (error) {
    console.error('Error getting payment with appointment:', error)
    return { data: null, error: 'Failed to get payment with appointment' }
  }
}

/**
 * Get payments for a appointment
 */
export async function getAppointmentPayments(appointmentId: string): Promise<PaymentsResult> {
  try {
    const { allowed, error: permissionError } = await canAccessAppointment(appointmentId)
    
    if (!allowed) {
      return { data: null, error: permissionError || 'Insufficient permissions' }
    }

    const supabase = await createClient()

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: payments || [], error: null }
  } catch (error) {
    console.error('Error getting appointment payments:', error)
    return { data: null, error: 'Failed to get appointment payments' }
  }
}

/**
 * Get payments with role-based filtering
 */
export async function getUserPayments(
  status?: PaymentStatus,
  method?: PaymentMethod,
  limit = 50,
  offset = 0
): Promise<PaymentsResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    let query = supabase
      .from('payments')
      .select(`
        *,
        appointments (customer_id, location_id, locations(salon_id, salons(owner_id)))
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    }

    // Apply payment method filter
    if (method) {
      query = query.eq('payment_method', method)
    }

    const { data: payments, error } = await query

    if (error) {
      return { data: null, error: error.message }
    }

    // Filter based on user role
    let filteredPayments = payments || []

    if (user.role === 'customer') {
      // Customers can only see their own payments
      filteredPayments = filteredPayments.filter(p => 
        (p.appointments as any)?.customer_id === user.user_id
      )
    } else if (user.role === 'staff' || user.role === 'location_manager') {
      // Staff and location admins can see payments for their locations
      // This requires additional logic to check staff assignments
      // For now, we'll implement this in a separate function
    } else if (user.role === 'salon_owner') {
      // Salon admins can see payments for their salons
      filteredPayments = filteredPayments.filter(p => 
        (p.appointments as any)?.locations?.salons?.owner_id === user.user_id
      )
    }
    // super_admin sees all payments (no filter)

    // Remove the nested appointment data for cleaner response
    const cleanPayments = filteredPayments.map(p => {
      const { appointments, ...payment } = p
      return payment as Payment
    })

    return { data: cleanPayments, error: null }
  } catch (error) {
    console.error('Error getting user payments:', error)
    return { data: null, error: 'Failed to get user payments' }
  }
}

/**
 * Get payments for a location
 */
export async function getLocationPayments(
  locationId: string,
  status?: PaymentStatus,
  startDate?: string,
  endDate?: string
): Promise<PaymentsWithAppointmentResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    let query = supabase
      .from('payments')
      .select(`
        *,
        appointments!inner (
          id,
          customer_id,
          total_price,
          appointment_date,
          status,
          location_id,
          customer:profiles!customer_id (first_name, last_name, email)
        )
      `)
      .eq('appointments.location_id', locationId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: payments, error } = await query

    if (error) {
      return { data: null, error: error.message }
    }

    const paymentsWithAppointment = (payments || []).map(p => ({
      ...p,
      appointment: p.appointments as any
    })) as PaymentWithAppointment[]

    return { data: paymentsWithAppointment, error: null }
  } catch (error) {
    console.error('Error getting location payments:', error)
    return { data: null, error: 'Failed to get location payments' }
  }
}

/**
 * Create new payment
 */
export async function createPayment(paymentData: PaymentInsert): Promise<PaymentCreateResult> {
  try {
    const { allowed, error: permissionError } = await canAccessAppointment(paymentData.appointment_id)
    
    if (!allowed) {
      return { data: null, error: permissionError || 'Insufficient permissions' }
    }

    const supabase = await createClient()

    // Verify appointment exists and get total amount
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('total_price, status')
      .eq('id', paymentData.appointment_id)
      .single()

    if (appointmentError || !appointment) {
      return { data: null, error: 'Appointment not found' }
    }

    // Check if payment amount is valid
    if (paymentData.amount > appointment.total_price) {
      return { data: null, error: 'Payment amount cannot exceed appointment total' }
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        ...paymentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: payment, error: null }
  } catch (error) {
    console.error('Error creating payment:', error)
    return { data: null, error: 'Failed to create payment' }
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  transactionId?: string
): Promise<PaymentUpdateResult> {
  try {
    const { data: payment, error: getError } = await getPaymentById(paymentId)
    
    if (getError || !payment) {
      return { data: null, error: getError || 'Payment not found' }
    }

    const { hasRole: hasPermission, error: roleError } = await hasMinimumRoleLevel('staff')
    
    if (roleError) {
      return { data: null, error: roleError }
    }

    if (!hasPermission) {
      return { data: null, error: 'Insufficient permissions' }
    }

    const supabase = await createClient()

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (transactionId) {
      updateData.transaction_id = transactionId
    }

    const { data: updatedPayment, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: updatedPayment, error: null }
  } catch (error) {
    console.error('Error updating payment status:', error)
    return { data: null, error: 'Failed to update payment status' }
  }
}

/**
 * Process payment refund
 */
export async function refundPayment(
  paymentId: string,
  refundAmount: number,
  reason?: string
): Promise<PaymentRefundResult> {
  try {
    const { data: payment, error: getError } = await getPaymentById(paymentId)
    
    if (getError || !payment) {
      return { data: null, error: getError || 'Payment not found' }
    }

    if (payment.status !== 'completed') {
      return { data: null, error: 'Can only refund completed payments' }
    }

    if (refundAmount > payment.amount) {
      return { data: null, error: 'Refund amount cannot exceed original payment amount' }
    }

    const { hasRole: hasPermission, error: roleError } = await hasMinimumRoleLevel('location_manager')
    
    if (roleError) {
      return { data: null, error: roleError }
    }

    if (!hasPermission) {
      return { data: null, error: 'Insufficient permissions' }
    }

    const supabase = await createClient()

    // Create refund payment record
    const { data: refundPayment, error: refundError } = await supabase
      .from('payments')
      .insert({
        appointment_id: payment.appointment_id,
        amount: -refundAmount, // Negative amount for refund
        payment_method: payment.payment_method,
        status: 'completed',
        transaction_id: `refund-${payment.transaction_id || paymentId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (refundError) {
      return { data: null, error: refundError.message }
    }

    // Update original payment status if fully refunded
    if (refundAmount === payment.amount) {
      await supabase
        .from('payments')
        .update({
          status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
    }

    return { data: refundPayment, error: null }
  } catch (error) {
    console.error('Error processing refund:', error)
    return { data: null, error: 'Failed to process refund' }
  }
}

/**
 * Get payment statistics for location/salon
 */
export async function getPaymentStats(locationId: string, days = 30): Promise<{
  data: {
    totalPayments: number
    totalRevenue: number
    completedPayments: number
    pendingPayments: number
    failedPayments: number
    refundedAmount: number
    averagePaymentValue: number
    paymentMethodBreakdown: Record<PaymentMethod, number>
  } | null
  error: string | null
}> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        appointments!inner (location_id)
      `)
      .eq('appointments.location_id', locationId)
      .gte('created_at', startDate.toISOString())

    if (error) {
      return { data: null, error: error.message }
    }

    const paymentMethodBreakdown: Record<PaymentMethod, number> = {
      cash: 0,
      card: 0,
      online: 0,
      gift_card: 0
    }

    let totalRevenue = 0
    let completedPayments = 0
    let pendingPayments = 0
    let failedPayments = 0
    let refundedAmount = 0

    payments?.forEach(payment => {
      paymentMethodBreakdown[payment.payment_method] += payment.amount

      if (payment.amount > 0) {
        totalRevenue += payment.amount
      } else {
        refundedAmount += Math.abs(payment.amount)
      }

      switch (payment.status) {
        case 'completed':
          completedPayments++
          break
        case 'pending':
          pendingPayments++
          break
        case 'failed':
          failedPayments++
          break
        case 'refunded':
          // Handled above in amount check
          break
      }
    })

    const stats = {
      totalPayments: payments?.length || 0,
      totalRevenue,
      completedPayments,
      pendingPayments,
      failedPayments,
      refundedAmount,
      averagePaymentValue: completedPayments > 0 ? totalRevenue / completedPayments : 0,
      paymentMethodBreakdown
    }

    return { data: stats, error: null }
  } catch (error) {
    console.error('Error getting payment stats:', error)
    return { data: null, error: 'Failed to get payment statistics' }
  }
}