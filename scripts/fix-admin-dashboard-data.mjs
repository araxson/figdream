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

async function fixAdminDashboardData() {
  console.log('🔧 Fixing admin dashboard data...\n')
  
  try {
    // Create proper salons
    console.log('📍 Creating real salons...')
    const salons = [
      {
        name: 'Glamour Beauty Studio',
        slug: 'glamour-beauty-studio',
        description: 'Premium beauty services in downtown',
        phone: '(555) 123-4567',
        email: 'info@glamourbeauty.com',
        address: JSON.stringify({
          street: '123 Beauty Lane',
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94102',
          country: 'USA'
        }),
        timezone: 'America/Los_Angeles',
        is_active: true,
        business_hours: {
          monday: { open: '09:00', close: '19:00' },
          tuesday: { open: '09:00', close: '19:00' },
          wednesday: { open: '09:00', close: '19:00' },
          thursday: { open: '09:00', close: '21:00' },
          friday: { open: '09:00', close: '21:00' },
          saturday: { open: '10:00', close: '18:00' },
          sunday: { open: '11:00', close: '17:00' }
        },
        metadata: {
          rating: 4.8,
          total_reviews: 234,
          established_year: 2015
        }
      },
      {
        name: 'Elite Hair & Spa',
        slug: 'elite-hair-spa',
        description: 'Luxury hair and spa treatments',
        phone: '(555) 234-5678',
        email: 'contact@elitehairspa.com',
        address: JSON.stringify({
          street: '456 Spa Avenue',
          city: 'Los Angeles',
          state: 'CA',
          postal_code: '90001',
          country: 'USA'
        }),
        timezone: 'America/Los_Angeles',
        is_active: true,
        business_hours: {
          monday: { open: '10:00', close: '20:00' },
          tuesday: { open: '10:00', close: '20:00' },
          wednesday: { open: '10:00', close: '20:00' },
          thursday: { open: '10:00', close: '20:00' },
          friday: { open: '10:00', close: '21:00' },
          saturday: { open: '09:00', close: '19:00' },
          sunday: { closed: true }
        },
        metadata: {
          rating: 4.9,
          total_reviews: 456,
          established_year: 2010
        }
      },
      {
        name: 'Zen Wellness Center',
        slug: 'zen-wellness-center',
        description: 'Holistic beauty and wellness services',
        phone: '(555) 345-6789',
        email: 'hello@zenwellness.com',
        address: JSON.stringify({
          street: '789 Wellness Way',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'USA'
        }),
        timezone: 'America/New_York',
        is_active: true,
        business_hours: {
          monday: { open: '08:00', close: '20:00' },
          tuesday: { open: '08:00', close: '20:00' },
          wednesday: { open: '08:00', close: '20:00' },
          thursday: { open: '08:00', close: '20:00' },
          friday: { open: '08:00', close: '20:00' },
          saturday: { open: '09:00', close: '18:00' },
          sunday: { open: '10:00', close: '16:00' }
        },
        metadata: {
          rating: 4.7,
          total_reviews: 189,
          established_year: 2018
        }
      }
    ]
    
    for (const salon of salons) {
      const { error } = await supabase
        .from('salons')
        .upsert(salon, { onConflict: 'slug' })
      
      if (error) {
        console.warn(`Warning: Could not create salon ${salon.name}:`, error.message)
      } else {
        console.log(`✅ Created/Updated salon: ${salon.name}`)
      }
    }
    
    // Create more diverse users
    console.log('\n👥 Creating diverse user accounts...')
    const userTypes = [
      // Salon owners
      { email: 'owner1@glamour.com', name: 'Sarah Johnson', role: 'salon_owner' },
      { email: 'owner2@elite.com', name: 'Michael Chen', role: 'salon_owner' },
      { email: 'owner3@zen.com', name: 'Emily Rodriguez', role: 'salon_owner' },
      
      // Salon managers
      { email: 'manager1@glamour.com', name: 'Jessica Smith', role: 'salon_manager' },
      { email: 'manager2@elite.com', name: 'David Park', role: 'salon_manager' },
      
      // Staff members
      { email: 'stylist1@glamour.com', name: 'Anna Wilson', role: 'staff' },
      { email: 'stylist2@glamour.com', name: 'James Brown', role: 'staff' },
      { email: 'therapist1@zen.com', name: 'Maria Garcia', role: 'staff' },
      { email: 'nail1@elite.com', name: 'Lisa Taylor', role: 'staff' },
      
      // Regular customers
      { email: 'customer1@example.com', name: 'Robert Johnson', role: 'customer' },
      { email: 'customer2@example.com', name: 'Patricia Williams', role: 'customer' },
      { email: 'customer3@example.com', name: 'Jennifer Davis', role: 'customer' },
      { email: 'customer4@example.com', name: 'William Miller', role: 'customer' },
      { email: 'customer5@example.com', name: 'Elizabeth Moore', role: 'customer' }
    ]
    
    for (const user of userTypes) {
      try {
        const { data: authUser } = await supabase.auth.admin.createUser({
          email: user.email,
          password: 'TestPass123!',
          email_confirm: true,
          user_metadata: {
            full_name: user.name,
            role: user.role
          }
        })
        
        if (authUser?.user) {
          const [firstName, lastName] = user.name.split(' ')
          await supabase.from('profiles').upsert({
            id: authUser.user.id,
            email: user.email,
            full_name: user.name,
            first_name: firstName,
            last_name: lastName,
            role: user.role,
            phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
          })
          console.log(`✅ Created user: ${user.name} (${user.role})`)
        }
      } catch (error) {
        // User might already exist
        console.log(`ℹ️ User ${user.email} may already exist`)
      }
    }
    
    // Create appointments with various statuses
    console.log('\n📅 Creating appointments...')
    const { data: allSalons } = await supabase.from('salons').select('id, name')
    const { data: allCustomers } = await supabase.from('profiles').select('id, email').eq('role', 'customer')
    const { data: allStaff } = await supabase.from('profiles').select('id, email').eq('role', 'staff')
    
    if (allSalons?.length && allCustomers?.length && allStaff?.length) {
      const statuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show']
      const appointments = []
      
      // Create appointments for the past 30 days
      for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
        const appointmentDate = new Date()
        appointmentDate.setDate(appointmentDate.getDate() - daysAgo)
        
        // Create 2-5 appointments per day
        const appointmentsPerDay = Math.floor(Math.random() * 4) + 2
        
        for (let i = 0; i < appointmentsPerDay; i++) {
          const salon = allSalons[Math.floor(Math.random() * allSalons.length)]
          const customer = allCustomers[Math.floor(Math.random() * allCustomers.length)]
          const staff = allStaff[Math.floor(Math.random() * allStaff.length)]
          
          const hour = Math.floor(Math.random() * 10) + 9 // 9 AM to 7 PM
          const startTime = new Date(appointmentDate)
          startTime.setHours(hour, Math.random() > 0.5 ? 0 : 30, 0, 0)
          
          const endTime = new Date(startTime)
          endTime.setMinutes(endTime.getMinutes() + (Math.floor(Math.random() * 3) + 1) * 30) // 30-90 minutes
          
          appointments.push({
            salon_id: salon.id,
            customer_id: customer.id,
            staff_id: staff.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: daysAgo === 0 ? 'confirmed' : 
                   daysAgo < 7 ? statuses[Math.floor(Math.random() * 3)] :
                   statuses[Math.floor(Math.random() * statuses.length)],
            notes: `Appointment for ${salon.name}`
          })
        }
      }
      
      const { data: createdAppointments, error } = await supabase
        .from('appointments')
        .insert(appointments)
        .select()
      
      if (error) {
        console.warn('Warning: Could not create all appointments:', error.message)
      } else {
        console.log(`✅ Created ${createdAppointments?.length || 0} appointments`)
      }
    }
    
    // Create diverse audit logs
    console.log('\n📝 Creating audit logs...')
    const { data: users } = await supabase.from('profiles').select('id, email, role')
    
    if (users?.length) {
      const actions = ['LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'VIEW']
      const entities = ['appointment', 'profile', 'service', 'salon', 'review', 'payment']
      const auditLogs = []
      
      // Create 50 audit log entries
      for (let i = 0; i < 50; i++) {
        const user = users[Math.floor(Math.random() * users.length)]
        const action = actions[Math.floor(Math.random() * actions.length)]
        const entity = entities[Math.floor(Math.random() * entities.length)]
        
        auditLogs.push({
          user_id: user.id,
          action: action,
          entity_type: entity,
          entity_id: Math.random().toString(36).substring(7),
          metadata: {
            user_email: user.email,
            user_role: user.role,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        })
      }
      
      const { error } = await supabase
        .from('audit_logs')
        .insert(auditLogs)
      
      if (error) {
        console.warn('Warning: Could not create audit logs:', error.message)
      } else {
        console.log(`✅ Created ${auditLogs.length} audit log entries`)
      }
    }
    
    // Create some reviews
    console.log('\n⭐ Creating reviews...')
    const { data: appointments } = await supabase
      .from('appointments')
      .select('id, customer_id, staff_id, salon_id')
      .eq('status', 'completed')
      .limit(20)
    
    if (appointments?.length) {
      const reviews = []
      const reviewTexts = [
        'Excellent service! Highly recommend.',
        'Great experience, will definitely come back.',
        'Professional and friendly staff.',
        'Amazing results, love my new look!',
        'Good service but a bit pricey.',
        'Very satisfied with the treatment.',
        'Best salon in town!',
        'Wonderful atmosphere and skilled professionals.'
      ]
      
      for (const apt of appointments.slice(0, 15)) {
        reviews.push({
          appointment_id: apt.id,
          customer_id: apt.customer_id,
          staff_id: apt.staff_id,
          salon_id: apt.salon_id,
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
          is_verified: true,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        })
      }
      
      const { error } = await supabase
        .from('reviews')
        .insert(reviews)
      
      if (error) {
        console.warn('Warning: Could not create reviews:', error.message)
      } else {
        console.log(`✅ Created ${reviews.length} reviews`)
      }
    }
    
    console.log('\n✨ Admin dashboard data fix complete!')
    console.log('📊 The dashboard should now display comprehensive data')
    
  } catch (error) {
    console.error('❌ Error fixing admin dashboard data:', error)
    process.exit(1)
  }
}

fixAdminDashboardData()