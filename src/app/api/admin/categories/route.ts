import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

// GET /api/admin/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const salonId = searchParams.get('salon_id')
    const isActive = searchParams.get('is_active')
    
    const offset = (page - 1) * limit
    
    let query = supabase
      .from('service_categories')
      .select(`
        *,
        salon:salons!service_categories_salon_id_fkey(
          id,
          name,
          slug
        ),
        services(count)
      `, { count: 'exact' })
      .order('display_order', { ascending: true })
      .range(offset, offset + limit - 1)
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    if (salonId) {
      query = query.eq('salon_id', salonId)
    }
    
    if (isActive !== null && isActive !== '') {
      query = query.eq('is_active', isActive === 'true')
    }
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    // Transform data to include service counts
    const categoriesWithCounts = data?.map(category => ({
      ...category,
      serviceCount: category.services?.[0]?.count || 0,
      services: undefined // Remove raw service data
    }))
    
    return NextResponse.json({
      categories: categoriesWithCounts,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { salon_id, name, description, icon, is_active, display_order } = body
    
    if (!salon_id || !name) {
      return NextResponse.json(
        { error: 'Salon and name are required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    // Check if slug already exists for this salon
    const { data: existingCategory } = await supabase
      .from('service_categories')
      .select('id')
      .eq('salon_id', salon_id)
      .eq('slug', slug)
      .single()
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists for this salon' },
        { status: 400 }
      )
    }
    
    // Get max display order if not provided
    let finalDisplayOrder = display_order
    if (finalDisplayOrder === undefined || finalDisplayOrder === null) {
      const { data: maxOrderData } = await supabase
        .from('service_categories')
        .select('display_order')
        .eq('salon_id', salon_id)
        .order('display_order', { ascending: false })
        .limit(1)
        .single()
      
      finalDisplayOrder = (maxOrderData?.display_order || 0) + 1
    }
    
    // Create the category
    const { data: category, error: categoryError } = await supabase
      .from('service_categories')
      .insert({
        salon_id,
        name,
        slug,
        description,
        icon: icon || 'tag',
        is_active: is_active ?? true,
        display_order: finalDisplayOrder
      })
      .select(`
        *,
        salon:salons!service_categories_salon_id_fkey(
          id,
          name,
          slug
        )
      `)
      .single()
    
    if (categoryError) throw categoryError
    
    await logAuditEvent({
      action: 'create',
      entity_type: 'service_category',
      entity_id: category.id,
      details: { 
        category_name: name,
        salon_id,
        created_by: session.user.email
      }
    })
    
    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}