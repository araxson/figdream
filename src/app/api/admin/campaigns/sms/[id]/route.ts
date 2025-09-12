import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

interface Params {
  params: Promise<{
    id: string
  }>
}

// GET /api/admin/campaigns/sms/[id] - Get single SMS campaign
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    const { data: campaign, error } = await supabase
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
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
      }
      throw error
    }
    
    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error fetching SMS campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SMS campaign' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/campaigns/sms/[id] - Update SMS campaign
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = await createClient()
    
    // Get current campaign data for audit log
    const { data: oldCampaign } = await supabase
      .from('sms_campaigns')
      .select('*')
      .eq('id', id)
      .single()
    
    if (!oldCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    
    // Prevent editing completed campaigns
    if (oldCampaign.status === 'completed' || oldCampaign.status === 'sending') {
      return NextResponse.json(
        { error: 'Cannot edit a campaign that has been sent' },
        { status: 400 }
      )
    }
    
    // Update the campaign
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('sms_campaigns')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
    
    if (updateError) throw updateError
    
    await logAuditEvent({
      action: 'update',
      entity_type: 'sms_campaign',
      entity_id: id,
      details: { 
        campaign_name: updatedCampaign.name,
        old_data: oldCampaign,
        new_data: updatedCampaign,
        updated_by: session.user.email
      }
    })
    
    return NextResponse.json({ campaign: updatedCampaign })
  } catch (error) {
    console.error('Error updating SMS campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update SMS campaign' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/campaigns/sms/[id] - Delete SMS campaign
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Get campaign data for audit log
    const { data: campaignToDelete } = await supabase
      .from('sms_campaigns')
      .select('*')
      .eq('id', id)
      .single()
    
    if (!campaignToDelete) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    
    // Prevent deleting active campaigns
    if (campaignToDelete.status === 'sending') {
      return NextResponse.json(
        { error: 'Cannot delete a campaign that is currently being sent' },
        { status: 400 }
      )
    }
    
    // Delete the campaign
    const { error: deleteError } = await supabase
      .from('sms_campaigns')
      .delete()
      .eq('id', id)
    
    if (deleteError) throw deleteError
    
    await logAuditEvent({
      action: 'delete',
      entity_type: 'sms_campaign',
      entity_id: id,
      details: { 
        campaign_name: campaignToDelete.name,
        deleted_data: campaignToDelete,
        deleted_by: session.user.email
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'SMS campaign deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting SMS campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete SMS campaign' },
      { status: 500 }
    )
  }
}