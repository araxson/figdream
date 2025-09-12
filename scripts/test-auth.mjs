#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hlwlbighcjnmgoulvkog.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsd2xiaWdoY2pubWdvdWx2a29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTE3MTcsImV4cCI6MjA3MTQ2NzcxN30.liLpTVqBuuMyymSBVVXSrh9YhFgn0A-UdiczKbN7RNg'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  console.log('🔍 Testing authentication...\n')
  
  // Test login with the super admin account
  console.log('📧 Attempting login with: ivatlou@gmail.com')
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'ivatlou@gmail.com',
    password: 'Aliahmadi-1377'
  })
  
  if (error) {
    console.error('❌ Login failed:', error.message)
    process.exit(1)
  }
  
  console.log('✅ Login successful!')
  console.log('👤 User ID:', data.user.id)
  console.log('📧 Email:', data.user.email)
  
  // Check profile and role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()
  
  if (profileError) {
    console.error('❌ Failed to fetch profile:', profileError.message)
  } else {
    console.log('\n📋 Profile Information:')
    console.log('   Name:', profile.full_name)
    console.log('   Role:', profile.role)
    console.log('   Phone:', profile.phone)
  }
  
  // Check user_roles
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('*, salons(name)')
    .eq('user_id', data.user.id)
    .single()
  
  if (roleError) {
    console.error('❌ Failed to fetch user role:', roleError.message)
  } else {
    console.log('\n🔑 Role Information:')
    console.log('   Role:', userRole.role)
    console.log('   Salon:', userRole.salons?.name)
    console.log('   Permissions:', JSON.stringify(userRole.permissions, null, 2))
  }
  
  // Test session persistence
  console.log('\n🔄 Testing session persistence...')
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    console.log('✅ Session is active')
    console.log('   Access token:', session.access_token.substring(0, 20) + '...')
    console.log('   Expires at:', new Date(session.expires_at * 1000).toLocaleString())
  } else {
    console.log('❌ No active session found')
  }
  
  // Sign out
  console.log('\n🔚 Signing out...')
  await supabase.auth.signOut()
  console.log('✅ Signed out successfully')
  
  console.log('\n✨ Authentication test completed successfully!')
}

testAuth().catch(console.error)