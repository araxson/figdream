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

    // Prevent self-deactivation
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current status
    const { data: user } = await supabase
      .from('profiles')
      .select('is_active, email')
      .eq('id', params.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Toggle status
    const newStatus = !user.is_active
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_active: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      console.error('Error toggling user status:', error)
      return NextResponse.json({ error: 'Failed to toggle status' }, { status: 500 })
    }

    await logAuditEvent({
      action: 'update',
      entity_type: 'user',
      entity_id: params.id,
      details: { 
        field: 'is_active',
        old_value: user.is_active,
        new_value: newStatus,
        user_email: user.email
      }
    })

    return NextResponse.json({ 
      success: true,
      is_active: newStatus,
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`
    })
  } catch (error) {
    console.error('Error in POST /api/admin/users/[id]/toggle-status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}