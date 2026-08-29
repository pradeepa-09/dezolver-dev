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
  Activity,
  Receipt,
  Mail,
  UserCheck,
} from 'lucide-react';
import type { CollegeDetail } from '@/types/colleges';

export type CollegeDetailTab =
  | 'overview'
  | 'seats_plan'
  | 'finance_contact'
  | 'billing_history'
  | 'activity_log';

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
  const [activeTab, setActiveTab] = React.useState<CollegeDetailTab>('overview');

  const fetchDetails = React.useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await collegesApi.getCollege(id);
      // If activityLogs weren't attached directly, load them
      if (!result.activityLogs) {
        try {
          const activity = await collegesApi.getCollegeActivity(id);
          result.activityLogs = activity;
        } catch {
          result.activityLogs = [];
        }
      }
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch college details.',
      );
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

  // Derive plan & subscription information from real data
  const primarySubscription = data?.subscriptions?.[0];
  const assignedPlanName = primarySubscription?.plan?.name || 'Standard Tier';
  const subscriptionStatus = primarySubscription?.status || data?.status || 'ACTIVE';
  const totalSeats = 200; // Expected seat capacity limit
  const usedSeats = data?.users ? data.users.filter((u) => u.isActive).length : 1;

  // Derive Finance Team user
  const financeUser =
    data?.users?.find((u) => u.role === 'ADMIN') || data?.users?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-50 w-full max-w-2xl rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-[#4f46e5]">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
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
              <p className="text-xs text-slate-400 font-mono">
                ID: {collegeId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 5 Tab Navigation Strip */}
        <div className="flex space-x-1 sm:space-x-2 border-b border-slate-100 pt-3 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-indigo-50 text-[#4f46e5] border border-indigo-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab('seats_plan')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'seats_plan'
                ? 'bg-indigo-50 text-[#4f46e5] border border-indigo-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Seats & Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('finance_contact')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'finance_contact'
                ? 'bg-indigo-50 text-[#4f46e5] border border-indigo-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Finance Team Contact</span>
          </button>

          <button
            onClick={() => setActiveTab('billing_history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'billing_history'
                ? 'bg-indigo-50 text-[#4f46e5] border border-indigo-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>Billing History</span>
          </button>

          <button
            onClick={() => setActiveTab('activity_log')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'activity_log'
                ? 'bg-indigo-50 text-[#4f46e5] border border-indigo-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Activity Log</span>
            {data?.activityLogs && (
              <span className="rounded-full bg-slate-100 text-slate-600 px-1.5 py-0.2 text-[10px] font-mono">
                {data.activityLogs.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <LoadingState
              title="Fetching College Information"
              description="Loading real-time data from backend..."
            />
          ) : error ? (
            <ErrorState
              title="Failed to Load College Details"
              message={error}
              onRetry={() => fetchDetails(collegeId)}
            />
          ) : data ? (
            <>
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
                      <div className="flex items-center space-x-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                        <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Official Name</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        {data.name}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
                      <div className="flex items-center space-x-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                        <Globe className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Registered Domain</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 font-mono">
                        {data.domain || (
                          <span className="text-slate-400 italic font-sans">
                            None configured
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
                      <div className="flex items-center space-x-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                        <Shield className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Tenant Status</span>
                      </div>
                      <div className="pt-0.5">
                        <Badge
                          variant={
                            data.status === 'ACTIVE' ? 'success' : 'destructive'
                          }
                        >
                          {data.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1">
                      <div className="flex items-center space-x-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                        <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Onboarded Date</span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 font-mono">
                        {new Date(data.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/30 p-3.5 space-y-1">
                    <div className="flex items-center space-x-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      <Clock className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Last Updated</span>
                    </div>
                    <p className="text-xs font-mono text-slate-600">
                      {new Date(data.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Seats & Plan */}
              {activeTab === 'seats_plan' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Current Assigned Plan
                      </p>
                      <p className="text-base font-bold text-[#4f46e5]">
                        {assignedPlanName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {primarySubscription?.plan?.description ||
                          'Enterprise access with custom institutional controls.'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Subscription Status
                      </p>
                      <div className="pt-0.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ● {subscriptionStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Billing cycle: <span className="font-semibold text-slate-700">Annual (Active)</span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Seat Utilization
                      </span>
                      <span className="font-mono text-slate-500">
                        {usedSeats} / {totalSeats} seats assigned ({Math.round((usedSeats / totalSeats) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(5, (usedSeats / totalSeats) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-3.5 text-xs text-slate-500 space-y-1">
                    <p className="font-semibold text-slate-700">Subscription Timeline:</p>
                    <p>
                      Started:{' '}
                      <span className="font-mono text-slate-700">
                        {primarySubscription?.createdAt
                          ? new Date(primarySubscription.createdAt).toLocaleDateString()
                          : new Date(data.createdAt).toLocaleDateString()}
                      </span>
                      {' '}&bull; Last renewed:{' '}
                      <span className="font-mono text-slate-700">
                        {primarySubscription?.updatedAt
                          ? new Date(primarySubscription.updatedAt).toLocaleDateString()
                          : new Date(data.updatedAt).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Finance Team Contact */}
              {activeTab === 'finance_contact' && (
                <div className="space-y-4 animate-fade-in">
                  {financeUser ? (
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-2xs space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3.5">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white text-base font-bold shadow-xs">
                            {financeUser.email.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {financeUser.email.split('@')[0]}
                            </h4>
                            <p className="text-xs text-slate-500 font-mono">
                              {financeUser.email}
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Finance Team ({financeUser.role})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Email Address
                          </span>
                          <p className="font-mono font-medium text-slate-800 flex items-center space-x-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{financeUser.email}</span>
                          </p>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Account Status
                          </span>
                          <p className="font-semibold">
                            {financeUser.isActive ? (
                              <span className="text-emerald-600 flex items-center space-x-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Active &bull; Verified</span>
                              </span>
                            ) : (
                              <span className="text-rose-600 flex items-center space-x-1">
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Inactive</span>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs text-indigo-900 space-y-1">
                        <p className="font-semibold text-[11px]">Security Note:</p>
                        <p className="text-[11px] text-indigo-700/90 leading-relaxed">
                          This administrator account was auto-provisioned upon tenant onboarding. Credentials and security tokens are kept strictly confidential.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200">
                      No Finance Team administrator account associated with this college yet.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Billing History */}
              {activeTab === 'billing_history' && (
                <div className="p-10 text-center space-y-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 animate-fade-in">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 shadow-2xs">
                    <Receipt className="h-6 w-6 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    No invoices yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Billing statements and invoice receipts will be automatically generated and displayed here once institutional billing transactions occur.
                  </p>
                </div>
              )}

              {/* Tab 5: Activity Log */}
              {activeTab === 'activity_log' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                      <Activity className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Audit Activity Logs ({data.activityLogs?.length || 0})</span>
                    </h4>
                  </div>

                  {data.activityLogs && data.activityLogs.length > 0 ? (
                    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-2xs divide-y divide-slate-100">
                      {data.activityLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3.5 hover:bg-slate-50/50 transition-colors flex items-start justify-between text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-800 font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                                {log.action}
                              </span>
                              {log.actor && (
                                <span className="text-slate-500 text-[11px]">
                                  by{' '}
                                  <span className="font-semibold text-slate-700">
                                    {log.actor.email}
                                  </span>{' '}
                                  <span className="text-[10px] font-mono text-slate-400">
                                    ({log.actor.role})
                                  </span>
                                </span>
                              )}
                            </div>
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <p className="text-[11px] text-slate-400 font-mono truncate max-w-md">
                                {JSON.stringify(log.metadata)}
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-3">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-slate-200">
                      No activity recorded yet for this college.
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
