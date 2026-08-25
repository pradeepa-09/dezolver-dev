import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Loading...',
  description,
  className,
  fullScreen = false,
}) => {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center animate-fade-in',
        className,
      )}
    >
      <div className="relative mb-4 flex items-center justify-center">
        <div className="absolute h-12 w-12 rounded-full border border-indigo-500/20 bg-indigo-500/5 animate-ping" />
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
      {title && (
        <h4 className="text-base font-semibold text-foreground">{title}</h4>
      )}
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};
