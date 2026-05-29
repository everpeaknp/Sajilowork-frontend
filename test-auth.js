/**
 * Test Authentication API
 * 
 * Run with: node test-auth.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testAuth() {
  console.log('🧪 Testing Authentication API...\n');

  // Test 1: Check if backend is running
  console.log('1️⃣ Testing backend connectivity...');
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/token/verify/`, {
      validateStatus: () => true // Accept any status
    });
    console.log('✅ Backend is running');
    console.log(`   Status: ${response.status}`);
  } catch (error) {
    console.log('❌ Backend is not running or not accessible');
    console.log(`   Error: ${error.message}`);
    console.log('\n💡 Make sure Django server is running: python manage.py runserver');
    return;
  }

  // Test 2: Test login with test credentials
  console.log('\n2️⃣ Testing login endpoint...');
  try {
    const loginData = {
      email: 'test@example.com',
      password: 'testpassword123'
    };

    const response = await axios.post(
      `${API_BASE_URL}/auth/login/`,
      loginData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: () => true
      }
    );

    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.access) {
      console.log('✅ Login endpoint is working');
      console.log(`   Access Token: ${response.data.access.substring(0, 20)}...`);
      console.log(`   User: ${response.data.user?.email || 'N/A'}`);
    } else if (response.status === 401) {
      console.log('⚠️  Login endpoint is working but credentials are invalid');
      console.log('   This is expected if test user doesn\'t exist');
    } else {
      console.log('❌ Unexpected response from login endpoint');
    }
  } catch (error) {
    console.log('❌ Error testing login endpoint');
    console.log(`   Error: ${error.message}`);
  }

  // Test 3: Check CORS configuration
  console.log('\n3️⃣ Testing CORS configuration...');
  try {
    const response = await axios.options(`${API_BASE_URL}/auth/login/`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST'
      },
      validateStatus: () => true
    });

    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
    };

    console.log('   CORS Headers:', corsHeaders);

    if (corsHeaders['Access-Control-Allow-Origin']) {
      console.log('✅ CORS is configured');
    } else {
      console.log('⚠️  CORS might not be configured properly');
    }
  } catch (error) {
    console.log('⚠️  Could not test CORS');
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n✨ Test complete!\n');
  console.log('📝 Next steps:');
  console.log('   1. Create a test user in Django admin or via registration');
  console.log('   2. Update test credentials in this script');
  console.log('   3. Test login from frontend at http://localhost:3000/signin');
}

testAuth().catch(console.error);
