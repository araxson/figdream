import { NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabase/server'

export async function POST(_request: Request) {
  try {
    await createClient()
    
    // Check if this is a local development environment
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!isDevelopment) {
      return NextResponse.json(
        { error: 'Demo data creation is only available in development' },
        { status: 403 }
      )
    }
    
    const demoUsers = [
      {
        email: 'customer@demo.com',
        password: 'Demo123!',
        full_name: 'Sarah Johnson',
        role: 'customer'
      },
      {
        email: 'staff@demo.com',
        password: 'Demo123!',
        full_name: 'Emily Chen',
        role: 'staff'
      },
      {
        email: 'owner@demo.com',
        password: 'Demo123!',
        full_name: 'Michael Roberts',
        role: 'salon_owner'
      },
      {
        email: 'admin@demo.com',
        password: 'Demo123!',
        full_name: 'Admin User',
        role: 'super_admin'
      }
    ]
    
    const results = []
    
    for (const userData of demoUsers) {
      // Since we can't use admin API in edge functions, we'll create a placeholder
      // In production, you would use the Supabase Admin SDK with service role key
      results.push({
        email: userData.email,
        message: 'Please create this user manually through Supabase Dashboard',
        credentials: {
          email: userData.email,
          password: userData.password,
          role: userData.role
        }
      })
    }
    
    return NextResponse.json({
      message: 'Demo user information',
      users: results,
      instructions: 'Please create these users manually in your Supabase Dashboard under Authentication > Users'
    })
    
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Failed to generate demo user information' },
      { status: 500 }
    )
  }
}