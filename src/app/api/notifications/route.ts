import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabase/server'
import { getUser } from '@/lib/data-access/auth'

export async function GET(request: NextRequest) {
  try {
    const { user } = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Verify user can access these notifications
    if (userId && userId !== user.id) {
      // Check if user is admin or staff that can view other's notifications
      const role = user.raw_app_meta_data?.role
      if (!['super_admin', 'salon_owner', 'location_manager'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const supabase = await createClient()
    
    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId || user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error, count } = await query

    if (error) {
      throw error
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId || user.id)
      .eq('is_read', false)

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to send notifications
    const role = user.raw_app_meta_data?.role
    if (!['super_admin', 'salon_owner', 'location_manager', 'staff'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { user_id, title, message, type, action_url } = body

    if (!user_id || !title || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        title,
        message,
        type,
        is_read: false
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Send real-time update
    await supabase
      .channel('notifications')
      .send({
        type: 'broadcast',
        event: 'new_notification',
        payload: data
      })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to create notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}