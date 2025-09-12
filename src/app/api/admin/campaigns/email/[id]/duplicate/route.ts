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
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (!originalCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Create duplicate with new name
    const duplicatedName = `${originalCampaign.name} (Copy)`
    
    const { data: duplicatedCampaign, error: duplicateError } = await supabase
      .from('email_campaigns')
      .insert({
        salon_id: originalCampaign.salon_id,
        name: duplicatedName,
        subject: originalCampaign.subject,
        content: originalCampaign.content,
        template_id: originalCampaign.template_id,
        status: 'draft',
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

    if (duplicateError) {
      console.error('Error duplicating campaign:', duplicateError)
      return NextResponse.json({ error: 'Failed to duplicate campaign' }, { status: 500 })
    }

    await logAuditEvent({
      action: 'duplicate',
      entity_type: 'email_campaign',
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
      message: 'Email campaign duplicated successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/admin/campaigns/email/[id]/duplicate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}