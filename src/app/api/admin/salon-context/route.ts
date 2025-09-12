import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyApiSession } from '@/lib/api/auth-utils'

export async function DELETE(request: Request) {
  try {
    const { user } = await verifyApiSession(request)
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const cookieStore = cookies()
    cookieStore.delete('admin_salon_context')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing salon context:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}