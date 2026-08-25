import * as React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface SuccessStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  compact?: boolean;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  className,
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-lg border border-emerald-800/40 bg-emerald-950/40 p-3 text-emerald-200 animate-fade-in',
          className,
        )}
      >
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="text-xs font-medium">{message || title}</span>
        </div>
        {actionLabel && onAction && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAction}
            className="h-7 px-2 text-xs text-emerald-300 hover:bg-emerald-900/50"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-emerald-800/30 bg-emerald-950/20 p-8 text-center animate-fade-in',
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-700/40 bg-emerald-900/30 text-emerald-400">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h4 className="text-base font-semibold text-emerald-100">{title}</h4>
      {message && (
        <p className="mt-1 text-sm text-emerald-300/80 max-w-md">{message}</p>
      )}
      {actionLabel && onAction && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onAction}
          className="mt-5 border-emerald-800/50 text-emerald-200 hover:bg-emerald-900/40"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
