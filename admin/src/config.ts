export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  USERS: '/api/users',
  PAYMENTS: '/api/payments',
  LOGIN: '/api/auth/login',
  CHECK_EMAIL: '/api/users/check-email',
}; 