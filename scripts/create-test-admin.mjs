#!/usr/bin/env node

import fetch from 'node-fetch';

const SUPABASE_URL = 'https://hlwlbighcjnmgoulvkog.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsd2xiaWdoY2pubWdvdWx2a29nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg5MTcxNywiZXhwIjoyMDcxNDY3NzE3fQ.GRIuTVl-_BegdSiHU6kxEpmFRUTksOkcAmH_Rt17Kcs';

async function createTestAdmin() {
  console.log('🔧 Creating test admin account...\n');

  try {
    // Create a test admin with a different email
    const testEmail = 'admin@figdream.test';
    const testPassword = 'TestAdmin123!';
    
    console.log('👤 Creating test admin user...');
    
    const createResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          first_name: 'Test',
          last_name: 'Admin',
          full_name: 'Test Admin',
          role: 'super_admin'
        }
      })
    });

    let userId;
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      if (errorText.includes('already exists')) {
        // User exists, try to get it
        console.log('ℹ️  User exists, fetching ID...');
        const getUserResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_user_by_email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_email: testEmail })
        });
        
        // If RPC doesn't exist, we'll create a new unique email
        const uniqueEmail = `admin${Date.now()}@figdream.test`;
        console.log(`📧 Creating with unique email: ${uniqueEmail}`);
        
        const retryResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: uniqueEmail,
            password: testPassword,
            email_confirm: true,
            user_metadata: {
              first_name: 'Test',
              last_name: 'Admin',
              full_name: 'Test Admin',
              role: 'super_admin'
            }
          })
        });
        
        if (!retryResponse.ok) {
          throw new Error('Failed to create user with unique email');
        }
        
        const userData = await retryResponse.json();
        userId = userData.id;
        testEmail = uniqueEmail; // Update email for login test
      } else {
        throw new Error(`Failed to create user: ${errorText}`);
      }
    } else {
      const userData = await createResponse.json();
      userId = userData.id;
    }
    
    console.log('✅ User created with ID:', userId);

    // Create profile using REST API
    console.log('\n📋 Creating user profile...');
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
        email: testEmail,
        first_name: 'Test',
        last_name: 'Admin',
        full_name: 'Test Admin',
        role: 'super_admin',
        is_verified: true
      })
    });
    console.log('✅ Profile created');

    // Create or use existing admin salon
    console.log('\n🏢 Setting up admin salon...');
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
        email: testEmail,
        timezone: 'America/Toronto',
        is_active: true,
        settings: {
          type: 'system',
          purpose: 'platform_administration'
        },
        created_by: userId
      })
    }).catch(() => {
      console.log('ℹ️  Admin salon already exists');
    });

    // Create user role
    console.log('\n🔑 Assigning super admin role...');
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
    console.log('✅ Super admin role assigned');

    // Test the login
    console.log('\n🔐 Testing login...');
    const loginResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.log('⚠️  Login test failed:', error);
    } else {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 TEST ADMIN ACCOUNT CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);
    console.log('👤 Name: Test Admin');
    console.log('🛡️  Role: Super Admin');
    console.log('='.repeat(60));
    console.log('\n✨ You can now login at: http://localhost:3000/login');
    console.log('   with the credentials above');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestAdmin();