const fs = require('fs');
const path = require('path');

// Function to recursively find all .tsx files
function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to update URLs in a file
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace the incorrect backend URL with the correct one
    content = content.replace(/jaifriend-bacnd-production\.up\.railway\.app/g, 'jaifriend-backend-production.up.railway.app');
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🔍 Finding all .tsx files...');
const tsxFiles = findTsxFiles('./src');
console.log(`📁 Found ${tsxFiles.length} .tsx files`);

console.log('\n🔄 Updating backend URLs...');
let updatedCount = 0;

tsxFiles.forEach(filePath => {
  if (updateFile(filePath)) {
    updatedCount++;
  }
});

console.log(`\n✨ Update complete! Updated ${updatedCount} out of ${tsxFiles.length} files.`);
console.log('🔗 All backend URLs have been changed from "bacnd" to "backend".');
