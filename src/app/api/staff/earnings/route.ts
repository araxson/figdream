import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/api/dal/auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'summary'
    const period = searchParams.get('period') || '30'
    const staffId = searchParams.get('staffId') || session.user.id
    
    const supabase = await createClient()
    
    if (type === 'tips') {
      // Get tips history
      const { data: tips, error } = await supabase
        .from('staff_earnings')
        .select(`
          *,
          appointment:appointments(
            appointment_date,
            customer:profiles!appointments_customer_id_fkey(full_name)
          )
        `)
        .eq('staff_id', staffId)
        .not('tip_amount', 'is', null)
        .gt('tip_amount', 0)
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (error) throw error
      
      return NextResponse.json({ tips: tips || [] })
    }
    
    if (type === 'summary') {
      // Get earnings summary
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(period))
      
      const { data: earnings, error } = await supabase
        .from('staff_earnings')
        .select('tip_amount, commission_amount, total_earnings')
        .eq('staff_id', staffId)
        .gte('created_at', startDate.toISOString())
      
      if (error) throw error
      
      const summary = {
        total: 0,
        tips: 0,
        commissions: 0,
        bonuses: 0
      }
      
      earnings?.forEach(earning => {
        summary.total += earning.total_earnings || 0
        summary.tips += earning.tip_amount || 0
        summary.commissions += earning.commission_amount || 0
      })
      
      return NextResponse.json({ summary })
    }
    
    // Default: return all earnings
    const { data: earnings, error } = await supabase
      .from('staff_earnings')
      .select('*')
      .eq('staff_id', staffId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({ earnings: earnings || [] })
  } catch (error) {
    console.error('Get staff earnings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    )
  }
}