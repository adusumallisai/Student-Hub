/**
 * api/client.js
 * Central axios instance: attaches the JWT to every request and redirects
 * to /login on 401 so components don't each need to handle auth errors.
 */
import axios from 'axios';

const client = axios.create({ baseURL: '/api' });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('sh_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('sh_token');
      localStorage.removeItem('sh_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;
