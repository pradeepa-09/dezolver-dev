import * as React from 'react';
import { PermissionDeniedState } from '@/components/shared/PermissionDeniedState';

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <PermissionDeniedState
        title="403 - Forbidden"
        message="Your current role does not have authorization to view this Super Admin area. Please contact an administrator or sign in with an authorized account."
        requiredRole="SUPER_ADMIN"
      />
    </div>
  );
};
