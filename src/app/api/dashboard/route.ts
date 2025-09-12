import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, type SessionDTO } from '@/lib/api/dal/auth'
import { USER_ROLES } from '@/lib/auth/constants'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export async function GET(request: Request) {
  try {
    // Verify user is authenticated
    const session = await requireAuth()
    const supabase = await createClient()

    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const userRole = profile.role
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    // Route to appropriate handler based on user role and requested data type
    switch (userRole) {
      case USER_ROLES.CUSTOMER:
        return await handleCustomerDashboard(supabase, session, type)
      
      case USER_ROLES.STAFF:
        return await handleStaffDashboard(supabase, session, type)
      
      case USER_ROLES.SALON_OWNER:
      case USER_ROLES.SALON_MANAGER:
        return await handleOwnerDashboard(supabase, session, type)
      
      case USER_ROLES.SUPER_ADMIN:
        return await handleAdminDashboard(supabase, session, type)
      
      default:
        return NextResponse.json({ error: 'Invalid user role' }, { status: 403 })
    }
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Customer Dashboard Handler
async function handleCustomerDashboard(
  supabase: SupabaseClient<Database>, 
  session: SessionDTO, 
  type: string
) {
  try {
    switch (type) {
      case 'appointments':
        return await getCustomerAppointments(supabase, session)
      case 'offers':
        return await getCustomerOffers(supabase, session)
      case 'stats':
      case 'overview':
      default:
        return await getCustomerStats(supabase, session)
    }
  } catch (error) {
    console.error('Customer dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch customer dashboard data' }, { status: 500 })
  }
}

// Staff Dashboard Handler
async function handleStaffDashboard(
  supabase: SupabaseClient<Database>, 
  session: SessionDTO, 
  type: string
) {
  try {
    // Get staff profile
    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('id, salon_id, commission_rate')
      .eq('user_id', session.user.id)
      .single()

    if (!staffProfile) {
      return NextResponse.json({ error: 'Staff profile not found' }, { status: 404 })
    }

    switch (type) {
      case 'reviews':
        return await getStaffReviews(supabase, staffProfile)
      case 'schedule':
        return await getStaffSchedule(supabase, staffProfile)
      case 'stats':
      case 'overview':
      default:
        return await getStaffStats(supabase, staffProfile)
    }
  } catch (error) {
    console.error('Staff dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch staff dashboard data' }, { status: 500 })
  }
}

// Owner Dashboard Handler
async function handleOwnerDashboard(
  supabase: SupabaseClient<Database>, 
  session: SessionDTO, 
  type: string
) {
  try {
    // Get salon context for the owner
    const { data: salonData } = await supabase
      .from('salons')
      .select('id')
      .eq('created_by', session.user.id)
      .single()

    if (!salonData) {
      return NextResponse.json({ error: 'No salon found' }, { status: 404 })
    }

    switch (type) {
      case 'appointments':
        return await getOwnerAppointments(supabase, salonData.id)
      case 'services':
        return await getOwnerServices(supabase, salonData.id)
      case 'stats':
      case 'overview':
      default:
        return await getOwnerStats(supabase, salonData.id)
    }
  } catch (error) {
    console.error('Owner dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch owner dashboard data' }, { status: 500 })
  }
}

// Admin Dashboard Handler
async function handleAdminDashboard(
  supabase: SupabaseClient<Database>, 
  session: SessionDTO, 
  type: string
) {
  try {
    switch (type) {
      case 'overview':
        return await getAdminOverviewData(supabase)
      case 'appointments':
        return await getAdminAppointmentsData(supabase)
      case 'revenue':
        return await getAdminRevenueData(supabase)
      case 'staff':
        return await getAdminStaffData(supabase)
      case 'services':
        return await getAdminServicesData(supabase)
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch admin dashboard data' }, { status: 500 })
  }
}

// Customer Dashboard Functions
async function getCustomerAppointments(supabase: SupabaseClient<Database>, session: SessionDTO) {
  // Get customer profile
  const { data: customerProfile } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  if (!customerProfile) {
    return NextResponse.json({ appointments: [] })
  }

  let query = supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      start_time,
      end_time,
      status,
      computed_total_price,
      notes,
      created_at,
      salons (
        id,
        name,
        address,
        phone,
        logo_url
      ),
      staff:staff_profiles (
        id,
        user_id,
        profiles (
          first_name,
          last_name,
          avatar_url
        )
      ),
      appointment_services (
        services (
          id,
          name,
          price,
          duration_minutes
        )
      ),
      reviews (
        id,
        rating,
        comment
      )
    `)
    .eq('customer_id', customerProfile.id)

  const today = new Date().toISOString().split('T')[0]
  query = query
    .gte('appointment_date', today)
    .in('status', ['confirmed', 'pending'])
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true })
    .limit(10)

  const { data: appointments, error } = await query

  if (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }

  // Transform appointments data
  const transformedAppointments = appointments?.map(apt => ({
    id: apt.id,
    date: apt.appointment_date,
    startTime: apt.start_time,
    endTime: apt.end_time,
    status: apt.status,
    totalPrice: apt.computed_total_price || 0,
    notes: apt.notes,
    createdAt: apt.created_at,
    salon: {
      id: apt.salons?.id,
      name: apt.salons?.name || 'Salon',
      address: apt.salons?.address,
      phone: apt.salons?.phone,
      image: apt.salons?.logo_url
    },
    staff: apt.staff?.profiles
      ? {
          name: `${apt.staff.profiles.first_name || ''} ${apt.staff.profiles.last_name || ''}`.trim(),
          avatar: apt.staff.profiles.avatar_url
        }
      : null,
    services: apt.appointment_services?.map(as => ({
      id: as.services?.id,
      name: as.services?.name || 'Service',
      price: as.services?.price || 0,
      duration: as.services?.duration_minutes || 30
    })) || [],
    review: apt.reviews?.[0] || null,
    canReview: apt.status === 'completed' && !apt.reviews?.[0],
    canCancel: apt.status === 'pending' || (apt.status === 'confirmed' && apt.appointment_date >= today),
    canReschedule: apt.status !== 'cancelled' && apt.status !== 'completed' && apt.appointment_date >= today
  })) || []

  return NextResponse.json({
    appointments: transformedAppointments,
    summary: {
      total: transformedAppointments.length,
      upcoming: transformedAppointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length,
      completed: transformedAppointments.filter(a => a.status === 'completed').length
    }
  })
}

async function getCustomerOffers(_supabase: SupabaseClient<Database>, _session: SessionDTO) {
  // Return empty offers since the offers table doesn't exist yet
  return NextResponse.json({
    offers: [],
    categories: {
      available: [],
      redeemed: [],
      expired: [],
      upcoming: []
    },
    summary: {
      total: 0,
      available: 0,
      redeemed: 0,
      loyaltyPoints: 0
    },
    message: 'Offers feature coming soon'
  })
}

async function getCustomerStats(supabase: SupabaseClient<Database>, session: SessionDTO) {
  // Get customer profile
  let { data: customerProfile } = await supabase
    .from('customers')
    .select('id, created_at, computed_total_spent, computed_total_visits')
    .eq('user_id', session.user.id)
    .single()

  if (!customerProfile) {
    // Get first salon as default
    const { data: defaultSalon } = await supabase
      .from('salons')
      .select('id')
      .limit(1)
      .single()

    // Create customer profile if it doesn't exist
    const { data: newCustomer } = await supabase
      .from('customers')
      .insert({
        user_id: session.user.id,
        email: session.user.email || '',
        salon_id: defaultSalon?.id || '0d4c5224-c174-4223-8201-de3f60bd4424'
      })
      .select('id, created_at, computed_total_spent, computed_total_visits')
      .single()

    customerProfile = newCustomer
  }

  const customerId = customerProfile?.id
  
  if (!customerId) {
    return NextResponse.json({
      totalBookings: 0,
      upcomingAppointments: 0,
      completedAppointments: 0,
      loyaltyPoints: 0,
      totalSpent: 0,
      favoriteService: 'None yet',
      memberSince: 0,
      activeOffers: 0,
      membershipLevel: 'Bronze',
      nextRewardAt: 100
    })
  }

  // Fetch appointment statistics
  const { count: totalAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customerId)
    .neq('status', 'cancelled')

  const { count: upcomingAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customerId)
    .in('status', ['confirmed', 'pending'])
    .gte('appointment_date', new Date().toISOString().split('T')[0])

  const { count: completedAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customerId)
    .eq('status', 'completed')

  // Calculate total spent
  const { data: spentData } = await supabase
    .from('appointments')
    .select('computed_total_price')
    .eq('customer_id', customerId)
    .eq('status', 'completed')

  const totalSpent = spentData?.reduce((sum, apt) => sum + (apt.computed_total_price || 0), 0) || 0

  // Fetch favorite services (most booked)
  const { data: serviceBookings } = await supabase
    .from('appointment_services')
    .select(`
      service_id,
      services (
        id,
        name
      ),
      appointments!inner (
        customer_id,
        status
      )
    `)
    .eq('appointments.customer_id', customerId)
    .eq('appointments.status', 'completed')

  // Count service bookings
  const serviceCounts: Record<string, { name: string; count: number }> = {}
  serviceBookings?.forEach(booking => {
    if (booking.services) {
      const id = booking.services.id
      if (!serviceCounts[id]) {
        serviceCounts[id] = { name: booking.services.name, count: 0 }
      }
      serviceCounts[id].count++
    }
  })

  const favoriteService = Object.values(serviceCounts)
    .sort((a, b) => b.count - a.count)[0]?.name || 'None yet'

  // Calculate member since (in months)
  const memberSince = customerProfile?.created_at 
    ? Math.floor((Date.now() - new Date(customerProfile.created_at).getTime()) / (30 * 24 * 60 * 60 * 1000))
    : 0

  const stats = {
    totalBookings: totalAppointments || 0,
    upcomingAppointments: upcomingAppointments || 0,
    completedAppointments: completedAppointments || 0,
    loyaltyPoints: 0,
    totalSpent,
    favoriteService,
    memberSince,
    activeOffers: 0,
    membershipLevel: calculateMembershipLevel(totalSpent),
    nextRewardAt: calculateNextReward(0)
  }

  return NextResponse.json(stats)
}

// Staff Dashboard Functions
async function getStaffReviews(supabase: SupabaseClient<Database>, staffProfile: { id: string; salon_id: string }) {
  // Fetch recent reviews for this staff member
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      customer_id,
      appointments (
        id,
        appointment_date,
        appointment_services (
          services (
            name
          )
        )
      )
    `)
    .eq('staff_id', staffProfile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }

  // Fetch customer details
  interface Customer {
    id: string
    first_name: string | null
    last_name: string | null
  }
  let customersMap: Record<string, Customer> = {}
  if (reviews && reviews.length > 0) {
    const customerIds = [...new Set(reviews.map(r => r.customer_id).filter(Boolean))]
    if (customerIds.length > 0) {
      const { data: customers } = await supabase
        .from('customers')
        .select('id, first_name, last_name')
        .in('id', customerIds)
      
      if (customers) {
        customersMap = Object.fromEntries(customers.map(c => [c.id, c]))
      }
    }
  }

  // Transform reviews data
  const transformedReviews = reviews?.map(review => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    date: review.created_at,
    customerName: customersMap[review.customer_id] 
      ? `${customersMap[review.customer_id].first_name || ''} ${customersMap[review.customer_id].last_name || ''}`.trim()
      : 'Anonymous',
    customerAvatar: null,
    serviceName: review.appointments?.appointment_services?.[0]?.services?.name || 'Service',
    appointmentDate: review.appointments?.appointment_date
  })) || []

  // Calculate rating distribution
  const ratingDistribution = {
    5: reviews?.filter(r => r.rating === 5).length || 0,
    4: reviews?.filter(r => r.rating === 4).length || 0,
    3: reviews?.filter(r => r.rating === 3).length || 0,
    2: reviews?.filter(r => r.rating === 2).length || 0,
    1: reviews?.filter(r => r.rating === 1).length || 0
  }

  const totalReviews = reviews?.length || 0
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
    : 0

  return NextResponse.json({
    reviews: transformedReviews,
    stats: {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      recentTrend: calculateTrend(reviews || [])
    }
  })
}

async function getStaffSchedule(supabase: SupabaseClient<Database>, staffProfile: { id: string }) {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Fetch today's and tomorrow's appointments
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      start_time,
      end_time,
      status,
      computed_total_price,
      notes,
      customer_id,
      appointment_services (
        services (
          id,
          name,
          price,
          duration_minutes
        )
      )
    `)
    .eq('staff_id', staffProfile.id)
    .in('appointment_date', [today, tomorrow])
    .neq('status', 'cancelled')
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
  }

  // Fetch customer details separately
  interface Customer {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone: string | null
  }
  let customersMap: Record<string, Customer> = {}
  if (appointments && appointments.length > 0) {
    const customerIds = [...new Set(appointments.map(a => a.customer_id).filter(Boolean))]
    if (customerIds.length > 0) {
      const { data: customers } = await supabase
        .from('customers')
        .select('id, first_name, last_name, email, phone')
        .in('id', customerIds)
      
      if (customers) {
        customersMap = Object.fromEntries(customers.map(c => [c.id, c]))
      }
    }
  }

  // Transform appointments into schedule format
  const schedule = appointments?.map(apt => ({
    id: apt.id,
    date: apt.appointment_date,
    startTime: apt.start_time,
    endTime: apt.end_time,
    status: apt.status,
    customerName: customersMap[apt.customer_id] 
      ? `${customersMap[apt.customer_id].first_name || ''} ${customersMap[apt.customer_id].last_name || ''}`.trim()
      : 'Unknown Customer',
    customerPhone: customersMap[apt.customer_id]?.phone,
    customerEmail: customersMap[apt.customer_id]?.email,
    customerAvatar: null,
    services: apt.appointment_services?.map(as => ({
      name: as.services?.name || 'Service',
      duration: as.services?.duration_minutes || 30,
      price: as.services?.price || 0
    })) || [],
    totalPrice: apt.computed_total_price,
    notes: apt.notes,
    isToday: apt.appointment_date === today
  })) || []

  // Get working hours for staff member
  const todayDayOfWeek = new Date().getDay()
  const tomorrowDayOfWeek = (todayDayOfWeek + 1) % 7
  
  const { data: workingHours } = await supabase
    .from('staff_schedules')
    .select('day_of_week, start_time, end_time, is_working')
    .eq('staff_id', staffProfile.id)
    .in('day_of_week', [todayDayOfWeek, tomorrowDayOfWeek])

  // Calculate availability slots
  const availability = workingHours?.map(wh => ({
    dayOfWeek: wh.day_of_week,
    date: wh.day_of_week === todayDayOfWeek ? today : tomorrow,
    startTime: wh.start_time,
    endTime: wh.end_time,
    isAvailable: wh.is_working
  })) || []

  return NextResponse.json({
    schedule,
    availability,
    summary: {
      todayCount: schedule.filter(s => s.isToday).length,
      tomorrowCount: schedule.filter(s => !s.isToday).length,
      todayEarnings: schedule
        .filter(s => s.isToday && s.status === 'completed')
        .reduce((sum, s) => sum + (s.totalPrice || 0), 0)
    }
  })
}

async function getStaffStats(supabase: SupabaseClient<Database>, staffProfile: { id: string; salon_id: string; commission_rate?: number | null }) {
  const today = new Date().toISOString().split('T')[0]
  const startOfWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  // Fetch today's appointments for this staff member
  const { count: todayAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('staff_id', staffProfile.id)
    .eq('appointment_date', today)
    .neq('status', 'cancelled')

  const { count: completedToday } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('staff_id', staffProfile.id)
    .eq('appointment_date', today)
    .eq('status', 'completed')

  const { count: upcomingToday } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('staff_id', staffProfile.id)
    .eq('appointment_date', today)
    .in('status', ['confirmed', 'pending'])

  // Calculate earnings (today, week, month)
  const { data: todayEarnings } = await supabase
    .from('appointments')
    .select('computed_total_price')
    .eq('staff_id', staffProfile.id)
    .eq('appointment_date', today)
    .eq('status', 'completed')

  const { data: weeklyEarnings } = await supabase
    .from('appointments')
    .select('computed_total_price')
    .eq('staff_id', staffProfile.id)
    .gte('appointment_date', startOfWeek)
    .eq('status', 'completed')

  const { data: monthlyEarnings } = await supabase
    .from('appointments')
    .select('computed_total_price')
    .eq('staff_id', staffProfile.id)
    .gte('appointment_date', startOfMonth)
    .eq('status', 'completed')

  // Calculate commission-based earnings
  const commissionRate = staffProfile.commission_rate || 0.5
  const calculateEarnings = (data: Array<{ computed_total_price?: number | null }> | null) => {
    const total = data?.reduce((sum, item) => sum + (item.computed_total_price || 0), 0) || 0
    return total * commissionRate
  }

  // Fetch customer stats
  const { data: uniqueCustomers } = await supabase
    .from('appointments')
    .select('customer_id')
    .eq('staff_id', staffProfile.id)
    .gte('appointment_date', startOfMonth)
    .eq('status', 'completed')

  const uniqueCustomerCount = new Set(uniqueCustomers?.map(a => a.customer_id).filter(Boolean)).size

  // Fetch reviews for this staff member
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('staff_id', staffProfile.id)

  const averageRating = reviews?.length 
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length 
    : 0

  // Fetch regular clients
  const { data: regularClientsData } = await supabase
    .from('appointments')
    .select('customer_id')
    .eq('staff_id', staffProfile.id)
    .eq('status', 'completed')

  const customerCounts = regularClientsData?.reduce((acc: Record<string, number>, curr) => {
    if (curr.customer_id) {
      acc[curr.customer_id] = (acc[curr.customer_id] || 0) + 1
    }
    return acc
  }, {}) || {}

  const regularClients = Object.values(customerCounts).filter(count => count >= 3).length

  const stats = {
    todayAppointments: todayAppointments || 0,
    completedToday: completedToday || 0,
    upcomingToday: upcomingToday || 0,
    todayEarnings: calculateEarnings(todayEarnings),
    weeklyEarnings: calculateEarnings(weeklyEarnings),
    monthlyEarnings: calculateEarnings(monthlyEarnings),
    totalCustomers: uniqueCustomerCount,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviews?.length || 0,
    regularClients,
    commissionRate: commissionRate * 100,
  }

  return NextResponse.json({ stats })
}

// Owner Dashboard Functions
async function getOwnerAppointments(supabase: SupabaseClient<Database>, salonId: string) {
  const today = new Date().toISOString().split('T')[0]

  // Fetch today's appointments with customer and service details
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      start_time,
      end_time,
      status,
      computed_total_price,
      notes,
      customer_id,
      staff_id,
      staff:staff_profiles (
        id,
        user_id,
        profiles (
          first_name,
          last_name,
          email
        )
      ),
      appointment_services (
        services (
          id,
          name,
          price,
          duration_minutes
        )
      )
    `)
    .eq('salon_id', salonId)
    .eq('appointment_date', today)
    .order('start_time', { ascending: true })
    .limit(20)

  if (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
  
  // Fetch customer details separately
  interface Customer {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone: string | null
  }
  let customersMap: Record<string, Customer> = {}
  if (appointments && appointments.length > 0) {
    const customerIds = [...new Set(appointments.map(a => a.customer_id).filter(Boolean))]
    if (customerIds.length > 0) {
      const { data: customers } = await supabase
        .from('customers')
        .select('id, first_name, last_name, email, phone')
        .in('id', customerIds)
      
      if (customers) {
        customersMap = Object.fromEntries(customers.map(c => [c.id, c]))
      }
    }
  }

  // Transform the data to match the expected format
  const transformedAppointments = appointments?.map(apt => ({
    id: apt.id,
    time: apt.start_time,
    customerName: customersMap[apt.customer_id] 
      ? `${customersMap[apt.customer_id].first_name || ''} ${customersMap[apt.customer_id].last_name || ''}`.trim()
      : 'Unknown Customer',
    serviceName: apt.appointment_services?.[0]?.services?.name || 'Service',
    staffName: apt.staff?.profiles
      ? `${apt.staff.profiles.first_name || ''} ${apt.staff.profiles.last_name || ''}`.trim()
      : 'Unassigned',
    status: apt.status,
    amount: apt.computed_total_price || 0,
    duration: apt.appointment_services?.[0]?.services?.duration_minutes || 30,
    customer: customersMap[apt.customer_id] || null,
    services: apt.appointment_services?.map(as => as.services).filter(Boolean) || [],
    staff: apt.staff
  })) || []

  return NextResponse.json(transformedAppointments)
}

async function getOwnerServices(supabase: SupabaseClient<Database>, salonId: string) {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  // Fetch top services by booking count this month
  const { data: serviceBookings, error } = await supabase
    .from('appointment_services')
    .select(`
      service_id,
      services (
        id,
        name,
        price,
        duration_minutes
      ),
      appointments!inner (
        appointment_date,
        status,
        salon_id
      )
    `)
    .eq('appointments.salon_id', salonId)
    .gte('appointments.appointment_date', startOfMonth)
    .eq('appointments.status', 'completed')

  if (error) {
    console.error('Error fetching service data:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }

  // Aggregate service data
  interface ServiceStat {
    id: string
    name: string
    bookings: number
    revenue: number
    price: number
    duration_minutes: number
  }

  const serviceStats = serviceBookings?.reduce((acc: Record<string, ServiceStat>, booking) => {
    if (!booking.services) return acc
    
    const serviceId = booking.service_id
    if (!acc[serviceId]) {
      acc[serviceId] = {
        id: booking.services.id,
        name: booking.services.name,
        bookings: 0,
        revenue: 0,
        price: booking.services.price,
        duration_minutes: booking.services.duration_minutes,
      }
    }
    
    acc[serviceId].bookings += 1
    acc[serviceId].revenue += booking.services.price || 0
    
    return acc
  }, {}) || {}

  // Convert to array and sort by bookings
  const topServices = Object.values(serviceStats)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 10)
    .map((service) => ({
      id: service.id,
      name: service.name,
      bookings: service.bookings,
      revenue: service.revenue,
      price: service.price,
      duration: service.duration_minutes,
      growthRate: 0
    }))

  return NextResponse.json(topServices)
}

async function getOwnerStats(supabase: SupabaseClient<Database>, salonId: string) {
  const today = new Date().toISOString().split('T')[0]
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const startOfWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Fetch today's revenue
  const { data: todayRevenue } = await supabase
    .from('appointments')
    .select('computed_total_price')
    .eq('salon_id', salonId)
    .eq('appointment_date', today)
    .eq('status', 'completed')

  // Fetch monthly revenue
  const { data: monthlyRevenue } = await supabase
    .from('appointments')
    .select('computed_total_price')
    .eq('salon_id', salonId)
    .gte('appointment_date', startOfMonth)
    .eq('status', 'completed')

  // Fetch appointment counts
  const { count: todayAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .eq('appointment_date', today)

  const { count: completedToday } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .eq('appointment_date', today)
    .eq('status', 'completed')

  const { count: upcomingToday } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .eq('appointment_date', today)
    .in('status', ['confirmed', 'pending'])

  // Fetch weekly earnings
  const { data: weeklyRevenue } = await supabase
    .from('appointments')
    .select('computed_total_price')
    .eq('salon_id', salonId)
    .gte('appointment_date', startOfWeek)
    .eq('status', 'completed')

  // Fetch customer stats
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)

  // Fetch regular clients
  const { data: regularClientsData } = await supabase
    .from('appointments')
    .select('customer_id')
    .eq('salon_id', salonId)
    .eq('status', 'completed')

  const customerAppointmentCounts = regularClientsData?.reduce((acc: Record<string, number>, curr) => {
    if (curr.customer_id) {
      acc[curr.customer_id] = (acc[curr.customer_id] || 0) + 1
    }
    return acc
  }, {}) || {}

  const regularClients = Object.values(customerAppointmentCounts).filter(count => count > 3).length

  // Fetch staff and service counts
  const { count: activeStaff } = await supabase
    .from('staff_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .eq('is_active', true)

  const { count: totalServices } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .eq('is_active', true)

  // Fetch reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('salon_id', salonId)

  const averageRating = reviews?.length 
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length 
    : 0

  // Calculate totals
  const calculateTotal = (data: Array<{ computed_total_price?: number | null }> | null) => 
    data?.reduce((sum, item) => sum + (item.computed_total_price || 0), 0) || 0

  const stats = {
    todayRevenue: calculateTotal(todayRevenue),
    monthlyRevenue: calculateTotal(monthlyRevenue),
    todayAppointments: todayAppointments || 0,
    completedToday: completedToday || 0,
    upcomingToday: upcomingToday || 0,
    weeklyEarnings: calculateTotal(weeklyRevenue),
    monthlyEarnings: calculateTotal(monthlyRevenue),
    totalCustomers: totalCustomers || 0,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviews?.length || 0,
    regularClients,
    activeStaff: activeStaff || 0,
    totalServices: totalServices || 0
  }

  return NextResponse.json(stats)
}

// Admin Dashboard Functions (from original analytics route)
async function getAdminOverviewData(supabase: SupabaseClient<Database>) {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))

  // Get total appointments
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('id, status, appointment_date, computed_total_price')

  if (appointmentsError) throw appointmentsError

  // Get total customers
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('id, created_at')

  if (customersError) throw customersError

  // Get total staff
  const { data: staff, error: staffError } = await supabase
    .from('staff_profiles')
    .select('id, created_at, is_active')

  if (staffError) throw staffError

  // Calculate metrics
  const totalAppointments = appointments?.length || 0
  const completedAppointments = appointments?.filter((a: { status: string }) => a.status === 'completed').length || 0
  const totalRevenue = appointments?.reduce((sum: number, a: { computed_total_price?: number | null }) => sum + (a.computed_total_price || 0), 0) || 0
  const totalCustomers = customers?.length || 0
  const activeStaff = staff?.filter((s: { is_active: boolean }) => s.is_active).length || 0

  // This week's appointments
  const thisWeekAppointments = appointments?.filter((a: { appointment_date: string }) => 
    new Date(a.appointment_date) >= startOfWeek
  ).length || 0

  // This month's revenue
  const thisMonthRevenue = appointments?.filter((a: { appointment_date: string; status: string }) => 
    new Date(a.appointment_date) >= startOfMonth && a.status === 'completed'
  ).reduce((sum: number, a: { computed_total_price?: number | null }) => sum + (a.computed_total_price || 0), 0) || 0

  return NextResponse.json({
    success: true,
    data: {
      totalAppointments,
      completedAppointments,
      totalRevenue,
      totalCustomers,
      activeStaff,
      thisWeekAppointments,
      thisMonthRevenue,
      completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0
    }
  })
}

async function getAdminAppointmentsData(supabase: SupabaseClient<Database>) {
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      status,
      computed_total_price,
      customers (
        id,
        full_name,
        email
      ),
      staff (
        id,
        full_name
      ),
      services (
        id,
        name,
        duration
      )
    `)
    .order('appointment_date', { ascending: false })
    .limit(100)

  if (error) throw error

  return NextResponse.json({
    success: true,
    data: appointments || []
  })
}

async function getAdminRevenueData(supabase: SupabaseClient<Database>) {
  const { data: revenue, error } = await supabase
    .from('appointments')
    .select('appointment_date, computed_total_price, status')
    .eq('status', 'completed')
    .not('computed_total_price', 'is', null)
    .order('appointment_date', { ascending: false })

  if (error) throw error

  // Group by date
  const revenueByDate = revenue?.reduce((acc: Record<string, number>, appointment: { appointment_date: string; computed_total_price: number | null }) => {
    const date = new Date(appointment.appointment_date).toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + (appointment.computed_total_price || 0)
    return acc
  }, {} as Record<string, number>) || {}

  return NextResponse.json({
    success: true,
    data: {
      revenue,
      revenueByDate,
      totalRevenue: revenue?.reduce((sum: number, a: { computed_total_price: number | null }) => sum + (a.computed_total_price || 0), 0) || 0
    }
  })
}

async function getAdminStaffData(supabase: SupabaseClient<Database>) {
  const { data: staff, error } = await supabase
    .from('staff_profiles')
    .select(`
      id,
      is_active,
      created_at,
      profiles!inner (
        full_name,
        email
      ),
      appointments (
        id,
        status,
        computed_total_price
      )
    `)

  if (error) throw error

  // Calculate staff performance
  const staffWithMetrics = staff?.map((member: { appointments?: Array<{ status: string; computed_total_price?: number | null }>; profiles?: { full_name?: string | null; email?: string | null } } & Record<string, unknown>) => {
    const appointments = member.appointments || []
    const completedAppointments = appointments.filter((a: { status: string }) => a.status === 'completed')
    const totalRevenue = completedAppointments.reduce((sum: number, a: { computed_total_price?: number | null }) => sum + (a.computed_total_price || 0), 0)

    return {
      ...member,
      appointmentsCount: appointments.length,
      completedAppointments: completedAppointments.length,
      totalRevenue,
      averageRevenue: completedAppointments.length > 0 ? totalRevenue / completedAppointments.length : 0
    }
  }) || []

  return NextResponse.json({
    success: true,
    data: staffWithMetrics
  })
}

async function getAdminServicesData(supabase: SupabaseClient<Database>) {
  const { data: services, error } = await supabase
    .from('services')
    .select(`
      id,
      name,
      description,
      price,
      duration_minutes,
      is_active,
      appointments (
        id,
        status,
        computed_total_price
      )
    `)

  if (error) throw error

  // Calculate service popularity and revenue
  const servicesWithMetrics = services?.map((service: { appointments?: Array<{ status: string; computed_total_price?: number | null }> } & Record<string, unknown>) => {
    const appointments = service.appointments || []
    const completedAppointments = appointments.filter((a: { status: string }) => a.status === 'completed')
    const totalRevenue = completedAppointments.reduce((sum: number, a: { computed_total_price?: number | null }) => sum + (a.computed_total_price || 0), 0)

    return {
      ...service,
      bookingsCount: appointments.length,
      completedBookings: completedAppointments.length,
      totalRevenue,
      averageRevenue: completedAppointments.length > 0 ? totalRevenue / completedAppointments.length : 0
    }
  }) || []

  return NextResponse.json({
    success: true,
    data: servicesWithMetrics
  })
}

// Helper Functions
function calculateMembershipLevel(totalSpent: number): string {
  if (totalSpent >= 5000) return 'Platinum'
  if (totalSpent >= 2000) return 'Gold'
  if (totalSpent >= 500) return 'Silver'
  return 'Bronze'
}

function calculateNextReward(points: number): number {
  const rewardThreshold = 100
  const remaining = rewardThreshold - (points % rewardThreshold)
  return remaining
}

function calculateTrend(reviews: Array<{ rating?: number }>): 'up' | 'down' | 'stable' {
  if (reviews.length < 2) return 'stable'
  
  const recent = reviews.slice(0, 5)
  const older = reviews.slice(5, 10)
  
  if (older.length === 0) return 'stable'
  
  const recentAvg = recent.reduce((sum, r) => sum + (r.rating || 0), 0) / recent.length
  const olderAvg = older.reduce((sum, r) => sum + (r.rating || 0), 0) / older.length
  
  const diff = recentAvg - olderAvg
  
  if (diff > 0.2) return 'up'
  if (diff < -0.2) return 'down'
  return 'stable'
}