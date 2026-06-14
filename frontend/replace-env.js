/**
 * Injects BACKEND_URL from the Vercel environment variable into
 * environment.prod.ts before the Angular build runs.
 *
 * Usage: set BACKEND_URL=https://your-docker-backend.com in Vercel env vars.
 */
const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');
const backendUrl = process.env.BACKEND_URL || 'https://trinalynus-rolesense-ai.hf.space';

const content = `export const environment = {
  production: true,
  apiUrl: '${backendUrl}/api',
};
`;

fs.writeFileSync(envFile, content);
console.log(`[replace-env] apiUrl set to: ${backendUrl}/api`);
