import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

interface Params {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get user email
    const { data: user } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', params.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
    })

    if (error) {
      console.error('Error sending password reset email:', error)
      return NextResponse.json({ error: 'Failed to send password reset email' }, { status: 500 })
    }

    await logAuditEvent({
      action: 'password_reset',
      entity_type: 'user',
      entity_id: params.id,
      details: { 
        user_email: user.email,
        initiated_by: session.user.email
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Password reset email sent successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/admin/users/[id]/reset-password:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}