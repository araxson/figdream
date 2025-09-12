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
    const salonId = searchParams.get('salonId')
    const status = searchParams.get('status')
    const includeMetrics = searchParams.get('includeMetrics') === 'true'
    
    const supabase = await createClient()
    
    // Get email campaigns (using the actual table name from database)
    let query = supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (salonId) {
      query = query.eq('salon_id', salonId)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data: campaigns, error } = await query
    
    if (error) throw error
    
    // Note: Metrics functionality would need a separate metrics table
    // For now, return campaigns without metrics
    if (includeMetrics && campaigns) {
      const campaignsWithMetrics = campaigns.map(campaign => ({
        ...campaign,
        metrics: null // Would need to implement metrics tracking
      }))
      
      return NextResponse.json({ campaigns: campaignsWithMetrics })
    }
    
    return NextResponse.json({ campaigns: campaigns || [] })
  } catch (error) {
    console.error('Get campaigns error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const data = await request.json() as {
      name: string
      subject: string
      content: string
      recipient_list: string[]
      scheduled_at?: string
      salon_id: string
    }
    const supabase = await createClient()
    
    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .insert({
        name: data.name,
        subject: data.subject || '',
        content: data.content,
        scheduled_at: data.scheduled_at,
        salon_id: data.salon_id,
        status: 'draft'
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Create campaign error:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { id, ...data }: { id: string; [key: string]: unknown } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Update campaign error:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete campaign error:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}