import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    
    const offset = (page - 1) * limit
    
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }
    
    if (role) {
      query = query.eq('role', role)
    }
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      users: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, role, full_name, first_name, last_name, phone } = body
    
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role
      }
    })
    
    if (authError) throw authError
    
    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email,
        role,
        full_name,
        first_name,
        last_name,
        phone
      })
      .select()
      .single()
    
    if (profileError) {
      // Rollback auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id)
      throw profileError
    }
    
    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'CREATE',
      entity_type: 'user',
      entity_id: authUser.user.id,
      new_data: { email, role }
    })
    
    return NextResponse.json({ user: profile })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}