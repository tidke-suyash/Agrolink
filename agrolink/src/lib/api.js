const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch wrapper that auto-attaches auth token and handles errors.
 */
async function request(endpoint, options = {}) {
  const { method = 'GET', body, headers: customHeaders = {}, token } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Attach auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Convenience methods
export const api = {
  get: (endpoint, token) => request(endpoint, { method: 'GET', token }),
  post: (endpoint, body, token) => request(endpoint, { method: 'POST', body, token }),
  put: (endpoint, body, token) => request(endpoint, { method: 'PUT', body, token }),
  delete: (endpoint, token) => request(endpoint, { method: 'DELETE', token }),
};

export default api;
