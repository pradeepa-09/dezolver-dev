import * as React from 'react';
import { plansApi } from '../api/plansApi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  CreditCard,
  Building2,
  Calendar,
  Layers,
  X,
  Clock,
  FileText,
} from 'lucide-react';
import type { PlanDetail } from '@/types/plans';

export interface PlanDetailsModalProps {
  planId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({
  planId,
  isOpen,
  onClose,
}) => {
  const [data, setData] = React.useState<PlanDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchDetails = React.useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await plansApi.getPlan(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan details');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen && planId) {
      fetchDetails(planId);
    } else {
      setData(null);
      setError(null);
    }
  }, [isOpen, planId, fetchDetails]);

  if (!isOpen || !planId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-50 w-full max-w-xl rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-foreground">
                  {data?.name || 'Plan Details'}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground font-mono">ID: {planId}</p>
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

        {/* Modal Body */}
        <div className="py-4 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <LoadingState
              title="Loading Plan Details"
              description="Fetching plan and subscription associations..."
            />
          ) : error ? (
            <ErrorState
              title="Failed to Load Plan"
              message={error}
              onRetry={() => fetchDetails(planId)}
            />
          ) : data ? (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/60 bg-secondary/30 p-3.5 space-y-1">
                  <div className="flex items-center space-x-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Plan Name</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{data.name}</p>
                </div>

                <div className="rounded-xl border border-border/60 bg-secondary/30 p-3.5 space-y-1">
                  <div className="flex items-center space-x-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Subscribed Tenants</span>
                  </div>
                  <p className="text-sm font-bold text-indigo-400 font-mono">
                    {data.subscriptions?.length ?? data._count?.subscriptions ?? 0} Active
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-secondary/30 p-3.5 space-y-1">
                  <div className="flex items-center space-x-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Created At</span>
                  </div>
                  <p className="text-xs font-mono text-foreground">
                    {new Date(data.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-secondary/30 p-3.5 space-y-1">
                  <div className="flex items-center space-x-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Last Updated</span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">
                    {new Date(data.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl border border-border/60 bg-secondary/20 p-3.5 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </p>
                <p className="text-xs text-foreground leading-relaxed">
                  {data.description || (
                    <span className="text-muted-foreground italic">No description provided.</span>
                  )}
                </p>
              </div>

              {/* Subscriptions Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Subscribed Colleges ({data.subscriptions?.length || 0})</span>
                </h4>

                {data.subscriptions && data.subscriptions.length > 0 ? (
                  <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border/60 bg-secondary/40 text-muted-foreground">
                        <tr>
                          <th className="p-3 font-semibold">College Name</th>
                          <th className="p-3 font-semibold">Domain</th>
                          <th className="p-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {data.subscriptions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-secondary/20 transition-colors">
                            <td className="p-3 font-medium text-foreground">
                              {sub.college?.name || sub.collegeId}
                            </td>
                            <td className="p-3 font-mono text-muted-foreground">
                              {sub.college?.domain || '—'}
                            </td>
                            <td className="p-3">
                              <Badge
                                variant={sub.status === 'ACTIVE' ? 'success' : 'secondary'}
                                className="text-[10px]"
                              >
                                {sub.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-5 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border">
                    No colleges are currently subscribed to this plan.
                  </div>
                )}
              </div>
            </div>
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
