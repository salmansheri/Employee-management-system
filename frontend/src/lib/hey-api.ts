import { client } from '../client/client.gen';
import { useAuthStore } from '../store/useAuthStore';
import { refresh } from '#/client';

// Initialize HTTP interceptors for the generated Hey-API client
export function initApiInterceptors() {
  // Ensure base URL and withCredentials are set correctly
  const baseURL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || 
                  (typeof process !== 'undefined' && process.env?.VITE_BACKEND_URL) || 
                  'http://localhost:8081';

  console.log(`[API Interceptor] Initializing Hey-API client config at ${baseURL}`);
  client.setConfig({
    baseURL,
    withCredentials: true,
  });

  // Request Interceptor: Inject JWT Token from Zustand auth store
  client.instance.interceptors.request.use((config: any) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      (config.headers as any).Authorization = `Bearer ${token}`;
      console.log(`[API Request] Authorized request sending to: ${config.url}`);
    } else {
      console.log(`[API Request] Unauthorized/Public request sending to: ${config.url}`);
    }
    return config;
  });

  // Response Interceptor: Handle Token Rotation (401 Retry)
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  const processQueue = (error: any, token: string | null = null) => {
    console.log(`[API Interceptor] Processing queued requests. Remaining queue size: ${failedQueue.length}`);
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token!);
      }
    });
    failedQueue = [];
  };

  client.instance.interceptors.response.use(
    (response: any) => {
      console.log(`[API Response] Successfully received response from: ${response.config?.url}`);
      return response;
    },
    async (error: any) => {
      const originalRequest = error.config as any;
      
      // If unauthorized and we haven't retried this request yet
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        console.warn(`[API Interceptor] Intercepted 401 Unauthorized for URL: ${originalRequest.url}`);

        if (originalRequest.url?.includes('/api/auth/refresh')) {
          console.error('[API Interceptor] Token refresh request itself failed with 401. Clearing session.');
          useAuthStore.getState().clearAuth();
          return Promise.reject(error);
        }

        if (isRefreshing) {
          console.log(`[API Interceptor] Token refresh already in progress. Queueing request: ${originalRequest.url}`);
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (!originalRequest.headers) {
                originalRequest.headers = {};
              }
              originalRequest.headers.Authorization = `Bearer ${token}`;
              console.log(`[API Interceptor] Retrying queued request: ${originalRequest.url}`);
              return client.instance.request(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;
        console.log('[API Interceptor] Starting token refresh rotation cycle...');

        try {
          // Attempt JWT Refresh
          const res = await refresh({ throwOnError: true });
          const newToken = (res.data as any)?.accessToken;

          if (newToken) {
            console.log('[API Interceptor] Token rotation succeeded. Setting new access token in Auth Store.');
            useAuthStore.getState().setAuth(newToken);
            processQueue(null, newToken);
            if (!originalRequest.headers) {
              originalRequest.headers = {};
            }
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            console.log(`[API Interceptor] Retrying original request: ${originalRequest.url}`);
            return client.instance.request(originalRequest);
          } else {
            throw new Error('Refresh response body was empty');
          }
        } catch (refreshError) {
          console.error('[API Interceptor] Token rotation failed. Logging out user...', refreshError);
          processQueue(refreshError, null);
          useAuthStore.getState().clearAuth();
          // Redirect to login page
          if (typeof window !== 'undefined') {
            console.log('[API Interceptor] Redirecting to /login');
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      console.error(`[API Response Error] Request failed for: ${originalRequest?.url}`, error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
}

export { client };
