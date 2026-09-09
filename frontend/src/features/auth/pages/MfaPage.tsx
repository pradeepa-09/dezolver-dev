import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { KeyRound, ArrowLeft, AlertCircle, ShieldAlert, CheckCircle2, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/useAuth';
import { ROUTES } from '@/config/routes';
import {
  ApiError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  NetworkError,
} from '@/lib/api/errors';
import type { User } from '@/types/auth';

interface MfaLocationState {
  mfaToken?: string;
  user?: User;
  from?: string;
}

export const MfaPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyMfa } = useAuth();

  const state = (location.state as MfaLocationState) || {};
  const { mfaToken, user, from } = state;

  const [otp, setOtp] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const isSessionMissing = !mfaToken || !user?.id;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setError(null);

    if (isSessionMissing) {
      setError('MFA session is missing or invalid. Please sign in again.');
      return;
    }

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (cleanOtp.length !== 6) {
      setError('Verification code must be exactly 6 digits.');
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyMfa({
        userId: user.id,
        otpCode: cleanOtp,
        mfaToken: mfaToken,
      });

      setIsSuccess(true);
      const destination = from || ROUTES.SUPER_ADMIN_DASHBOARD;
      // Brief pause to display success state before redirecting
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 500);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        if (err.message.toLowerCase().includes('expired')) {
          setError('Your MFA session has expired. Please sign in again.');
        } else if (err.message.toLowerCase().includes('missing')) {
          setError('MFA authentication token is missing. Please sign in again.');
        } else {
          setError('Invalid verification code. Please check your authenticator app and try again.');
        }
      } else if (err instanceof ForbiddenError) {
        setError('Access denied. You do not have permission to verify this account.');
      } else if (err instanceof ValidationError) {
        setError(err.message || 'Invalid verification code format.');
      } else if (err instanceof NetworkError) {
        setError('Unable to reach authentication server. Please check your connection.');
      } else if (err instanceof ApiError) {
        setError(err.message || 'MFA verification failed. Please try again.');
      } else {
        setError('An unexpected error occurred during MFA verification. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (error) setError(null);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden bg-background">
      {/* Background Decorative Gradients */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-600/10 blur-[100px]" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-600/10">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Dezolver
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mt-0.5">
              Multi-Factor Authentication
            </p>
          </div>
        </div>

        <Card className="border-border/80 bg-card/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-600/20 text-indigo-400">
              <KeyRound className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Two-Step Verification</CardTitle>
            <CardDescription>
              {user?.email ? (
                <>
                  Enter the 6-digit verification code sent to or generated for{' '}
                  <span className="font-semibold text-foreground">{user.email}</span>.
                </>
              ) : (
                'Enter the 6-digit security code generated by your authenticator app.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {isSessionMissing && (
              <div
                role="alert"
                className="flex items-start space-x-2.5 rounded-lg border border-amber-800/40 bg-amber-950/40 p-3 text-xs text-amber-200"
              >
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  No active MFA session found. Please sign in with your username and password first.
                </span>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex items-start space-x-3 rounded-lg border border-rose-800/40 bg-rose-950/40 p-3 text-sm text-rose-200 animate-fade-in"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1 leading-snug">{error}</div>
              </div>
            )}

            {isSuccess && (
              <div
                role="status"
                className="flex items-start space-x-3 rounded-lg border border-emerald-800/40 bg-emerald-950/40 p-3 text-sm text-emerald-200 animate-fade-in"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                <div className="flex-1 leading-snug">
                  Verification successful. Redirecting to your dashboard...
                </div>
              </div>
            )}

            {!isSessionMissing ? (
              <form onSubmit={handleVerify} className="space-y-4" noValidate>
                <Input
                  label="6-Digit Verification Code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={isSubmitting || isSuccess}
                  className="text-center tracking-widest text-xl font-mono"
                  autoFocus
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isSubmitting}
                  disabled={otp.length !== 6 || isSuccess}
                  leftIcon={<KeyRound className="h-4 w-4" />}
                >
                  {isSubmitting ? 'Verifying Code...' : 'Verify & Continue'}
                </Button>
              </form>
            ) : (
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Return to Login
              </Button>
            )}

            <div className="pt-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                disabled={isSubmitting}
              >
                Back to Login
              </Button>
            </div>
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
