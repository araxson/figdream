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
    const { data: category } = await supabase
      .from('service_categories')
      .select('is_active, name')
      .eq('id', params.id)
      .single()

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Toggle status
    const newStatus = !category.is_active
    const { error } = await supabase
      .from('service_categories')
      .update({ 
        is_active: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      console.error('Error toggling category status:', error)
      return NextResponse.json({ error: 'Failed to toggle status' }, { status: 500 })
    }

    await logAuditEvent({
      action: 'update',
      entity_type: 'service_category',
      entity_id: params.id,
      details: { 
        field: 'is_active',
        old_value: category.is_active,
        new_value: newStatus,
        category_name: category.name,
        updated_by: session.user.email
      }
    })

    return NextResponse.json({ 
      success: true,
      is_active: newStatus,
      message: `Category ${newStatus ? 'activated' : 'deactivated'} successfully`
    })
  } catch (error) {
    console.error('Error in POST /api/admin/categories/[id]/toggle-status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}