import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth/context/useAuth';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { getApiBaseUrl } from '@/config/env';
import {
  Activity,
  RefreshCw,
  Server,
  ShieldCheck,
  Building2,
  CreditCard,
  BarChart3,
  LifeBuoy,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

export const SuperAdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading, isError, error, isSuccess, isFetching, refetch } = useHealthCheck();

  const baseUrl = getApiBaseUrl();

  const upcomingModules = [
    {
      title: 'College Management',
      description: 'Multi-tenant college onboarding, domains, subscriptions, and administrative users.',
      icon: Building2,
      status: 'Phase 2',
    },
    {
      title: 'Plans & Subscriptions',
      description: 'Tiered subscription management, feature gates, and billing configuration.',
      icon: CreditCard,
      status: 'Phase 3',
    },
    {
      title: 'System Analytics',
      description: 'Platform utilization, active college metrics, and audit logs.',
      icon: BarChart3,
      status: 'Phase 4',
    },
    {
      title: 'Support Tickets',
      description: 'Cross-tenant customer issues, priority queueing, and status resolution.',
      icon: LifeBuoy,
      status: 'Phase 5',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-indigo-900/40 bg-gradient-to-r from-indigo-950/40 via-card to-card p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Super Admin Console
              </h1>
              <Badge variant="default" className="text-xs">
                Active Session
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Welcome, <span className="font-semibold text-foreground">{user?.email}</span>. You are authenticated as <span className="font-mono text-indigo-400 font-semibold">{user?.role}</span>.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs font-mono py-1 px-2.5">
              API Base: {baseUrl || '(relative)'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Backend Connectivity Check Tool */}
      <Card className="border-border/80 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-indigo-400" />
              <CardTitle className="text-lg">Backend Health Check</CardTitle>
            </div>
            <CardDescription>
              Real-time connectivity verification using <code>GET /health</code> through the shared typed API client.
            </CardDescription>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
          >
            Recheck API
          </Button>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border border-border/60 bg-secondary/30 p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Endpoint Target */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Endpoint
                </span>
                <p className="text-sm font-mono font-medium text-foreground">
                  {baseUrl ? `${baseUrl}/health` : '/health'}
                </p>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Connection Status
                </span>
                <div className="flex items-center space-x-2">
                  {isLoading ? (
                    <Badge variant="warning" className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 animate-spin" />
                      <span>Probing...</span>
                    </Badge>
                  ) : isSuccess ? (
                    <Badge variant="success" className="flex items-center space-x-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Connected (200 OK)</span>
                    </Badge>
                  ) : isError ? (
                    <Badge variant="destructive" className="flex items-center space-x-1">
                      <XCircle className="h-3 w-3" />
                      <span>Unreachable</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline">Idle</Badge>
                  )}
                </div>
              </div>

              {/* Latency */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Round-trip Latency
                </span>
                <p className="text-sm font-mono text-foreground flex items-center space-x-1">
                  <Activity className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                  <span>
                    {(data as { _clientLatencyMs?: number })?._clientLatencyMs !== undefined
                      ? `${(data as { _clientLatencyMs?: number })._clientLatencyMs} ms`
                      : '—'}
                  </span>
                </p>
              </div>
            </div>

            {/* Error or Response Details */}
            {isError && (
              <div className="rounded-lg border border-rose-800/40 bg-rose-950/30 p-3 text-xs text-rose-300 space-y-1">
                <p className="font-semibold text-rose-200">Connectivity Check Notice:</p>
                <p>
                  {error?.message || 'Could not connect to the backend server. Verify that your backend service is running and VITE_API_BASE_URL is properly configured.'}
                </p>
              </div>
            )}

            {isSuccess && data && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Response Payload
                </span>
                <pre className="p-3 rounded-lg bg-background/90 border border-border/80 text-[11px] text-emerald-300 font-mono overflow-x-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Super Admin Modules Roadmap (Clean Placeholder Cards) */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-indigo-400" />
          <h2 className="text-base font-bold text-foreground">
            Platform Modules Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Card key={mod.title} className="border-border/60 bg-card/50 opacity-80 hover:opacity-100 transition-opacity">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary border border-border text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-base">{mod.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {mod.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">
                    {mod.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
