// API Configuration based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://dj4haaiis0la7.cloudfront.net'
  : 'http://localhost:5000';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    AUTH: `${API_BASE_URL}/api/auth`,
    SUPPLIERS: `${API_BASE_URL}/api/suppliers`,
    CLIENTS: `${API_BASE_URL}/api/clients`,
    SELLERS: `${API_BASE_URL}/api/sellers`,
    REPORTS: `${API_BASE_URL}/api/reports`,
    EXPENSES: `${API_BASE_URL}/api/expenses`,
    OVERTIME: `${API_BASE_URL}/api/overtime`,
    FUTURE_ORDERS: `${API_BASE_URL}/api/future-orders`,
    RESINS: `${API_BASE_URL}/api/resins`,
    BILLING: `${API_BASE_URL}/api/billing`,
    PRODUCED_RESINS: `${API_BASE_URL}/api/produced-resins`,
    RAW_MATERIALS: `${API_BASE_URL}/api/raw-materials`,
  }
};

export default API_CONFIG;
