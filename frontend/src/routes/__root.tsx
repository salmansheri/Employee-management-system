import { useEffect } from 'react';
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useLocation,
  useNavigate,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';
import appCss from '../styles.css?url';
import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useMeQuery } from '../hooks/useAuth';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from '../components/ui/sonner';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'EMS - Employee Management System' },
    ],
    links: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap' },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument />
    </QueryClientProvider>
  );
}

function RootDocument() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { isAuthenticated } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, theme } = useUIStore();
  
  // Navigation Guard / Authentication Redirect
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Sync theme class to document element for immediate persistence on load/refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  }, [theme]);

  // Fetch logged in profile detail via hook
  useMeQuery();

  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return (
      <html lang="en" className={theme}>
        <head>
          <HeadContent />
        </head>
        <body>
          <Outlet />
          <Toaster />
          <Scripts />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={theme}>
      <head>
        <HeadContent />
      </head>
      <body className="flex h-screen overflow-hidden bg-base text-text selection:bg-mauve/30 selection:text-text">
        {/* Render Sidebar Component */}
        <Sidebar />

        {/* Sidebar Toggle for Collapsed State */}
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="absolute left-20 top-4 z-30 p-2 rounded-lg bg-mantle border border-surface0/80 hover:bg-surface0 text-subtext0 hover:text-text shadow-lg cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Main Work Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header Component */}
          <Header />

          {/* Main Content View with route-based animation */}
          <main className="flex-1 overflow-y-auto p-6 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
