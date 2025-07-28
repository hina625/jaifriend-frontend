const fetch = require('node-fetch');

async function testAvatarBackend() {
  try {
    console.log('🖼️ Testing Avatar/Cover Backend Integration...\n');

    // Test 1: Check if backend is running
    console.log('1. Testing backend connection...');
    const healthCheck = await fetch('http://localhost:5000/api/health');
    if (healthCheck.ok) {
      console.log('✅ Backend is running');
    } else {
      console.log('❌ Backend is not responding');
      return;
    }

    // Test 2: Check if userimages endpoint exists
    console.log('\n2. Testing userimages endpoint...');
    const userImagesCheck = await fetch('http://localhost:5000/api/userimages');
    if (userImagesCheck.status === 401) {
      console.log('✅ UserImages endpoint exists (requires authentication)');
    } else if (userImagesCheck.ok) {
      console.log('✅ UserImages endpoint is accessible');
    } else {
      console.log('❌ UserImages endpoint not found');
      return;
    }

    // Test 3: Check if uploads directory exists
    console.log('\n3. Testing uploads directory...');
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, '..', '..', 'my-express-app', 'uploads');
    
    if (fs.existsSync(uploadsDir)) {
      console.log('✅ Uploads directory exists');
    } else {
      console.log('⚠️ Uploads directory not found, creating...');
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Uploads directory created');
    }

    console.log('\n🎉 Avatar/Cover backend test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the frontend: npm run dev');
    console.log('2. Visit: http://localhost:3000/dashboard/settings/avatar');
    console.log('3. Try uploading avatar and cover images');
    console.log('4. Check browser console for API calls');
    console.log('5. Verify images are saved in database and uploads folder');
    console.log('6. Check that images persist after page refresh');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: cd my-express-app && npm start');
    console.log('2. Check if MongoDB is connected');
    console.log('3. Verify authentication is working');
    console.log('4. Check server logs for errors');
    console.log('5. Ensure uploads directory has write permissions');
  }
}

testAvatarBackend(); 