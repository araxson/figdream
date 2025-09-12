import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'

interface Params {
  params: {
    id: string
  }
}

// GET /api/admin/users/[id] - Get single user
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    const { data: user, error } = await supabase
      .from('profiles')
      .select(`
        *,
        appointments:appointments!appointments_customer_id_fkey (
          id,
          start_time,
          status
        ),
        reviews (
          id,
          rating,
          created_at
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      throw error
    }
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = await createClient()
    
    // Get current user data for audit log
    const { data: oldUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single()
    
    // Update profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      throw updateError
    }
    
    // Update auth metadata if email or role changed
    if (body.email || body.role) {
      const updates: any = {}
      if (body.email) updates.email = body.email
      if (body.role) updates.user_metadata = { ...oldUser?.user_metadata, role: body.role }
      
      const { error: authError } = await supabase.auth.admin.updateUserById(
        params.id,
        updates
      )
      
      if (authError) {
        console.error('Error updating auth user:', authError)
      }
    }
    
    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'UPDATE',
      entity_type: 'user',
      entity_id: params.id,
      old_data: oldUser,
      new_data: updatedUser
    })
    
    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prevent self-deletion
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Get user data for audit log
    const { data: userToDelete } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(params.id)
    
    if (authError) {
      console.error('Error deleting auth user:', authError)
      // Continue with profile deletion even if auth deletion fails
    }
    
    // Delete profile (cascades to related records)
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', params.id)
    
    if (deleteError) {
      throw deleteError
    }
    
    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'DELETE',
      entity_type: 'user',
      entity_id: params.id,
      old_data: userToDelete
    })
    
    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}