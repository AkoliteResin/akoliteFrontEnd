import axios from 'axios';

// Single point for backend URL configuration
// Use HTTPS for production (required for GitHub Pages)
// Development: http://localhost:5000
// Production: https://dj4haaiis0la7.cloudfront.net
const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? (process.env.REACT_APP_BACKEND_URL || 'https://dj4haaiis0la7.cloudfront.net')
  : (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000');

// Create an axios instance with authorization header
const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  // Allow self-signed certificates in development
  httpsAgent: {
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
});

// Add token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses - redirect to login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Centralized API endpoints configuration
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    VERIFY_OTP: '/api/auth/verify-otp',
    LOGOUT: '/api/auth/logout',
  },
  // Clients endpoints
  CLIENTS: {
    GET_ALL: '/api/clients',
    GET_ONE: '/api/clients/:id',
    CREATE: '/api/clients',
    UPDATE: '/api/clients/:id',
    DELETE: '/api/clients/:id',
  },
  // Orders endpoints
  ORDERS: {
    GET_ALL: '/api/orders',
    GET_ONE: '/api/orders/:id',
    CREATE: '/api/orders',
    UPDATE: '/api/orders/:id',
    DELETE: '/api/orders/:id',
  },
  // Produced Resins endpoints
  PRODUCED_RESINS: {
    GET_ALL: '/api/produced-resins',
    GET_ONE: '/api/produced-resins/:id',
    CREATE: '/api/produced-resins',
    UPDATE: '/api/produced-resins/:id',
    DELETE: '/api/produced-resins/:id',
  },
  // Resins endpoints
  RESINS: {
    GET_ALL: '/api/resins',
    CREATE: '/api/resins',
    UPDATE: '/api/resins/:id',
    DELETE: '/api/resins/:id',
  },
  // Raw Materials endpoints
  RAW_MATERIALS: {
    GET_ALL: '/api/raw-materials',
    ADD: '/api/raw-materials/add',
    MODIFY: '/api/raw-materials/modify',
    DELETE: '/api/raw-materials/:id',
  },
  // Suppliers endpoints
  SUPPLIERS: {
    GET_ALL: '/api/suppliers',
    CREATE: '/api/suppliers',
    UPDATE: '/api/suppliers/:id',
    DELETE: '/api/suppliers/:id',
  },
  // Sellers endpoints
  SELLERS: {
    GET_ALL: '/api/sellers',
    CREATE: '/api/sellers',
    UPDATE: '/api/sellers/:id',
    DELETE: '/api/sellers/:id',
  },
  // Billing endpoints
  BILLING: {
    GET_ALL: '/api/billing',
    CREATE: '/api/billing',
    UPDATE: '/api/billing/:id',
  },
  // Reports endpoints
  REPORTS: {
    LOCATION_ORDERS: '/api/reports/location-orders',
    PURCHASE: '/api/reports/purchase',
    SALES: '/api/reports/sales',
  },
  // Expenses endpoints
  EXPENSES: {
    GET_ALL: '/api/expenses',
    CREATE: '/api/expenses',
    UPDATE: '/api/expenses/:id',
    DELETE: '/api/expenses/:id',
  },
  // Overtime endpoints
  OVERTIME: {
    GET_ALL: '/api/overtime',
    CREATE: '/api/overtime',
    UPDATE: '/api/overtime/:id',
    DELETE: '/api/overtime/:id',
  },
};

export { BACKEND_URL };
export default axiosInstance;
