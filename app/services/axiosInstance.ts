import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

let authToken:any = null;
let pluginSecretKey:any = null;
// Create axios instance with default configuration
export const setAuthToken = (token) => {
  authToken = token;
};

export const setPluginSecretKey = (key) => {
  pluginSecretKey = key;
};
const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'https://william-muciferous-elenor.ngrok-free.app/api/plugin/ark-ai/',
  timeout: 50000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'authorization': 'Bearer lplojpfcmf'
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Add authorization token (JWT) if available
    if (authToken) {
      config.headers['ark-plugin-jwt-key'] = authToken;
    }
    // Add plugin secret key (API key) if available
    if (pluginSecretKey) {
      config.headers['ark-plugin-api-key'] = pluginSecretKey;
    }

    // Add request timestamp for debugging
    config.headers['X-Request-Time'] = new Date().toISOString();

    // Log request for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Log successful response for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Handle common errors
    if (error.response) {
      const { status, data, config } = error.response;

      // Log error details for debugging
      console.error('API Error:', {
        status,
        url: config?.url,
        message: error.message,
        data,
      });

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken');
          // You might want to redirect to login page here
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.warn('Access forbidden:', config?.url);
          break;
        case 404:
          // Not found
          console.warn('Resource not found:', config?.url);
          break;
        case 500:
          // Server error
          console.error('Server error occurred');
          break;
        default:
          console.error('HTTP Error:', status, data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - no response received:', error.message);
    } else {
      // Other error
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default axiosInstance;

// Convenience methods for common HTTP operations
export const apiClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.get<T>(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.post<T>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.put<T>(url, data, config),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.patch<T>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.delete<T>(url, config),

  head: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.head<T>(url, config),

  options: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    axiosInstance.options<T>(url, config),

  // Raw axios instance for advanced usage
  instance: axiosInstance,
};
