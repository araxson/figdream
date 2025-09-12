import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/api/dal/auth'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { 
      appointmentId, 
      manual_total_amount, 
      manual_tip_amount, 
      payment_method,
      services = []
    } = await request.json()
    
    if (!appointmentId || !manual_total_amount || !payment_method) {
      return NextResponse.json(
        { error: 'Appointment ID, total amount, and payment method are required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    const totalAmount = parseFloat(manual_total_amount)
    const tipAmount = parseFloat(manual_tip_amount || '0')
    
    // Update appointment with payment info
    const { error: appointmentError } = await supabase
      .from('appointments')
      .update({
        manual_total_amount: totalAmount,
        manual_tip_amount: tipAmount,
        payment_method: payment_method,
        payment_collected: true,
        payment_collected_at: new Date().toISOString(),
        payment_collected_by: session.user.id
      })
      .eq('id', appointmentId)
    
    if (appointmentError) {
      console.error('Error updating appointment payment:', appointmentError)
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      )
    }
    
    // Get appointment details for earnings record
    const { data: appointment, error: fetchError } = await supabase
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
    
    if (fetchError) {
      console.error('Error fetching appointment details:', fetchError)
      // Don't fail the payment update if we can't create earnings record
      return NextResponse.json({ success: true })
    }
    
    // Create entry in staff_earnings for tracking
    if (appointment) {
      const customerName = appointment.customers && typeof appointment.customers === 'object' && 'first_name' in appointment.customers
        ? `${(appointment.customers as { first_name?: string; last_name?: string }).first_name || ''} ${(appointment.customers as { first_name?: string; last_name?: string }).last_name || ''}`.trim()
        : null
      
      const serviceName = services.length > 0 
        ? services.map((s: { name: string }) => s.name).join(', ')
        : 'Appointment Services'
      
      const { error: earningsError } = await supabase
        .from('staff_earnings')
        .insert({
          salon_id: appointment.salon_id,
          staff_id: appointment.staff_id,
          appointment_id: appointmentId,
          service_date: appointment.appointment_date,
          service_name: serviceName,
          service_amount: totalAmount,
          tip_amount: tipAmount,
          customer_name: customerName,
          payment_method: payment_method,
          category: 'service',
          recorded_by: session.user.id
        })
      
      if (earningsError) {
        console.error('Error recording earnings:', earningsError)
        // Don't fail the payment update if earnings recording fails
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update appointment payment error:', error)
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    )
  }
}