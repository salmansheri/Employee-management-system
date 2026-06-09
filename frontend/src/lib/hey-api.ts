import { client } from '../client/client.gen';
import { useAuthStore } from '../store/useAuthStore';
import { refresh } from '#/client';

// Initialize HTTP interceptors for the generated Hey-API client
export function initApiInterceptors() {
  // Ensure base URL and withCredentials are set correctly
  client.setConfig({
    baseURL: 'http://localhost:8081',
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
    (response: any) => response,
    async (error: any) => {
      const originalRequest = error.config as any;
      
      // If unauthorized and we haven't retried this request yet
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        if (originalRequest.url?.includes('/api/auth/refresh')) {
          // If the refresh call itself fails, log out
          useAuthStore.getState().clearAuth();
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (!originalRequest.headers) {
                originalRequest.headers = {};
              }
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return client.instance.request(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt JWT Refresh
          const res = await refresh({ throwOnError: true });
          const newToken = (res.data as any)?.accessToken;

          if (newToken) {
            useAuthStore.getState().setAuth(newToken);
            processQueue(null, newToken);
            if (!originalRequest.headers) {
              originalRequest.headers = {};
            }
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return client.instance.request(originalRequest);
          } else {
            throw new Error('Refresh response body was empty');
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          useAuthStore.getState().clearAuth();
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );
}

export { client };
