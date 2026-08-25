import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  Users,
  CreditCard,
  Layers,
  Activity,
  Calendar,
  UserCheck,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import type { PlatformAnalytics } from '@/types/analytics';

export const PlatformAnalyticsPage: React.FC = () => {
  const {
    data: analytics,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<PlatformAnalytics, Error>({
    queryKey: ['platform-analytics'],
    queryFn: () => analyticsApi.getPlatformAnalytics(),
    staleTime: 15_000,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Platform Analytics
            </h1>
            <Badge variant="default" className="font-mono text-xs">
              Live Metrics
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time aggregate data across institutions, user accounts, subscription tiers, and administrative operations.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* States */}
      {isLoading ? (
        <LoadingState
          title="Loading Platform Intelligence"
          description="Aggregating metrics across institutions and subscriptions..."
        />
      ) : isError ? (
        <ErrorState
          title="Failed to Load Platform Analytics"
          message={error?.message || 'A network error occurred while querying analytics data.'}
          onRetry={() => refetch()}
        />
      ) : !analytics ? (
        <EmptyState
          title="No Platform Data Available"
          description="Analytics data is not available at this moment."
        />
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Colleges KPI */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Colleges
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-foreground font-mono">
                  {analytics.colleges.total}
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2 border-t border-border/40 text-xs">
                <span className="inline-flex items-center text-emerald-400 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1" />
                  {analytics.colleges.active} Active
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="inline-flex items-center text-rose-400 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mr-1" />
                  {analytics.colleges.suspended} Suspended
                </span>
              </div>
            </div>

            {/* Users KPI */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total Users
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-foreground font-mono">
                  {analytics.users.total}
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground font-mono">
                <span>{analytics.users.byRole.superAdmin} Super</span>
                <span>•</span>
                <span>{analytics.users.byRole.admin} Admin</span>
                <span>•</span>
                <span>{analytics.users.byRole.user} User</span>
              </div>
            </div>

            {/* Plans KPI */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Configured Plans
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30">
                  <CreditCard className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-foreground font-mono">
                  {analytics.plans.total}
                </p>
              </div>
              <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground">
                Active platform tiers
              </div>
            </div>

            {/* Subscriptions KPI */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Subscriptions
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
                  <Layers className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-foreground font-mono">
                  {analytics.subscriptions.total}
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2 border-t border-border/40 text-xs">
                <span className="text-emerald-400 font-mono">
                  {analytics.subscriptions.active} Active
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Summary Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* College Status Distribution */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-foreground">
                  Institution Status Distribution
                </h3>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground">Active Institutions</span>
                    <span className="font-mono text-emerald-400">
                      {analytics.colleges.active} (
                      {analytics.colleges.total > 0
                        ? Math.round((analytics.colleges.active / analytics.colleges.total) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          analytics.colleges.total > 0
                            ? (analytics.colleges.active / analytics.colleges.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground">Suspended Institutions</span>
                    <span className="font-mono text-rose-400">
                      {analytics.colleges.suspended} (
                      {analytics.colleges.total > 0
                        ? Math.round((analytics.colleges.suspended / analytics.colleges.total) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-rose-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          analytics.colleges.total > 0
                            ? (analytics.colleges.suspended / analytics.colleges.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* User Account Role Distribution */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-foreground">
                  User Roles & Activity
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl border border-border/60 bg-secondary/30 p-3 text-center">
                  <p className="text-lg font-bold text-indigo-400 font-mono">
                    {analytics.users.byRole.superAdmin}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Super Admins</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-secondary/30 p-3 text-center">
                  <p className="text-lg font-bold text-purple-400 font-mono">
                    {analytics.users.byRole.admin}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Admins (Finance)</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-secondary/30 p-3 text-center">
                  <p className="text-lg font-bold text-emerald-400 font-mono">
                    {analytics.users.byRole.user}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Regular Users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Administrative Activity Log */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-foreground">
                  Recent Administrative Audit Log
                </h3>
              </div>
              <Badge variant="secondary" className="text-[10px] font-mono">
                Latest {analytics.recentActivity.length} Events
              </Badge>
            </div>

            {analytics.recentActivity.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border">
                No administrative audit records logged yet.
              </div>
            ) : (
              <div className="rounded-xl border border-border/70 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border/60 bg-secondary/40 text-muted-foreground font-semibold">
                      <tr>
                        <th className="p-3 pl-4">Action</th>
                        <th className="p-3">Actor</th>
                        <th className="p-3">Target</th>
                        <th className="p-3 pr-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {analytics.recentActivity.map((activity) => (
                        <tr key={activity.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-3 pl-4">
                            <Badge variant="default" className="font-mono text-[10px]">
                              {activity.action}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {activity.actor ? (
                              <div className="flex items-center space-x-1.5">
                                <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="font-mono text-foreground font-medium">
                                  {activity.actor.email}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic">System</span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-muted-foreground">
                            {activity.targetType ? (
                              <span>
                                {activity.targetType}
                                {activity.targetId ? ` (${activity.targetId.slice(0, 8)}...)` : ''}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="p-3 pr-4 font-mono text-muted-foreground">
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(activity.createdAt).toLocaleString()}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
