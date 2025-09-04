#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hlwlbighcjnmgoulvkog.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsd2xiaWdoY2pubWdvdWx2a29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTE3MTcsImV4cCI6MjA3MTQ2NzcxN30.liLpTVqBuuMyymSBVVXSrh9YhFgn0A-UdiczKbN7RNg'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createAdmin() {
  console.log('🔐 Creating Super Admin Account...\n')
  
  const email = 'ivatlou@gmail.com'
  const password = 'Admin123!'
  
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  
  try {
    // Try to sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: 'Super',
          last_name: 'Admin',
          full_name: 'Super Admin',
          role: 'super_admin'
        }
      }
    })
    
    if (error) {
      console.error('\n❌ Signup error:', error.message)
      
      // If user exists, try to sign in
      if (error.message.includes('already registered')) {
        console.log('\n📝 User already exists. Trying to sign in...')
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (signInError) {
          console.error('❌ Sign in failed:', signInError.message)
          console.log('\n💡 The account exists but the password might be different.')
        } else {
          console.log('✅ Successfully signed in!')
          console.log('   User ID:', signInData.user?.id)
        }
      }
    } else {
      console.log('\n✅ Account created successfully!')
      console.log('   User ID:', data.user?.id)
      console.log('\n🎯 The account will automatically be set as super_admin')
    }
    
    console.log('\n📋 Account Details:')
    console.log('   Email: ivatlou@gmail.com')
    console.log('   Password: Admin123!')
    console.log('   Role: super_admin')
    console.log('\n✨ You can now log in at http://localhost:3001/login')
    
  } catch (err) {
    console.error('\n❌ Unexpected error:', err.message)
  }
}

createAdmin()