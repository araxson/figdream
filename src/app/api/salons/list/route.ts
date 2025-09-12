import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const includeDetails = searchParams.get('includeDetails') === 'true'

    let query = supabase
      .from('salons')
      .select(`
        *,
        profiles!salons_created_by_fkey(
          email,
          full_name
        )
      `)

    // If not requesting details, only get active salons
    if (!includeDetails) {
      query = query.eq('is_active', true)
    }

    const { data: salons, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching salons:', error)
      return NextResponse.json({ error: 'Failed to fetch salons' }, { status: 500 })
    }

    // If including details, fetch counts for each salon
    if (includeDetails && salons) {
      const salonsWithCounts = await Promise.all(salons.map(async (salon) => {
        try {
          const [appointments, customers, staff] = await Promise.all([
            supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('salon_id', salon.id),
            supabase.from('customers').select('id', { count: 'exact', head: true }).eq('salon_id', salon.id),
            supabase.from('staff_profiles').select('id', { count: 'exact', head: true }).eq('salon_id', salon.id)
          ])

          return {
            ...salon,
            _count: {
              appointments: appointments.count || 0,
              customers: customers.count || 0,
              staff: staff.count || 0
            }
          }
        } catch (error) {
          console.error(`Error fetching counts for salon ${salon.id}:`, error)
          return {
            ...salon,
            _count: {
              appointments: 0,
              customers: 0,
              staff: 0
            }
          }
        }
      }))

      return NextResponse.json({ salons: salonsWithCounts })
    }

    return NextResponse.json({ salons: salons || [] })

  } catch (error) {
    console.error('Error fetching salons:', error)
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