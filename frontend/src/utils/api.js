import axios from 'axios';

let apiUrl = import.meta.env.VITE_API_URL || '';
if (apiUrl) {
  apiUrl = apiUrl.trim().replace(/\/+$/, '');
}

// Create a pre-configured Axios client with credentials enabled for HTTP-only cookies
const api = axios.create({
  baseURL: apiUrl, // Points to Render backend in production, or uses Vite proxy in dev
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
