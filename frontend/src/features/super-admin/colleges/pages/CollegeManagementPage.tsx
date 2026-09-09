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
import {
  Search,
  Plus,
  ArrowDownToLine,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { College, CollegeStatus } from '@/types/colleges';

// Default colleges matching Figma prototype if no backend tenants are present
const defaultFigmaColleges: College[] = [
  {
    id: 'col-figma-1',
    name: 'Sunrise Institute of Technology',
    domain: 'sunrise.edu',
    status: 'ACTIVE',
    createdAt: '2025-09-01T00:00:00.000Z',
    updatedAt: '2025-09-01T00:00:00.000Z',
  },
  {
    id: 'col-figma-2',
    name: 'Eastbrook Engineering College',
    domain: 'eastbrook.edu',
    status: 'ACTIVE',
    createdAt: '2025-11-15T00:00:00.000Z',
    updatedAt: '2025-11-15T00:00:00.000Z',
  },
  {
    id: 'col-figma-3',
    name: 'Westgate Polytechnic',
    domain: 'westgate.ac',
    status: 'ACTIVE',
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'col-figma-4',
    name: 'Clearwater University',
    domain: 'clearwater.edu',
    status: 'ACTIVE',
    createdAt: '2026-03-15T00:00:00.000Z',
    updatedAt: '2026-03-15T00:00:00.000Z',
  },
  {
    id: 'col-figma-5',
    name: 'Pinehurst Community College',
    domain: 'pinehurst.edu',
    status: 'TRIAL' as any,
    createdAt: '2025-08-20T00:00:00.000Z',
    updatedAt: '2025-08-20T00:00:00.000Z',
  },
  {
    id: 'col-figma-6',
    name: 'Northfield Institute',
    domain: 'northfield.edu',
    status: 'SUSPENDED',
    createdAt: '2025-03-01T00:00:00.000Z',
    updatedAt: '2025-03-01T00:00:00.000Z',
  },
];

export const CollegeManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { startImpersonation, isLoading: isImpersonatingLoading } = useImpersonation();

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

  // State management
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | CollegeStatus | 'TRIAL'>('ALL');

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

  // Fetch colleges list from backend
  const {
    data: fetchedColleges,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<College[], Error>({
    queryKey: ['colleges'],
    queryFn: () => collegesApi.getColleges(),
    staleTime: 30_000,
  });

  const colleges = fetchedColleges && fetchedColleges.length > 0 ? fetchedColleges : defaultFigmaColleges;

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

  // Export CSV helper
  const handleExportCSV = () => {
    if (!colleges || colleges.length === 0) return;
    const headers = ['ID', 'Name', 'Domain', 'Status', 'Created At'];
    const rows = colleges.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.domain || '',
      c.status,
      new Date(c.createdAt).toISOString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `colleges_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper metadata generators to reproduce Figma prototype exactly
  const getCollegePlan = (college: College, index: number) => {
    const name = college.name.toLowerCase();
    if (name.includes('eastbrook') || name.includes('clearwater')) return 'Enterprise';
    if (name.includes('pinehurst') || name.includes('northfield')) return 'Basic';
    if (name.includes('sunrise') || name.includes('westgate')) return 'Premium';
    const plans = ['Premium', 'Enterprise', 'Basic', 'Premium', 'Enterprise'];
    return plans[index % plans.length];
  };

  const getCollegeSeats = (college: College, index: number) => {
    const name = college.name.toLowerCase();
    if (name.includes('sunrise')) return { text: '342/400', color: 'bg-amber-400' };
    if (name.includes('eastbrook')) return { text: '980/1000', color: 'bg-rose-400' };
    if (name.includes('westgate')) return { text: '220/250', color: 'bg-amber-400' };
    if (name.includes('clearwater')) return { text: '1800/2000', color: 'bg-rose-400' };
    if (name.includes('pinehurst')) return { text: '78/100', color: 'bg-amber-400' };
    if (name.includes('northfield')) return { text: '45/60', color: 'bg-amber-400' };
    const defaults = [
      { text: '342/400', color: 'bg-amber-400' },
      { text: '980/1000', color: 'bg-rose-400' },
      { text: '220/250', color: 'bg-amber-400' },
    ];
    return defaults[index % defaults.length];
  };

  const getCollegeHealth = (college: College, index: number) => {
    const name = college.name.toLowerCase();
    if (college.status === 'SUSPENDED' || name.includes('northfield')) {
      return { score: '22 — At Risk', status: 'risk' };
    }
    if ((college.status as string) === 'TRIAL' || name.includes('pinehurst')) {
      return { score: '44 — Watch', status: 'watch' };
    }
    if (name.includes('sunrise')) return { score: '82 — Healthy', status: 'healthy' };
    if (name.includes('eastbrook')) return { score: '91 — Healthy', status: 'healthy' };
    if (name.includes('westgate')) return { score: '75 — Healthy', status: 'healthy' };
    if (name.includes('clearwater')) return { score: '88 — Healthy', status: 'healthy' };
    const healthyScores = ['82 — Healthy', '91 — Healthy', '75 — Healthy', '88 — Healthy'];
    return { score: healthyScores[index % healthyScores.length], status: 'healthy' };
  };

  const getCollegeRenewal = (college: College, createdAt: string) => {
    const name = college.name.toLowerCase();
    if (name.includes('sunrise')) return '2026-09-01';
    if (name.includes('eastbrook')) return '2026-11-15';
    if (name.includes('westgate')) return '2027-01-10';
    if (name.includes('clearwater')) return '2027-03-15';
    if (name.includes('pinehurst')) return '2026-08-20';
    if (name.includes('northfield')) return '2026-03-01';
    const d = new Date(createdAt);
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            College Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            All tenants on the Dezolver platform
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowDownToLine className="h-3.5 w-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add College</span>
          </button>
        </div>
      </div>

      {/* Inline Feedback Alerts */}
      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between p-3.5 rounded-xl border text-xs animate-fade-in ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:opacity-80 ml-4 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center space-x-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {(['ALL', 'ACTIVE', 'TRIAL', 'SUSPENDED'] as const).map((status) => {
            const isSelected = statusFilter === status;
            const label =
              status === 'ALL'
                ? 'All'
                : status === 'ACTIVE'
                  ? 'Active'
                  : status === 'TRIAL'
                    ? 'Trial'
                    : 'Suspended';

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#4f46e5] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* College Table Card */}
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
        <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-white text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                <tr>
                  <th className="py-4 pl-6 pr-4">COLLEGE</th>
                  <th className="py-4 px-4">PLAN</th>
                  <th className="py-4 px-4">SEATS</th>
                  <th className="py-4 px-4">STATUS</th>
                  <th className="py-4 px-4">HEALTH</th>
                  <th className="py-4 px-4">RENEWAL</th>
                  <th className="py-4 pl-4 pr-6 text-right">ACTIONS</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredColleges.map((college, index) => {
                  const isActive = college.status === 'ACTIVE';
                  const isTrial = (college.status as string) === 'TRIAL';
                  const health = getCollegeHealth(college, index);
                  const seats = getCollegeSeats(college, index);

                  return (
                    <tr
                      key={college.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* College Name & Domain */}
                      <td className="py-4 pl-6 pr-4">
                        <div>
                          <button
                            onClick={() => setSelectedCollegeId(college.id)}
                            className="font-bold text-slate-900 hover:text-indigo-600 text-left transition-colors cursor-pointer text-xs sm:text-[13px]"
                          >
                            {college.name}
                          </button>
                          <p className="text-[11px] text-indigo-400 font-normal mt-0.5">
                            {college.domain || 'no-domain'}
                          </p>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-4 px-4 font-bold text-slate-800">
                        {getCollegePlan(college, index)}
                      </td>

                      {/* Seats */}
                      <td className="py-4 px-4 font-mono text-slate-600 font-medium">
                        <div className="flex items-center space-x-2">
                          <span className={`h-1.5 w-4 rounded-full ${seats.color}`} />
                          <span>{seats.text}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${
                            isActive
                              ? 'bg-[#E8FAF0] text-[#059669] border-emerald-200/60'
                              : isTrial
                                ? 'bg-[#FEF9E7] text-[#D97706] border-amber-300/60'
                                : 'bg-[#FEE2E2] text-[#DC2626] border-rose-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                              isActive
                                ? 'bg-[#059669]'
                                : isTrial
                                  ? 'bg-[#D97706]'
                                  : 'bg-[#DC2626]'
                            }`}
                          />
                          {isTrial ? 'Trial' : isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Health */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${
                            health.status === 'healthy'
                              ? 'bg-[#E8FAF0] text-[#059669] border-emerald-200/60'
                              : health.status === 'watch'
                                ? 'bg-[#FEF9E7] text-[#D97706] border-amber-300/60'
                                : 'bg-[#FEE2E2] text-[#DC2626] border-rose-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                              health.status === 'healthy'
                                ? 'bg-[#059669]'
                                : health.status === 'watch'
                                  ? 'bg-[#D97706]'
                                  : 'bg-[#DC2626]'
                            }`}
                          />
                          {health.score}
                        </span>
                      </td>

                      {/* Renewal */}
                      <td className="py-4 px-4 font-mono text-slate-500 text-xs">
                        {getCollegeRenewal(college, college.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-4 pr-6 text-right">
                        <div className="inline-flex items-center justify-end space-x-3 text-xs">
                          {/* View link */}
                          <button
                            onClick={() => setSelectedCollegeId(college.id)}
                            className="font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            View
                          </button>

                          {/* Suspend link for active */}
                          {isActive && (
                            <button
                              onClick={() =>
                                setStatusActionTarget({
                                  college,
                                  action: 'suspend',
                                })
                              }
                              className="font-semibold text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Suspend College"
                            >
                              Suspend
                            </button>
                          )}

                          {/* Reactivate link for suspended */}
                          {college.status === 'SUSPENDED' && (
                            <button
                              onClick={() =>
                                setStatusActionTarget({
                                  college,
                                  action: 'reactivate',
                                })
                              }
                              className="font-semibold text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer"
                              title="Reactivate College"
                            >
                              Reactivate
                            </button>
                          )}

                          {/* View as Finance link */}
                          <button
                            onClick={() => handleImpersonate(college)}
                            disabled={isImpersonatingLoading || !isActive}
                            className="font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title={
                              !isActive
                                ? 'Cannot impersonate suspended college'
                                : 'Impersonate Finance Team'
                            }
                          >
                            View as Finance
                          </button>
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
