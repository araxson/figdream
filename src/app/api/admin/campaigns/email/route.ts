import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

// GET /api/admin/campaigns/email - List all email campaigns
export async function GET(request: NextRequest) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const salonId = searchParams.get('salon_id')
    const status = searchParams.get('status')
    
    const offset = (page - 1) * limit
    
    let query = supabase
      .from('email_campaigns')
      .select(`
        *,
        salon:salons!email_campaigns_salon_id_fkey(
          id,
          name,
          slug
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,subject.ilike.%${search}%`)
    }
    
    if (salonId) {
      query = query.eq('salon_id', salonId)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      campaigns: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('Error fetching email campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email campaigns' },
      { status: 500 }
    )
  }
}

// POST /api/admin/campaigns/email - Create new email campaign
export async function POST(request: NextRequest) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { salon_id, name, subject, content, template_id, scheduled_at, status } = body
    
    if (!salon_id || !name || !subject || !content) {
      return NextResponse.json(
        { error: 'Salon, name, subject, and content are required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Create the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert({
        salon_id,
        name,
        subject,
        content,
        template_id,
        scheduled_at,
        status: status || 'draft',
        recipients_count: 0,
        opens_count: 0,
        clicks_count: 0
      })
      .select(`
        *,
        salon:salons!email_campaigns_salon_id_fkey(
          id,
          name,
          slug
        )
      `)
      .single()
    
    if (campaignError) throw campaignError
    
    await logAuditEvent({
      action: 'create',
      entity_type: 'email_campaign',
      entity_id: campaign.id,
      details: { 
        campaign_name: name,
        salon_id,
        status,
        created_by: session.user.email
      }
    })
    
    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error creating email campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create email campaign' },
      { status: 500 }
    )
  }
}