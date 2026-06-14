const host = (typeof window !== 'undefined') ? window.location.hostname : 'localhost';
const isLocal = host === 'localhost' || host === '127.0.0.1';
export const environment = {
  production: false,
  apiUrl: isLocal ? `http://${host}:8000/api` : 'https://trinalynus-rolesense-ai.hf.space/api',
};
