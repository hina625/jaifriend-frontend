const fetch = require('node-fetch');

async function testFeed() {
  try {
    console.log('🧪 Testing Feed Integration...\n');

    // Test 1: Check if backend is running
    console.log('1. Testing backend connection...');
    const healthCheck = await fetch('http://localhost:5000/api/posts');
    if (healthCheck.ok) {
      console.log('✅ Backend is running');
    } else {
      console.log('❌ Backend is not responding');
      return;
    }

    // Test 2: Get all posts
    console.log('\n2. Fetching all posts...');
    const postsResponse = await fetch('http://localhost:5000/api/posts');
    const posts = await postsResponse.json();
    
    console.log(`📊 Found ${posts.length} posts in database`);
    
    if (posts.length > 0) {
      console.log('\n📝 Sample posts:');
      posts.slice(0, 3).forEach((post, index) => {
        console.log(`${index + 1}. ${post.user?.name || 'Unknown User'}: ${post.content.substring(0, 50)}...`);
      });
    } else {
      console.log('⚠️  No posts found. Run create-sample-users.js first.');
    }

    // Test 3: Check specific users
    console.log('\n3. Checking for sample users...');
    const usernames = ['ahmed_khan', 'fatima_ali', 'hassan_raza', 'ayesha_malik', 'usman_ali', 'sana_ahmed', 'bilal_hassan'];
    
    for (const username of usernames) {
      const userResponse = await fetch(`http://localhost:5000/api/users/search?q=${username}`);
      if (userResponse.ok) {
        const users = await userResponse.json();
        const user = users.find(u => u.username === username);
        if (user) {
          console.log(`✅ Found user: ${user.name} (@${user.username})`);
        } else {
          console.log(`❌ User not found: ${username}`);
        }
      }
    }

    console.log('\n🎉 Feed test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure you have sample users: node create-sample-users.js');
    console.log('2. Start the frontend: npm run dev');
    console.log('3. Visit: http://localhost:3000/dashboard');
    console.log('4. Check if profile posts appear in the feed');
    console.log('5. Click on user names/avatars to navigate to profiles');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: cd my-express-app && npm start');
    console.log('2. Check MongoDB connection');
    console.log('3. Run create-sample-users.js to create test data');
  }
}

testFeed(); 