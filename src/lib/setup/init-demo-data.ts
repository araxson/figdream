import { createClient } from '@/lib/database/supabase/client'

// Demo user credentials for testing
export const DEMO_USERS = {
  customer: {
    email: 'customer@demo.com',
    password: 'Demo123!',
    role: 'customer',
    fullName: 'Sarah Johnson',
    phone: '+1234567890'
  },
  staff: {
    email: 'staff@demo.com',
    password: 'Demo123!',
    role: 'staff',
    fullName: 'Emily Chen',
    phone: '+1234567891'
  },
  salonOwner: {
    email: 'owner@demo.com',
    password: 'Demo123!',
    role: 'salon_owner',
    fullName: 'Michael Roberts',
    phone: '+1234567892'
  },
  superAdmin: {
    email: 'admin@demo.com',
    password: 'Demo123!',
    role: 'super_admin',
    fullName: 'Admin User',
    phone: '+1234567893'
  }
}

export async function createDemoUser(userInfo: typeof DEMO_USERS.customer) {
  const supabase = createClient()
  
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userInfo.email)
      .single()

    if (existingUser) {
      console.log(`User ${userInfo.email} already exists`)
      return { success: true, message: 'User already exists' }
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userInfo.email,
      password: userInfo.password,
      options: {
        data: {
          full_name: userInfo.fullName,
          phone: userInfo.phone,
          role: userInfo.role
        }
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return { success: false, error: authError.message }
    }

    if (authData.user) {
      // Update profile with role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: userInfo.email,
          full_name: userInfo.fullName,
          phone: userInfo.phone,
          role: userInfo.role,
          is_verified: true
        })

      if (profileError) {
        console.error('Error updating profile:', profileError)
        return { success: false, error: profileError.message }
      }

      console.log(`Created demo user: ${userInfo.email}`)
      return { success: true, user: authData.user }
    }
  } catch (error) {
    console.error('Error in createDemoUser:', error)
    return { success: false, error: 'Failed to create demo user' }
  }
}

export async function initializeDemoData() {
  console.log('Initializing demo data...')
  
  const results = []
  
  // Create demo users
  for (const [_key, userInfo] of Object.entries(DEMO_USERS)) {
    const result = await createDemoUser(userInfo)
    results.push({ user: userInfo.email, ...result })
  }
  
  console.log('Demo data initialization complete')
  return results
}

// Quick login function for demo purposes
export async function quickLogin(role: keyof typeof DEMO_USERS) {
  const supabase = createClient()
  const userInfo = DEMO_USERS[role]
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userInfo.email,
      password: userInfo.password
    })
    
    if (error) {
      console.error('Quick login error:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, user: data.user, session: data.session }
  } catch (error) {
    console.error('Quick login error:', error)
    return { success: false, error: 'Failed to login' }
  }
}