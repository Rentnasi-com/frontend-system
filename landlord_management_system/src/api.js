import axios from 'axios';
import store from './store/store';

const api = axios.create({
  baseURL: 'http://property.rentnasi.com/api',
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
