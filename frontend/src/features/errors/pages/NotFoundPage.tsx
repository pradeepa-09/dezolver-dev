import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card/90 p-10 text-center shadow-2xl backdrop-blur-md max-w-lg mx-auto animate-fade-in">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-700/50 bg-indigo-950/40 text-indigo-400 shadow-inner">
          <FileQuestion className="h-8 w-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
          Error 404 • Page Not Found
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Page Not Found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          The page you are looking for does not exist, has been removed, or is temporarily unavailable.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Go Back
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(ROUTES.LOGIN)}
            leftIcon={<Home className="h-4 w-4" />}
          >
            Return to Login
          </Button>
        </div>
      </div>
    </div>
  );
};
