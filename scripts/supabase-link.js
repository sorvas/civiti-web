/**
 * Cross-platform script to link Supabase project.
 * Reads project ref from SUPABASE_PROJECT_REF environment variable.
 *
 * Usage:
 *   Set SUPABASE_PROJECT_REF in your environment or .env file, then:
 *   npm run supabase:link
 */
const { execSync } = require('child_process');

// Try to load from .env file if dotenv is available
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not required, env var can be set directly
}

const projectRef = process.env.SUPABASE_PROJECT_REF;

if (!projectRef) {
  console.error('Error: SUPABASE_PROJECT_REF environment variable is not set.');
  console.error('');
  console.error('Set it in one of these ways:');
  console.error('  1. Add SUPABASE_PROJECT_REF=your-ref to .env file');
  console.error('  2. Run directly: npx supabase link --project-ref your-ref');
  console.error('');
  console.error('Your project ref can be found in Supabase Dashboard → Project Settings → General');
  process.exit(1);
}

console.log(`Linking to Supabase project: ${projectRef}`);

try {
  execSync(`npx supabase link --project-ref ${projectRef}`, {
    stdio: 'inherit',
    shell: true
  });
} catch (error) {
  process.exit(error.status || 1);
}
