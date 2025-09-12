import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api/dal/auth'
import { getTimeOffRequests, createTimeOffRequest } from '@/lib/api/dal/time-off'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const staffId = searchParams.get('staff_id') || undefined
    const status = searchParams.get('status') || undefined

    const requests = await getTimeOffRequests(staffId, status)
    
    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching time off requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time off requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { staff_id, start_date, end_date, reason } = body

    if (!staff_id || !start_date || !end_date || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const timeOffRequest = await createTimeOffRequest(
      staff_id,
      start_date,
      end_date,
      reason
    )
    
    return NextResponse.json(timeOffRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating time off request:', error)
    return NextResponse.json(
      { error: 'Failed to create time off request' },
      { status: 500 }
    )
  }
}