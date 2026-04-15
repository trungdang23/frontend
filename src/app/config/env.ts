const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '';
const appEnv = import.meta.env.VITE_APP_ENV?.trim() || import.meta.env.MODE;

if (!apiBaseUrl) {
  throw new Error('Missing VITE_API_BASE_URL.');
}

export const env = {
  apiBaseUrl,
  appEnv,
};
