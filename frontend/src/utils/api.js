import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('rc_refresh');
      if (refresh) {
        try {
          const res = await axios.post(`${API_URL}/users/token/refresh/`, { refresh });
          localStorage.setItem('rc_token', res.data.access);
          original.headers.Authorization = `Bearer ${res.data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem('rc_token');
          localStorage.removeItem('rc_refresh');
          localStorage.removeItem('rc_account');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
