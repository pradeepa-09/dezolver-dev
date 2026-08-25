import * as React from 'react';
import { plansApi } from '../api/plansApi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Edit2, AlertCircle, X } from 'lucide-react';
import type { Plan, UpdatePlanDto } from '@/types/plans';

export interface EditPlanModalProps {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Plan) => void;
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({
  plan,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = React.useState<UpdatePlanDto>({
    name: '',
    description: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (plan && isOpen) {
      setFormData({
        name: plan.name,
        description: plan.description || '',
      });
      setErrors({});
      setApiError(null);
      setIsSubmitting(false);
    }
  }, [plan, isOpen]);

  if (!isOpen || !plan) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Plan name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Plan name must be under 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be under 1000 characters';
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
      const payload: UpdatePlanDto = {
        name: formData.name?.trim(),
        description: formData.description?.trim() || undefined,
      };

      const updated = await plansApi.updatePlan(plan.id, payload);
      onSuccess(updated);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update subscription plan';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-50 w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Edit2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Edit Subscription Plan</h3>
              <p className="text-xs text-muted-foreground font-mono">ID: {plan.id}</p>
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

        {/* API Error Alert */}
        {apiError && (
          <div className="mt-4 flex items-center space-x-2 rounded-xl border border-rose-900/50 bg-rose-950/40 p-3.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Input
            id="edit-plan-name"
            label="Plan Name *"
            value={formData.name || ''}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={errors.name}
            required
            autoFocus
          />

          <div className="w-full space-y-1.5">
            <label
              htmlFor="edit-plan-description"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Description (Optional)
            </label>
            <textarea
              id="edit-plan-description"
              rows={3}
              placeholder="Summary of plan entitlements and features..."
              value={formData.description || ''}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, description: e.target.value }));
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              className="w-full rounded-xl border border-border/80 bg-secondary/30 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            />
            {errors.description && (
              <p className="text-xs font-medium text-rose-400">{errors.description}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border/50">
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
              disabled={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
