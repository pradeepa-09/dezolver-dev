import * as React from 'react';
import { collegesApi } from '../api/collegesApi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  Building2,
  Globe,
  Calendar,
  Users,
  Shield,
  CreditCard,
  X,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { CollegeDetail } from '@/types/colleges';

export interface CollegeDetailsModalProps {
  collegeId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CollegeDetailsModal: React.FC<CollegeDetailsModalProps> = ({
  collegeId,
  isOpen,
  onClose,
}) => {
  const [data, setData] = React.useState<CollegeDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'users' | 'billing'>('overview');

  const fetchDetails = React.useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await collegesApi.getCollege(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch college details.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen && collegeId) {
      setActiveTab('overview');
      fetchDetails(collegeId);
    } else {
      setData(null);
      setError(null);
    }
  }, [isOpen, collegeId, fetchDetails]);

  if (!isOpen || !collegeId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-50 w-full max-w-2xl rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-foreground">
                  {data?.name || 'College Details'}
                </h3>
                {data && (
                  <Badge
                    variant={data.status === 'ACTIVE' ? 'success' : 'destructive'}
                    className="text-[10px]"
                  >
                    {data.status}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                ID: {collegeId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-border/40 pt-3 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'users'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Users</span>
            {data?.users && (
              <span className="rounded-full bg-secondary px-1.5 py-0.2 text-[10px] font-mono">
                {data.users.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'billing'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-muted-foreground/60 hover:text-muted-foreground'
            }`}
          >
            <span>Subscriptions</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-muted text-muted-foreground font-mono">
              Phase 3
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <LoadingState title="Fetching College Information" description="Loading real-time data from backend..." />
          ) : error ? (
            <ErrorState
              title="Failed to Load College Details"
              message={error}
              onRetry={() => fetchDetails(collegeId)}
            />
          ) : data ? (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border/60 bg-secondary/30 p-3.5 space-y-1">
                      <div className="flex items-center space-x-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>Official Name</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{data.name}</p>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-secondary/30 p-3.5 space-y-1">
                      <div className="flex items-center space-x-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        <Globe className="h-3.5 w-3.5" />
                        <span>Registered Domain</span>
                      </div>
                      <p className="text-sm font-medium text-foreground font-mono">
                        {data.domain || <span className="text-muted-foreground italic font-sans">None configured</span>}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-secondary/30 p-3.5 space-y-1">
                      <div className="flex items-center space-x-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        <Shield className="h-3.5 w-3.5" />
                        <span>Tenant Status</span>
                      </div>
                      <div className="pt-0.5">
                        <Badge variant={data.status === 'ACTIVE' ? 'success' : 'destructive'}>
                          {data.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-secondary/30 p-3.5 space-y-1">
                      <div className="flex items-center space-x-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Onboarded Date</span>
                      </div>
                      <p className="text-xs font-medium text-foreground font-mono">
                        {new Date(data.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-secondary/20 p-3.5 space-y-1">
                    <div className="flex items-center space-x-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Last Updated</span>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">
                      {new Date(data.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>Associated Accounts ({data.users?.length || 0})</span>
                    </h4>
                  </div>

                  {data.users && data.users.length > 0 ? (
                    <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-border/60 bg-secondary/40 text-muted-foreground">
                          <tr>
                            <th className="p-3 font-semibold">User Email</th>
                            <th className="p-3 font-semibold">Backend Role</th>
                            <th className="p-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {data.users.map((u) => (
                            <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                              <td className="p-3 font-mono font-medium text-foreground">
                                {u.email}
                              </td>
                              <td className="p-3">
                                <Badge variant="secondary" className="font-mono text-[10px]">
                                  {u.role}
                                </Badge>
                              </td>
                              <td className="p-3">
                                {u.isActive ? (
                                  <span className="inline-flex items-center text-emerald-400">
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-rose-400">
                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                    Inactive
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border">
                      No user accounts associated with this college yet.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="p-8 text-center space-y-3 rounded-xl border border-dashed border-border/80 bg-secondary/10 animate-fade-in">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Subscription & Billing Controls</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Subscription management, feature tiers, and billing configuration will be integrated in Backend Phase 7 & Frontend Plans Module.
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-border/50">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
