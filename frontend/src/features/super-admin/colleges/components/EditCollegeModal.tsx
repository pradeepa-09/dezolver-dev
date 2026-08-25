import * as React from 'react';
import { collegesApi } from '../api/collegesApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Edit, Globe, Building2, AlertCircle, X } from 'lucide-react';
import { ApiError, ValidationError } from '@/lib/api/errors';
import type { College } from '@/types/colleges';

export interface EditCollegeModalProps {
  college: College | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: College) => void;
}

export const EditCollegeModal: React.FC<EditCollegeModalProps> = ({
  college,
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

  React.useEffect(() => {
    if (college && isOpen) {
      setName(college.name || '');
      setDomain(college.domain || '');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [college, isOpen]);

  if (!isOpen || !college) return null;

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (name.trim() && name.trim().length > 255) {
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
      const updated = await collegesApi.updateCollege(college.id, {
        name: name.trim() || undefined,
        domain: domain.trim() || undefined,
      });

      onSuccess(updated);
      onClose();
    } catch (err) {
      if (err instanceof ValidationError) {
        setErrors({ form: err.message });
      } else if (err instanceof ApiError) {
        setErrors({ form: err.message });
      } else {
        setErrors({ form: 'An unexpected error occurred while updating the college.' });
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
              <Edit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Edit College</h3>
              <p className="text-xs text-muted-foreground">
                Update details for <span className="font-semibold text-foreground">{college.name}</span>.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="py-4 space-y-4" noValidate>
          {errors.form && (
            <div
              role="alert"
              className="flex items-start space-x-2.5 rounded-lg border border-rose-800/40 bg-rose-950/40 p-3 text-xs text-rose-200 animate-fade-in"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          <Input
            label="College Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
            leftIcon={<Building2 className="h-4 w-4" />}
            disabled={isSubmitting}
            maxLength={255}
          />

          <Input
            label="Domain"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              if (errors.domain) setErrors((prev) => ({ ...prev, domain: undefined }));
            }}
            error={errors.domain}
            leftIcon={<Globe className="h-4 w-4" />}
            disabled={isSubmitting}
            maxLength={255}
          />

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
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
