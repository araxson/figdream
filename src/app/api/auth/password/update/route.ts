import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // First check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Update the password
    const { error } = await supabase.auth.updateUser({
      password
    })
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    // Sign out the user to force them to login with new password
    await supabase.auth.signOut()
    
    return NextResponse.json(
      { success: true, message: 'Password updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}