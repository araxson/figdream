// Direct Supabase authentication test
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔧 Testing Direct Supabase Authentication');
console.log('URL:', supabaseUrl);
console.log('');

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testDirectAuth() {
  // Test 1: Try to sign in as super admin
  console.log('Test 1: Sign in as super admin');
  const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'ivatlou@gmail.com',
    password: 'Admin123!'
  });

  if (signInError) {
    console.error('❌ Super admin sign in failed:', signInError.message);
    console.error('Error details:', signInError);
  } else {
    console.log('✅ Super admin sign in successful!');
    console.log('User ID:', signIn.user?.id);
    console.log('Email:', signIn.user?.email);
    
    // Check profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', signIn.user?.id)
      .single();
    
    console.log('Profile:', profile);
    
    // Check role
    const { data: role } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', signIn.user?.id)
      .single();
    
    console.log('Role:', role);
    
    await supabase.auth.signOut();
  }

  console.log('');

  // Test 2: Create a new customer account
  console.log('Test 2: Create new customer account');
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        first_name: 'Test',
        last_name: 'User',
        role: 'customer',
        full_name: 'Test User'
      }
    }
  });

  if (signUpError) {
    console.error('❌ Customer sign up failed:', signUpError.message);
    console.error('Error details:', signUpError);
  } else {
    console.log('✅ Customer sign up successful!');
    console.log('User ID:', signUp.user?.id);
    console.log('Email:', signUp.user?.email);
    
    // Wait a moment for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if profile was created
    if (signUp.user?.id) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', signUp.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Profile not found:', profileError.message);
      } else {
        console.log('✅ Profile created:', profile);
      }
      
      // Check if role was created
      const { data: role, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', signUp.user.id)
        .single();
      
      if (roleError) {
        console.error('❌ Role not found:', roleError.message);
      } else {
        console.log('✅ Role created:', role);
      }
    }
  }
  
  console.log('');
  console.log('Tests complete!');
}

testDirectAuth().catch(console.error);