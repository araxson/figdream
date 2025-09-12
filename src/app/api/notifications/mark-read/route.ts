import { markNotificationAsRead } from '@/lib/api/dal/notifications'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { notificationId } = await request.json()
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }
    
    const success = await markNotificationAsRead(notificationId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to mark notification as read' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Mark notification read error:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}