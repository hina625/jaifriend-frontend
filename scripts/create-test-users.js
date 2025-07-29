const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testUsers = [
  {
    name: 'Hina Sadaf',
    username: 'hina_sadaf',
    email: 'hina@example.com',
    password: 'password123',
    bio: 'BSCS 2nd Year Student - Passionate about technology and coding!'
  },
  {
    name: 'Ahmed Khan',
    username: 'ahmed_khan',
    email: 'ahmed@example.com',
    password: 'password123',
    bio: 'Software Developer | Coffee Lover | Tech Enthusiast'
  },
  {
    name: 'Fatima Ali',
    username: 'fatima_ali',
    email: 'fatima@example.com',
    password: 'password123',
    bio: 'UI/UX Designer | Creative Mind | Art Lover'
  },
  {
    name: 'Hassan Raza',
    username: 'hassan_raza',
    email: 'hassan@example.com',
    password: 'password123',
    bio: 'Full Stack Developer | Problem Solver | Team Player'
  },
  {
    name: 'Ayesha Malik',
    username: 'ayesha_malik',
    email: 'ayesha@example.com',
    password: 'password123',
    bio: 'Data Scientist | AI Enthusiast | Research Lover'
  }
];

async function createTestUsers() {
  console.log('Creating test users...\n');
  
  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.name} (${user.username})`);
      
      const response = await axios.post(`${API_URL}/auth/register`, user);
      
      console.log(`✅ ${user.name} created successfully!`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Token: ${response.data.token}\n`);
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message === 'User already exists') {
        console.log(`ℹ️ ${user.name} already exists`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Password: ${user.password}\n`);
      } else {
        console.error(`❌ Error creating ${user.name}:`, error.response?.data?.message || error.message);
      }
    }
  }
  
  console.log('🎉 Test users setup complete!');
  console.log('\n📋 Login Credentials:');
  testUsers.forEach(user => {
    console.log(`   ${user.name}: ${user.username} / ${user.password}`);
  });
  console.log('\n🔗 Profile URLs:');
  testUsers.forEach(user => {
    console.log(`   ${user.name}: /dashboard/profile/${user.username}`);
  });
}

createTestUsers(); 