const fetch = require('node-fetch');

async function testProfileNavigation() {
  try {
    console.log('🧭 Testing Profile Navigation...\n');

    // Test 1: Check if backend is running
    console.log('1. Testing backend connection...');
    const healthCheck = await fetch('http://localhost:5000/api/users/suggested');
    if (healthCheck.ok) {
      console.log('✅ Backend is running');
    } else {
      console.log('❌ Backend is not responding');
      return;
    }

    // Test 2: Get suggested users
    console.log('\n2. Fetching suggested users...');
    const usersResponse = await fetch('http://localhost:5000/api/users/suggested');
    const users = await usersResponse.json();
    
    console.log(`📊 Found ${users.length} users in database`);
    
    if (users.length > 0) {
      console.log('\n👥 Sample users:');
      users.slice(0, 3).forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.username}) - ID: ${user.id || user._id}`);
      });

      // Test 3: Test individual user profile
      const testUser = users[0];
      if (testUser) {
        console.log(`\n3. Testing user profile for: ${testUser.name}`);
        const profileResponse = await fetch(`http://localhost:5000/api/users/${testUser.id || testUser._id}`);
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('✅ User profile API working:');
          console.log(`   - Name: ${profileData.name}`);
          console.log(`   - Username: ${profileData.username}`);
          console.log(`   - Followers: ${profileData.followers}`);
          console.log(`   - Posts: ${profileData.posts}`);
        } else {
          console.log('❌ User profile API failed');
        }
      }
    } else {
      console.log('⚠️  No users found. Run create-sample-users.js first.');
    }

    console.log('\n🎉 Profile navigation test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the frontend: npm run dev');
    console.log('2. Visit: http://localhost:3000/dashboard/profile/users');
    console.log('3. Click on any user to go to their profile');
    console.log('4. Profile should load with user data and posts');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: cd my-express-app && npm start');
    console.log('2. Check if sample users exist: node create-sample-users.js');
    console.log('3. Verify MongoDB connection');
    console.log('4. Check browser console for errors');
  }
}

testProfileNavigation(); 