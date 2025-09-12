import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().length(6, 'OTP must be 6 digits'),
  type: z.enum(['email', 'email_change']).default('email')
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate request body with Zod
    const validation = verifyOtpSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }
    
    const { email, token, type } = validation.data
    
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type
    })
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    if (data.session) {
      // Get user role for redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user?.id || '')
        .single()
      
      return NextResponse.json(
        { 
          success: true, 
          user: data.user,
          role: profile?.role || 'customer'
        },
        { status: 200 }
      )
    }
    
    return NextResponse.json(
      { error: 'Invalid OTP' },
      { status: 400 }
    )
  } catch (error) {
    console.error('OTP verify error:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}