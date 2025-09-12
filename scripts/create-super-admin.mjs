#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hlwlbighcjnmgoulvkog.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsd2xiaWdoY2pubWdvdWx2a29nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg5MTcxNywiZXhwIjoyMDcxNDY3NzE3fQ.GRIuTVl-_BegdSiHU6kxEpmFRUTksOkcAmH_Rt17Kcs'

// Use service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createSuperAdmin() {
  console.log('🔧 Creating super admin account...\n')
  
  try {
    // First, clean up any existing data
    console.log('🧹 Cleaning up existing data...')
    
    // Delete with service role context
    await supabase.from('user_roles').delete().eq('user_id', '1824d0a4-7033-4fcc-9261-dd2ec4a64cf5')
    await supabase.from('profiles').delete().eq('id', '1824d0a4-7033-4fcc-9261-dd2ec4a64cf5')
    await supabase.from('salons').delete().eq('id', '00000000-0000-0000-0000-000000000000')
    
    // Delete existing user from auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser('1824d0a4-7033-4fcc-9261-dd2ec4a64cf5')
    if (deleteError && !deleteError.message.includes('not found')) {
      console.log('⚠️  Warning during cleanup:', deleteError.message)
    }
    
    console.log('✅ Cleanup complete\n')
    
    // Create new super admin user
    console.log('👤 Creating new super admin user...')
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'ivatlou@gmail.com',
      password: 'Aliahmadi-1377',
      email_confirm: true,
      phone: '+15874349195',
      phone_confirm: true,
      user_metadata: {
        first_name: 'Afshin',
        last_name: 'Ahmadi Ivatlou',
        full_name: 'Afshin Ahmadi Ivatlou',
        role: 'super_admin'
      }
    })
    
    if (userError) {
      throw new Error(`Failed to create user: ${userError.message}`)
    }
    
    const userId = userData.user.id
    console.log('✅ User created with ID:', userId)
    
    // Create salon for super admin
    console.log('\n🏢 Creating admin salon...')
    const { error: salonError } = await supabase
      .from('salons')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Platform Administration',
        slug: 'platform-admin',
        email: 'ivatlou@gmail.com',
        timezone: 'America/Toronto',
        is_active: true,
        settings: {
          type: 'system',
          purpose: 'platform_administration'
        },
        created_by: userId
      })
    
    if (salonError) {
      console.log('⚠️  Salon might already exist:', salonError.message)
    } else {
      console.log('✅ Admin salon created')
    }
    
    // Create profile
    console.log('\n📋 Creating user profile...')
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        user_id: userId,
        email: 'ivatlou@gmail.com',
        first_name: 'Afshin',
        last_name: 'Ahmadi Ivatlou',
        full_name: 'Afshin Ahmadi Ivatlou',
        phone: '+15874349195',
        role: 'super_admin',
        is_verified: true
      })
    
    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }
    console.log('✅ Profile created')
    
    // Create user role
    console.log('\n🔑 Assigning super admin role...')
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        salon_id: '00000000-0000-0000-0000-000000000000',
        role: 'super_admin',
        permissions: {
          all_permissions: true,
          system_admin: true,
          platform_admin: true
        },
        is_active: true
      })
    
    if (roleError) {
      throw new Error(`Failed to create user role: ${roleError.message}`)
    }
    console.log('✅ Super admin role assigned')
    
    // Test login
    console.log('\n🔐 Testing login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'ivatlou@gmail.com',
      password: 'Aliahmadi-1377'
    })
    
    if (loginError) {
      throw new Error(`Login test failed: ${loginError.message}`)
    }
    
    console.log('✅ Login successful!')
    console.log('\n========================================')
    console.log('🎉 Super Admin Account Created Successfully!')
    console.log('========================================')
    console.log('📧 Email: ivatlou@gmail.com')
    console.log('🔑 Password: Aliahmadi-1377')
    console.log('👤 Name: Afshin Ahmadi Ivatlou')
    console.log('📱 Phone: +15874349195')
    console.log('🛡️  Role: Super Admin')
    console.log('========================================\n')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

createSuperAdmin()