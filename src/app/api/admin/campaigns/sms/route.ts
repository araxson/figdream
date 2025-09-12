import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

// GET /api/admin/campaigns/sms - List all SMS campaigns
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
      .from('sms_campaigns')
      .select(`
        *,
        salon:salons!sms_campaigns_salon_id_fkey(
          id,
          name,
          slug
        ),
        creator:profiles!sms_campaigns_created_by_fkey(
          id,
          full_name,
          email
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,message_template.ilike.%${search}%`)
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
    console.error('Error fetching SMS campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SMS campaigns' },
      { status: 500 }
    )
  }
}

// POST /api/admin/campaigns/sms - Create new SMS campaign
export async function POST(request: NextRequest) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      salon_id, 
      name, 
      message_template, 
      campaign_type, 
      target_segments,
      scheduled_at,
      use_shortlinks,
      track_conversions,
      conversion_window_hours,
      status 
    } = body
    
    if (!salon_id || !name || !message_template) {
      return NextResponse.json(
        { error: 'Salon, name, and message template are required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Create the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('sms_campaigns')
      .insert({
        salon_id,
        name,
        message_template,
        campaign_type: campaign_type || 'promotional',
        target_segments,
        target_count: 0,
        scheduled_at,
        status: status || 'draft',
        sent_count: 0,
        delivered_count: 0,
        clicked_count: 0,
        opted_out_count: 0,
        conversion_count: 0,
        revenue_generated: 0,
        use_shortlinks: use_shortlinks || false,
        track_conversions: track_conversions || false,
        conversion_window_hours: conversion_window_hours || 24,
        created_by: session.user.id
      })
      .select(`
        *,
        salon:salons!sms_campaigns_salon_id_fkey(
          id,
          name,
          slug
        ),
        creator:profiles!sms_campaigns_created_by_fkey(
          id,
          full_name,
          email
        )
      `)
      .single()
    
    if (campaignError) throw campaignError
    
    await logAuditEvent({
      action: 'create',
      entity_type: 'sms_campaign',
      entity_id: campaign.id,
      details: { 
        campaign_name: name,
        salon_id,
        campaign_type,
        status,
        created_by: session.user.email
      }
    })
    
    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error creating SMS campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create SMS campaign' },
      { status: 500 }
    )
  }
}