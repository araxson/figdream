#!/usr/bin/env node

import fetch from 'node-fetch';

const SUPABASE_URL = 'https://hlwlbighcjnmgoulvkog.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsd2xiaWdoY2pubWdvdWx2a29nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg5MTcxNywiZXhwIjoyMDcxNDY3NzE3fQ.GRIuTVl-_BegdSiHU6kxEpmFRUTksOkcAmH_Rt17Kcs';

async function resetAdminPassword() {
  console.log('🔧 Resetting admin password...\n');

  try {
    // First, get the existing user
    console.log('🔍 Finding existing user...');
    const getUserResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=ivatlou@gmail.com`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!getUserResponse.ok) {
      throw new Error('Failed to find user');
    }

    const usersData = await getUserResponse.json();
    
    if (!usersData.users || usersData.users.length === 0) {
      console.log('❌ User not found. Creating new user...');
      
      // Create new user
      const createResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
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
          }
        })
      });

      if (!createResponse.ok) {
        const error = await createResponse.text();
        throw new Error(`Failed to create user: ${error}`);
      }

      const newUser = await createResponse.json();
      console.log('✅ New user created with ID:', newUser.id);
      
    } else {
      const userId = usersData.users[0].id;
      console.log('✅ User found with ID:', userId);
      
      // Update the password
      console.log('🔑 Updating password...');
      const updateResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: 'Aliahmadi-1377',
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            first_name: 'Afshin',
            last_name: 'Ahmadi Ivatlou',
            full_name: 'Afshin Ahmadi Ivatlou',
            role: 'super_admin'
          }
        })
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.text();
        throw new Error(`Failed to update password: ${error}`);
      }

      console.log('✅ Password updated successfully');
    }

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
      console.log('⚠️  Login test failed:', error);
      console.log('Note: Password has been updated but login might need a moment to propagate');
    } else {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful!');
      console.log('   Access token:', loginData.access_token.substring(0, 20) + '...');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ PASSWORD RESET COMPLETE!');
    console.log('='.repeat(50));
    console.log('📧 Email: ivatlou@gmail.com');
    console.log('🔑 Password: Aliahmadi-1377');
    console.log('='.repeat(50));
    console.log('\n✨ You can now login at: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();