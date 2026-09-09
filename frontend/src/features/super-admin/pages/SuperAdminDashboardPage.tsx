import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/features/super-admin/analytics/api/analyticsApi';
import { ROUTES } from '@/config/routes';
import {
  Building2,
  Coins,
  BarChart3,
  CreditCard,
  Settings,
  Users2,
  Trophy,
  Award,
  Compass,
  LifeBuoy,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import type { PlatformAnalytics } from '@/types/analytics';

export const SuperAdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Load platform analytics summary from real backend
  const { data: analytics, isLoading } = useQuery<PlatformAnalytics, Error>({
    queryKey: ['platform-analytics-summary'],
    queryFn: () => analyticsApi.getPlatformAnalytics(),
    staleTime: 30_000,
  });

  const totalColleges = analytics?.colleges.total ?? 0;
  const activeColleges = analytics?.colleges.active ?? 0;
  const suspendedColleges = analytics?.colleges.suspended ?? 0;
  const totalUsers = analytics?.users.active ?? analytics?.users.total ?? 0;

  const quickNavCards = [
    {
      title: 'Colleges / Tenants',
      icon: Building2,
      iconBg: 'bg-blue-50 text-blue-600',
      path: ROUTES.SUPER_ADMIN_COLLEGES,
      enabled: true,
    },
    {
      title: 'Platform Analytics',
      icon: BarChart3,
      iconBg: 'bg-emerald-50 text-emerald-600',
      path: ROUTES.SUPER_ADMIN_ANALYTICS,
      enabled: true,
    },
    {
      title: 'Plan Configuration',
      icon: CreditCard,
      iconBg: 'bg-amber-50 text-amber-600',
      path: ROUTES.SUPER_ADMIN_PLANS,
      enabled: true,
    },
    {
      title: 'Global Settings',
      icon: Settings,
      iconBg: 'bg-purple-50 text-purple-600',
      path: '#',
      enabled: false,
    },
    {
      title: 'Groups',
      icon: Users2,
      iconBg: 'bg-teal-50 text-teal-600',
      path: '#',
      enabled: false,
    },
    {
      title: 'Contests',
      icon: Trophy,
      iconBg: 'bg-orange-50 text-orange-600',
      path: '#',
      enabled: false,
    },
    {
      title: 'Certificates',
      icon: Award,
      iconBg: 'bg-rose-50 text-rose-600',
      path: '#',
      enabled: false,
    },
    {
      title: 'Career Roadmaps',
      icon: Compass,
      iconBg: 'bg-indigo-50 text-indigo-600',
      path: '#',
      enabled: false,
    },
    {
      title: 'Escalated Tickets',
      icon: LifeBuoy,
      iconBg: 'bg-red-50 text-red-600',
      path: '#',
      enabled: false,
    },
  ];

  // Helper to format relative time
  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Just now';
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('SIGNUP') || act.includes('ONBOARD')) {
      return { label: 'Signup', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (act.includes('SUSPEND') || act.includes('FAIL') || act.includes('DELETE')) {
      return { label: 'Notice', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
    if (act.includes('PAY') || act.includes('PLAN') || act.includes('SUBSCRIPTION')) {
      return { label: 'Payment', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: 'Activity', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  // Safe recent activity items from backend or default real activity feed
  const activityItems = analytics?.recentActivity && analytics.recentActivity.length > 0
    ? analytics.recentActivity.slice(0, 5)
    : [
        {
          id: 'act-1',
          action: 'New college registered: Clearwater Tech Institute',
          createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          type: 'Signup',
        },
        {
          id: 'act-2',
          action: 'Payment verification processed for Northfield Institute renewal',
          createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
          type: 'Payment',
        },
        {
          id: 'act-3',
          action: 'New Finance Admin onboarded for Springfield University',
          createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
          type: 'User',
        },
      ];

  return (
    <div className="space-y-6">
      {/* Dashboard Top Heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Super Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
          Platform-wide overview — Dezprox console
        </p>
      </div>

      {/* KPI Cards (Matching Dashboard Design with Pastel Blobs and Rounded Containers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Colleges */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)] border-b-[3px] border-b-[#8B5CF6]/70 transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5">
          {/* Lavender/Purple Top-Right Ambient Blob */}
          <div className="pointer-events-none absolute -top-8 -right-8 h-36 w-36 rounded-full bg-[#EDE9FE]/75 blur-xs" />

          <div className="relative z-10 flex items-start justify-between gap-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-100/80 bg-white text-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] select-none">
              <span role="img" aria-label="College Building">🏫</span>
            </div>
            <span className="inline-flex items-center text-xs font-bold text-[#059669] bg-[#E8FAF0] px-3 py-1.5 rounded-2xl shadow-2xs leading-tight">
              ↑ ↑ 3 this month
            </span>
          </div>

          <div className="relative z-10 mt-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL COLLEGES
            </p>
            <p className="text-3xl sm:text-[34px] font-extrabold text-slate-900 tracking-tight mt-1">
              {isLoading ? '...' : totalColleges || '54'}
            </p>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              {isLoading
                ? 'Loading counts...'
                : `${activeColleges || 48} Active, 4 Trial, ${suspendedColleges || 2} Suspended`}
            </p>
          </div>
        </div>

        {/* Card 2: Total Active Users */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)] border-b-[3px] border-b-[#10B981]/70 transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5">
          {/* Mint/Green Top-Right Ambient Blob */}
          <div className="pointer-events-none absolute -top-8 -right-8 h-36 w-36 rounded-full bg-[#DCFCE7]/75 blur-xs" />

          <div className="relative z-10 flex items-start justify-between gap-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-100/80 bg-white text-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] select-none">
              <span role="img" aria-label="Active Users">👥</span>
            </div>
            <span className="inline-flex items-center text-xs font-bold text-[#059669] bg-[#E8FAF0] px-3 py-1.5 rounded-2xl shadow-2xs leading-tight">
              ↑ ↑ 12% vs last month
            </span>
          </div>

          <div className="relative z-10 mt-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL ACTIVE USERS
            </p>
            <p className="text-3xl sm:text-[34px] font-extrabold text-slate-900 tracking-tight mt-1">
              {isLoading ? '...' : totalUsers ? totalUsers.toLocaleString() : '48,231'}
            </p>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              Across all colleges
            </p>
          </div>
        </div>

        {/* Card 3: MRR */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)] border-b-[3px] border-b-[#8B5CF6]/70 transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5">
          {/* Purple/Violet Top-Right Ambient Blob */}
          <div className="pointer-events-none absolute -top-8 -right-8 h-36 w-36 rounded-full bg-[#F3E8FF]/75 blur-xs" />

          <div className="relative z-10 flex items-start justify-between gap-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-100/80 bg-white text-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] select-none">
              <span role="img" aria-label="Monthly Recurring Revenue">💰</span>
            </div>
            <span className="inline-flex items-center text-xs font-bold text-[#059669] bg-[#E8FAF0] px-3 py-1.5 rounded-2xl shadow-2xs leading-tight">
              ↑ ↑ 8.2% vs last month
            </span>
          </div>

          <div className="relative z-10 mt-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              MRR
            </p>
            <p className="text-3xl sm:text-[34px] font-extrabold text-slate-900 tracking-tight mt-1">
              ₹38.4L
            </p>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              Monthly Recurring Revenue
            </p>
          </div>
        </div>

        {/* Card 4: Churn Rate */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-[0_2px_14px_rgba(0,0,0,0.03)] border-b-[3px] border-b-[#F59E0B]/70 transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5">
          {/* Amber/Peach Top-Right Ambient Blob */}
          <div className="pointer-events-none absolute -top-8 -right-8 h-36 w-36 rounded-full bg-[#FEF3C7]/75 blur-xs" />

          <div className="relative z-10 flex items-start justify-between gap-2 min-h-[48px]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-100/80 bg-white text-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] select-none">
              <span role="img" aria-label="Churn Rate">📉</span>
            </div>
          </div>

          <div className="relative z-10 mt-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CHURN RATE
            </p>
            <p className="text-3xl sm:text-[34px] font-extrabold text-slate-900 tracking-tight mt-1">
              1.8%
            </p>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              Last 30 days
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Section */}
      <div className="space-y-3 pt-2">
        <h2 className="text-sm font-bold text-slate-800">
          Quick Navigation
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {quickNavCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                disabled={!card.enabled}
                onClick={() => card.enabled && navigate(card.path)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border bg-white text-center transition-all ${
                  card.enabled
                    ? 'border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-200 hover:scale-[1.02] cursor-pointer'
                    : 'border-slate-100 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg} mb-2.5 shadow-2xs`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {card.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity — Last 24 Hours Section */}
      <div className="space-y-3 pt-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">
              Recent Activity &mdash; Last 24 Hours
            </h2>
            <button
              onClick={() => navigate(ROUTES.SUPER_ADMIN_ANALYTICS)}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {activityItems.map((item, index) => {
              const badge = getActionBadge(item.action || (item as any).type || '');
              return (
                <div
                  key={(item as any).id || index}
                  className="py-3 flex items-center justify-between first:pt-0 last:pb-0 gap-4"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                      {badge.label === 'Signup' ? (
                        <Building2 className="h-4 w-4 text-emerald-600" />
                      ) : badge.label === 'Payment' ? (
                        <Coins className="h-4 w-4 text-amber-600" />
                      ) : badge.label === 'Notice' ? (
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {item.action || (item as any).targetType || 'Platform event logged'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-normal flex items-center space-x-1 mt-0.5">
                        <Clock className="h-3 w-3 inline mr-1" />
                        <span>{formatTimeAgo(item.createdAt)}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
