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
      .select('is_featured, name')
      .eq('id', params.id)
      .single()

    if (!plan) {
      return NextResponse.json({ error: 'Pricing plan not found' }, { status: 404 })
    }

    // Toggle featured status
    const newStatus = !plan.is_featured
    
    // If setting as featured, unfeatured all other plans first
    if (newStatus) {
      await supabase
        .from('pricing_plans')
        .update({ is_featured: false })
        .neq('id', params.id)
    }
    
    const { error } = await supabase
      .from('pricing_plans')
      .update({ 
        is_featured: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      console.error('Error toggling pricing plan featured status:', error)
      return NextResponse.json({ error: 'Failed to toggle featured status' }, { status: 500 })
    }

    await logAuditEvent({
      action: 'update',
      entity_type: 'pricing_plan',
      entity_id: params.id,
      details: { 
        field: 'is_featured',
        old_value: plan.is_featured,
        new_value: newStatus,
        plan_name: plan.name,
        updated_by: session.user.email
      }
    })

    return NextResponse.json({ 
      success: true,
      is_featured: newStatus,
      message: `Pricing plan ${newStatus ? 'set as featured' : 'removed from featured'} successfully`
    })
  } catch (error) {
    console.error('Error in POST /api/admin/pricing/[id]/toggle-featured:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}