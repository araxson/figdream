import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('created_by', user.id)
      .single()

    if (error) {
      console.error('Error fetching salon data:', error)
      return NextResponse.json(
        { error: 'Failed to fetch salon data' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Get salon settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch salon settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const updateData = await request.json()

    // First, get the salon to ensure user owns it
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('created_by', user.id)
      .single()

    if (salonError || !salon) {
      return NextResponse.json(
        { error: 'Salon not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('salons')
      .update({
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone,
        address: updateData.address,
        description: updateData.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', salon.id)

    if (error) {
      console.error('Error updating salon settings:', error)
      return NextResponse.json(
        { error: 'Failed to update salon settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update salon settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update salon settings' },
      { status: 500 }
    )
  }
}