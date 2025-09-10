import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { appointmentId, rating, comment } = body

    if (!appointmentId || !rating) {
      return NextResponse.json(
        { error: 'Appointment ID and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Get appointment details with customer profile
    const { data: appointment } = await supabase
      .from('appointments')
      .select(`
        *,
        profiles:customer_id(
          id,
          user_id
        )
      `)
      .eq('id', appointmentId)
      .single()

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Verify the user is the customer for this appointment
    const customerProfile = appointment.profiles as { id?: string; user_id?: string }
    if (customerProfile?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to review this appointment' },
        { status: 403 }
      )
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('appointment_id', appointmentId)
      .single()

    if (existingReview) {
      // Update existing review
      const { data: updatedReview, error } = await supabase
        .from('reviews')
        .update({
          rating,
          comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReview.id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ 
        success: true,
        review: updatedReview,
        message: 'Review updated successfully'
      }, { status: 200 })
    } else {
      // Create new review
      const { data: newReview, error } = await supabase
        .from('reviews')
        .insert({
          appointment_id: appointmentId,
          customer_id: appointment.customer_id,
          salon_id: appointment.salon_id,
          staff_id: appointment.staff_id,
          rating,
          comment,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Note: Average rating should be calculated via a database view or trigger
      // The mv_salon_dashboard view already provides average_rating

      return NextResponse.json({ 
        success: true,
        review: newReview,
        message: 'Review submitted successfully'
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Review submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const salonId = searchParams.get('salonId')
    const staffId = searchParams.get('staffId')
    const customerId = searchParams.get('customerId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('reviews')
      .select(`
        *,
        profiles!reviews_customer_id_fkey(
          first_name,
          last_name,
          email
        ),
        salons(name),
        staff_profiles(
          profiles(full_name)
        ),
        appointments(
          appointment_services(
            services(name)
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (salonId) {
      query = query.eq('salon_id', salonId)
    }
    if (staffId) {
      query = query.eq('staff_id', staffId)
    }
    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    const { data: reviews, error, count } = await query

    if (error) throw error

    // Calculate statistics if salon or staff specific
    let stats = null
    if (salonId || staffId) {
      const ratings = reviews?.map(r => r.rating) || []
      if (ratings.length > 0) {
        stats = {
          averageRating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
          totalReviews: count || ratings.length,
          distribution: {
            5: ratings.filter(r => r === 5).length,
            4: ratings.filter(r => r === 4).length,
            3: ratings.filter(r => r === 3).length,
            2: ratings.filter(r => r === 2).length,
            1: ratings.filter(r => r === 1).length,
          }
        }
      }
    }

    return NextResponse.json({ 
      reviews: reviews || [],
      total: count || 0,
      stats
    }, { status: 200 })

  } catch (error) {
    console.error('Reviews fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// Handle owner response to review
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reviewId, ownerResponse } = body

    if (!reviewId || !ownerResponse) {
      return NextResponse.json(
        { error: 'Review ID and response are required' },
        { status: 400 }
      )
    }

    // Get review details
    const { data: review } = await supabase
      .from('reviews')
      .select(`
        *,
        salons!inner(created_by)
      `)
      .eq('id', reviewId)
      .single()

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Verify the user is the salon owner
    if (review.salons?.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to respond to this review' },
        { status: 403 }
      )
    }

    // Update review with owner response
    const { data: updatedReview, error } = await supabase
      .from('reviews')
      .update({
        response: ownerResponse,
        responded_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      review: updatedReview,
      message: 'Response added successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Owner response error:', error)
    return NextResponse.json(
      { error: 'Failed to add response' },
      { status: 500 }
    )
  }
}