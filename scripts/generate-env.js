// Runs at Vercel build time. Writes env-config.js with the injected env vars.
// env-config.js is gitignored and regenerated on every deploy.
const fs = require('fs');
const path = require('path');

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_ANON_KEY || '';

if (!url || !key) {
  console.warn('[generate-env] SUPABASE_URL or SUPABASE_ANON_KEY not set — env-config.js will have empty values. Set them in Vercel project settings.');
}

const content = `window.__env__ = { SUPABASE_URL: "${url}", SUPABASE_ANON_KEY: "${key}" };\n`;

fs.writeFileSync(path.join(__dirname, '..', 'env-config.js'), content);
console.log('[generate-env] env-config.js written.');
