import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

interface Params {
  params: {
    id: string
  }
}

// GET /api/admin/categories/[id] - Get single category
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    const { data: category, error } = await supabase
      .from('service_categories')
      .select(`
        *,
        salon:salons!service_categories_salon_id_fkey(
          id,
          name,
          slug
        ),
        services(
          id,
          name,
          price,
          duration
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }
      throw error
    }
    
    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/categories/[id] - Update category
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = await createClient()
    
    // Get current category data for audit log
    const { data: oldCategory } = await supabase
      .from('service_categories')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (!oldCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    // If name is being updated, regenerate slug
    let updates = { ...body }
    if (body.name && body.name !== oldCategory.name) {
      updates.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    
    // Update category
    const { data: updatedCategory, error: updateError } = await supabase
      .from('service_categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (updateError) {
      throw updateError
    }
    
    await logAuditEvent({
      action: 'update',
      entity_type: 'service_category',
      entity_id: params.id,
      details: { 
        category_name: updatedCategory.name,
        old_data: oldCategory,
        new_data: updatedCategory,
        updated_by: session.user.email
      }
    })
    
    return NextResponse.json({ category: updatedCategory })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Get category data for audit log
    const { data: categoryToDelete } = await supabase
      .from('service_categories')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (!categoryToDelete) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    // Check if category has services
    const { count: serviceCount } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', params.id)
    
    if (serviceCount && serviceCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing services' },
        { status: 400 }
      )
    }
    
    // Delete category
    const { error: deleteError } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', params.id)
    
    if (deleteError) {
      throw deleteError
    }
    
    await logAuditEvent({
      action: 'delete',
      entity_type: 'service_category',
      entity_id: params.id,
      details: { 
        category_name: categoryToDelete.name,
        deleted_data: categoryToDelete,
        deleted_by: session.user.email
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Category deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}