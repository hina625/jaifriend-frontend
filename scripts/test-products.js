const fetch = require('node-fetch');

async function testProducts() {
  try {
    console.log('🛍️ Testing Products Integration...\n');

    // Test 1: Check if backend is running
    console.log('1. Testing backend connection...');
    const healthCheck = await fetch('http://localhost:5000/api/products');
    if (healthCheck.ok) {
      console.log('✅ Backend is running');
    } else {
      console.log('❌ Backend is not responding');
      return;
    }

    // Test 2: Get all products
    console.log('\n2. Fetching products...');
    const productsResponse = await fetch('http://localhost:5000/api/products');
    const products = await productsResponse.json();
    
    console.log(`📊 Found ${products.length} products in database`);
    
    if (products.length > 0) {
      console.log('\n🛍️ Sample products:');
      products.slice(0, 3).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}: ${product.currency} ${product.price}`);
      });
    } else {
      console.log('⚠️  No products found. Run create-sample-products.js first.');
    }

    // Test 3: Check product structure
    if (products.length > 0) {
      console.log('\n3. Checking product structure...');
      const product = products[0];
      console.log('✅ Product structure:');
      console.log(`   - name: ${product.name}`);
      console.log(`   - price: ${product.price}`);
      console.log(`   - currency: ${product.currency}`);
      console.log(`   - imageUrl: ${product.imageUrl ? 'Available' : 'Not available'}`);
      console.log(`   - category: ${product.category}`);
    }

    console.log('\n🎉 Products test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the frontend: npm run dev');
    console.log('2. Visit: http://localhost:3000/dashboard');
    console.log('3. Look for "Latest Products" section in the feed');
    console.log('4. Products should display in a grid format');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend is running: cd my-express-app && npm start');
    console.log('2. Check if sample products exist: node create-sample-products.js');
    console.log('3. Verify MongoDB connection');
  }
}

testProducts(); 