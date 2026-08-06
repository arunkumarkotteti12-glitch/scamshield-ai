import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Localhost uses Express server port 5000; Vercel deployment uses native Vercel serverless functions ('')
const API_BASE_URL = isLocalhost ? 'http://localhost:5000' : '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject Supabase JWT access token into every outbound request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (err) {
      console.warn('Failed to retrieve session token for request:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Scan API Methods
 */
export const scanApi = {
  createScan: async (originalText, messageSource = 'other') => {
    const response = await apiClient.post('/api/scans', {
      originalText,
      messageSource
    });
    return response.data;
  },

  getScans: async () => {
    const response = await apiClient.get('/api/scans');
    return response.data;
  },

  getScanById: async (scanId) => {
    const response = await apiClient.get(`/api/scans/${scanId}`);
    return response.data;
  }
};
