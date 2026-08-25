import * as React from 'react';
import { collegesApi } from '../api/collegesApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Globe, AlertCircle, CheckCircle2, X } from 'lucide-react';
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
      setErrors({});
      setSuccessInfo(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

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
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={!isSubmitting ? onClose : undefined}
      />

      <div className="relative z-50 w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Add New College</h3>
              <p className="text-xs text-muted-foreground">
                Onboard a new institutional tenant to the Dezolver platform.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          {errors.form && (
            <div
              role="alert"
              className="flex items-start space-x-2.5 rounded-lg border border-rose-800/40 bg-rose-950/40 p-3 text-xs text-rose-200 animate-fade-in"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          {successInfo ? (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/30 p-4 space-y-2 text-emerald-100">
                <div className="flex items-center space-x-2 text-emerald-300 font-semibold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span>College Created Successfully!</span>
                </div>
                <p className="text-xs text-emerald-200/90">
                  <span className="font-semibold">{successInfo.college.name}</span> has been onboarded with initial <span className="font-mono font-bold">ACTIVE</span> status.
                </p>
                <div className="mt-3 p-3 rounded-lg bg-background/80 border border-emerald-800/30 text-xs space-y-1 text-muted-foreground">
                  <p className="font-semibold text-foreground">Auto-Provisioned Finance Team Account:</p>
                  <p className="font-mono text-emerald-300">{successInfo.financeUser.email}</p>
                  <p className="text-[11px] text-muted-foreground/80">
                    Role: <span className="font-mono">{successInfo.financeUser.role}</span> &bull; Active: Yes
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="default" size="sm" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="College Name *"
                placeholder="e.g. Massachusetts Institute of Technology"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                error={errors.name}
                leftIcon={<Building2 className="h-4 w-4" />}
                disabled={isSubmitting}
                maxLength={255}
                required
              />

              <Input
                label="Domain (Optional)"
                placeholder="e.g. mit.edu"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  if (errors.domain) setErrors((prev) => ({ ...prev, domain: undefined }));
                }}
                error={errors.domain}
                helperText="Unique domain identifier for college routing and finance email generation."
                leftIcon={<Globe className="h-4 w-4" />}
                disabled={isSubmitting}
                maxLength={255}
              />

              <div className="rounded-lg border border-border/60 bg-secondary/30 p-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Automatic Provisioning:</span> The backend will automatically generate a corresponding Finance Team administrator account for this college.
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? 'Creating College...' : 'Create College'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
