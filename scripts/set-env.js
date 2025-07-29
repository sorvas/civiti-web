const fs = require('fs');
const path = require('path');

// Get the Google Maps API key from environment variable
const googleMapsApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || '';

if (!googleMapsApiKey) {
  console.warn('Warning: VITE_GOOGLE_MAPS_API_KEY environment variable is not set');
  console.warn('Please set it in Vercel Dashboard for production deployment');
  process.exit(0); // Don't fail the build, just warn
}

// Update index.html with the API key
const indexPath = path.join(__dirname, '../src/index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Replace the placeholder with the actual API key
indexContent = indexContent.replace(
  'YOUR_DEVELOPMENT_API_KEY',
  googleMapsApiKey
);

fs.writeFileSync(indexPath, indexContent, 'utf8');

console.log('Google Maps API key injected into index.html');