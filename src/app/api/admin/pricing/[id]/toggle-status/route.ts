import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

interface Params {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get current status
    const { data: plan } = await supabase
      .from('pricing_plans')
      .select('is_active, name')
      .eq('id', params.id)
      .single()

    if (!plan) {
      return NextResponse.json({ error: 'Pricing plan not found' }, { status: 404 })
    }

    // Toggle status
    const newStatus = !plan.is_active
    const { error } = await supabase
      .from('pricing_plans')
      .update({ 
        is_active: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      console.error('Error toggling pricing plan status:', error)
      return NextResponse.json({ error: 'Failed to toggle status' }, { status: 500 })
    }

    await logAuditEvent({
      action: 'update',
      entity_type: 'pricing_plan',
      entity_id: params.id,
      details: { 
        field: 'is_active',
        old_value: plan.is_active,
        new_value: newStatus,
        plan_name: plan.name,
        updated_by: session.user.email
      }
    })

    return NextResponse.json({ 
      success: true,
      is_active: newStatus,
      message: `Pricing plan ${newStatus ? 'activated' : 'deactivated'} successfully`
    })
  } catch (error) {
    console.error('Error in POST /api/admin/pricing/[id]/toggle-status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}