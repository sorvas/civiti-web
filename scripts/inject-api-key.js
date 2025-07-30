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
console.log('Current working directory:', process.cwd());
console.log('Script directory:', __dirname);
console.log('Node version:', process.version);

// Debug: Check if we're in Vercel
if (process.env.VERCEL) {
  console.log('Running in Vercel environment');
  console.log('VERCEL_URL:', process.env.VERCEL_URL);
}

// Function to recursively find index.html files
function findIndexFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  try {
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
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }
  
  return fileList;
}

// List of possible dist directories to check
const possibleDistDirs = [
  // Current working directory paths
  path.join(process.cwd(), 'dist'),
  path.join(process.cwd(), 'dist/Civica'),
  path.join(process.cwd(), 'dist/Civica/browser'),
  path.join(process.cwd(), 'dist/browser'),
  // Relative to script location
  path.join(__dirname, '../dist'),
  path.join(__dirname, '../dist/Civica'),
  path.join(__dirname, '../dist/Civica/browser'),
  path.join(__dirname, '../dist/browser'),
  // Vercel specific paths
  '/vercel/path0/dist',
  '/vercel/path0/dist/Civica',
  '/vercel/path0/dist/Civica/browser',
  '/vercel/path0/dist/browser',
  // Additional Vercel paths
  './dist',
  './dist/Civica',
  './dist/Civica/browser',
  './dist/browser'
];

let indexFiles = [];

// Search each possible directory
for (const dir of possibleDistDirs) {
  console.log(`Checking directory: ${dir}`);
  if (fs.existsSync(dir)) {
    console.log(`  - Directory exists`);
    const found = findIndexFiles(dir);
    if (found.length > 0) {
      console.log(`  - Found ${found.length} index.html file(s)`);
      indexFiles.push(...found);
    }
  } else {
    console.log(`  - Directory not found`);
  }
}

// Remove duplicates
indexFiles = [...new Set(indexFiles)];

console.log(`\nTotal unique index.html files found: ${indexFiles.length}`);

if (indexFiles.length === 0) {
  console.error('\nERROR: No index.html files found!');
  console.error('Build output structure:');
  
  // Try to show what's in the dist directory
  const distDir = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distDir)) {
    console.error(`Contents of ${distDir}:`);
    try {
      const showDirContents = (dir, indent = '') => {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const itemPath = path.join(dir, item);
          const isDir = fs.statSync(itemPath).isDirectory();
          console.error(`${indent}${isDir ? '[DIR]' : ''} ${item}`);
          if (isDir && indent.length < 6) { // Limit depth
            showDirContents(itemPath, indent + '  ');
          }
        });
      };
      showDirContents(distDir);
    } catch (err) {
      console.error('Could not read directory structure:', err.message);
    }
  }
  
  process.exit(1);
}

let injected = false;

indexFiles.forEach(indexPath => {
  console.log(`\nProcessing: ${indexPath}`);
  
  try {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    if (content.includes('YOUR_DEVELOPMENT_API_KEY')) {
      content = content.replace(/YOUR_DEVELOPMENT_API_KEY/g, googleMapsApiKey);
      fs.writeFileSync(indexPath, content, 'utf8');
      console.log(`✓ API key injected successfully`);
      injected = true;
    } else {
      console.log(`  - Skipped (no placeholder found)`);
    }
  } catch (err) {
    console.error(`  - Error processing file: ${err.message}`);
  }
});

if (!injected) {
  console.error('\nERROR: Could not inject API key into any index.html files!');
  console.error('Either no files were found or no placeholders were present.');
  process.exit(1);
}

console.log('\nAPI key injection completed successfully!');