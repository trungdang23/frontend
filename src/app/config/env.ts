const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  (import.meta.env.MODE === 'test' ? 'https://api.buicojourney.com/api/v1' : '');
const appEnv = import.meta.env.VITE_APP_ENV?.trim() || 'development';

if (!apiBaseUrl) {
  throw new Error('Missing VITE_API_BASE_URL.');
}

export const env = {
  apiBaseUrl,
  appEnv,
};
