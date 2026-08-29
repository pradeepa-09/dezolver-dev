import * as React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/useAuth';
import { ImpersonationBanner } from '@/features/super-admin/colleges/components/ImpersonationBanner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ROUTES } from '@/config/routes';
import {
  LayoutDashboard,
  BarChart3,
  Building2,
  CreditCard,
  Settings,
  Users2,
  Trophy,
  Award,
  Compass,
  FileText,
  LifeBuoy,
  LogOut,
  ChevronDown,
  Search,
  Bell,
  Menu,
  X,
} from 'lucide-react';

export const SuperAdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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

  const getUserInitials = (email?: string) => {
    if (!email) return 'DA';
    const parts = email.split('@')[0].split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getUserDisplayName = (email?: string) => {
    if (!email) return 'Dezprox Admin';
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  const navigationSections = [
    {
      title: 'OVERVIEW',
      items: [
        {
          label: 'Dashboard',
          path: ROUTES.SUPER_ADMIN_DASHBOARD,
          icon: LayoutDashboard,
          active: location.pathname === ROUTES.SUPER_ADMIN_DASHBOARD,
          enabled: true,
        },
        {
          label: 'Platform Analytics',
          path: ROUTES.SUPER_ADMIN_ANALYTICS,
          icon: BarChart3,
          active: location.pathname.startsWith(ROUTES.SUPER_ADMIN_ANALYTICS),
          enabled: true,
        },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        {
          label: 'Colleges / Tenants',
          path: ROUTES.SUPER_ADMIN_COLLEGES,
          icon: Building2,
          active: location.pathname.startsWith(ROUTES.SUPER_ADMIN_COLLEGES),
          enabled: true,
        },
        {
          label: 'Plan Configuration',
          path: ROUTES.SUPER_ADMIN_PLANS,
          icon: CreditCard,
          active: location.pathname.startsWith(ROUTES.SUPER_ADMIN_PLANS),
          enabled: true,
        },
        {
          label: 'Global Settings',
          path: '#',
          icon: Settings,
          active: false,
          enabled: false,
        },
      ],
    },
    {
      title: 'PLATFORM MODULES',
      items: [
        {
          label: 'Groups (Platform-Wide)',
          path: '#',
          icon: Users2,
          active: false,
          enabled: false,
        },
        {
          label: 'Contests (Platform-Wide)',
          path: '#',
          icon: Trophy,
          active: false,
          enabled: false,
        },
        {
          label: 'Generate Certificate',
          path: '#',
          icon: Award,
          active: false,
          enabled: false,
        },
      ],
    },
    {
      title: 'CAREER ROADMAPS',
      items: [
        {
          label: 'Roadmap Library',
          path: '#',
          icon: Compass,
          active: false,
          enabled: false,
        },
        {
          label: 'Domain Assessments',
          path: '#',
          icon: FileText,
          active: false,
          enabled: false,
        },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        {
          label: 'Escalated Tickets',
          path: '#',
          icon: LifeBuoy,
          active: false,
          enabled: false,
        },
      ],
    },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#1b1548] text-white">
      {/* Brand Header */}
      <div className="p-5 pb-4 flex items-center space-x-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-xl shadow-md shadow-indigo-600/30">
          D
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-extrabold text-white text-base tracking-tight leading-tight">
            Dezolver
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-300/75 mt-0.5">
            EDTECH PLATFORM
          </span>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="px-4 mb-4">
        <button
          onClick={() => {
            navigate(ROUTES.SUPER_ADMIN_PROFILE);
            setIsMobileMenuOpen(false);
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.12] transition-colors cursor-pointer text-left"
          title="Open Profile Settings"
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-400 text-white text-xs font-bold shadow-inner">
              {getUserInitials(user?.email)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {getUserDisplayName(user?.email)}
              </p>
              <p className="text-[10px] text-indigo-300/70 font-medium">
                Super Admin
              </p>
            </div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-indigo-300/60 shrink-0 ml-1" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 space-y-5 pb-4 custom-sidebar-scroll">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-indigo-300/40 mb-1.5">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    disabled={!item.enabled}
                    onClick={() => {
                      if (item.enabled) {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                      item.active
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                        : item.enabled
                          ? 'text-indigo-200/70 hover:text-white hover:bg-white/[0.07]'
                          : 'text-indigo-200/30 cursor-not-allowed hover:text-indigo-200/40'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-white' : 'text-indigo-300/60'}`} />
                    <span className="truncate flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Logout Action */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => setIsLogoutDialogOpen(true)}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-300/80 hover:text-rose-100 hover:bg-rose-950/30 transition-colors text-left"
        >
          <LogOut className="h-4 w-4 shrink-0 text-rose-400" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Impersonation Banner (Global if active) */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <ImpersonationBanner />
      </div>

      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-40 border-r border-indigo-950/50 shadow-xl">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 shadow-2xl">
            {renderSidebarContent()}
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-3 text-white absolute top-3 right-3 z-20 focus:outline-none"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shadow-xs">
          {/* Left: Mobile Toggle & Search */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative flex items-center">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search anything..."
                className="h-9 w-48 sm:w-72 md:w-80 rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-12 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <span className="hidden sm:inline-block absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right Header Utilities: Notifications & User Profile */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <button
              onClick={() => navigate(`${ROUTES.SUPER_ADMIN_PROFILE}?tab=notifications`)}
              className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              aria-label="Notifications"
              title="Notification Settings"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <div className="h-6 w-px bg-slate-200" />

            {/* User Profile Info */}
            <button
              onClick={() => navigate(ROUTES.SUPER_ADMIN_PROFILE)}
              className="flex items-center space-x-2.5 hover:opacity-85 transition-opacity cursor-pointer text-left"
              title="View Profile Settings"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold shadow-xs">
                {getUserInitials(user?.email)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {getUserDisplayName(user?.email)}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Super Admin
                </p>
              </div>
            </button>
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

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
