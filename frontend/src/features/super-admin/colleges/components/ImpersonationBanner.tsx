import * as React from 'react';
import { useImpersonation } from '../context/useImpersonation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ShieldAlert, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ImpersonationBanner: React.FC = () => {
  const {
    isImpersonating,
    targetCollege,
    financeUser,
    expiresAt,
    isLoading,
    stopImpersonation,
  } = useImpersonation();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = React.useState<string>('');

  React.useEffect(() => {
    if (!expiresAt) {
      setTimeLeft('');
      return;
    }

    const updateCountdown = () => {
      const remainingSeconds = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
      );

      if (remainingSeconds <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      setTimeLeft(`${minutes}m ${seconds.toString().padStart(2, '0')}s remaining`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!isImpersonating || !targetCollege) {
    return null;
  }

  const handleReturn = async () => {
    await stopImpersonation();
    navigate('/super-admin/colleges', { replace: true });
  };

  return (
    <div
      role="region"
      aria-label="Active Impersonation Session Banner"
      className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-amber-600/40 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 px-4 py-2.5 text-amber-100 shadow-xl backdrop-blur-md animate-fade-in"
    >
      <div className="flex items-center space-x-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-300">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div className="text-xs sm:text-sm flex flex-wrap items-center gap-1.5">
          <span className="font-bold text-amber-200">
            Viewing as Finance Team
          </span>
          <span className="text-amber-400">&bull;</span>
          <span className="font-semibold text-white">
            {targetCollege.name}
          </span>
          {financeUser?.email && (
            <span className="hidden md:inline ml-1 text-amber-300/80 font-mono text-xs">
              ({financeUser.email})
            </span>
          )}

          {timeLeft && (
            <span className="ml-2 inline-flex items-center space-x-1 rounded-full bg-amber-800/80 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-mono font-medium text-amber-200">
              <Clock className="h-3 w-3 text-amber-300" />
              <span>{timeLeft}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleReturn}
          isLoading={isLoading}
          className="border-amber-500/40 bg-amber-900/60 text-amber-100 hover:bg-amber-800 hover:text-white cursor-pointer text-xs"
          leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
        >
          {isLoading ? 'Ending Session...' : 'Return to Super Admin'}
        </Button>
      </div>
    </div>
  );
};
