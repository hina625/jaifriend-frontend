const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Setting up Profile Pages with Backend...\n');

// Function to run commands
function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`📋 ${description}...`);
    exec(command, { cwd: path.join(__dirname, '../../my-express-app') }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`⚠️  Warning: ${stderr}`);
      }
      console.log(`✅ ${description} completed`);
      resolve(stdout);
    });
  });
}

async function setupProfiles() {
  try {
    // Step 1: Install backend dependencies
    await runCommand('npm install', 'Installing backend dependencies');
    
    // Step 2: Create sample users
    await runCommand('node create-sample-users.js', 'Creating sample users in database');
    
    // Step 3: Start the backend server
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the backend server: cd my-express-app && npm start');
    console.log('2. Start the frontend: cd my-app && npm run dev');
    console.log('3. Visit: http://localhost:3000/dashboard/profile/users');
    console.log('\n👥 Sample Users Created:');
    console.log('- Ahmed Khan (ahmed_khan) - Software Developer');
    console.log('- Fatima Ali (fatima_ali) - Digital Artist');
    console.log('- Hassan Raza (hassan_raza) - Fitness Trainer');
    console.log('- Ayesha Malik (ayesha_malik) - Fashion Designer');
    console.log('- Usman Ali (usman_ali) - Chef');
    console.log('- Sana Ahmed (sana_ahmed) - Travel Blogger');
    console.log('- Bilal Hassan (bilal_hassan) - Music Producer');
    console.log('\n🔑 Login with any user:');
    console.log('Email: [username]@email.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n🔧 Manual setup:');
    console.log('1. cd my-express-app');
    console.log('2. npm install');
    console.log('3. node create-sample-users.js');
    console.log('4. npm start');
  }
}

setupProfiles(); 