import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await verifyApiSession(request)
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    const { data: salon, error } = await supabase
      .from('salons')
      .select(`
        *,
        owner:profiles!salons_owner_id_fkey(
          id,
          email,
          full_name,
          avatar_url,
          role
        ),
        staff_members(count),
        appointments(count),
        customers(count),
        services(count)
      `)
      .eq('id', params.id)
      .single()

    if (error || !salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    return NextResponse.json(salon)
  } catch (error) {
    console.error('Error in GET /api/admin/salons/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await verifyApiSession(request)
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const data = await request.json()

    // Get existing salon
    const { data: existingSalon } = await supabase
      .from('salons')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!existingSalon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Handle owner change if provided
    if (data.owner_email && data.owner_email !== existingSalon.owner_email) {
      // Check if new owner exists
      const { data: newOwner } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.owner_email)
        .single()

      if (newOwner) {
        data.owner_id = newOwner.id
      } else {
        // Create new owner
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: data.owner_email,
          password: Math.random().toString(36).slice(-12),
          email_confirm: true,
          user_metadata: {
            role: 'salon_owner'
          }
        })

        if (authError) {
          return NextResponse.json({ error: 'Failed to create new owner' }, { status: 500 })
        }

        data.owner_id = authData.user.id

        // Update profile with role
        await supabase
          .from('profiles')
          .update({ role: 'salon_owner' })
          .eq('id', data.owner_id)
      }
    }

    // Remove owner_email from update data
    delete data.owner_email

    // Update salon
    const { data: salon, error } = await supabase
      .from('salons')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating salon:', error)
      return NextResponse.json({ error: 'Failed to update salon' }, { status: 500 })
    }

    await logAuditEvent({
      action: 'update',
      entity_type: 'salon',
      entity_id: params.id,
      details: { 
        old: existingSalon,
        new: salon 
      }
    })

    return NextResponse.json(salon)
  } catch (error) {
    console.error('Error in PATCH /api/admin/salons/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await verifyApiSession(request)
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get salon details before deletion
    const { data: salon } = await supabase
      .from('salons')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Delete salon (cascades will handle related data)
    const { error } = await supabase
      .from('salons')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting salon:', error)
      return NextResponse.json({ error: 'Failed to delete salon' }, { status: 500 })
    }

    await logAuditEvent({
      action: 'delete',
      entity_type: 'salon',
      entity_id: params.id,
      details: { salon }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/salons/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}