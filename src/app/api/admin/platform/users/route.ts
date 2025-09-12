import { NextRequest, NextResponse } from 'next/server'
import { createAuthClient, verifyApiSession } from '@/lib/api/auth-utils'
import { 
  handleCreate, 
  handleRead, 
  handleUpdate, 
  handleDelete,
  validateRequiredFields,
  validateEmail,
  sanitizeData 
} from '@/lib/api/crud-utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const _search = searchParams.get('search')
  const role = searchParams.get('role')
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')
  
  const filters: Record<string, string | boolean | number> = {}
  if (role && role !== 'all') {
    filters.role = role
  }
  
  return handleRead(filters, {
    table: 'profiles',
    requiredRole: 'super_admin',
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined
  }, request)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { userId, updates } = body

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required', success: false },
      { status: 400 }
    )
  }

  return handleUpdate(userId, sanitizeData(updates), {
    table: 'profiles',
    requiredRole: 'super_admin',
    validateData: (data) => {
      if (data.email && !validateEmail(String(data.email))) {
        return { valid: false, error: 'Invalid email format' }
      }
      return { valid: true }
    }
  }, request)
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required', success: false },
      { status: 400 }
    )
  }

  return handleDelete(userId, {
    table: 'profiles',
    requiredRole: 'super_admin',
    afterDelete: async (id, supabase) => {
      // Also delete from auth.users table
      const { error: authError } = await supabase.auth.admin.deleteUser(id)
      if (authError) {
        console.error('Error deleting auth user:', authError)
      }
    }
  }, request)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const sanitized = sanitizeData(body)
  const { email, password, full_name, role = 'customer' } = sanitized

  // Special handling for user creation (need to create auth user first)
  const session = await verifyApiSession(request)
  if (!session || session.user.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Unauthorized', success: false },
      { status: 401 }
    )
  }

  const validation = validateRequiredFields(sanitized, ['email', 'password'])
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: 400 }
    )
  }

  if (!validateEmail(email)) {
    return NextResponse.json(
      { error: 'Invalid email format', success: false },
      { status: 400 }
    )
  }

  const supabase = await createAuthClient(request)
  
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })
  
  if (authError || !authData.user) {
    console.error('Error creating auth user:', authError)
    return NextResponse.json(
      { error: 'Failed to create user', success: false },
      { status: 500 }
    )
  }
  
  // Use handleCreate for profile creation
  return handleCreate({
    id: authData.user.id,
    user_id: authData.user.id,
    email,
    full_name,
    role,
    is_verified: true
  }, {
    table: 'profiles',
    requiredRole: 'super_admin',
    transformData: (data) => ({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }, request)
}