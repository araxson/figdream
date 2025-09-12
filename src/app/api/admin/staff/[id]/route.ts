import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'

interface Params {
  params: {
    id: string
  }
}

// PATCH /api/admin/staff/[id] - Update staff member
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = await createClient()
    
    // Get current staff data for audit log
    const { data: oldStaff } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (!oldStaff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }
    
    // Update staff profile
    const { data: updatedStaff, error: updateError } = await supabase
      .from('staff_profiles')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (updateError) {
      throw updateError
    }
    
    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'UPDATE',
      entity_type: 'staff',
      entity_id: params.id,
      old_data: oldStaff,
      new_data: updatedStaff
    })
    
    return NextResponse.json({ staff: updatedStaff })
  } catch (error) {
    console.error('Error updating staff:', error)
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    )
  }
}