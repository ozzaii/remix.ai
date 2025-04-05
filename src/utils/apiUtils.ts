// API request optimization and error handling utilities

import { TokenManager } from './securityUtils';
import { Cache, debounce, throttle } from './performanceUtils';

// Configurable API client with retry logic, caching, and error handling
export class APIClient {
  private static instance: APIClient;
  private baseUrl: string;
  private cache: Cache<any>;
  private defaultHeaders: Record<string, string>;
  private maxRetries: number;
  private retryDelay: number;
  
  private constructor() {
    this.baseUrl = '';
    this.cache = new Cache<any>(5 * 60 * 1000); // 5 minute default cache
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }
  
  static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    
    return APIClient.instance;
  }
  
  // Configure the API client
  configure(config: {
    baseUrl: string;
    defaultHeaders?: Record<string, string>;
    maxRetries?: number;
    retryDelay?: number;
    cacheTTL?: number;
  }): void {
    this.baseUrl = config.baseUrl;
    
    if (config.defaultHeaders) {
      this.defaultHeaders = {
        ...this.defaultHeaders,
        ...config.defaultHeaders,
      };
    }
    
    if (config.maxRetries !== undefined) {
      this.maxRetries = config.maxRetries;
    }
    
    if (config.retryDelay !== undefined) {
      this.retryDelay = config.retryDelay;
    }
    
    if (config.cacheTTL !== undefined) {
      this.cache = new Cache<any>(config.cacheTTL);
    }
  }
  
  // Make a request with automatic retry, caching, and auth token handling
  async request<T>(options: {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: any;
    headers?: Record<string, string>;
    useCache?: boolean;
    cacheTTL?: number;
    useAuth?: boolean;
    retries?: number;
  }): Promise<T> {
    const {
      endpoint,
      method,
      data,
      headers = {},
      useCache = method === 'GET',
      cacheTTL,
      useAuth = true,
      retries = this.maxRetries,
    } = options;
    
    // Build URL
    const url = `${this.baseUrl}${endpoint}`;
    
    // Check cache for GET requests
    const cacheKey = useCache ? `${method}:${url}:${JSON.stringify(data)}` : '';
    if (useCache && method === 'GET') {
      const cachedResponse = this.cache.get(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Prepare headers
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };
    
    // Add auth token if needed
    if (useAuth) {
      const token = TokenManager.getInstance().getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : undefined,
    };
    
    try {
      // Make the request
      const response = await this.fetchWithRetry(url, requestOptions, retries);
      
      // Check if response is ok
      if (!response.ok) {
        throw new APIError(
          `API request failed with status ${response.status}`,
          response.status,
          await response.text()
        );
      }
      
      // Parse response
      const responseData = await response.json();
      
      // Cache successful GET responses
      if (useCache && method === 'GET') {
        this.cache.set(cacheKey, responseData, cacheTTL);
      }
      
      return responseData;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      throw new APIError(
        `API request failed: ${error instanceof Error ? error.message : String(error)}`,
        0,
        String(error)
      );
    }
  }
  
  // Fetch with automatic retry
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retriesLeft: number,
    delay: number = this.retryDelay
  ): Promise<Response> {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (retriesLeft <= 0) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff
      const nextDelay = delay * 2;
      
      // Retry the request
      return this.fetchWithRetry(url, options, retriesLeft - 1, nextDelay);
    }
  }
  
  // Convenience methods
  async get<T>(endpoint: string, options: Omit<Parameters<typeof this.request>[0], 'endpoint' | 'method'> = {}): Promise<T> {
    return this.request<T>({
      endpoint,
      method: 'GET',
      ...options,
    });
  }
  
  async post<T>(endpoint: string, data: any, options: Omit<Parameters<typeof this.request>[0], 'endpoint' | 'method' | 'data'> = {}): Promise<T> {
    return this.request<T>({
      endpoint,
      method: 'POST',
      data,
      ...options,
    });
  }
  
  async put<T>(endpoint: string, data: any, options: Omit<Parameters<typeof this.request>[0], 'endpoint' | 'method' | 'data'> = {}): Promise<T> {
    return this.request<T>({
      endpoint,
      method: 'PUT',
      data,
      ...options,
    });
  }
  
  async delete<T>(endpoint: string, options: Omit<Parameters<typeof this.request>[0], 'endpoint' | 'method'> = {}): Promise<T> {
    return this.request<T>({
      endpoint,
      method: 'DELETE',
      ...options,
    });
  }
  
  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Custom API error class
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseText: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Create debounced and throttled versions of API methods
export function createDebouncedAPI(apiClient: APIClient, delay: number = 300): Pick<APIClient, 'get' | 'post' | 'put' | 'delete'> {
  return {
    get: debounce((endpoint, options) => apiClient.get(endpoint, options), delay),
    post: debounce((endpoint, data, options) => apiClient.post(endpoint, data, options), delay),
    put: debounce((endpoint, data, options) => apiClient.put(endpoint, data, options), delay),
    delete: debounce((endpoint, options) => apiClient.delete(endpoint, options), delay),
  };
}

export function createThrottledAPI(apiClient: APIClient, limit: number = 1000): Pick<APIClient, 'get' | 'post' | 'put' | 'delete'> {
  return {
    get: throttle((endpoint, options) => apiClient.get(endpoint, options), limit),
    post: throttle((endpoint, data, options) => apiClient.post(endpoint, data, options), limit),
    put: throttle((endpoint, data, options) => apiClient.put(endpoint, data, options), limit),
    delete: throttle((endpoint, options) => apiClient.delete(endpoint, options), limit),
  };
}

// Error boundary for React components
export class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; onError?: (error: Error, errorInfo: React.ErrorInfo) => void },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; onError?: (error: Error, errorInfo: React.ErrorInfo) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Global error handler
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorListeners: Array<(error: Error, info?: any) => void> = [];
  
  private constructor() {
    // Set up global error handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleWindowError);
      window.addEventListener('unhandledrejection', this.handlePromiseRejection);
    }
  }
  
  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    
    return GlobalErrorHandler.instance;
  }
  
  // Add error listener
  addListener(listener: (error: Error, info?: any) => void): () => void {
    this.errorListeners.push(listener);
    
    // Return function to remove listener
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }
  
  // Handle window errors
  private handleWindowError = (event: ErrorEvent) => {
    this.notifyListeners(event.error || new Error(event.message));
  };
  
  // Handle unhandled promise rejections
  private handlePromiseRejection = (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    this.notifyListeners(error);
  };
  
  // Notify all listeners of an error
  private notifyListeners(error: Error, info?: any) {
    this.errorListeners.forEach(listener => {
      try {
        listener(error, info);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }
  
  // Clean up event listeners
  cleanup() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.handleWindowError);
      window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
    }
  }
}

// Export all utilities
export default {
  APIClient: APIClient.getInstance(),
  APIError,
  createDebouncedAPI,
  createThrottledAPI,
  ErrorBoundary,
  GlobalErrorHandler: GlobalErrorHandler.getInstance(),
};
