import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { salonId, staffId, serviceIds } = body

    if (!salonId || !staffId || !serviceIds || !Array.isArray(serviceIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: salonId, staffId, serviceIds' },
        { status: 400 }
      )
    }

    // Fetch all required data in parallel
    const [salonRes, staffRes, servicesRes] = await Promise.all([
      supabase.from('salons').select('*').eq('id', salonId).single(),
      supabase.from('staff_profiles').select('*, profiles(*)').eq('id', staffId).single(),
      supabase.from('services').select('*').in('id', serviceIds)
    ])

    if (salonRes.error) {
      console.error('Error fetching salon:', salonRes.error)
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    if (staffRes.error) {
      console.error('Error fetching staff:', staffRes.error)
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    if (servicesRes.error) {
      console.error('Error fetching services:', servicesRes.error)
      return NextResponse.json({ error: 'Services not found' }, { status: 404 })
    }

    const salon = {
      id: salonRes.data.id,
      name: salonRes.data.name,
      address: salonRes.data.address
    }

    const staff = {
      id: staffRes.data.id,
      user_id: staffRes.data.user_id,
      profiles: staffRes.data.profiles
    }

    const services = servicesRes.data?.map(s => ({
      id: s.id,
      name: s.name,
      duration_minutes: s.duration_minutes,
      price: s.price
    })) || []

    return NextResponse.json({
      salon,
      staff,
      services
    })

  } catch (error) {
    console.error('Error fetching booking details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    )
  }
}