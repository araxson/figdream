import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/api/dal/auth'
import { NextResponse } from 'next/server'
import { startOfMonth } from 'date-fns'

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const supabase = await createClient()
    const monthStart = startOfMonth(new Date())

    // Fetch staff earnings with service information
    const { data: earnings } = await supabase
      .from('staff_earnings')
      .select(`
        tip_amount,
        service_name,
        customer_name,
        created_at
      `)
      .eq('staff_id', session.user.id)
      .gte('created_at', monthStart.toISOString())

    // Group tips by service
    const serviceMap = new Map<string, number>()
    let totalAmount = 0
    
    earnings?.forEach(earning => {
      if (earning.tip_amount && earning.tip_amount > 0) {
        const serviceName = earning.service_name || 'Other'
        const existing = serviceMap.get(serviceName) || 0
        serviceMap.set(serviceName, existing + earning.tip_amount)
        totalAmount += earning.tip_amount
      }
    })

    // Convert to array and calculate percentages
    const analytics = Array.from(serviceMap.entries())
      .map(([service, amount]) => ({
        service,
        amount,
        percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Group by customer for top tippers
    const customerMap = new Map<string, { name: string; total: number; count: number }>()
    
    earnings?.forEach(earning => {
      if (earning.tip_amount && earning.tip_amount > 0) {
        const customerName = earning.customer_name || 'Unknown Customer'
        const existing = customerMap.get(customerName) || { name: customerName, total: 0, count: 0 }
        customerMap.set(customerName, {
          name: customerName,
          total: existing.total + earning.tip_amount,
          count: existing.count + 1
        })
      }
    })

    // Convert to array and calculate averages
    const topTippers = Array.from(customerMap.values())
      .map(({ name, total, count }) => ({
        name,
        total,
        average: Math.round(total / count)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4)

    return NextResponse.json({ analytics, topTippers })
  } catch (error) {
    console.error('Staff analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}