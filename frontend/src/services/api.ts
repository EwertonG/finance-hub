import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@FinanceHub:token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});