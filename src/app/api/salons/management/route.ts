import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all salons with owner info
    const { data: salonsData, error } = await supabase
      .from('salons')
      .select(`
        *,
        profiles!salons_created_by_fkey(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching salons for management:', error)
      return NextResponse.json({ error: 'Failed to fetch salons' }, { status: 500 })
    }

    // Get staff counts for each salon
    const salonsWithCounts = await Promise.all(
      (salonsData || []).map(async (salon) => {
        try {
          const { count } = await supabase
            .from('staff_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('salon_id', salon.id)

          return {
            ...salon,
            staff_count: count || 0
          }
        } catch (error) {
          console.error(`Error fetching staff count for salon ${salon.id}:`, error)
          return {
            ...salon,
            staff_count: 0
          }
        }
      })
    )

    return NextResponse.json({ salons: salonsWithCounts })

  } catch (error) {
    console.error('Error fetching salons for management:', error)
    return NextResponse.json(
      { error: 'Failed to fetch salons' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { name, email, phone, address, description, owner_id } = body

    // Validate required fields
    if (!name || !email || !phone || !address) {
      return NextResponse.json(
        { error: 'Name, email, phone, and address are required' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create salon
    const { data: salon, error } = await supabase
      .from('salons')
      .insert({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        email,
        phone,
        address,
        description: description || '',
        created_by: owner_id || user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating salon:', error)
      return NextResponse.json({ error: 'Failed to create salon' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      salon,
      message: 'Salon created successfully'
    })

  } catch (error) {
    console.error('Error creating salon:', error)
    return NextResponse.json(
      { error: 'Failed to create salon' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { salonId, action, data } = body

    if (!salonId || !action) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    let updateData = {}
    let message = ''

    switch (action) {
      case 'toggle_status':
        const { isActive } = data || {}
        if (typeof isActive !== 'boolean') {
          return NextResponse.json(
            { error: 'Invalid status value' },
            { status: 400 }
          )
        }
        updateData = {
          is_active: isActive,
          updated_at: new Date().toISOString()
        }
        message = `Salon ${isActive ? 'activated' : 'deactivated'} successfully`
        break

      case 'update_info':
        const { name, email, phone, address, description } = data || {}
        updateData = {
          ...(name && { name }),
          ...(email && { email }),
          ...(phone && { phone }),
          ...(address && { address }),
          ...(description && { description }),
          updated_at: new Date().toISOString()
        }
        message = 'Salon information updated successfully'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const { error } = await supabase
      .from('salons')
      .update(updateData)
      .eq('id', salonId)

    if (error) {
      console.error('Error updating salon:', error)
      return NextResponse.json({ error: 'Failed to update salon' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message
    })

  } catch (error) {
    console.error('Error updating salon:', error)
    return NextResponse.json(
      { error: 'Failed to update salon' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get('salonId')

    if (!salonId) {
      return NextResponse.json(
        { error: 'Salon ID is required' },
        { status: 400 }
      )
    }

    // First check if salon has any appointments, staff, or services
    const [appointments, staff, services] = await Promise.all([
      supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('salon_id', salonId),
      supabase.from('staff_profiles').select('id', { count: 'exact', head: true }).eq('salon_id', salonId),
      supabase.from('services').select('id', { count: 'exact', head: true }).eq('salon_id', salonId)
    ])

    if (appointments.count || staff.count || services.count) {
      return NextResponse.json(
        { error: 'Cannot delete salon with existing appointments, staff, or services. Please deactivate instead.' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('salons')
      .delete()
      .eq('id', salonId)

    if (error) {
      console.error('Error deleting salon:', error)
      return NextResponse.json({ error: 'Failed to delete salon' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Salon deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting salon:', error)
    return NextResponse.json(
      { error: 'Failed to delete salon' },
      { status: 500 }
    )
  }
}