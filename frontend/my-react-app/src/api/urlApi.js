const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Shown in front of the custom alias input, e.g. "localhost:5000/"
export const SHORT_DOMAIN = new URL(API_URL).host;

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error("Can't reach the server. Is the backend running?");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }
  return data;
}

export function shortenUrl({ originalUrl, customAlias, expirationDate }) {
  const body = { originalUrl };
  if (customAlias) body.customAlias = customAlias;
  if (expirationDate) body.expirationDate = expirationDate;

  return request('/api/url/shorten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
