import { useState, useEffect, useRef } from 'react';
import { useLocation } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Bell } from 'lucide-react';
import { Tooltip } from './ui/tooltip';
import { 
  useNotificationsQuery, 
  useUnreadCountQuery, 
  useMarkReadMutation, 
  useMarkAllReadMutation 
} from '../hooks/useNotifications';

export function Header() {
  const location = useLocation();
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [time, setTime] = useState(new Date());

  // Clock update effect
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Click outside notifications effect
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Fetch notifications data
  const { data: notifications } = useNotificationsQuery();
  const { data: unreadCountData } = useUnreadCountQuery();

  const unreadCount = typeof unreadCountData === 'number' ? unreadCountData : (unreadCountData as any)?.count || 0;

  // Mutations for notifications
  const markReadMutation = useMarkReadMutation();
  const markAllReadMutation = useMarkAllReadMutation();

  // Format digital clock
  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  // Get active breadcrumb title
  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/employees')) return 'Employee Directory';
    if (path.startsWith('/leaves')) return 'Leave Management';
    if (path.startsWith('/tasks')) return 'Tasks Kanban';
    if (path.startsWith('/settings')) return 'Settings';
    return 'EMS';
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-surface0/60 bg-mantle/70 backdrop-blur-md z-10">
      {/* Page Title / Breadcrumbs */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-text font-sans tracking-tight">
          {getBreadcrumbTitle()}
        </h1>
      </div>

      {/* Top Right Utilities */}
      <div className="flex items-center gap-6">
        {/* Digital Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-crust/50 border border-surface0/80 text-xs text-subtext1">
          <Clock className="h-4 w-4 text-blue" />
          <span className="font-mono text-blue font-medium">{formattedTime}</span>
          <span className="text-surface2">|</span>
          <span>{formattedDate}</span>
        </div>

        {/* Notifications bell */}
        <div className="relative" ref={notificationsRef}>
          <Tooltip content="Notifications" side="bottom">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full bg-surface0/80 hover:bg-surface1 border border-surface1 hover:border-surface2 text-subtext0 hover:text-text transition-all cursor-pointer"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red text-[9px] font-bold text-crust animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </Tooltip>

          {/* Notifications Dropdown Panel */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 rounded-xl glass-panel glass-panel-glow border border-surface0 p-2 shadow-2xl z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between p-2 border-b border-surface0">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-subtext1">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllReadMutation.mutate({})}
                      className="text-[10px] text-mauve hover:text-mauve/80 hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto py-1 space-y-1">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((notif: any) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.read) markReadMutation.mutate({ path: { id: notif.id } });
                        }}
                        className={`p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                          notif.read 
                            ? 'bg-transparent hover:bg-surface0/30' 
                            : 'bg-mauve/5 hover:bg-mauve/10 border-l-2 border-mauve'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-semibold text-text truncate">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-mauve shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[11px] text-subtext0 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[9px] text-surface2 mt-1 block">
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-subtext0">
                      No notifications yet
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
