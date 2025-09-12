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
  const categoryId = searchParams.get('categoryId')
  const includeCategories = searchParams.get('includeCategories') === 'true'
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')
  
  const filters: Record<string, unknown> = {
    is_active: true
  }
  
  if (salonId) {
    filters.salon_id = salonId
  }
  
  if (categoryId) {
    filters.category_id = categoryId
  }
  
  const response = await handleRead(filters, {
    table: 'services',
    requiredRole: ['super_admin', 'salon_owner', 'salon_manager', 'staff'],
    select: '*',
    orderBy: { column: 'name', ascending: true },
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined
  }, request)
  
  // If categories are requested, fetch them separately
  if (includeCategories && response.status === 200) {
    const categoryFilters: Record<string, unknown> = {}
    if (salonId) {
      categoryFilters.salon_id = salonId
    }
    
    const categoriesResponse = await handleRead(categoryFilters, {
      table: 'service_categories',
      requiredRole: ['super_admin', 'salon_owner', 'salon_manager', 'staff'],
      select: '*',
      orderBy: { column: 'display_order', ascending: true }
    }, request)
    
    if (categoriesResponse.status === 200) {
      const responseData = await response.json()
      const categoriesData = await categoriesResponse.json()
      
      return NextResponse.json({
        services: responseData.data || [],
        categories: categoriesData.data || [],
        success: true
      })
    }
  }
  
  return response
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const sanitized = sanitizeData(body)
  
  return handleCreate(sanitized, {
    table: 'services',
    requiredRole: ['super_admin', 'salon_owner', 'salon_manager'],
    validateData: (data) => {
      const validation = validateRequiredFields(data, ['name', 'price', 'duration_minutes'])
      if (!validation.valid) return validation
      
      if (Number(data.price) < 0) {
        return { valid: false, error: 'Price must be positive' }
      }
      
      if (Number(data.duration_minutes) < 5 || Number(data.duration_minutes) > 480) {
        return { valid: false, error: 'Duration must be between 5 and 480 minutes' }
      }
      
      return { valid: true }
    },
    transformData: (data) => ({
      ...data,
      slug: data.slug || String(data.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }, request)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...updates } = body
  
  if (!id) {
    return NextResponse.json(
      { error: 'Service ID is required', success: false },
      { status: 400 }
    )
  }
  
  const sanitized = sanitizeData(updates)
  
  return handleUpdate(id, sanitized, {
    table: 'services',
    requiredRole: ['super_admin', 'salon_owner', 'salon_manager'],
    validateData: (data) => {
      if (data.price !== undefined && Number(data.price) < 0) {
        return { valid: false, error: 'Price must be positive' }
      }
      
      if (data.duration_minutes !== undefined && 
          (Number(data.duration_minutes) < 5 || Number(data.duration_minutes) > 480)) {
        return { valid: false, error: 'Duration must be between 5 and 480 minutes' }
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
      { error: 'Service ID is required', success: false },
      { status: 400 }
    )
  }
  
  return handleDelete(id, {
    table: 'services',
    requiredRole: ['super_admin', 'salon_owner', 'salon_manager'],
    beforeDelete: async (id, supabase) => {
      // Check if service is used in any appointments
      const { data: appointments } = await supabase
        .from('appointment_services')
        .select('id')
        .eq('service_id', id)
        .limit(1)
      
      if (appointments && appointments.length > 0) {
        // Instead of deleting, deactivate the service
        await supabase
          .from('services')
          .update({ is_active: false })
          .eq('id', id)
        
        return false // Prevent actual deletion
      }
      
      return true
    }
  }, request)
}