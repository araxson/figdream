import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

interface Params {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get original campaign
    const { data: originalCampaign } = await supabase
      .from('sms_campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (!originalCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Create duplicate with new name
    const duplicatedName = `${originalCampaign.name} (Copy)`
    
    const { data: duplicatedCampaign, error: duplicateError } = await supabase
      .from('sms_campaigns')
      .insert({
        salon_id: originalCampaign.salon_id,
        name: duplicatedName,
        message_template: originalCampaign.message_template,
        campaign_type: originalCampaign.campaign_type,
        target_segments: originalCampaign.target_segments,
        target_count: 0,
        status: 'draft',
        sent_count: 0,
        delivered_count: 0,
        clicked_count: 0,
        opted_out_count: 0,
        conversion_count: 0,
        revenue_generated: 0,
        use_shortlinks: originalCampaign.use_shortlinks,
        track_conversions: originalCampaign.track_conversions,
        conversion_window_hours: originalCampaign.conversion_window_hours,
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

    if (duplicateError) {
      console.error('Error duplicating campaign:', duplicateError)
      return NextResponse.json({ error: 'Failed to duplicate campaign' }, { status: 500 })
    }

    await logAuditEvent({
      action: 'duplicate',
      entity_type: 'sms_campaign',
      entity_id: duplicatedCampaign.id,
      details: { 
        original_campaign_id: id,
        original_campaign_name: originalCampaign.name,
        new_campaign_name: duplicatedName,
        duplicated_by: session.user.email
      }
    })

    return NextResponse.json({ 
      success: true,
      campaign: duplicatedCampaign,
      message: 'SMS campaign duplicated successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/admin/campaigns/sms/[id]/duplicate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}