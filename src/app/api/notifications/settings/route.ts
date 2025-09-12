import { updateNotificationSettings, getNotificationSettings } from '@/lib/api/dal/notification-settings'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const settings = await getNotificationSettings()
    
    if (!settings) {
      return NextResponse.json(
        { error: 'Failed to fetch notification settings' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get notification settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const updates = await request.json()
    
    const success = await updateNotificationSettings(updates)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update notification settings' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update notification settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    )
  }
}