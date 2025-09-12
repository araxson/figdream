import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'

// GET /api/admin/services - List all services
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
    const salonId = searchParams.get('salon_id') || ''
    const isActive = searchParams.get('is_active')
    
    const offset = (page - 1) * limit
    
    let query = supabase
      .from('services')
      .select(`
        *,
        salon:salons(id, name),
        category:service_categories(id, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    if (salonId) {
      query = query.eq('salon_id', salonId)
    }
    
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      services: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

// POST /api/admin/services - Create new service
export async function POST(request: NextRequest) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      salon_id,
      category_id,
      name,
      description,
      duration_minutes,
      price,
      is_addon = false,
      requires_consultation = false,
      is_active = true,
      has_special_requirements = false,
      has_equipment_needed = false,
      metadata = {}
    } = body
    
    if (!salon_id || !name || !duration_minutes || price === undefined) {
      return NextResponse.json(
        { error: 'Salon, name, duration, and price are required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    // Create service
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert({
        salon_id,
        category_id,
        name,
        slug,
        description,
        duration_minutes,
        price,
        is_addon,
        requires_consultation,
        is_active,
        has_special_requirements,
        has_equipment_needed,
        metadata
      })
      .select(`
        *,
        salon:salons(id, name),
        category:service_categories(id, name)
      `)
      .single()
    
    if (serviceError) throw serviceError
    
    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'CREATE',
      entity_type: 'service',
      entity_id: service.id,
      new_data: service
    })
    
    return NextResponse.json({ service })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}