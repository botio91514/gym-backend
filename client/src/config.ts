export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://backend-na54.onrender.com' 
    : 'http://localhost:5000');

export const API_ENDPOINTS = {
  REGISTER: '/api/users/register',
  LOGIN: '/api/users/login',
  CHECK_EMAIL: '/api/users/check-email',
  UPLOAD_PHOTO: '/api/users/upload-photo',
  GET_USERS: '/api/users',
  UPDATE_USER: '/api/users',
  DELETE_USER: '/api/users',
  CHECK_SUBSCRIPTION: '/api/users/check-subscription'
}; 