import { NextRequest, NextResponse } from 'next/server'
import { 
  handleCreate, 
  handleUpdate, 
  handleDelete,
  validateRequiredFields,
  validateEmail,
  validatePhone,
  sanitizeData 
} from '@/lib/api/crud-utils'
import { createAuthClient } from '@/lib/api/auth-utils'
import { verifyApiSession } from '@/lib/api/auth-utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const salonId = searchParams.get('salonId')
  const search = searchParams.get('search')
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')
  
  const session = await verifyApiSession(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', success: false },
      { status: 401 }
    )
  }
  
  // Only allow salon owners, managers, staff and admins to list customers
  const allowedRoles = ['super_admin', 'salon_owner', 'salon_manager', 'staff']
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions', success: false },
      { status: 403 }
    )
  }
  
  const supabase = await createAuthClient(request)
  
  // Build query
  let query = supabase
    .from('profiles')
    .select(`
      *,
      appointments(count)
    `)
    .eq('role', 'customer')
  
  // Filter by salon if provided (get customers who have appointments at this salon)
  if (salonId) {
    const { data: customerIds } = await supabase
      .from('appointments')
      .select('customer_id')
      .eq('salon_id', salonId)
      .not('customer_id', 'is', null)
    
    if (customerIds) {
      const uniqueIds = [...new Set(customerIds.map(c => c.customer_id))]
      query = query.in('id', uniqueIds)
    }
  }
  
  // Search by name or email
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }
  
  // Apply ordering
  query = query.order('created_at', { ascending: false })
  
  // Apply pagination
  if (limit) query = query.limit(parseInt(limit))
  if (offset) {
    const limitValue = parseInt(limit || '10')
    query = query.range(parseInt(offset), parseInt(offset) + limitValue - 1)
  }
  
  const { data, error, count } = await query
  
  if (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers', success: false },
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
  
  // Customer creation through registration - set role to customer
  sanitized.role = 'customer'
  
  return handleCreate(sanitized, {
    table: 'profiles',
    // Allow anyone to create a customer account (self-registration)
    validateData: (data) => {
      const validation = validateRequiredFields(data, ['email', 'full_name'])
      if (!validation.valid) return validation
      
      if (!validateEmail(String(data.email))) {
        return { valid: false, error: 'Invalid email format' }
      }
      
      if (data.phone && !validatePhone(String(data.phone))) {
        return { valid: false, error: 'Invalid phone format' }
      }
      
      return { valid: true }
    },
    transformData: (data) => ({
      ...data,
      role: 'customer',
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }),
    beforeCreate: async (data, supabase) => {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', String(data.email))
        .single()
      
      if (existing) {
        throw new Error('Email already registered')
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
      { error: 'Customer ID is required', success: false },
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
  
  // Customers can update their own profile
  // Staff and above can update any customer profile
  const isOwnProfile = session.user.id === id && session.user.role === 'customer'
  const hasPermission = ['super_admin', 'salon_owner', 'salon_manager', 'staff'].includes(session.user.role)
  
  if (!isOwnProfile && !hasPermission) {
    return NextResponse.json(
      { error: 'Insufficient permissions', success: false },
      { status: 403 }
    )
  }
  
  const sanitized = sanitizeData(updates)
  
  // Prevent customers from changing their own role
  if (isOwnProfile && sanitized.role) {
    delete sanitized.role
  }
  
  return handleUpdate(id, sanitized, {
    table: 'profiles',
    validateData: (data) => {
      if (data.email && !validateEmail(String(data.email))) {
        return { valid: false, error: 'Invalid email format' }
      }
      
      if (data.phone && !validatePhone(String(data.phone))) {
        return { valid: false, error: 'Invalid phone format' }
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
      { error: 'Customer ID is required', success: false },
      { status: 400 }
    )
  }
  
  return handleDelete(id, {
    table: 'profiles',
    requiredRole: ['super_admin', 'salon_owner'],
    beforeDelete: async (id, supabase) => {
      // Check if customer has any appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id')
        .eq('customer_id', id)
        .limit(1)
      
      if (appointments && appointments.length > 0) {
        // Cannot delete customer with existing appointments
        throw new Error('Cannot delete customer with existing appointments')
      }
      
      return true
    },
    afterDelete: async (id, supabase) => {
      // Also delete from auth.users table
      const { error: authError } = await supabase.auth.admin.deleteUser(id)
      if (authError) {
        console.error('Error deleting auth user:', authError)
      }
    }
  }, request)
}