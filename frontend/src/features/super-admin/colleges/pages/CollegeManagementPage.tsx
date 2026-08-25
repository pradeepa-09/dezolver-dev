import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collegesApi } from '../api/collegesApi';
import { useImpersonation } from '../context/useImpersonation';
import { CreateCollegeModal } from '../components/CreateCollegeModal';
import { EditCollegeModal } from '../components/EditCollegeModal';
import { CollegeDetailsModal } from '../components/CollegeDetailsModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Building2,
  Plus,
  Search,
  Eye,
  Edit2,
  PowerOff,
  Power,
  UserCheck,
  Globe,
  Calendar,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import type { College, CollegeStatus } from '@/types/colleges';

export const CollegeManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { startImpersonation, isLoading: isImpersonatingLoading } = useImpersonation();

  // State management
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | CollegeStatus>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingCollege, setEditingCollege] = React.useState<College | null>(null);
  const [selectedCollegeId, setSelectedCollegeId] = React.useState<string | null>(null);

  // Status confirmation dialog state
  const [statusActionTarget, setStatusActionTarget] = React.useState<{
    college: College;
    action: 'suspend' | 'reactivate';
  } | null>(null);

  // Feedback alerts
  const [feedback, setFeedback] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Fetch colleges list
  const {
    data: colleges,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<College[], Error>({
    queryKey: ['colleges'],
    queryFn: () => collegesApi.getColleges(),
    staleTime: 30_000,
  });

  // Suspend mutation
  const suspendMutation = useMutation({
    mutationFn: (id: string) => collegesApi.suspendCollege(id),
    onSuccess: (updated) => {
      queryClient.setQueryData<College[]>(['colleges'], (prev) =>
        prev ? prev.map((c) => (c.id === updated.id ? updated : c)) : [updated],
      );
      setFeedback({
        type: 'success',
        message: `${updated.name} was successfully suspended.`,
      });
      setStatusActionTarget(null);
    },
    onError: (err) => {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to suspend college.',
      });
      setStatusActionTarget(null);
    },
  });

  // Reactivate mutation
  const reactivateMutation = useMutation({
    mutationFn: (id: string) => collegesApi.reactivateCollege(id),
    onSuccess: (updated) => {
      queryClient.setQueryData<College[]>(['colleges'], (prev) =>
        prev ? prev.map((c) => (c.id === updated.id ? updated : c)) : [updated],
      );
      setFeedback({
        type: 'success',
        message: `${updated.name} was successfully reactivated.`,
      });
      setStatusActionTarget(null);
    },
    onError: (err) => {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to reactivate college.',
      });
      setStatusActionTarget(null);
    },
  });

  // Handle impersonation trigger
  const handleImpersonate = async (college: College) => {
    try {
      await startImpersonation(college);
      setFeedback({
        type: 'success',
        message: `Impersonation session started for ${college.name}.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to start impersonation.',
      });
    }
  };

  // Client-side filtering
  const filteredColleges = React.useMemo(() => {
    if (!colleges) return [];
    return colleges.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (c.domain && c.domain.toLowerCase().includes(searchTerm.toLowerCase().trim()));

      const matchesStatus =
        statusFilter === 'ALL' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [colleges, searchTerm, statusFilter]);

  const counts = React.useMemo(() => {
    if (!colleges) return { all: 0, active: 0, suspended: 0 };
    return {
      all: colleges.length,
      active: colleges.filter((c) => c.status === 'ACTIVE').length,
      suspended: colleges.filter((c) => c.status === 'SUSPENDED').length,
    };
  }, [colleges]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              College Management
            </h1>
            <Badge variant="default" className="font-mono text-xs">
              {counts.all} Registered
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage multi-tenant college onboarding, institutional domains, operational status, and Finance Team impersonation.
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
            Add College
          </Button>
        </div>
      </div>

      {/* Inline Feedback Alerts */}
      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between p-3.5 rounded-xl border text-xs animate-fade-in ${
            feedback.type === 'success'
              ? 'border-emerald-800/40 bg-emerald-950/30 text-emerald-200'
              : 'border-rose-800/40 bg-rose-950/30 text-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
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

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card/60 p-3 rounded-xl border border-border/80">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Search by college name or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="h-9 text-xs"
          />
        </div>

        <div className="flex items-center space-x-1 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            }`}
          >
            Active ({counts.active})
          </button>
          <button
            onClick={() => setStatusFilter('SUSPENDED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'SUSPENDED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            }`}
          >
            Suspended ({counts.suspended})
          </button>
        </div>
      </div>

      {/* College Table / States */}
      {isLoading ? (
        <LoadingState
          title="Loading College Directory"
          description="Fetching tenant records from the backend..."
        />
      ) : isError ? (
        <ErrorState
          title="Unable to Load Colleges"
          message={error?.message || 'A network error occurred while communicating with the backend.'}
          onRetry={() => refetch()}
        />
      ) : filteredColleges.length === 0 ? (
        searchTerm || statusFilter !== 'ALL' ? (
          <EmptyState
            title="No Matching Colleges"
            description="No colleges match your current search or status filter criteria."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
            }}
          />
        ) : (
          <EmptyState
            title="No Colleges Registered"
            description="Get started by onboarding your first college into the Dezolver platform."
            actionLabel="Add First College"
            onAction={() => setIsCreateModalOpen(true)}
          />
        )
      ) : (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xl animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-border/80 bg-secondary/40 text-muted-foreground font-semibold text-xs">
                <tr>
                  <th className="p-4 pl-5">College Name</th>
                  <th className="p-4">Domain</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Onboarded</th>
                  <th className="p-4 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredColleges.map((college) => {
                  const isActive = college.status === 'ACTIVE';

                  return (
                    <tr
                      key={college.id}
                      className="hover:bg-secondary/25 transition-colors group"
                    >
                      {/* Name */}
                      <td className="p-4 pl-5">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary border border-border/60 text-indigo-400 group-hover:border-indigo-500/40 transition-colors">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <button
                              onClick={() => setSelectedCollegeId(college.id)}
                              className="font-bold text-foreground hover:text-indigo-400 text-left transition-colors cursor-pointer"
                            >
                              {college.name}
                            </button>
                            <p className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px]">
                              {college.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Domain */}
                      <td className="p-4 font-mono text-xs">
                        {college.domain ? (
                          <div className="flex items-center space-x-1.5 text-foreground">
                            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{college.domain}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic font-sans text-xs">
                            —
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
                        <Badge
                          variant={isActive ? 'success' : 'destructive'}
                          className="font-medium text-xs"
                        >
                          {college.status}
                        </Badge>
                      </td>

                      {/* Created At */}
                      <td className="p-4 text-xs font-mono text-muted-foreground">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(college.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-5 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          {/* Details */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCollegeId(college.id)}
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                            title="View Details"
                            leftIcon={<Eye className="h-3.5 w-3.5" />}
                          >
                            <span className="hidden md:inline">Details</span>
                          </Button>

                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCollege(college)}
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                            title="Edit College"
                            leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                          >
                            <span className="hidden md:inline">Edit</span>
                          </Button>

                          {/* Suspend / Reactivate Trigger */}
                          {isActive ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setStatusActionTarget({
                                  college,
                                  action: 'suspend',
                                })
                              }
                              className="h-8 px-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                              title="Suspend College"
                              leftIcon={<PowerOff className="h-3.5 w-3.5" />}
                            >
                              <span className="hidden md:inline">Suspend</span>
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setStatusActionTarget({
                                  college,
                                  action: 'reactivate',
                                })
                              }
                              className="h-8 px-2.5 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30"
                              title="Reactivate College"
                              leftIcon={<Power className="h-3.5 w-3.5" />}
                            >
                              <span className="hidden md:inline">Reactivate</span>
                            </Button>
                          )}

                          {/* Impersonate / View as Finance Team */}
                          <Button
                            variant="subtle"
                            size="sm"
                            onClick={() => handleImpersonate(college)}
                            disabled={isImpersonatingLoading || !isActive}
                            className="h-8 px-2.5 text-xs"
                            title={
                              !isActive
                                ? 'Cannot impersonate suspended college'
                                : 'Impersonate Finance Team'
                            }
                            leftIcon={<UserCheck className="h-3.5 w-3.5" />}
                          >
                            <span className="hidden lg:inline">View as Finance</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals & Dialogs */}
      <CreateCollegeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(created) => {
          queryClient.setQueryData<College[]>(['colleges'], (prev) =>
            prev ? [created.college, ...prev] : [created.college],
          );
          setFeedback({
            type: 'success',
            message: `${created.college.name} was successfully onboarded.`,
          });
        }}
      />

      <EditCollegeModal
        college={editingCollege}
        isOpen={!!editingCollege}
        onClose={() => setEditingCollege(null)}
        onSuccess={(updated) => {
          queryClient.setQueryData<College[]>(['colleges'], (prev) =>
            prev ? prev.map((c) => (c.id === updated.id ? updated : c)) : [updated],
          );
          setFeedback({
            type: 'success',
            message: `${updated.name} details were updated.`,
          });
        }}
      />

      <CollegeDetailsModal
        collegeId={selectedCollegeId}
        isOpen={!!selectedCollegeId}
        onClose={() => setSelectedCollegeId(null)}
      />

      {/* Suspend / Reactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!statusActionTarget}
        variant={
          statusActionTarget?.action === 'suspend' ? 'danger' : 'default'
        }
        title={
          statusActionTarget?.action === 'suspend'
            ? `Suspend ${statusActionTarget.college.name}?`
            : `Reactivate ${statusActionTarget?.college.name}?`
        }
        description={
          statusActionTarget?.action === 'suspend'
            ? `Are you sure you want to suspend this college? Students and administrators associated with this tenant will be blocked from accessing platform services.`
            : `Are you sure you want to reactivate this college? Tenant access will be immediately restored.`
        }
        confirmLabel={
          statusActionTarget?.action === 'suspend'
            ? 'Yes, Suspend College'
            : 'Yes, Reactivate College'
        }
        isLoading={
          suspendMutation.isPending || reactivateMutation.isPending
        }
        onConfirm={() => {
          if (!statusActionTarget) return;
          if (statusActionTarget.action === 'suspend') {
            suspendMutation.mutate(statusActionTarget.college.id);
          } else {
            reactivateMutation.mutate(statusActionTarget.college.id);
          }
        }}
        onCancel={() => setStatusActionTarget(null)}
      />
    </div>
  );
};
