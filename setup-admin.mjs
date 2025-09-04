#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import readline from 'readline'

const supabaseUrl = 'https://hlwlbighcjnmgoulvkog.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsd2xiaWdoY2pubWdvdWx2a29nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg5MTcxNywiZXhwIjoyMDcxNDY3NzE3fQ.GRIuTVl-_BegdSiHU6kxEpmFRUTksOkcAmH_Rt17Kcs'

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question) {
  return new Promise(resolve => rl.question(question, resolve))
}

async function createSuperAdmin() {
  console.log('🔐 Super Admin Account Setup\n')
  console.log('=' .repeat(50))
  
  const email = 'ivatlou@gmail.com'
  console.log(`Email: ${email}`)
  
  // Ask for password
  const password = await askQuestion('Enter password (min 6 characters): ')
  
  if (password.length < 6) {
    console.error('❌ Password must be at least 6 characters long')
    rl.close()
    process.exit(1)
  }
  
  try {
    console.log('\n🚀 Creating super admin account...')
    
    // Create the user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: 'Super',
        last_name: 'Admin',
        full_name: 'Super Admin',
        role: 'super_admin'
      },
      app_metadata: {
        role: 'super_admin'
      }
    })
    
    if (error) {
      if (error.message.includes('already been registered')) {
        console.error('❌ User already exists. Cleaning up...')
        
        // Delete existing user
        const { data: users } = await supabase.auth.admin.listUsers()
        const existingUser = users?.users?.find(u => u.email === email)
        
        if (existingUser) {
          await supabase.auth.admin.deleteUser(existingUser.id)
          console.log('✅ Old account deleted')
          
          // Try again
          const { data: retryData, error: retryError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
              first_name: 'Super',
              last_name: 'Admin',
              full_name: 'Super Admin',
              role: 'super_admin'
            },
            app_metadata: {
              role: 'super_admin'
            }
          })
          
          if (retryError) {
            throw retryError
          }
          
          console.log('✅ User recreated successfully')
          console.log(`   User ID: ${retryData.user.id}`)
        }
      } else {
        throw error
      }
    } else {
      console.log('✅ User created successfully')
      console.log(`   User ID: ${data.user.id}`)
    }
    
    // The trigger will automatically set up profile and role
    console.log('\n✨ Super admin account setup complete!')
    console.log('\nYou can now log in with:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('\n🎯 You will be redirected to /super-admin dashboard upon login')
    
  } catch (err) {
    console.error('❌ Failed to create user:', err.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

createSuperAdmin()