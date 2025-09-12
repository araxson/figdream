import { NextRequest, NextResponse } from 'next/server'
import { 
  handleCreate, 
  handleUpdate, 
  handleDelete,
  validateRequiredFields,
  sanitizeData 
} from '@/lib/api/crud-utils'
import { createAuthClient } from '@/lib/api/auth-utils'
import { verifyApiSession } from '@/lib/api/auth-utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const view = searchParams.get('view') || 'all'
  const customerId = searchParams.get('customerId')
  const staffId = searchParams.get('staffId')
  const salonId = searchParams.get('salonId')
  const status = searchParams.get('status')
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')
  
  const session = await verifyApiSession(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', success: false },
      { status: 401 }
    )
  }
  
  const filters: Record<string, string | number | boolean> = {}
  
  // Apply role-based default filters
  if (session.user.role === 'customer' && !customerId) {
    filters.customer_id = session.user.id
  } else if (session.user.role === 'staff' && !staffId && !customerId) {
    filters.staff_id = session.user.id
  }
  
  // Apply requested filters
  if (customerId) filters.customer_id = customerId
  if (staffId) filters.staff_id = staffId
  if (salonId) filters.salon_id = salonId
  if (status) filters.status = status
  
  // Apply date filters based on view
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  const supabase = await createAuthClient(request)
  let query = supabase
    .from('appointments')
    .select(`
      *,
      customer:profiles!appointments_customer_id_fkey(id, full_name, email, avatar_url),
      salon:salons(id, name, address),
      staff:profiles!appointments_staff_id_fkey(id, full_name, avatar_url)
    `)
  
  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value)
    }
  })
  
  // Apply view-specific date filters
  switch (view) {
    case 'today':
      query = query.gte('appointment_date', today).lt('appointment_date', tomorrow)
      break
    case 'upcoming':
      query = query.gte('appointment_date', today).in('status', ['confirmed', 'pending'])
      break
    case 'past':
      query = query.lt('appointment_date', today)
      break
    case 'requests':
      query = query.eq('status', 'pending').gte('appointment_date', today)
      break
  }
  
  // Apply ordering and pagination
  query = query
    .order('appointment_date', { ascending: view === 'upcoming' })
    .order('start_time', { ascending: true })
  
  if (limit) query = query.limit(parseInt(limit))
  if (offset) query = query.range(parseInt(offset), parseInt(offset) + (limit ? parseInt(limit) : 10) - 1)
  
  const { data, error, count } = await query
  
  if (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments', success: false },
      { status: 500 }
    )
  }
  
  return NextResponse.json({
    data: data || [],
    count,
    success: true
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const sanitized = sanitizeData(body)
  
  return handleCreate(sanitized, {
    table: 'appointments',
    requiredRole: ['super_admin', 'salon_owner', 'salon_manager', 'staff', 'customer'],
    validateData: (data) => {
      const validation = validateRequiredFields(data, [
        'customer_id', 
        'salon_id', 
        'staff_id',
        'appointment_date',
        'start_time',
        'end_time'
      ])
      if (!validation.valid) return validation
      
      // Validate date is not in the past
      const appointmentDate = new Date(String(data.appointment_date))
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (appointmentDate < today) {
        return { valid: false, error: 'Cannot book appointments in the past' }
      }
      
      // Validate time format - expecting ISO datetime string
      if (!data.start_time || !data.end_time) {
        return { valid: false, error: 'Start and end times are required' }
      }
      
      // Validate end time is after start time
      if (data.end_time <= data.start_time) {
        return { valid: false, error: 'End time must be after start time' }
      }
      
      return { valid: true }
    },
    transformData: (data) => {
      // Convert time strings to full timestamps if needed
      const appointmentDate = data.appointment_date
      let startTime = data.start_time
      let endTime = data.end_time
      
      // If times are in HH:MM format, convert to full timestamp
      if (typeof startTime === 'string' && startTime.match(/^\d{2}:\d{2}$/)) {
        startTime = `${appointmentDate}T${startTime}:00Z`
      }
      if (typeof endTime === 'string' && endTime.match(/^\d{2}:\d{2}$/)) {
        endTime = `${appointmentDate}T${endTime}:00Z`
      }
      
      // Add services as JSONB if service_id provided
      const services = data.service_id ? [{
        id: data.service_id,
        name: data.service_name || 'Service',
        price: data.service_price || 0,
        duration: data.service_duration || 30
      }] : data.services || []
      
      return {
        ...data,
        start_time: startTime,
        end_time: endTime,
        services: services,
        status: data.status || 'pending',
        is_walk_in: data.is_walk_in || false,
        payment_collected: false,
        location_id: data.location_id || data.salon_id, // Use salon_id as location_id if not provided
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    beforeCreate: async (data, _supabase) => {
      // Skip conflict checking for now as the query is complex
      // TODO: Implement proper conflict checking with timestamp comparison
      return data
    },
    afterCreate: async (_data, _supabase) => {
      // Services are stored in the JSONB column, no need for separate records
      // The appointment_services table may not exist in all configurations
    }
  }, request)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...updates } = body
  
  if (!id) {
    return NextResponse.json(
      { error: 'Appointment ID is required', success: false },
      { status: 400 }
    )
  }
  
  const sanitized = sanitizeData(updates)
  
  return handleUpdate(id, sanitized, {
    table: 'appointments',
    requiredRole: ['super_admin', 'salon_owner', 'salon_manager', 'staff'],
    validateData: (data) => {
      // Validate status if being updated
      if (data.status) {
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show']
        if (!validStatuses.includes(String(data.status))) {
          return { valid: false, error: 'Invalid status' }
        }
      }
      
      // Validate time format if being updated
      if (data.start_time && typeof data.start_time === 'string') {
        // Accept both HH:MM and ISO format
        if (!data.start_time.match(/^\d{2}:\d{2}$/) && !data.start_time.match(/^\d{4}-\d{2}-\d{2}T/)) {
          return { valid: false, error: 'Invalid start time format' }
        }
      }
      if (data.end_time && typeof data.end_time === 'string') {
        if (!data.end_time.match(/^\d{2}:\d{2}$/) && !data.end_time.match(/^\d{4}-\d{2}-\d{2}T/)) {
          return { valid: false, error: 'Invalid end time format' }
        }
      }
      
      // Validate end time is after start time if both provided
      if (data.start_time && data.end_time && data.end_time <= data.start_time) {
        return { valid: false, error: 'End time must be after start time' }
      }
      
      return { valid: true }
    },
    transformData: (data) => {
      const transformed = { ...data }
      
      // Add cancelled_at timestamp if status is being set to cancelled
      if (data.status === 'cancelled') {
        transformed.cancelled_at = new Date().toISOString()
      }
      
      return transformed
    }
  }, request)
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json(
      { error: 'Appointment ID is required', success: false },
      { status: 400 }
    )
  }
  
  const session = await verifyApiSession(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', success: false },
      { status: 401 }
    )
  }
  
  return handleDelete(id, {
    table: 'appointments',
    requiredRole: ['super_admin', 'salon_owner', 'salon_manager'],
    beforeDelete: async (id, supabase) => {
      // Check if user has permission
      const { data: appointment } = await supabase
        .from('appointments')
        .select('customer_id, status')
        .eq('id', id)
        .single()
      
      if (!appointment) {
        throw new Error('Appointment not found')
      }
      
      // Allow customers to delete their own appointments
      if (session.user.role === 'customer' && appointment.customer_id !== session.user.id) {
        throw new Error('Not authorized to delete this appointment')
      }
      
      // Delete related appointment services first
      await supabase
        .from('appointment_services')
        .delete()
        .eq('appointment_id', id)
      
      return true
    }
  }, request)
}