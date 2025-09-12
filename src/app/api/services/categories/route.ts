import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/services/categories - List all service categories
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: categories, error } = await supabase
      .from('service_categories')
      .select('id, name, description, display_order')
      .order('display_order', { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching service categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service categories' },
      { status: 500 }
    )
  }
}