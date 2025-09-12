import { markAllNotificationsAsRead } from '@/lib/api/dal/notifications'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const success = await markAllNotificationsAsRead()
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to mark all notifications as read' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Mark all notifications read error:', error)
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    )
  }
}