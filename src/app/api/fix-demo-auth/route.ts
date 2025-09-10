import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  const demoAccounts = [
    { email: 'admin@demo.com', id: 'b73d28a4-c407-4ef4-a957-df36b4b2c628' },
    { email: 'owner@demo.com', id: '1efa17c7-a8ee-427e-9e0c-876463009444' },
    { email: 'staff@demo.com', id: 'fa0e1d16-e81d-4cf2-af1e-61df2bd234ed' },
    { email: 'customer@demo.com', id: '7ca5903e-a5ac-43d4-9db8-939db4ee391b' }
  ]
  
  const results = []
  
  for (const account of demoAccounts) {
    // Try to upsert/sync the user with Supabase Auth
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        id: account.id,
        email: account.email,
        password: 'Password123!',
        email_confirm: true,
        user_metadata: {
          name: account.email.split('@')[0]
        }
      })
      
      if (error && error.message.includes('already exists')) {
        // User exists, try to update password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          account.id,
          { 
            password: 'Password123!',
            email_confirm: true
          }
        )
        
        if (updateError) {
          results.push({ email: account.email, status: 'error', error: updateError.message })
        } else {
          results.push({ email: account.email, status: 'password_updated' })
        }
      } else if (error) {
        results.push({ email: account.email, status: 'error', error: error.message })
      } else {
        results.push({ email: account.email, status: 'created', id: data?.user?.id })
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error'
      results.push({ email: account.email, status: 'exception', error: errorMessage })
    }
  }
  
  return NextResponse.json({ 
    message: 'Demo accounts fix attempted',
    results,
    loginCredentials: {
      emails: demoAccounts.map(a => a.email),
      password: 'Password123!'
    }
  })
}