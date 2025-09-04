import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Direct Supabase connection for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('URL:', supabaseUrl ? 'Set' : 'Not set');
  console.error('Key:', supabaseAnonKey ? 'Set' : 'Not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignUp() {
  console.log('\n🧪 Testing Sign Up...');
  
  // Test customer signup
  const testEmail = `test_customer_${Date.now()}@example.com`;
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: 'TestPassword123!',
    options: {
      data: {
        first_name: 'Test',
        last_name: 'Customer',
        role: 'customer',
        full_name: 'Test Customer'
      }
    }
  });

  if (signUpError) {
    console.error('❌ Sign up failed:', signUpError.message);
    return false;
  }

  console.log('✅ Sign up successful:', signUpData.user?.email);
  
  // Check if profile was created
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', testEmail)
    .single();
    
  if (profile) {
    console.log('✅ Profile created:', profile);
  } else {
    console.error('❌ Profile not created');
  }
  
  // Check if user role was created
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', signUpData.user?.id)
    .single();
    
  if (userRole) {
    console.log('✅ User role created:', userRole);
  } else {
    console.error('❌ User role not created');
  }
  
  return true;
}

async function testSignIn() {
  console.log('\n🧪 Testing Sign In...');
  
  // Test super admin login
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'ivatlou@gmail.com',
    password: 'Admin123!'
  });

  if (signInError) {
    console.error('❌ Sign in failed:', signInError.message);
    return false;
  }

  console.log('✅ Sign in successful:', signInData.user?.email);
  
  // Get user role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', signInData.user?.id)
    .single();
    
  console.log('User role:', userRole?.role);
  
  // Sign out
  await supabase.auth.signOut();
  
  return true;
}

async function runTests() {
  console.log('🚀 Starting authentication tests...');
  console.log('Supabase URL:', supabaseUrl);
  
  // Test sign up
  const signUpSuccess = await testSignUp();
  
  // Test sign in
  const signInSuccess = await testSignIn();
  
  if (signUpSuccess && signInSuccess) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n❌ Some tests failed');
  }
}

runTests().catch(console.error);