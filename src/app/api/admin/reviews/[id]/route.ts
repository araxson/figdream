import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'

interface Params {
  params: {
    id: string
  }
}

// PATCH /api/admin/reviews/[id] - Update review
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = await createClient()
    
    // Get current review data for audit log
    const { data: oldReview } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (!oldReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    
    // Update review
    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
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
      entity_type: 'review',
      entity_id: params.id,
      old_data: oldReview,
      new_data: updatedReview
    })
    
    return NextResponse.json({ review: updatedReview })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/reviews/[id] - Delete review
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Get review data for audit log
    const { data: reviewToDelete } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (!reviewToDelete) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    
    // Delete review
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', params.id)
    
    if (deleteError) {
      throw deleteError
    }
    
    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'DELETE',
      entity_type: 'review',
      entity_id: params.id,
      old_data: reviewToDelete
    })
    
    return NextResponse.json({ success: true, message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}