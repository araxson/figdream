import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api/dal/auth'
import { updateTimeOffRequest, deleteTimeOffRequest } from '@/lib/api/dal/time-off'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, rejection_reason } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const { id } = await params
    const updatedRequest = await updateTimeOffRequest(
      id,
      status,
      user.id,
      rejection_reason
    )
    
    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error('Error updating time off request:', error)
    return NextResponse.json(
      { error: 'Failed to update time off request' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await deleteTimeOffRequest(id)
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting time off request:', error)
    return NextResponse.json(
      { error: 'Failed to delete time off request' },
      { status: 500 }
    )
  }
}