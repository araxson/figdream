import { NextRequest, NextResponse } from 'next/server'
import { 
  getStaffBreaks, 
  getStaffBreaksBySalon,
  createStaffBreak
} from '@/lib/api/dal/staff-breaks'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const staffId = searchParams.get('staffId')
    const salonId = searchParams.get('salonId')
    const dayOfWeek = searchParams.get('dayOfWeek')
    
    if (salonId) {
      const breaks = await getStaffBreaksBySalon(
        salonId, 
        dayOfWeek ? parseInt(dayOfWeek) : undefined
      )
      return NextResponse.json(breaks)
    }
    
    const breaks = await getStaffBreaks(
      staffId || undefined, 
      dayOfWeek ? parseInt(dayOfWeek) : undefined
    )
    return NextResponse.json(breaks)
  } catch (error) {
    console.error('Error fetching staff breaks:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch staff breaks' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.staff_id || !body.start_time || !body.end_time) {
      return NextResponse.json(
        { error: 'staff_id, start_time, and end_time are required' },
        { status: 400 }
      )
    }
    
    const breakItem = await createStaffBreak(body)
    return NextResponse.json(breakItem, { status: 201 })
  } catch (error) {
    console.error('Error creating staff break:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create staff break' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}