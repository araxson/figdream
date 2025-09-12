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

    // Get user
    const { data: user } = await supabase
      .from('profiles')
      .select('email, email_verified')
      .eq('id', params.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.email_verified) {
      return NextResponse.json({ 
        success: true,
        message: 'Email already verified'
      })
    }

    // Update email verification status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (updateError) {
      console.error('Error verifying email:', updateError)
      return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 })
    }

    // Update auth user metadata
    const { error: authError } = await supabase.auth.admin.updateUserById(
      params.id,
      { email_confirm: true }
    )

    if (authError) {
      console.error('Error updating auth user:', authError)
    }

    await logAuditEvent({
      action: 'email_verified',
      entity_type: 'user',
      entity_id: params.id,
      details: { 
        user_email: user.email,
        verified_by: session.user.email
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Email verified successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/admin/users/[id]/verify-email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}