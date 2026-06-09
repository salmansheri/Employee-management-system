import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  exp: number;
}

function decodeJwt(token: string): UserProfile | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('[Auth Store] Failed to decode JWT token:', e);
    return null;
  }
}

interface AuthState {
  accessToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  setAuth: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token: string) => {
        const decoded = decodeJwt(token);
        if (decoded) {
          console.log(`[Auth Store] Session initialized for User: ${decoded.email}, Role: ${decoded.role}`);
          set({
            accessToken: token,
            user: decoded,
            isAuthenticated: true,
          });
        }
      },
      clearAuth: () => {
        console.log('[Auth Store] Session cleared. User logged out.');
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'ems-auth-storage', // Persist auth session
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
