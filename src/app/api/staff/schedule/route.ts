import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/api/dal/auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staffId') || session.user.id
    
    const supabase = await createClient()
    
    // Get staff schedules
    const { data: schedules, error } = await supabase
      .from('staff_schedules')
      .select('*')
      .eq('staff_id', staffId)
      .order('day_of_week')
    
    if (error) throw error
    
    return NextResponse.json({ schedules: schedules || [] })
  } catch (error) {
    console.error('Get staff schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const data = await request.json()
    const supabase = await createClient()
    
    const { data: schedule, error } = await supabase
      .from('staff_schedules')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Create staff schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { id, ...data } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    const { data: schedule, error } = await supabase
      .from('staff_schedules')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Update staff schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
}