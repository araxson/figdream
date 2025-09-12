#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkDashboardData() {
  console.log('🔍 Checking dashboard data availability...\n')
  
  try {
    // Check profiles table
    const { count: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    console.log(`✅ Profiles: ${profileCount || 0} records`)
    
    // Check salons table
    const { count: salonCount } = await supabase
      .from('salons')
      .select('*', { count: 'exact', head: true })
    
    console.log(`✅ Salons: ${salonCount || 0} records`)
    
    // Check appointments table
    const { count: appointmentCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
    
    console.log(`✅ Appointments: ${appointmentCount || 0} records`)
    
    // Check staff_profiles table
    const { count: staffCount } = await supabase
      .from('staff_profiles')
      .select('*', { count: 'exact', head: true })
    
    console.log(`✅ Staff Profiles: ${staffCount || 0} records`)
    
    // Check services table
    const { count: serviceCount } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
    
    console.log(`✅ Services: ${serviceCount || 0} records`)
    
    // Check audit_logs table
    const { count: auditCount } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
    
    console.log(`✅ Audit Logs: ${auditCount || 0} records`)
    
    // Check if admin user exists
    const { data: adminUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'super_admin')
      .single()
    
    if (adminUser) {
      console.log(`\n✅ Admin user found: ${adminUser.email}`)
    } else {
      console.log('\n⚠️ No admin user found')
    }
    
    console.log('\n✨ Dashboard data check complete!')
    
  } catch (error) {
    console.error('❌ Error checking dashboard data:', error)
    process.exit(1)
  }
}

checkDashboardData()