import * as React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/utils';

export interface PermissionDeniedStateProps {
  title?: string;
  message?: string;
  requiredRole?: string;
  className?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
}

export const PermissionDeniedState: React.FC<PermissionDeniedStateProps> = ({
  title = 'Access Denied',
  message = 'You do not have the required permissions or role to access this area of Dezolver.',
  requiredRole,
  className,
  showHomeButton = true,
  showBackButton = true,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-amber-800/40 bg-card/90 p-10 text-center shadow-2xl backdrop-blur-md max-w-lg mx-auto animate-fade-in',
        className,
      )}
    >
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-700/50 bg-amber-950/40 text-amber-400 shadow-inner">
        <ShieldAlert className="h-8 w-8" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
        </span>
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">
        Error 403 • Forbidden
      </span>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{message}</p>

      {requiredRole && (
        <div className="mt-4 inline-flex items-center rounded-md border border-amber-800/40 bg-amber-950/30 px-3 py-1.5 text-xs text-amber-300">
          <span className="font-semibold mr-1">Required Role:</span>
          <code>{requiredRole}</code>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {showBackButton && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Go Back
          </Button>
        )}
        {showHomeButton && (
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(ROUTES.LOGIN)}
            leftIcon={<Home className="h-4 w-4" />}
          >
            Return to Login
          </Button>
        )}
      </div>
    </div>
  );
};
