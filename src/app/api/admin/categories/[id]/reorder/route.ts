import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

interface Params {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { direction } = body

    if (!direction || (direction !== 'up' && direction !== 'down')) {
      return NextResponse.json(
        { error: 'Invalid direction. Must be "up" or "down"' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current category with its order and salon_id
    const { data: currentCategory } = await supabase
      .from('service_categories')
      .select('salon_id, display_order, name')
      .eq('id', params.id)
      .single()

    if (!currentCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Get all categories for this salon ordered by display_order
    const { data: allCategories } = await supabase
      .from('service_categories')
      .select('id, display_order')
      .eq('salon_id', currentCategory.salon_id)
      .order('display_order', { ascending: true })

    if (!allCategories || allCategories.length < 2) {
      return NextResponse.json(
        { error: 'Not enough categories to reorder' },
        { status: 400 }
      )
    }

    // Find current index
    const currentIndex = allCategories.findIndex(c => c.id === params.id)
    if (currentIndex === -1) {
      return NextResponse.json({ error: 'Category not found in list' }, { status: 500 })
    }

    // Calculate new index
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    // Check bounds
    if (newIndex < 0 || newIndex >= allCategories.length) {
      return NextResponse.json(
        { error: 'Cannot move category in that direction' },
        { status: 400 }
      )
    }

    // Get the category to swap with
    const swapCategory = allCategories[newIndex]

    // Swap display orders
    const currentOrder = currentCategory.display_order
    const swapOrder = swapCategory.display_order

    // Update both categories in a transaction-like manner
    const { error: updateError1 } = await supabase
      .from('service_categories')
      .update({ 
        display_order: swapOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (updateError1) {
      console.error('Error updating first category:', updateError1)
      return NextResponse.json({ error: 'Failed to reorder categories' }, { status: 500 })
    }

    const { error: updateError2 } = await supabase
      .from('service_categories')
      .update({ 
        display_order: currentOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', swapCategory.id)

    if (updateError2) {
      // Try to rollback the first update
      await supabase
        .from('service_categories')
        .update({ display_order: currentOrder })
        .eq('id', params.id)
      
      console.error('Error updating second category:', updateError2)
      return NextResponse.json({ error: 'Failed to reorder categories' }, { status: 500 })
    }

    await logAuditEvent({
      action: 'update',
      entity_type: 'service_category',
      entity_id: params.id,
      details: { 
        field: 'display_order',
        old_value: currentOrder,
        new_value: swapOrder,
        direction,
        category_name: currentCategory.name,
        updated_by: session.user.email
      }
    })

    return NextResponse.json({ 
      success: true,
      message: `Category moved ${direction} successfully`
    })
  } catch (error) {
    console.error('Error in POST /api/admin/categories/[id]/reorder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}