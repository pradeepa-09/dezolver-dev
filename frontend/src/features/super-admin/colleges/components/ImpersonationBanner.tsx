import * as React from 'react';
import { useImpersonation } from '../context/useImpersonation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ImpersonationBanner: React.FC = () => {
  const { isImpersonating, targetCollege, financeUser, isLoading, stopImpersonation } =
    useImpersonation();
  const navigate = useNavigate();

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
        <div className="text-xs sm:text-sm">
          <span className="font-bold text-amber-200">
            Viewing as Finance Team
          </span>
          <span className="mx-2 text-amber-400">&bull;</span>
          <span className="font-semibold text-white">
            {targetCollege.name}
          </span>
          {financeUser?.email && (
            <span className="hidden md:inline ml-1.5 text-amber-300/80 font-mono text-xs">
              ({financeUser.email})
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
          className="border-amber-500/40 bg-amber-900/60 text-amber-100 hover:bg-amber-800 hover:text-white"
          leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
        >
          {isLoading ? 'Ending Session...' : 'Return to Super Admin'}
        </Button>
      </div>
    </div>
  );
};
