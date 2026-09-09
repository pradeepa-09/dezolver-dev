import * as React from 'react';
import { plansApi } from '../api/plansApi';
import { AlertCircle, X, Info } from 'lucide-react';
import type { Plan, CreatePlanDto } from '@/types/plans';

export interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (plan: Plan) => void;
}

export const CreatePlanModal: React.FC<CreatePlanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = React.useState('');
  const [pricePerSeat, setPricePerSeat] = React.useState('');
  const [minSeats, setMinSeats] = React.useState('');
  const [maxSeats, setMaxSeats] = React.useState('');
  const [billingCycle, setBillingCycle] = React.useState<'Monthly' | 'Annual' | 'Monthly/Annual'>('Annual');
  const [autoPricing, setAutoPricing] = React.useState(false);

  // Features list
  const [features, setFeatures] = React.useState<string[]>([]);
  const [featureInput, setFeatureInput] = React.useState('');

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setPricePerSeat('');
      setMinSeats('');
      setMaxSeats('');
      setBillingCycle('Annual');
      setAutoPricing(false);
      setFeatures([]);
      setFeatureInput('');
      setErrors({});
      setApiError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures((prev) => [...prev, trimmed]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (featureToRemove: string) => {
    setFeatures((prev) => prev.filter((f) => f !== featureToRemove));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Plan name is required';
    } else if (name.length > 255) {
      newErrors.name = 'Plan name must be under 255 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const description = [
        pricePerSeat ? `Price: ₹${pricePerSeat}/seat/year` : '',
        minSeats ? `Min: ${minSeats}` : '',
        maxSeats ? `Max: ${maxSeats}` : '',
        `Billing: ${billingCycle}`,
        features.length > 0 ? `Features: ${features.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      const payload: CreatePlanDto = {
        name: name.trim(),
        description: description || undefined,
      };

      const created = await plansApi.createPlan(payload);
      onSuccess(created);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create subscription plan';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-50 w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl animate-fade-in border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-base font-bold text-slate-900">Add New Plan</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="mt-3 flex items-center space-x-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Row 1: Plan Name & Price per seat */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="create-plan-name"
                className="block text-[10px] font-bold uppercase tracking-wider text-slate-500"
              >
                PLAN NAME <span className="text-rose-500">*</span>
              </label>
              <input
                id="create-plan-name"
                type="text"
                placeholder="e.g. Starter"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                autoFocus
              />
              {errors.name && (
                <p className="text-[11px] font-medium text-rose-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="create-plan-price"
                className="block text-[10px] font-bold uppercase tracking-wider text-slate-500"
              >
                PRICE PER SEAT (₹/YEAR) <span className="text-rose-500">*</span>
              </label>
              <input
                id="create-plan-price"
                type="text"
                placeholder="e.g. 299"
                value={pricePerSeat}
                onChange={(e) => setPricePerSeat(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          {/* Row 2: Min Seats & Max Seats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="create-plan-min-seats"
                className="block text-[10px] font-bold uppercase tracking-wider text-slate-500"
              >
                MIN SEATS <span className="text-rose-500">*</span>
              </label>
              <input
                id="create-plan-min-seats"
                type="text"
                placeholder="e.g. 10"
                value={minSeats}
                onChange={(e) => setMinSeats(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="create-plan-max-seats"
                className="block text-[10px] font-bold uppercase tracking-wider text-slate-500"
              >
                MAX SEATS <span className="text-rose-500">*</span>
              </label>
              <input
                id="create-plan-max-seats"
                type="text"
                placeholder="e.g. 100"
                value={maxSeats}
                onChange={(e) => setMaxSeats(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          {/* Row 3: Billing Cycle */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              BILLING CYCLE <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Monthly', 'Annual', 'Monthly/Annual'] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`h-9 px-3 text-xs font-semibold rounded-xl border transition-all ${
                    billingCycle === cycle
                      ? 'border-[#5b52e0] text-[#5b52e0] bg-indigo-50/20 shadow-2xs'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  {cycle}
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Auto-Pricing Toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-bold text-slate-900">Auto-Pricing</p>
              <p className="text-[11px] text-slate-400">
                Automatically adjust pricing based on seat tier
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={autoPricing}
              onClick={() => setAutoPricing(!autoPricing)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoPricing ? 'bg-[#5b52e0]' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  autoPricing ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Row 5: Features Included */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900">
              Features Included
            </label>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type a feature and press Enter..."
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                className="flex-1 h-9 rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="h-9 px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 shadow-2xs transition-all"
              >
                Add
              </button>
            </div>

            {/* Chips or Empty Helper */}
            {features.length === 0 ? (
              <p className="text-[11px] italic text-slate-400 pt-0.5">
                No features added yet. Leave empty to use defaults.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-xs font-medium"
                  >
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(feature)}
                      className="text-indigo-400 hover:text-indigo-700 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Info Banner */}
          <div className="flex items-start space-x-2 rounded-xl bg-indigo-50/60 border border-indigo-100 p-3 text-xs text-indigo-700">
            <Info className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
            <p className="font-medium leading-relaxed text-[11px]">
              The new plan will be immediately available for college sign-up and upgrade workflows.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#5b52e0] hover:bg-[#4f46e5] active:bg-[#4338ca] rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
