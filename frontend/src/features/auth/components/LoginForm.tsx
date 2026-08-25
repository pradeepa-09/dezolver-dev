import * as React from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/context/useAuth';
import { ApiError, UnauthorizedError, ValidationError, NetworkError } from '@/lib/api/errors';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [errors, setErrors] = React.useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({
        email: email.trim(),
        password,
      });

      if (result.requiresMfa) {
        navigate(ROUTES.MFA, { replace: true });
        return;
      }

      // If user has role other than SUPER_ADMIN and attempts to access super admin, ProtectedRoute will handle role gating
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || ROUTES.SUPER_ADMIN_DASHBOARD;
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        setErrors({ form: 'Invalid email or password. Please check your credentials and try again.' });
      } else if (err instanceof ValidationError) {
        setErrors({ form: err.message || 'Validation failed on the submitted credentials.' });
      } else if (err instanceof NetworkError) {
        setErrors({ form: 'Unable to reach backend service. Please check your connection or server status.' });
      } else if (err instanceof ApiError) {
        setErrors({ form: err.message || 'Authentication failed. Please try again.' });
      } else {
        setErrors({ form: 'An unexpected error occurred during login. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errors.form && (
        <div
          role="alert"
          className="flex items-start space-x-3 rounded-lg border border-rose-800/40 bg-rose-950/40 p-3 text-sm text-rose-200 animate-fade-in"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1 leading-snug">{errors.form}</div>
        </div>
      )}

      <Input
        label="Email Address"
        type="email"
        autoComplete="email"
        placeholder="admin@dezolver.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
        }}
        error={errors.email}
        leftIcon={<Mail className="h-4 w-4" />}
        disabled={isSubmitting}
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
        }}
        error={errors.password}
        leftIcon={<Lock className="h-4 w-4" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        }
        disabled={isSubmitting}
      />

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isSubmitting}
          leftIcon={<LogIn className="h-4 w-4" />}
        >
          {isSubmitting ? 'Signing in...' : 'Sign in to Console'}
        </Button>
      </div>
    </form>
  );
};
