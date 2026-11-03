const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const localApiUrl = `http://${window.location.hostname === '127.0.0.1' ? '127.0.0.1' : 'localhost'}:5050`;

// In production this must be the public HTTPS URL of the separately deployed API.
export const apiBaseUrl = (configuredApiUrl || (import.meta.env.DEV ? localApiUrl : ''))
  .replace(/\/+$/, '');

export function apiUrl(path) {
  if (!apiBaseUrl) {
    throw new Error('The API is not configured. Set VITE_API_URL in the frontend deployment settings.');
  }

  return `${apiBaseUrl}${path}`;
}
