import { NextRequest, NextResponse } from 'next/server'
import { updateStaffService, deleteStaffService } from '@/lib/api/dal/staff-services'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const service = await updateStaffService(id, body)
    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating staff service:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update staff service' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await deleteStaffService(id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error deleting staff service:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete staff service' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    )
  }
}