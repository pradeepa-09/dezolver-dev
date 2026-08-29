import * as React from 'react';
import { collegesApi } from '../api/collegesApi';
import { AlertCircle, CheckCircle2, X, ChevronDown } from 'lucide-react';
import { ApiError, ValidationError } from '@/lib/api/errors';
import type { CreateCollegeResponse } from '@/types/colleges';

export interface CreateCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (created: CreateCollegeResponse) => void;
}

export const CreateCollegeModal: React.FC<CreateCollegeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = React.useState('');
  const [domain, setDomain] = React.useState('');
  const [plan, setPlan] = React.useState('Premium');
  const [seats, setSeats] = React.useState('200');
  const [financeEmail, setFinanceEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    name?: string;
    domain?: string;
    form?: string;
  }>({});
  const [successInfo, setSuccessInfo] = React.useState<CreateCollegeResponse | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setDomain('');
      setPlan('Premium');
      setSeats('200');
      setFinanceEmail('');
      setErrors({});
      setSuccessInfo(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Suggest finance email when domain is typed
  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDomain(val);
    if (!financeEmail || financeEmail.startsWith('finance@')) {
      if (val.trim()) {
        setFinanceEmail(`finance@${val.trim()}`);
      } else {
        setFinanceEmail('');
      }
    }
    if (errors.domain) setErrors((prev) => ({ ...prev, domain: undefined }));
  };

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'College name is required';
    } else if (name.trim().length > 255) {
      newErrors.name = 'College name must not exceed 255 characters';
    }

    if (domain.trim() && domain.trim().length > 255) {
      newErrors.domain = 'Domain must not exceed 255 characters';
    } else if (
      domain.trim() &&
      !/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
        domain.trim(),
      )
    ) {
      newErrors.domain = 'Please enter a valid domain (e.g. stanford.edu)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrors({});
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await collegesApi.createCollege({
        name: name.trim(),
        domain: domain.trim() || undefined,
      });

      setSuccessInfo(response);
      onSuccess(response);
    } catch (err) {
      if (err instanceof ValidationError) {
        setErrors({ form: err.message });
      } else if (err instanceof ApiError) {
        setErrors({ form: err.message });
      } else {
        setErrors({ form: 'An unexpected error occurred while creating the college.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Modal Dialog Box */}
      <div className="relative z-50 w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Add New College
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4">
          {errors.form && (
            <div
              role="alert"
              className="flex items-start space-x-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 animate-fade-in"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          {successInfo ? (
            <div className="space-y-4 animate-fade-in py-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-2 text-emerald-900">
                <div className="flex items-center space-x-2 text-emerald-800 font-semibold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>College Created Successfully!</span>
                </div>
                <p className="text-xs text-emerald-700">
                  <span className="font-semibold">{successInfo.college.name}</span> has been onboarded with initial <span className="font-mono font-bold">ACTIVE</span> status.
                </p>
                <div className="mt-3 p-3 rounded-xl bg-white border border-emerald-200 text-xs space-y-1 text-slate-600">
                  <p className="font-semibold text-slate-800">Auto-Provisioned Finance Team Account:</p>
                  <p className="font-mono text-emerald-700 font-medium">{successInfo.financeUser.email}</p>
                  <p className="text-[11px] text-slate-500">
                    Role: <span className="font-mono">{successInfo.financeUser.role}</span> &bull; Plan: {plan} &bull; Seats: {seats}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Field 1: College Name */}
              <div>
                <label
                  htmlFor="collegeName"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  COLLEGE NAME <span className="text-rose-500">*</span>
                </label>
                <input
                  id="collegeName"
                  type="text"
                  placeholder="e.g. Sunrise Institute of Technology"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  disabled={isSubmitting}
                  maxLength={255}
                  className={`h-11 w-full rounded-2xl border bg-white px-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all ${
                    errors.name ? 'border-rose-300 ring-1 ring-rose-500/30' : 'border-slate-200'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Field 2: Domain */}
              <div>
                <label
                  htmlFor="collegeDomain"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  DOMAIN <span className="text-rose-500">*</span>
                </label>
                <input
                  id="collegeDomain"
                  type="text"
                  placeholder="e.g. sunrise.edu"
                  value={domain}
                  onChange={handleDomainChange}
                  disabled={isSubmitting}
                  maxLength={255}
                  className={`h-11 w-full rounded-2xl border bg-white px-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all ${
                    errors.domain ? 'border-rose-300 ring-1 ring-rose-500/30' : 'border-slate-200'
                  }`}
                />
                {errors.domain && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{errors.domain}</p>
                )}
              </div>

              {/* Field 3: Subscription Plan */}
              <div>
                <label
                  htmlFor="subscriptionPlan"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  SUBSCRIPTION PLAN <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="subscriptionPlan"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs appearance-none transition-all cursor-pointer"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                  <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 4: Expected Seats */}
              <div>
                <label
                  htmlFor="expectedSeats"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  EXPECTED SEATS <span className="text-rose-500">*</span>
                </label>
                <input
                  id="expectedSeats"
                  type="number"
                  min="1"
                  placeholder="200"
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
                />
              </div>

              {/* Field 5: Finance Team Email */}
              <div>
                <label
                  htmlFor="financeEmail"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  FINANCE TEAM EMAIL <span className="text-rose-500">*</span>
                </label>
                <input
                  id="financeEmail"
                  type="email"
                  placeholder="finance@college.edu"
                  value={financeEmail}
                  onChange={(e) => setFinanceEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
                />
              </div>

              {/* Automatic Provisioning Info Callout */}
              <div className="rounded-2xl border border-[#dbeafe] bg-[#eef2ff] p-3.5 text-xs text-[#4338ca] flex items-center space-x-2">
                <span className="text-sm shrink-0">💡</span>
                <span className="font-medium text-[11px] leading-relaxed">
                  Saving will auto-create the Finance Team account and send an invite email.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating College...' : 'Create College'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
