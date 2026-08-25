import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAuth } from '@/features/auth/context/useAuth';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // If already authenticated with SUPER_ADMIN role, redirect to dashboard
  if (isAuthenticated && user?.role === 'SUPER_ADMIN') {
    return <Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden bg-background">
      {/* Background Decorative Gradients */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-600/10 blur-[100px]" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-600/10">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Dezolver
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mt-0.5">
              Super Admin Console
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-border/80 bg-card/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-bold">Authentication Required</CardTitle>
            <CardDescription>
              Sign in with your Super Admin credentials to access the administrative control center.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="text-center text-xs text-muted-foreground/80">
          Protected System &bull; Unauthorized access is strictly prohibited and monitored.
        </p>
      </div>
    </div>
  );
};
