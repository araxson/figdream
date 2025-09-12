import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/api/dal/auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const customerId = searchParams.get('customerId') || session.user.id
    const salonId = searchParams.get('salonId')
    
    const supabase = await createClient()
    const response: Record<string, unknown> = {}
    
    // Get customer appointments history
    if (type === 'history' || type === 'all') {
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          salon:salons(name, address),
          service:services(name, price),
          staff:profiles!appointments_staff_id_fkey(full_name)
        `)
        .eq('customer_id', customerId)
        .order('appointment_date', { ascending: false })
      
      response.appointments = appointments || []
    }
    
    // Get customer favorites
    if (type === 'favorites' || type === 'all') {
      const { data: favorites } = await supabase
        .from('customer_favorites')
        .select(`
          *,
          salon:salons(name, address, phone, logo_url)
        `)
        .eq('customer_id', customerId)
      
      response.favorites = favorites || []
    }
    
    // Get customer reviews
    if (type === 'reviews' || type === 'all') {
      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          *,
          salon:salons(name),
          responses:review_responses(*)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
      
      response.reviews = reviews || []
    }
    
    // Get customer metrics (for staff/owner view)
    if (type === 'metrics' && salonId) {
      const { data: customerData } = await supabase
        .from('profiles')
        .select(`
          *,
          appointments!appointments_customer_id_fkey(count),
          reviews!reviews_customer_id_fkey(rating)
        `)
        .eq('id', customerId)
        .single()
      
      if (customerData) {
        const { data: appointmentStats } = await supabase
          .from('appointments')
          .select('computed_total_price, status, appointment_date')
          .eq('customer_id', customerId)
          .eq('salon_id', salonId)
        
        const totalSpent = appointmentStats?.reduce((sum, apt) => 
          apt.status === 'completed' ? sum + (apt.computed_total_price || 0) : sum, 0) || 0
        
        const completedAppointments = appointmentStats?.filter(apt => 
          apt.status === 'completed').length || 0
        
        // Calculate average rating from reviews array
        const reviewRatings = Array.isArray(customerData.reviews) ? 
          customerData.reviews.map((r: { rating?: number }) => r.rating).filter((r: number | undefined): r is number => r != null) : []
        const averageRating = reviewRatings.length > 0 ? 
          reviewRatings.reduce((sum: number, rating: number) => sum + rating, 0) / reviewRatings.length : 0

        response.metrics = {
          totalAppointments: appointmentStats?.length || 0,
          completedAppointments,
          totalSpent,
          averageRating,
          lastVisit: appointmentStats?.[0]?.appointment_date || null
        }
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Get customer data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { action, salonId } = await request.json()
    const supabase = await createClient()
    
    if (action === 'addFavorite' && salonId) {
      // Get customer ID from user's auth ID
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single()
      
      if (!customer) {
        return NextResponse.json(
          { error: 'Customer profile not found' },
          { status: 404 }
        )
      }
      
      const { error } = await supabase
        .from('customer_favorites')
        .insert({
          customer_id: customer.id,
          salon_id: salonId,
          favorite_type: 'salon',
          service_id: '',
          staff_id: ''
        })
      
      if (error && error.code !== '23505') { // Ignore duplicate key errors
        throw error
      }
      
      return NextResponse.json({ success: true })
    }
    
    if (action === 'removeFavorite' && salonId) {
      const { error } = await supabase
        .from('customer_favorites')
        .delete()
        .eq('customer_id', session.user.id)
        .eq('salon_id', salonId)
      
      if (error) throw error
      
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Customer action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}