import { createClient } from '@/lib/database/supabase/server'

export async function createDemoUsers() {
  const supabase = await createClient()
  
  const demoUsers = [
    {
      email: 'customer@demo.com',
      password: 'Demo123!',
      metadata: {
        full_name: 'Sarah Johnson',
        role: 'customer',
        phone: '+1234567890'
      }
    },
    {
      email: 'staff@demo.com',
      password: 'Demo123!',
      metadata: {
        full_name: 'Emily Chen',
        role: 'staff',
        phone: '+1234567891'
      }
    },
    {
      email: 'owner@demo.com',
      password: 'Demo123!',
      metadata: {
        full_name: 'Michael Roberts',
        role: 'salon_owner',
        phone: '+1234567892'
      }
    },
    {
      email: 'admin@demo.com',
      password: 'Demo123!',
      metadata: {
        full_name: 'Admin User',
        role: 'super_admin',
        phone: '+1234567893'
      }
    }
  ]
  
  const results = []
  
  for (const user of demoUsers) {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .single()
      
      if (existingUser) {
        results.push({
          email: user.email,
          success: true,
          message: 'User already exists'
        })
        continue
      }
      
      // Create the user using Supabase Admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.metadata
      })
      
      if (error) {
        results.push({
          email: user.email,
          success: false,
          error: error.message
        })
      } else {
        results.push({
          email: user.email,
          success: true,
          id: data.user?.id
        })
      }
    } catch (_error) {
      results.push({
        email: user.email,
        success: false,
        error: 'Failed to create user'
      })
    }
  }
  
  return results
}