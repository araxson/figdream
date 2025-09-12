import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

export async function GET(request: Request) {
  try {
    const { user } = await verifyApiSession(request)
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const offset = (page - 1) * limit

    let query = supabase
      .from('salons')
      .select(`
        *,
        owner:profiles!salons_owner_id_fkey(
          id,
          email,
          full_name,
          avatar_url
        )
      `, { count: 'exact' })

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching salons:', error)
      return NextResponse.json({ error: 'Failed to fetch salons' }, { status: 500 })
    }

    return NextResponse.json({
      salons: data,
      total: count,
      page,
      limit
    })
  } catch (error) {
    console.error('Error in GET /api/admin/salons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await verifyApiSession(request)
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const data = await request.json()

    // First, create or get the owner user
    let ownerId = null
    if (data.owner_email) {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.owner_email)
        .single()

      if (existingUser) {
        ownerId = existingUser.id
      } else {
        // Create new user with temporary password
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: data.owner_email,
          password: Math.random().toString(36).slice(-12),
          email_confirm: true,
          user_metadata: {
            role: 'salon_owner'
          }
        })

        if (authError) {
          console.error('Error creating user:', authError)
          return NextResponse.json({ error: 'Failed to create salon owner' }, { status: 500 })
        }

        ownerId = authData.user.id

        // Update profile with role
        await supabase
          .from('profiles')
          .update({ role: 'salon_owner' })
          .eq('id', ownerId)
      }
    }

    // Create the salon
    const { data: salon, error } = await supabase
      .from('salons')
      .insert([{
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country || 'US',
        owner_id: ownerId,
        is_active: true,
        created_by: user.id
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating salon:', error)
      return NextResponse.json({ error: 'Failed to create salon' }, { status: 500 })
    }

    await logAuditEvent({
      action: 'create',
      entity_type: 'salon',
      entity_id: salon.id,
      details: { salon }
    })

    // Send welcome email to owner
    if (data.owner_email) {
      // TODO: Implement email sending
    }

    return NextResponse.json(salon)
  } catch (error) {
    console.error('Error in POST /api/admin/salons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}