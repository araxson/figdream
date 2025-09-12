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

    // Get campaign
    const { data: campaign } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Check if campaign can be sent
    if (campaign.status === 'sent' || campaign.status === 'sending') {
      return NextResponse.json(
        { error: 'Campaign has already been sent or is currently being sent' },
        { status: 400 }
      )
    }

    // Update campaign status to sending
    const { error: updateError } = await supabase
      .from('email_campaigns')
      .update({ 
        status: 'sending',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating campaign status:', updateError)
      return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 })
    }

    // In a real implementation, this would trigger the email sending service
    // For now, we'll simulate sending by updating to sent status after a delay
    setTimeout(async () => {
      await supabase
        .from('email_campaigns')
        .update({ 
          status: 'sent',
          recipients_count: Math.floor(Math.random() * 1000) + 100, // Simulated
          opens_count: Math.floor(Math.random() * 500), // Simulated
          clicks_count: Math.floor(Math.random() * 200), // Simulated
        })
        .eq('id', id)
    }, 5000)

    await logAuditEvent({
      action: 'send',
      entity_type: 'email_campaign',
      entity_id: id,
      details: { 
        campaign_name: campaign.name,
        salon_id: campaign.salon_id,
        sent_by: session.user.email
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Email campaign is being sent'
    })
  } catch (error) {
    console.error('Error in POST /api/admin/campaigns/email/[id]/send:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}