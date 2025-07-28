const fetch = require('node-fetch');

async function testAddresses() {
  try {
    console.log('🏠 Testing Addresses Backend Integration...\n');

    // Test 1: Check if backend is running
    console.log('1. Testing backend connection...');
    const healthCheck = await fetch('http://localhost:5000/api/health');
    if (healthCheck.ok) {
      console.log('✅ Backend is running');
    } else {
      console.log('❌ Backend is not responding');
      return;
    }

    // Test 2: Check if addresses endpoint exists
    console.log('\n2. Testing addresses endpoint...');
    const addressesCheck = await fetch('http://localhost:5000/api/addresses');
    if (addressesCheck.status === 401) {
      console.log('✅ Addresses endpoint exists (requires authentication)');
    } else if (addressesCheck.ok) {
      console.log('✅ Addresses endpoint is accessible');
    } else {
      console.log('❌ Addresses endpoint not found');
      return;
    }

    console.log('\n🎉 Addresses backend test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the frontend: npm run dev');
    console.log('2. Visit: http://localhost:3000/dashboard/settings/addresses');
    console.log('3. Try adding, editing, and deleting addresses');
    console.log('4. Check browser console for API calls');
    console.log('5. Verify data persists in database');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: cd my-express-app && npm start');
    console.log('2. Check if MongoDB is connected');
    console.log('3. Verify authentication is working');
    console.log('4. Check server logs for errors');
  }
}

testAddresses(); 