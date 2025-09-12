import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/api/dal/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const supabase = await createClient()
    
    // Get user's salon
    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('created_by', session.user.id)
      .single()

    if (!salon) {
      return NextResponse.json(
        { error: 'No salon found for user' },
        { status: 404 }
      )
    }
    
    // Fetch staff profiles
    const { data: staffData, error: staffError } = await supabase
      .from('staff_profiles')
      .select(`
        *,
        profiles(*)
      `)
      .eq('salon_id', salon.id)
    
    if (staffError) {
      console.error('Error fetching staff:', staffError)
      return NextResponse.json(
        { error: 'Failed to fetch staff' },
        { status: 500 }
      )
    }
    
    // Fetch services
    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salon.id)
    
    if (servicesError) {
      console.error('Error fetching services:', servicesError)
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      staff: staffData || [],
      services: servicesData || [],
      salon: salon
    })
  } catch (error) {
    console.error('Get filter options error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    )
  }
}