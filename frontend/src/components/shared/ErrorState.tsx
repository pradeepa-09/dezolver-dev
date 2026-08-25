import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while processing your request.',
  onRetry,
  className,
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-lg border border-rose-800/40 bg-rose-950/40 p-3 text-rose-200 animate-fade-in',
          className,
        )}
      >
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span className="text-xs font-medium">{message}</span>
        </div>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-7 px-2 text-xs text-rose-300 hover:bg-rose-900/50"
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-rose-800/30 bg-rose-950/20 p-8 text-center animate-fade-in',
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-rose-700/40 bg-rose-900/30 text-rose-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h4 className="text-base font-semibold text-rose-100">{title}</h4>
      <p className="mt-1 text-sm text-rose-300/80 max-w-md">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="mt-5 border-rose-800/50 text-rose-200 hover:bg-rose-900/40"
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
