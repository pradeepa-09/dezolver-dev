import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { plansApi } from '../api/plansApi';
import { CreatePlanModal } from '../components/CreatePlanModal';
import { EditPlanModal } from '../components/EditPlanModal';
import { PlanDetailsModal } from '../components/PlanDetailsModal';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  CreditCard,
  Plus,
  Search,
  Eye,
  Edit2,
  Calendar,
  Layers,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import type { Plan } from '@/types/plans';

export const PlanConfigurationPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<Plan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);

  const [feedback, setFeedback] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const {
    data: plans,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Plan[], Error>({
    queryKey: ['plans'],
    queryFn: () => plansApi.getPlans(),
    staleTime: 30_000,
  });

  const filteredPlans = React.useMemo(() => {
    if (!plans) return [];
    return plans.filter((p) => {
      const term = searchTerm.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    });
  }, [plans, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Subscription Plans
            </h1>
            <Badge variant="default" className="font-mono text-xs">
              {plans?.length || 0} Configured
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Define, update, and manage institutional subscription tiers and feature entitlements across colleges.
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
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Plan
          </Button>
        </div>
      </div>

      {/* Inline Feedback Alerts */}
      {feedback && (
        <div
          role="status"
          className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-800/40 bg-emerald-950/30 text-emerald-200 text-xs animate-fade-in"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:opacity-80 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card/60 p-3 rounded-xl border border-border/80">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Search plans by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Table / State Views */}
      {isLoading ? (
        <LoadingState
          title="Loading Subscription Plans"
          description="Fetching configured plan tiers from the backend..."
        />
      ) : isError ? (
        <ErrorState
          title="Failed to Load Plans"
          message={error?.message || 'A network error occurred while connecting to the backend.'}
          onRetry={() => refetch()}
        />
      ) : filteredPlans.length === 0 ? (
        searchTerm ? (
          <EmptyState
            title="No Matching Plans"
            description="No subscription plans matched your search query."
            actionLabel="Reset Search"
            onAction={() => setSearchTerm('')}
          />
        ) : (
          <EmptyState
            title="No Subscription Plans Configured"
            description="Create your first subscription tier to begin onboarding college subscribers."
            actionLabel="Create First Plan"
            onAction={() => setIsCreateModalOpen(true)}
          />
        )
      ) : (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xl animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-border/80 bg-secondary/40 text-muted-foreground font-semibold text-xs">
                <tr>
                  <th className="p-4 pl-5">Plan Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Subscribed Colleges</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredPlans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-secondary/25 transition-colors group"
                  >
                    {/* Plan Name & ID */}
                    <td className="p-4 pl-5">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary border border-border/60 text-indigo-400 group-hover:border-indigo-500/40 transition-colors">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div>
                          <button
                            onClick={() => setSelectedPlanId(plan.id)}
                            className="font-bold text-foreground hover:text-indigo-400 text-left transition-colors cursor-pointer"
                          >
                            {plan.name}
                          </button>
                          <p className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px]">
                            {plan.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="p-4 text-xs text-muted-foreground max-w-xs truncate">
                      {plan.description || (
                        <span className="italic text-muted-foreground/60">—</span>
                      )}
                    </td>

                    {/* Subscriptions */}
                    <td className="p-4">
                      <div className="flex items-center space-x-1.5 font-mono text-xs text-foreground">
                        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{plan._count?.subscriptions || 0}</span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="p-4 text-xs font-mono text-muted-foreground">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-5 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPlanId(plan.id)}
                          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                          title="View Details"
                          leftIcon={<Eye className="h-3.5 w-3.5" />}
                        >
                          <span className="hidden md:inline">Details</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPlan(plan)}
                          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                          title="Edit Plan"
                          leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                        >
                          <span className="hidden md:inline">Edit</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreatePlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(created) => {
          queryClient.setQueryData<Plan[]>(['plans'], (prev) =>
            prev ? [created, ...prev] : [created],
          );
          setFeedback({
            type: 'success',
            message: `Plan "${created.name}" created successfully.`,
          });
        }}
      />

      {/* Edit Modal */}
      <EditPlanModal
        plan={editingPlan}
        isOpen={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        onSuccess={(updated) => {
          queryClient.setQueryData<Plan[]>(['plans'], (prev) =>
            prev ? prev.map((p) => (p.id === updated.id ? updated : p)) : [updated],
          );
          setFeedback({
            type: 'success',
            message: `Plan "${updated.name}" updated successfully.`,
          });
        }}
      />

      {/* Details Modal */}
      <PlanDetailsModal
        planId={selectedPlanId}
        isOpen={!!selectedPlanId}
        onClose={() => setSelectedPlanId(null)}
      />
    </div>
  );
};
