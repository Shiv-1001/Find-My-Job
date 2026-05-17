const API_BASE = 'http://localhost:5000/api';

const getHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Authentication
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  register: async (payload) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Jobs
  getJobs: async (token) => {
    const res = await fetch(`${API_BASE}/jobs?limit=50`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    return res.json();
  },

  postJob: async (token, payload) => {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Applications
  submitApplication: async (token, payload) => {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  getApplications: async (token) => {
    const res = await fetch(`${API_BASE}/applications/my`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    return res.json();
  },

  // User Profile
  updateProfile: async (token, payload) => {
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
