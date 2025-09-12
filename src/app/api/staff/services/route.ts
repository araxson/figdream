import { NextRequest, NextResponse } from 'next/server'
import { 
  getStaffServices, 
  getStaffServicesBySalon,
  createStaffService,
  getAvailableServicesForStaff
} from '@/lib/api/dal/staff-services'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const staffId = searchParams.get('staffId')
    const salonId = searchParams.get('salonId')
    const available = searchParams.get('available')
    
    if (available === 'true' && staffId && salonId) {
      const services = await getAvailableServicesForStaff(staffId, salonId)
      return NextResponse.json(services)
    }
    
    if (staffId) {
      const services = await getStaffServices(staffId)
      return NextResponse.json(services)
    }
    
    if (salonId) {
      const services = await getStaffServicesBySalon(salonId)
      return NextResponse.json(services)
    }
    
    return NextResponse.json(
      { error: 'Either staffId or salonId is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching staff services:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch staff services' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 403 : 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.staff_id || !body.service_id) {
      return NextResponse.json(
        { error: 'staff_id and service_id are required' },
        { status: 400 }
      )
    }
    
    const service = await createStaffService(body)
    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating staff service:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create staff service' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}