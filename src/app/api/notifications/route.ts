import { NextRequest, NextResponse } from 'next/server'
import { 
  handleCreate, 
  handleRead, 
  handleUpdate, 
  handleDelete,
  validateRequiredFields,
  sanitizeData 
} from '@/lib/api/crud-utils'
import { createAuthClient } from '@/lib/api/auth-utils'
import { verifyApiSession } from '@/lib/api/auth-utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const isRead = searchParams.get('isRead')
  const type = searchParams.get('type')
  const countOnly = searchParams.get('countOnly') === 'true'
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')
  
  const session = await verifyApiSession(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', success: false },
      { status: 401 }
    )
  }
  
  // If countOnly, return unread count
  if (countOnly) {
    const supabase = await createAuthClient(request)
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false)
    
    return NextResponse.json({ count, success: true })
  }
  
  const filters: Record<string, unknown> = {
    user_id: userId || session.user.id
  }
  
  if (isRead !== null) {
    filters.is_read = isRead === 'true'
  }
  
  if (type) {
    filters.type = type
  }
  
  return handleRead(filters, {
    table: 'notifications',
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined
  }, request)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const sanitized = sanitizeData(body)
  
  const session = await verifyApiSession(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', success: false },
      { status: 401 }
    )
  }
  
  // Only admins and system can create notifications for other users
  if (sanitized.user_id && sanitized.user_id !== session.user.id) {
    if (!['super_admin', 'salon_owner', 'salon_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions', success: false },
        { status: 403 }
      )
    }
  } else {
    sanitized.user_id = session.user.id
  }
  
  return handleCreate(sanitized, {
    table: 'notifications',
    validateData: (data) => {
      const validation = validateRequiredFields(data, ['user_id', 'title', 'type'])
      if (!validation.valid) return validation
      
      const validTypes = ['appointment', 'promotion', 'reminder', 'system', 'staff', 'customer']
      if (!validTypes.includes(String(data.type))) {
        return { valid: false, error: 'Invalid notification type' }
      }
      
      return { valid: true }
    },
    transformData: (data) => ({
      ...data,
      is_read: false,
      created_at: new Date().toISOString()
    })
  }, request)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, markAllRead, ...updates } = body
  
  const session = await verifyApiSession(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', success: false },
      { status: 401 }
    )
  }
  
  // Handle mark all as read
  if (markAllRead) {
    const supabase = await createAuthClient(request)
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', session.user.id)
      .eq('is_read', false)
    
    if (error) {
      console.error('Error marking all as read:', error)
      return NextResponse.json(
        { error: 'Failed to mark all as read', success: false },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  }
  
  if (!id) {
    return NextResponse.json(
      { error: 'Notification ID is required', success: false },
      { status: 400 }
    )
  }
  
  const sanitized = sanitizeData(updates)
  
  // Add read timestamp if marking as read
  if (sanitized.is_read === true) {
    sanitized.read_at = new Date().toISOString()
  }
  
  return handleUpdate(id, sanitized, {
    table: 'notifications',
    validateData: (data) => {
      // Only allow updating is_read field
      const allowedFields = ['is_read']
      const keys = Object.keys(data)
      
      for (const key of keys) {
        if (!allowedFields.includes(key) && key !== 'read_at') {
          return { valid: false, error: `Cannot update field: ${key}` }
        }
      }
      
      return { valid: true }
    },
    beforeUpdate: async (id, data, supabase) => {
      // Verify ownership
      const { data: notification } = await supabase
        .from('notifications')
        .select('user_id')
        .eq('id', id)
        .single()
      
      if (!notification || notification.user_id !== session.user.id) {
        throw new Error('Not authorized to update this notification')
      }
      
      return data
    }
  }, request)
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const deleteAll = searchParams.get('deleteAll') === 'true'
  const deleteRead = searchParams.get('deleteRead') === 'true'
  
  const session = await verifyApiSession(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', success: false },
      { status: 401 }
    )
  }
  
  const supabase = await createAuthClient(request)
  
  // Handle bulk delete operations
  if (deleteAll || deleteRead) {
    let query = supabase
      .from('notifications')
      .delete()
      .eq('user_id', session.user.id)
    
    if (deleteRead) {
      query = query.eq('is_read', true)
    }
    
    const { error } = await query
    
    if (error) {
      console.error('Error deleting notifications:', error)
      return NextResponse.json(
        { error: 'Failed to delete notifications', success: false },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  }
  
  if (!id) {
    return NextResponse.json(
      { error: 'Notification ID is required', success: false },
      { status: 400 }
    )
  }
  
  return handleDelete(id, {
    table: 'notifications',
    beforeDelete: async (id, supabase) => {
      // Verify ownership
      const { data: notification } = await supabase
        .from('notifications')
        .select('user_id')
        .eq('id', id)
        .single()
      
      if (!notification || notification.user_id !== session.user.id) {
        throw new Error('Not authorized to delete this notification')
      }
      
      return true
    }
  }, request)
}