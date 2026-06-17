import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('myday_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('myday_token');
      localStorage.removeItem('myday_user');
      if (!window.location.pathname.startsWith('/sign')) {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
