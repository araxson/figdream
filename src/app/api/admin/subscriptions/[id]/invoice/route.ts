import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get subscription with details
    const { data: subscription } = await supabase
      .from('platform_subscriptions')
      .select(`
        *,
        salon:salons!platform_subscriptions_salon_id_fkey(
          id,
          name,
          slug,
          owner_id,
          profiles!salons_owner_id_fkey(
            full_name,
            email,
            phone
          )
        ),
        plan:pricing_plans!platform_subscriptions_plan_id_fkey(
          id,
          name,
          price,
          billing_period,
          features:pricing_features(*)
        )
      `)
      .eq('id', params.id)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // In a real implementation, this would generate a PDF invoice
    // For now, we'll return invoice data that could be used to generate a PDF
    
    const invoiceData = {
      invoice_number: `INV-${subscription.id.slice(0, 8).toUpperCase()}`,
      issue_date: new Date().toISOString(),
      due_date: subscription.current_period_end,
      
      // Billing details
      bill_to: {
        name: subscription.salon?.profiles?.full_name || subscription.salon?.name,
        email: subscription.salon?.profiles?.email,
        phone: subscription.salon?.profiles?.phone,
        salon_name: subscription.salon?.name
      },
      
      // Invoice items
      items: [{
        description: `${subscription.plan?.name} - ${subscription.plan?.billing_period} subscription`,
        quantity: 1,
        unit_price: subscription.amount,
        total: subscription.amount
      }],
      
      // Totals
      subtotal: subscription.amount,
      tax: 0, // You might calculate tax based on location
      total: subscription.amount,
      
      // Payment info
      payment_status: subscription.status,
      payment_method: subscription.stripe_subscription_id ? 'Credit Card' : 'Manual',
      
      // Period
      billing_period: {
        start: subscription.current_period_start,
        end: subscription.current_period_end
      }
    }

    // For now, return JSON. In production, you'd generate and return a PDF
    return NextResponse.json({ 
      invoice: invoiceData,
      message: 'Invoice data generated. PDF generation not implemented in demo.'
    })
    
  } catch (error) {
    console.error('Error in GET /api/admin/subscriptions/[id]/invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}