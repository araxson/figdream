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

async function createSampleData() {
  console.log('📝 Creating sample data for dashboards...\n')
  
  try {
    // Get the existing salon
    const { data: existingSalon } = await supabase
      .from('salons')
      .select('*')
      .single()
    
    let salonId = existingSalon?.id
    
    // Create a salon if none exists
    if (!salonId) {
      const { data: newSalon, error: salonError } = await supabase
        .from('salons')
        .insert({
          name: 'FigDream Beauty Salon',
          slug: 'figdream-beauty',
          description: 'Premium beauty services for everyone',
          phone: '555-0100',
          email: 'contact@figdream.test',
          address: '123 Beauty Lane',
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94102',
          country: 'USA',
          timezone: 'America/Los_Angeles',
          is_active: true,
          business_hours: {
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '20:00' },
            friday: { open: '09:00', close: '20:00' },
            saturday: { open: '10:00', close: '17:00' },
            sunday: { closed: true }
          }
        })
        .select()
        .single()
      
      if (salonError) throw salonError
      salonId = newSalon.id
      console.log('✅ Created salon:', newSalon.name)
    } else {
      console.log('✅ Using existing salon:', existingSalon.name)
    }
    
    // Create service categories first
    const categories = [
      { name: 'Hair', slug: 'hair', description: 'Hair services', salon_id: salonId },
      { name: 'Nails', slug: 'nails', description: 'Nail services', salon_id: salonId },
      { name: 'Spa', slug: 'spa', description: 'Spa and wellness services', salon_id: salonId }
    ]
    
    const { data: createdCategories, error: categoriesError } = await supabase
      .from('service_categories')
      .upsert(categories, { onConflict: 'slug,salon_id' })
      .select()
    
    if (categoriesError) console.warn('Warning: Could not create categories:', categoriesError.message)
    else console.log(`✅ Created ${createdCategories?.length || 0} service categories`)
    
    // Get category IDs
    const { data: allCategories } = await supabase
      .from('service_categories')
      .select('id, name')
      .eq('salon_id', salonId)
    
    const categoryMap = {}
    allCategories?.forEach(cat => {
      categoryMap[cat.name] = cat.id
    })
    
    // Create services
    const services = [
      { 
        name: 'Haircut', 
        slug: 'haircut',
        description: 'Professional haircut', 
        price: 50, 
        duration_minutes: 30, 
        category_id: categoryMap['Hair'], 
        is_active: true, 
        salon_id: salonId,
        is_addon: false,
        requires_consultation: false
      },
      { 
        name: 'Hair Color', 
        slug: 'hair-color',
        description: 'Full hair coloring', 
        price: 120, 
        duration_minutes: 90, 
        category_id: categoryMap['Hair'], 
        is_active: true, 
        salon_id: salonId,
        is_addon: false,
        requires_consultation: true
      },
      { 
        name: 'Manicure', 
        slug: 'manicure',
        description: 'Classic manicure', 
        price: 35, 
        duration_minutes: 45, 
        category_id: categoryMap['Nails'], 
        is_active: true, 
        salon_id: salonId,
        is_addon: false,
        requires_consultation: false
      },
      { 
        name: 'Pedicure', 
        slug: 'pedicure',
        description: 'Spa pedicure', 
        price: 45, 
        duration_minutes: 60, 
        category_id: categoryMap['Nails'], 
        is_active: true, 
        salon_id: salonId,
        is_addon: false,
        requires_consultation: false
      },
      { 
        name: 'Facial', 
        slug: 'facial',
        description: 'Rejuvenating facial', 
        price: 80, 
        duration_minutes: 60, 
        category_id: categoryMap['Spa'], 
        is_active: true, 
        salon_id: salonId,
        is_addon: false,
        requires_consultation: false
      }
    ]
    
    const { data: createdServices, error: servicesError } = await supabase
      .from('services')
      .upsert(services, { onConflict: 'slug,salon_id' })
      .select()
    
    if (servicesError) throw servicesError
    console.log(`✅ Created ${createdServices?.length || 0} services`)
    
    // Create some staff members
    const { data: staffUser1 } = await supabase.auth.admin.createUser({
      email: 'staff1@figdream.test',
      password: 'StaffPass123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Jane Smith',
        role: 'staff'
      }
    })
    
    const { data: staffUser2 } = await supabase.auth.admin.createUser({
      email: 'staff2@figdream.test',
      password: 'StaffPass123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'John Doe',
        role: 'staff'
      }
    })
    
    if (staffUser1?.user) {
      await supabase.from('profiles').upsert({
        id: staffUser1.user.id,
        email: staffUser1.user.email,
        full_name: 'Jane Smith',
        role: 'staff',
        first_name: 'Jane',
        last_name: 'Smith'
      })
      
      await supabase.from('staff_profiles').insert({
        user_id: staffUser1.user.id,
        salon_id: salonId,
        specialties: ['Hair', 'Color'],
        bio: 'Expert hair stylist with 10 years experience',
        is_active: true
      })
      console.log('✅ Created staff member: Jane Smith')
    }
    
    if (staffUser2?.user) {
      await supabase.from('profiles').upsert({
        id: staffUser2.user.id,
        email: staffUser2.user.email,
        full_name: 'John Doe',
        role: 'staff',
        first_name: 'John',
        last_name: 'Doe'
      })
      
      await supabase.from('staff_profiles').insert({
        user_id: staffUser2.user.id,
        salon_id: salonId,
        specialties: ['Nails', 'Spa'],
        bio: 'Certified nail technician and spa specialist',
        is_active: true
      })
      console.log('✅ Created staff member: John Doe')
    }
    
    // Create some customers
    const { data: customer1 } = await supabase.auth.admin.createUser({
      email: 'customer1@figdream.test',
      password: 'CustomerPass123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Alice Johnson',
        role: 'customer'
      }
    })
    
    const { data: customer2 } = await supabase.auth.admin.createUser({
      email: 'customer2@figdream.test',
      password: 'CustomerPass123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Bob Wilson',
        role: 'customer'
      }
    })
    
    if (customer1?.user) {
      await supabase.from('profiles').upsert({
        id: customer1.user.id,
        email: customer1.user.email,
        full_name: 'Alice Johnson',
        role: 'customer',
        first_name: 'Alice',
        last_name: 'Johnson'
      })
      
      await supabase.from('customers').insert({
        user_id: customer1.user.id,
        preferred_name: 'Alice',
        phone: '555-0201',
        date_of_birth: '1990-05-15'
      })
      console.log('✅ Created customer: Alice Johnson')
    }
    
    if (customer2?.user) {
      await supabase.from('profiles').upsert({
        id: customer2.user.id,
        email: customer2.user.email,
        full_name: 'Bob Wilson',
        role: 'customer',
        first_name: 'Bob',
        last_name: 'Wilson'
      })
      
      await supabase.from('customers').insert({
        user_id: customer2.user.id,
        preferred_name: 'Bob',
        phone: '555-0202',
        date_of_birth: '1985-08-20'
      })
      console.log('✅ Created customer: Bob Wilson')
    }
    
    // Create some appointments (mix of statuses for today and this month)
    const today = new Date()
    const appointments = []
    
    // Today's appointments
    if (staffUser1?.user && customer1?.user && createdServices?.[0]) {
      appointments.push({
        salon_id: salonId,
        customer_id: customer1.user.id,
        staff_id: staffUser1.user.id,
        start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(),
        end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30).toISOString(),
        status: 'completed',
        notes: 'Regular haircut'
      })
      
      appointments.push({
        salon_id: salonId,
        customer_id: customer2?.user?.id,
        staff_id: staffUser1.user.id,
        start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0).toISOString(),
        end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30).toISOString(),
        status: 'confirmed',
        notes: 'Hair coloring appointment'
      })
    }
    
    // Past appointments this month
    if (staffUser2?.user && customer1?.user) {
      for (let i = 1; i <= 5; i++) {
        appointments.push({
          salon_id: salonId,
          customer_id: customer1.user.id,
          staff_id: staffUser2.user.id,
          start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate() - i, 11, 0).toISOString(),
          end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate() - i, 12, 0).toISOString(),
          status: 'completed',
          notes: 'Service completed'
        })
      }
    }
    
    const { data: createdAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .insert(appointments)
      .select()
    
    if (appointmentsError) throw appointmentsError
    console.log(`✅ Created ${createdAppointments?.length || 0} appointments`)
    
    // Add some audit logs for activity
    const auditLogs = [
      {
        user_id: staffUser1?.user?.id,
        action: 'CREATE',
        entity_type: 'appointment',
        entity_id: createdAppointments?.[0]?.id,
        new_data: { status: 'confirmed' }
      },
      {
        user_id: customer1?.user?.id,
        action: 'LOGIN',
        entity_type: 'session',
        new_data: { timestamp: new Date().toISOString() }
      },
      {
        user_id: staffUser2?.user?.id,
        action: 'UPDATE',
        entity_type: 'appointment',
        entity_id: createdAppointments?.[1]?.id,
        old_data: { status: 'pending' },
        new_data: { status: 'confirmed' }
      }
    ]
    
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert(auditLogs)
    
    if (auditError) console.warn('Warning: Could not create audit logs:', auditError.message)
    else console.log('✅ Created audit log entries')
    
    console.log('\n✨ Sample data creation complete!')
    console.log('📊 Dashboards should now display real data')
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error)
    process.exit(1)
  }
}

createSampleData()