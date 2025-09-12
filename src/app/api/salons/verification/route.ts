import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'

    let query = supabase
      .from('salons')
      .select(`
        *,
        profiles (
          first_name,
          last_name,
          email
        )
      `)

    if (filter === 'active') {
      query = query.eq('is_active', true)
    } else if (filter === 'inactive') {
      query = query.eq('is_active', false)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching salons for verification:', error)
      return NextResponse.json({ error: 'Failed to fetch salons' }, { status: 500 })
    }

    return NextResponse.json({ salons: data || [] })

  } catch (error) {
    console.error('Error fetching salons for verification:', error)
    return NextResponse.json(
      { error: 'Failed to fetch salons' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { salonId, isActive } = body

    if (!salonId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('salons')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', salonId)

    if (error) {
      console.error('Error updating salon status:', error)
      return NextResponse.json({ error: 'Failed to update salon status' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: `Salon ${isActive ? 'activated' : 'deactivated'} successfully`
    })

  } catch (error) {
    console.error('Error updating salon status:', error)
    return NextResponse.json(
      { error: 'Failed to update salon status' },
      { status: 500 }
    )
  }
}