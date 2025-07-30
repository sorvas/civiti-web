const fs = require('fs');
const path = require('path');

// Simple script to inject API key after build
const googleMapsApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || '';

if (!googleMapsApiKey) {
  console.error('ERROR: VITE_GOOGLE_MAPS_API_KEY environment variable is not set!');
  console.error('Google Maps will not work without a valid API key.');
  process.exit(1);
}

console.log('Injecting Google Maps API key into dist files...');

// Function to recursively find index.html files
function findIndexFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findIndexFiles(filePath, fileList);
    } else if (file === 'index.html') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Search for index.html files in dist directory
const distDir = path.join(__dirname, '../dist');
console.log(`Searching for index.html files in: ${distDir}`);

const indexFiles = findIndexFiles(distDir);

if (indexFiles.length === 0) {
  // Try Vercel's output location
  const vercelDist = '/vercel/path0/dist';
  if (fs.existsSync(vercelDist)) {
    console.log(`Searching in Vercel dist: ${vercelDist}`);
    indexFiles.push(...findIndexFiles(vercelDist));
  }
}

console.log(`Found ${indexFiles.length} index.html file(s)`);

let injected = false;

indexFiles.forEach(indexPath => {
  console.log(`Processing: ${indexPath}`);
  
  let content = fs.readFileSync(indexPath, 'utf8');
  
  if (content.includes('YOUR_DEVELOPMENT_API_KEY')) {
    content = content.replace(/YOUR_DEVELOPMENT_API_KEY/g, googleMapsApiKey);
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log(`✓ API key injected into: ${indexPath}`);
    injected = true;
  } else {
    console.log(`  - Skipped (no placeholder found)`);
  }
});

if (!injected) {
  console.error('ERROR: Could not inject API key into any index.html files!');
  console.error('Either no files were found or no placeholders were present.');
  process.exit(1);
}

console.log('API key injection completed successfully!');