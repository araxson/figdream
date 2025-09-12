import { NextRequest, NextResponse } from 'next/server'
import { 
  handleCreate, 
  handleRead, 
  handleUpdate, 
  handleDelete,
  validateRequiredFields,
  sanitizeData 
} from '@/lib/api/crud-utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const salonId = searchParams.get('salonId')
  const isActive = searchParams.get('isActive')
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')
  
  const filters: Record<string, string | boolean | number> = {}
  
  if (salonId) {
    filters.salon_id = salonId
  }
  
  if (isActive !== null) {
    filters.is_active = isActive === 'true'
  }
  
  return handleRead(filters, {
    table: 'staff_profiles',
    requiredRole: ['super_admin', 'salon_owner', 'salon_manager'],
    select: `
      *,
      profiles(*)
    `,
    orderBy: { column: 'created_at', ascending: true },
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined
  }, request)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const sanitized = sanitizeData(body)
  
  // Generate employee ID
  const employeeId = `EMP-${Date.now()}`
  
  return handleCreate({
    ...sanitized,
    employee_id: employeeId
  }, {
    table: 'staff_profiles',
    requiredRole: ['super_admin', 'salon_owner', 'salon_manager'],
    validateData: (data) => {
      const validation = validateRequiredFields(data, ['user_id', 'salon_id', 'title'] as const)
      if (!validation.valid) return validation
      
      if (data.commission_rate !== undefined && data.commission_rate !== null &&
          (Number(data.commission_rate) < 0 || Number(data.commission_rate) > 100)) {
        return { valid: false, error: 'Commission rate must be between 0 and 100' }
      }
      
      return { valid: true }
    },
    transformData: (data) => ({
      ...data,
      commission_rate: data.commission_rate || 0,
      specialties: data.specialties || [],
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }),
    beforeCreate: async (data, supabase) => {
      // Check if user already exists as staff in this salon
      const { data: existing } = await supabase
        .from('staff_profiles')
        .select('id')
        .eq('user_id', String(data.user_id))
        .eq('salon_id', String(data.salon_id))
        .single()
      
      if (existing) {
        throw new Error('User is already a staff member at this salon')
      }
      
      // Update user's role to staff if they're currently a customer
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', String(data.user_id))
        .single()
      
      if (profile && profile.role === 'customer') {
        await supabase
          .from('profiles')
          .update({ role: 'staff' })
          .eq('id', String(data.user_id))
      }
      
      return data
    }
  }, request)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...updates } = body
  
  if (!id) {
    return NextResponse.json(
      { error: 'Staff ID is required', success: false },
      { status: 400 }
    )
  }
  
  const sanitized = sanitizeData(updates)
  
  return handleUpdate(id, sanitized, {
    table: 'staff_profiles',
    requiredRole: ['super_admin', 'salon_owner', 'salon_manager'],
    validateData: (data) => {
      if (data.commission_rate !== undefined && data.commission_rate !== null &&
          (Number(data.commission_rate) < 0 || Number(data.commission_rate) > 100)) {
        return { valid: false, error: 'Commission rate must be between 0 and 100' }
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
      { error: 'Staff ID is required', success: false },
      { status: 400 }
    )
  }
  
  return handleDelete(id, {
    table: 'staff_profiles',
    requiredRole: ['super_admin', 'salon_owner', 'salon_manager'],
    beforeDelete: async (id, supabase) => {
      // Check if staff has any future appointments
      const today = new Date().toISOString().split('T')[0]
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id')
        .eq('staff_id', id)
        .gte('appointment_date', today)
        .eq('status', 'confirmed')
        .limit(1)
      
      if (appointments && appointments.length > 0) {
        // Deactivate instead of delete
        await supabase
          .from('staff_profiles')
          .update({ is_active: false })
          .eq('id', id)
        
        return false // Prevent deletion
      }
      
      return true
    }
  }, request)
}