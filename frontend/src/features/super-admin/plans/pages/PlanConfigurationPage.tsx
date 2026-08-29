import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { plansApi } from '../api/plansApi';
import { CreatePlanModal } from '../components/CreatePlanModal';
import { EditPlanModal } from '../components/EditPlanModal';
import { PlanDetailsModal } from '../components/PlanDetailsModal';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  Plus,
  Check,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { Plan } from '@/types/plans';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  tierTag: string;
  enabled: boolean;
}

interface PlanCardConfig {
  id?: string;
  name: string;
  price: string;
  minSeats: string;
  maxSeats: string;
  billingCycle: string;
  autoPricing: string;
  features: string[];
}

const DEFAULT_PLANS: PlanCardConfig[] = [
  {
    name: 'Basic',
    price: '₹499',
    minSeats: '10',
    maxSeats: '100',
    billingCycle: 'Annual',
    autoPricing: 'Disabled',
    features: [
      'Courses & Labs',
      'Assessments (Quiz/Test)',
      'Coding Judge',
      'Basic Analytics',
    ],
  },
  {
    name: 'Premium',
    price: '₹799',
    minSeats: '50',
    maxSeats: '500',
    billingCycle: 'Monthly/Annual',
    autoPricing: 'Enabled',
    features: [
      'All Basic features',
      'Exam Proctoring',
      'Contests',
      'Department Analytics',
      'Certificate Engine',
      'Priority Support',
    ],
  },
  {
    name: 'Enterprise',
    price: '₹1199',
    minSeats: '200',
    maxSeats: 'Unlimited',
    billingCycle: 'Annual',
    autoPricing: 'Enabled',
    features: [
      'All Premium features',
      'White-label / Custom Domain',
      'Custom Report Builder',
      'Dedicated CSM',
      'SLA Guarantee',
      'Bulk Import',
    ],
  },
];

export const PlanConfigurationPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<Plan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);

  // Inline feedback alert
  const [feedback, setFeedback] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Feature flag matrix state
  const [featureFlags, setFeatureFlags] = React.useState<FeatureFlag[]>([
    {
      id: 'proctoring-v2',
      name: 'Proctoring v2',
      description: 'New webcam monitoring with snapshot aggregation. Beta rollout.',
      tierTag: 'Premium + Enterprise',
      enabled: true,
    },
    {
      id: 'analytics-v3',
      name: 'Analytics v3 Dashboard',
      description: 'Redesigned analytics with custom report builder and scheduled delivery.',
      tierTag: 'Enterprise only',
      enabled: false,
    },
    {
      id: 'ai-certificates',
      name: 'AI Certificate Suggestions',
      description: 'AI-generated certificate template suggestions based on course content.',
      tierTag: '10% of Premium (random)',
      enabled: false,
    },
  ]);

  const toggleFeatureFlag = (id: string) => {
    setFeatureFlags((prev) =>
      prev.map((flag) =>
        flag.id === id ? { ...flag, enabled: !flag.enabled } : flag,
      ),
    );
  };

  // Fetch real plans from backend
  const {
    data: plans,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Plan[], Error>({
    queryKey: ['plans'],
    queryFn: () => plansApi.getPlans(),
    staleTime: 30_000,
  });

  // Map backend plans to standard UI presentation
  const displayPlans = React.useMemo(() => {
    return DEFAULT_PLANS.map((defaultPlan, index) => {
      const matchedBackendPlan = plans && plans[index] ? plans[index] : null;
      return {
        ...defaultPlan,
        id: matchedBackendPlan?.id || `plan-${index + 1}`,
        rawPlan: matchedBackendPlan || {
          id: `plan-${index + 1}`,
          name: defaultPlan.name,
          description: `${defaultPlan.name} tier`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, [plans]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subscription Plan Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Define the plans available for college sign-up and upgrades
          </p>
        </div>
        <LoadingState
          title="Loading Subscription Plans"
          description="Fetching configured plan tiers from the backend..."
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subscription Plan Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Define the plans available for college sign-up and upgrades
          </p>
        </div>
        <ErrorState
          title="Failed to Load Plans"
          message={error?.message || 'A network error occurred while connecting to the backend.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subscription Plan Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Define the plans available for college sign-up and upgrades
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5b52e0] hover:bg-[#4f46e5] active:bg-[#4338ca] rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Plan</span>
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

      {/* Plans 3-Column Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayPlans.map((plan) => (
          <div
            key={plan.name}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              {/* Card Header: Plan Name & Edit Plan Button */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  {plan.name}
                </h2>
                <button
                  onClick={() => setEditingPlan(plan.rawPlan)}
                  className="px-3.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
                  title="Edit Plan"
                >
                  Edit Plan
                </button>
              </div>

              {/* Plan Pricing */}
              <div className="mt-3 flex items-baseline">
                <span className="text-3xl font-black text-[#5b52e0] font-mono tracking-tight">
                  {plan.price}
                </span>
                <span className="text-xs text-slate-400 font-medium ml-1">
                  /seat/year
                </span>
              </div>

              {/* Metadata Specs */}
              <div className="mt-6 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500 font-medium">Min Seats</span>
                  <span className="font-semibold text-slate-900 font-mono">{plan.minSeats}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500 font-medium">Max Seats</span>
                  <span className="font-semibold text-slate-900 font-mono">{plan.maxSeats}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500 font-medium">Billing Cycle</span>
                  <span className="font-semibold text-slate-900">{plan.billingCycle}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500 font-medium">Auto-Pricing</span>
                  <span className="font-semibold text-slate-900">{plan.autoPricing}</span>
                </div>
              </div>

              {/* Features List */}
              <ul className="mt-6 space-y-3 pt-2">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center space-x-2 text-xs text-slate-700">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Flag Matrix Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900">
          Feature Flag Matrix
        </h2>

        <div className="space-y-6">
          {featureFlags.map((flag) => (
            <div
              key={flag.id}
              className="flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900">{flag.name}</p>
                <p className="text-xs text-slate-500">{flag.description}</p>
                <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-[10px] font-semibold px-2 py-0.5 rounded-md mt-1">
                  {flag.tierTag}
                </span>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={flag.enabled}
                onClick={() => toggleFeatureFlag(flag.id)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  flag.enabled ? 'bg-[#5b52e0]' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    flag.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

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
