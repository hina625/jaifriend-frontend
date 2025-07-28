const fetch = require('node-fetch');

async function testProfileFix() {
  try {
    console.log('🔧 Testing Profile Fix...\n');

    // Test 1: Check if backend is running
    console.log('1. Testing backend connection...');
    const healthCheck = await fetch('http://localhost:5000/api/posts');
    if (healthCheck.ok) {
      console.log('✅ Backend is running');
    } else {
      console.log('❌ Backend is not responding');
      return;
    }

    // Test 2: Get a sample user
    console.log('\n2. Testing user data structure...');
    const searchResponse = await fetch('http://localhost:5000/api/users/search?q=ahmed_khan');
    if (searchResponse.ok) {
      const users = await searchResponse.json();
      const user = users.find(u => u.username === 'ahmed_khan');
      
      if (user) {
        console.log('✅ Found user:', user.name);
        console.log('📊 User data structure:');
        console.log(`   - followers: ${typeof user.followers} (${user.followers})`);
        console.log(`   - following: ${typeof user.following} (${user.following})`);
        console.log(`   - followersList: ${Array.isArray(user.followersList) ? 'Array' : typeof user.followersList} (${user.followersList?.length || 0} items)`);
        console.log(`   - followingList: ${Array.isArray(user.followingList) ? 'Array' : typeof user.followingList} (${user.followingList?.length || 0} items)`);
        
        // Test 3: Check if followersList is an array
        if (Array.isArray(user.followersList)) {
          console.log('✅ followersList is an array - Profile fix should work!');
        } else {
          console.log('❌ followersList is not an array - Need to fix backend');
        }
      } else {
        console.log('❌ User not found');
      }
    }

    console.log('\n🎉 Profile fix test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the frontend: npm run dev');
    console.log('2. Visit: http://localhost:3000/dashboard/profile/users');
    console.log('3. Click on any user profile');
    console.log('4. Navigate to the "Friends" tab');
    console.log('5. Should not show any errors');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: cd my-express-app && npm start');
    console.log('2. Check if sample users exist: node create-sample-users.js');
    console.log('3. Verify MongoDB connection');
  }
}

testProfileFix(); 