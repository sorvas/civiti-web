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

// Possible locations for the built index.html
const distPaths = [
  path.join(__dirname, '../dist/Civica/browser/index.html'),
  path.join(__dirname, '../dist/Civica/index.html'),
  path.join(__dirname, '../dist/index.html')
];

let found = false;

for (const distPath of distPaths) {
  if (fs.existsSync(distPath)) {
    console.log(`Found index.html at: ${distPath}`);
    
    let content = fs.readFileSync(distPath, 'utf8');
    
    if (content.includes('YOUR_DEVELOPMENT_API_KEY')) {
      content = content.replace(/YOUR_DEVELOPMENT_API_KEY/g, googleMapsApiKey);
      fs.writeFileSync(distPath, content, 'utf8');
      console.log(`✓ API key injected successfully`);
      found = true;
    } else {
      console.log('API key already present or placeholder not found');
    }
  }
}

if (!found) {
  console.error('ERROR: Could not find any dist/index.html files!');
  console.error('Make sure the Angular build completed successfully.');
  process.exit(1);
}