#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hlwlbighcjnmgoulvkog.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsd2xiaWdoY2pubWdvdWx2a29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTE3MTcsImV4cCI6MjA3MTQ2NzcxN30.liLpTVqBuuMyymSBVVXSrh9YhFgn0A-UdiczKbN7RNg'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  console.log('🔐 Testing Login for ivatlou@gmail.com\n')
  console.log('=' .repeat(50))
  
  const email = 'ivatlou@gmail.com'
  const password = 'Admin123!'
  
  try {
    // Test login
    console.log('📝 Attempting login...')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('\n❌ Login failed:', error.message)
      console.error('   Error code:', error.status)
      console.error('   Full error:', error)
      
      // Try to get more details
      console.log('\n🔍 Checking account status in database...')
      const { data: user } = await supabase
        .from('profiles')
        .select('email, is_verified')
        .eq('email', email)
        .single()
      
      if (user) {
        console.log('   Account found in profiles:', user)
      } else {
        console.log('   No profile found')
      }
      
      process.exit(1)
    }
    
    console.log('\n✅ Login successful!')
    console.log('   User ID:', data.user?.id)
    console.log('   Email:', data.user?.email)
    console.log('   Role:', data.user?.user_metadata?.role)
    console.log('   Session:', data.session ? 'Active' : 'None')
    
    if (data.session) {
      console.log('\n🎯 Session Details:')
      console.log('   Access Token:', data.session.access_token.substring(0, 20) + '...')
      console.log('   Expires at:', new Date(data.session.expires_at * 1000).toLocaleString())
    }
    
    // Check user role
    console.log('\n🔍 Checking user role...')
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role, is_active')
      .eq('user_id', data.user?.id)
      .single()
    
    if (roleData) {
      console.log('   Role from database:', roleData.role)
      console.log('   Active:', roleData.is_active)
    }
    
    console.log('\n✨ Everything works! You can now login at http://localhost:3001/login')
    console.log('\n📋 Credentials:')
    console.log('   Email: ivatlou@gmail.com')
    console.log('   Password: Admin123!')
    
  } catch (err) {
    console.error('\n❌ Unexpected error:', err)
    process.exit(1)
  }
}

testLogin()