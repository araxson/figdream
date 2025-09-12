import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/api/dal/auth'

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { reviewId, response } = await request.json()
    
    if (!reviewId || !response) {
      return NextResponse.json(
        { error: 'Review ID and response are required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Verify the user owns the salon associated with this review
    const { data: review } = await supabase
      .from('reviews')
      .select('salon_id')
      .eq('id', reviewId)
      .single()
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }
    
    // Verify salon ownership
    const { data: salon } = await supabase
      .from('salons')
      .select('created_by')
      .eq('id', review.salon_id)
      .single()
    
    if (!salon || (salon.created_by !== session.user.id && session.user.role !== 'super_admin')) {
      return NextResponse.json(
        { error: 'Unauthorized to respond to this review' },
        { status: 403 }
      )
    }
    
    // Update the review with response
    const { error } = await supabase
      .from('reviews')
      .update({
        response: response.trim(),
        responded_at: new Date().toISOString()
      })
      .eq('id', reviewId)
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to submit response' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Review response error:', error)
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    )
  }
}