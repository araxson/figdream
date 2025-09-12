import { NextRequest, NextResponse } from 'next/server'
import { 
  handleCreate, 
  handleRead, 
  handleUpdate, 
  handleDelete,
  validateRequiredFields,
  validateEmail,
  validatePhone,
  sanitizeData 
} from '@/lib/api/crud-utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ownerId = searchParams.get('ownerId')
  const city = searchParams.get('city')
  const isActive = searchParams.get('isActive')
  const _search = searchParams.get('search')
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')
  
  const filters: Record<string, unknown> = {}
  
  if (ownerId) filters.created_by = ownerId
  if (city) filters.city = city
  if (isActive !== null) filters.is_active = isActive === 'true'
  
  return handleRead(filters, {
    table: 'salons',
    select: `
      *,
      owner:profiles!salons_created_by_fkey(id, full_name, email),
      services(count),
      staff_profiles(count)
    `,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined
  }, request)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const sanitized = sanitizeData(body)
  
  return handleCreate(sanitized, {
    table: 'salons',
    requiredRole: ['super_admin', 'salon_owner'],
    validateData: (data) => {
      const validation = validateRequiredFields(data, [
        'name',
        'address',
        'city',
        'country',
        'phone',
        'email'
      ])
      if (!validation.valid) return validation
      
      if (!validateEmail(String(data.email))) {
        return { valid: false, error: 'Invalid email format' }
      }
      
      if (!validatePhone(String(data.phone))) {
        return { valid: false, error: 'Invalid phone format' }
      }
      
      // Validate operating hours if provided
      if (data.operating_hours) {
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
        
        for (const day of Object.keys(data.operating_hours)) {
          if (!validDays.includes(day.toLowerCase())) {
            return { valid: false, error: `Invalid day: ${day}` }
          }
          
          const hours = (data.operating_hours as Record<string, {is_open: boolean, open_time: string, close_time: string}>)[day]
          if (hours.is_open) {
            if (!timeRegex.test(hours.open_time) || !timeRegex.test(hours.close_time)) {
              return { valid: false, error: `Invalid time format for ${day}` }
            }
          }
        }
      }
      
      return { valid: true }
    },
    transformData: (data) => ({
      ...data,
      is_active: data.is_active ?? true,
      is_verified: false,
      settings: data.settings || {},
      operating_hours: data.operating_hours || getDefaultOperatingHours(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }),
    afterCreate: async (data, supabase) => {
      // Update owner's role to salon_owner if they're currently a customer
      const session = await supabase.auth.getSession()
      if (session.data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.data.session.user.id)
          .single()
        
        if (profile && profile.role === 'customer') {
          await supabase
            .from('profiles')
            .update({ role: 'salon_owner' })
            .eq('id', session.data.session.user.id)
        }
      }
    }
  }, request)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...updates } = body
  
  if (!id) {
    return NextResponse.json(
      { error: 'Salon ID is required', success: false },
      { status: 400 }
    )
  }
  
  const sanitized = sanitizeData(updates)
  
  return handleUpdate(id, sanitized, {
    table: 'salons',
    requiredRole: ['super_admin', 'salon_owner', 'salon_manager'],
    validateData: (data) => {
      if (data.email && !validateEmail(String(data.email))) {
        return { valid: false, error: 'Invalid email format' }
      }
      
      if (data.phone && !validatePhone(String(data.phone))) {
        return { valid: false, error: 'Invalid phone format' }
      }
      
      // Validate operating hours if provided
      if (data.operating_hours) {
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
        
        for (const day of Object.keys(data.operating_hours)) {
          if (!validDays.includes(day.toLowerCase())) {
            return { valid: false, error: `Invalid day: ${day}` }
          }
          
          const hours = (data.operating_hours as Record<string, {is_open: boolean, open_time: string, close_time: string}>)[day]
          if (hours.is_open) {
            if (!timeRegex.test(hours.open_time) || !timeRegex.test(hours.close_time)) {
              return { valid: false, error: `Invalid time format for ${day}` }
            }
          }
        }
      }
      
      return { valid: true }
    }
  }, request)
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json(
      { error: 'Salon ID is required', success: false },
      { status: 400 }
    )
  }
  
  return handleDelete(id, {
    table: 'salons',
    requiredRole: ['super_admin', 'salon_owner'],
    beforeDelete: async (id, supabase) => {
      // Check if salon has any appointments or staff
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id')
        .eq('salon_id', id)
        .limit(1)
      
      if (appointments && appointments.length > 0) {
        // Deactivate instead of delete
        await supabase
          .from('salons')
          .update({ is_active: false })
          .eq('id', id)
        
        return false // Prevent deletion
      }
      
      const { data: staff } = await supabase
        .from('staff_profiles')
        .select('id')
        .eq('salon_id', id)
        .limit(1)
      
      if (staff && staff.length > 0) {
        // Deactivate instead of delete
        await supabase
          .from('salons')
          .update({ is_active: false })
          .eq('id', id)
        
        return false // Prevent deletion
      }
      
      return true
    }
  }, request)
}

// Helper function to get default operating hours
function getDefaultOperatingHours() {
  const defaultHours = {
    is_open: true,
    open_time: '09:00',
    close_time: '18:00'
  }
  
  return {
    monday: defaultHours,
    tuesday: defaultHours,
    wednesday: defaultHours,
    thursday: defaultHours,
    friday: defaultHours,
    saturday: { ...defaultHours, close_time: '17:00' },
    sunday: { is_open: false, open_time: '09:00', close_time: '17:00' }
  }
}