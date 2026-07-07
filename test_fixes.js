// Test script to verify all fixes
import { supabase, supabaseAdmin } from './src/lib/supabaseClient.ts';
import { registerUser } from './src/services/authService.ts';

async function testFixes() {
  console.log('Testing authentication fixes...');
  
  try {
    // Test 1: Check if Supabase clients are configured correctly
    console.log('1. Testing Supabase client configuration...');
    
    // Test regular client
    const { data: regularData, error: regularError } = await supabase
      .from('end_users')
      .select('*')
      .limit(1);
    
    if (regularError) {
      console.log('Regular client error:', regularError.message);
      if (regularError.code === '406') {
        console.log('❌ Still getting 406 error with regular client');
      }
    } else {
      console.log('✅ Regular Supabase client works');
    }
    
    // Test admin client
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('end_users')
      .select('*')
      .limit(1);
    
    if (adminError) {
      console.log('Admin client error:', adminError.message);
    } else {
      console.log('✅ Admin Supabase client works');
    }
    
    // Test 2: Test user registration with proper email
    console.log('\n2. Testing user registration with valid email...');
    const testEmail = `test-${Date.now()}@gmail.com`;
    
    const registerResult = await registerUser({
      first_name: 'Test',
      last_name: 'User',
      email: testEmail,
      password: 'TestPassword123!',
      confirm_password: 'TestPassword123!',
      terms_accepted: true
    });
    
    if (registerResult.success) {
      console.log('✅ User registration successful:', registerResult.user?.id);
    } else {
      console.log('❌ Registration failed:', registerResult.error);
      if (registerResult.error?.includes('406')) {
        console.log('Still getting 406 error during registration');
      }
      if (registerResult.error?.includes('invalid')) {
        console.log('Email validation issue');
      }
    }
    
    // Test 3: Test RLS policies
    console.log('\n3. Testing RLS policies...');
    
    // Try to insert with regular client (should fail due to RLS)
    const { error: regularInsertError } = await supabase
      .from('end_users')
      .insert([{
        email: `rls-test-${Date.now()}@example.com`,
        password_hash: 'test',
        is_verified: false,
        is_active: true
      }]);
      
    if (regularInsertError) {
      console.log('✅ Regular client insert blocked by RLS (expected)');
    } else {
      console.log('❌ Regular client insert succeeded (RLS not working)');
    }
    
    // Try to insert with admin client (should succeed)
    const { error: adminInsertError } = await supabaseAdmin
      .from('end_users')
      .insert([{
        email: `admin-test-${Date.now()}@example.com`,
        password_hash: 'test',
        is_verified: false,
        is_active: true
      }]);
      
    if (adminInsertError) {
      console.log('❌ Admin client insert failed:', adminInsertError.message);
    } else {
      console.log('✅ Admin client insert succeeded (RLS bypass working)');
    }
    
  } catch (error) {
    console.error('Test failed with exception:', error);
  }
  
  console.log('\nAll tests completed.');
}

testFixes();