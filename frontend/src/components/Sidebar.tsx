import { useNavigate, useLocation, Link } from '@tanstack/react-router';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { useMeQuery, useLogoutMutation } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  CheckSquare, 
  LogOut, 
  ChevronLeft,
  User, 
  Building2,
  Shield,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';

export function Sidebar() {
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { clearAuth, user } = useAuthStore();
  
  const { data: profile } = useMeQuery();
  const logoutMutation = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync({});
    } catch (e) {
      // Ignore network failures on logout
    }
    clearAuth();
    navigate({ to: '/login' });
  };

  const isAdmin = profile?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_ADMIN';
  const isManager = profile?.role === 'ROLE_MANAGER' || user?.role === 'ROLE_MANAGER';
  const canViewEmployees = isAdmin || isManager;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col h-full bg-mantle border-r border-surface0/60 z-20 shrink-0"
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-surface0/60">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-mauve to-blue">
            <Building2 className="h-5 w-5 text-crust" />
          </div>
          {!sidebarCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-bold text-lg tracking-tight bg-gradient-to-r from-text to-subtext1 bg-clip-text text-transparent"
            >
              EMS Portal
            </motion.span>
          )}
        </div>
        {!sidebarCollapsed && (
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-surface0/50 text-subtext0 hover:text-text transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
        <SidebarLink 
          to="/" 
          icon={<LayoutDashboard className="h-5 w-5" />} 
          label="Dashboard" 
          collapsed={sidebarCollapsed} 
        />
        {canViewEmployees && (
          <SidebarLink 
            to="/employees" 
            icon={<Users className="h-5 w-5" />} 
            label="Employees" 
            collapsed={sidebarCollapsed} 
          />
        )}
        <SidebarLink 
          to="/leaves" 
          icon={<CalendarDays className="h-5 w-5" />} 
          label="Leaves & WFH" 
          collapsed={sidebarCollapsed} 
        />
        <SidebarLink 
          to="/tasks" 
          icon={<CheckSquare className="h-5 w-5" />} 
          label="Task Board" 
          collapsed={sidebarCollapsed} 
        />
        <SidebarLink 
          to="/settings" 
          icon={<Settings className="h-5 w-5" />} 
          label="Settings" 
          collapsed={sidebarCollapsed} 
        />
      </nav>

      {/* Sidebar Footer User Session */}
      <div className="p-4 border-t border-surface0/60 bg-crust/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface1 border border-surface2/30">
            <User className="h-5 w-5 text-mauve" />
          </div>
          {!sidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-semibold truncate text-text">
                {profile ? `${profile.firstName} ${profile.lastName}` : (user?.email || 'Loading...')}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="h-3 w-3 text-mauve" />
                <span className="text-[10px] font-medium text-mauve uppercase tracking-wider">
                  {profile?.role?.replace('ROLE_', '') || user?.role?.replace('ROLE_', '') || 'Employee'}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-surface0 hover:bg-red/10 border border-surface1 hover:border-red/20 py-2 px-3 text-sm font-medium text-subtext1 hover:text-red transition-all cursor-pointer disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

function SidebarLink({ to, icon, label, collapsed }: SidebarLinkProps) {
  const location = useLocation();
  const isActive = to === '/' 
    ? location.pathname === '/' 
    : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
        isActive
          ? 'bg-mauve !text-[#11111b] font-semibold shadow-lg shadow-mauve/15 hover:bg-mauve/95'
          : 'text-subtext0 hover:text-text hover:bg-surface0/60 border border-transparent hover:border-surface0/30'
      }`}
    >
      <span className={`shrink-0 ${isActive ? 'text-[#11111b]' : ''}`}>{icon}</span>
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className={`text-sm truncate ${isActive ? 'text-[#11111b]' : ''}`}
        >
          {label}
        </motion.span>
      )}
    </Link>
  );
}
