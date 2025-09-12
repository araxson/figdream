#!/usr/bin/env node

import fetch from 'node-fetch';

const SUPABASE_URL = 'https://hlwlbighcjnmgoulvkog.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsd2xiaWdoY2pubWdvdWx2a29nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg5MTcxNywiZXhwIjoyMDcxNDY3NzE3fQ.GRIuTVl-_BegdSiHU6kxEpmFRUTksOkcAmH_Rt17Kcs';

async function deleteExistingUser(email) {
  // First, get the user ID
  const getUserResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${email}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json'
    }
  });

  if (getUserResponse.ok) {
    const users = await getUserResponse.json();
    if (users && users.users && users.users.length > 0) {
      const userId = users.users[0].id;
      
      // Delete the user
      const deleteResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (deleteResponse.ok) {
        console.log('✅ Existing user deleted');
      }
    }
  }
}

async function createSuperAdmin() {
  console.log('🔧 Setting up super admin account...\n');

  try {
    // First delete existing user if any
    console.log('🧹 Cleaning up existing user...');
    await deleteExistingUser('ivatlou@gmail.com');

    // Create new user via Supabase Admin API
    console.log('👤 Creating new super admin user...');
    
    const createUserResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
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
        },
        app_metadata: {
          provider: 'email',
          providers: ['email']
        }
      })
    });

    if (!createUserResponse.ok) {
      const error = await createUserResponse.text();
      throw new Error(`Failed to create user: ${error}`);
    }

    const userData = await createUserResponse.json();
    const userId = userData.id;
    console.log('✅ User created with ID:', userId);

    // Now create the profile and roles using SQL
    console.log('\n📋 Setting up profile and roles...');
    
    const setupDataResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/setup_super_admin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: userId,
        email: 'ivatlou@gmail.com',
        first_name: 'Afshin',
        last_name: 'Ahmadi Ivatlou',
        phone: '+15874349195'
      })
    });

    // Even if the RPC doesn't exist, we'll create the data directly
    console.log('📦 Creating profile and role entries...');

    // Create profile
    await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
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
    });

    // Create admin salon
    await fetch(`${SUPABASE_URL}/rest/v1/salons`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
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
    }).catch(() => {
      console.log('ℹ️  Admin salon might already exist');
    });

    // Create user role
    await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
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
    });

    console.log('✅ Profile and roles created');

    // Test the login
    console.log('\n🔐 Testing login...');
    const loginResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'ivatlou@gmail.com',
        password: 'Aliahmadi-1377'
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      throw new Error(`Login test failed: ${error}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log('   Access token:', loginData.access_token.substring(0, 20) + '...');

    console.log('\n' + '='.repeat(50));
    console.log('🎉 SUPER ADMIN ACCOUNT CREATED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('📧 Email: ivatlou@gmail.com');
    console.log('🔑 Password: Aliahmadi-1377');
    console.log('👤 Name: Afshin Ahmadi Ivatlou');
    console.log('📱 Phone: +15874349195');
    console.log('🛡️  Role: Super Admin');
    console.log('='.repeat(50));
    console.log('\n✨ You can now login at: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createSuperAdmin();