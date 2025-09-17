// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const API_ENDPOINTS = {
  analyze: `${API_BASE_URL}/analyze`
};

export default API_BASE_URL;