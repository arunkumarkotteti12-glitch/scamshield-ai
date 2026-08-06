import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// When hosted on Vercel, relative path '' uses Vercel Serverless Function directly for <1s latency
const DEFAULT_API_URL = isLocalhost ? 'http://localhost:5000' : '';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined ? import.meta.env.VITE_API_BASE_URL : DEFAULT_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s timeout to gracefully support cold starts
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
