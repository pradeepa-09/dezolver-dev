import * as React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/useAuth';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { ImpersonationBanner } from '@/features/super-admin/colleges/components/ImpersonationBanner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes';
import {
  ShieldCheck,
  LogOut,
  Activity,
  LayoutDashboard,
  Building2,
  CreditCard,
  BarChart3,
  LifeBuoy,
} from 'lucide-react';

export const SuperAdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { isSuccess, isError, isLoading } = useHealthCheck();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsLogoutDialogOpen(false);
      navigate(ROUTES.LOGIN, { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      label: 'Overview',
      path: ROUTES.SUPER_ADMIN_DASHBOARD,
      icon: LayoutDashboard,
      active: location.pathname === ROUTES.SUPER_ADMIN_DASHBOARD,
      enabled: true,
    },
    {
      label: 'Colleges',
      path: ROUTES.SUPER_ADMIN_COLLEGES,
      icon: Building2,
      active: location.pathname.startsWith(ROUTES.SUPER_ADMIN_COLLEGES),
      enabled: true,
    },
    {
      label: 'Plans',
      path: ROUTES.SUPER_ADMIN_PLANS,
      icon: CreditCard,
      active: location.pathname.startsWith(ROUTES.SUPER_ADMIN_PLANS),
      enabled: true,
    },
    {
      label: 'Analytics',
      path: ROUTES.SUPER_ADMIN_ANALYTICS,
      icon: BarChart3,
      active: location.pathname.startsWith(ROUTES.SUPER_ADMIN_ANALYTICS),
      enabled: true,
    },
    {
      label: 'Support Tickets',
      path: '#',
      icon: LifeBuoy,
      active: false,
      enabled: false,
      badge: 'Upcoming',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Impersonation Warning Banner */}
      <ImpersonationBanner />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand & Context */}
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-foreground tracking-tight">Dezolver</span>
                <Badge variant="default" className="text-[10px] py-0 px-1.5 uppercase font-bold tracking-wider">
                  Super Admin
                </Badge>
              </div>
            </div>
          </div>

          {/* Right Header Utilities: Health Status, User Badge, Logout */}
          <div className="flex items-center space-x-3">
            {/* Backend Connectivity Status */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full border border-border/80 bg-secondary/40 text-xs">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">API:</span>
              {isLoading ? (
                <span className="text-amber-400 font-medium animate-pulse">Checking...</span>
              ) : isSuccess ? (
                <span className="inline-flex items-center text-emerald-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5" />
                  Online
                </span>
              ) : isError ? (
                <span className="inline-flex items-center text-rose-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mr-1.5" />
                  Offline
                </span>
              ) : (
                <span className="text-muted-foreground">Unknown</span>
              )}
            </div>

            {/* Authenticated User Pill */}
            <div className="flex items-center space-x-2 rounded-lg border border-border/60 bg-secondary/30 px-3 py-1.5">
              <div className="h-6 w-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-foreground truncate max-w-[160px]">
                  {user?.email || 'admin@dezolver.com'}
                </p>
                <p className="text-[10px] font-mono text-indigo-400 uppercase leading-none">
                  {user?.role || 'SUPER_ADMIN'}
                </p>
              </div>
            </div>

            {/* Logout Trigger */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLogoutDialogOpen(true)}
              className="text-muted-foreground hover:text-rose-400 hover:bg-rose-950/20"
              leftIcon={<LogOut className="h-4 w-4" />}
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Subnav Navigation */}
        <div className="border-t border-border/40 bg-card/40">
          <div className="mx-auto flex max-w-7xl space-x-1 px-4 sm:px-6 lg:px-8 overflow-x-auto py-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  disabled={!item.enabled}
                  onClick={() => item.enabled && navigate(item.path)}
                  className={`inline-flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    item.active
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                      : item.enabled
                        ? 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                        : 'text-muted-foreground/40 cursor-not-allowed'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8 animate-fade-in">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
        Dezolver Control Center &bull; Super Admin Foundation v0.1.0
      </footer>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        variant="danger"
        title="Sign Out of Super Admin?"
        description="Are you sure you want to end your Super Admin session? You will need to authenticate again to access this console."
        confirmLabel="Yes, Sign Out"
        cancelLabel="Stay Logged In"
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </div>
  );
};
