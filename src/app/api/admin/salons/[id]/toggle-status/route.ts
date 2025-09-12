import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await verifyApiSession(request)
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get current status
    const { data: salon } = await supabase
      .from('salons')
      .select('is_active')
      .eq('id', params.id)
      .single()

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Toggle status
    const newStatus = !salon.is_active
    const { error } = await supabase
      .from('salons')
      .update({ 
        is_active: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      console.error('Error toggling salon status:', error)
      return NextResponse.json({ error: 'Failed to toggle status' }, { status: 500 })
    }

    await logAuditEvent({
      action: 'update',
      entity_type: 'salon',
      entity_id: params.id,
      details: { 
        field: 'is_active',
        old_value: salon.is_active,
        new_value: newStatus
      }
    })

    return NextResponse.json({ 
      success: true,
      is_active: newStatus 
    })
  } catch (error) {
    console.error('Error in POST /api/admin/salons/[id]/toggle-status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}