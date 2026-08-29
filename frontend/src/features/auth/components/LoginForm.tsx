import * as React from 'react';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
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
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [forgotFeedback, setForgotFeedback] = React.useState<string | null>(null);

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
    } else if (password.length < 5) {
      newErrors.password = 'Password must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setForgotFeedback(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({
        email: email.trim(),
        password,
      });

      const from =
        (location.state as { from?: { pathname?: string } })?.from?.pathname ||
        ROUTES.SUPER_ADMIN_DASHBOARD;

      if (result.mfaRequired || result.requiresMfa) {
        navigate(ROUTES.MFA, {
          replace: true,
          state: {
            mfaToken: result.mfaToken,
            user: result.user,
            from,
          },
        });
        return;
      }

      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        setErrors({
          form: 'Invalid email or password. Please check your credentials and try again.',
        });
      } else if (err instanceof ValidationError) {
        setErrors({
          form: err.message || 'Validation failed on the submitted credentials.',
        });
      } else if (err instanceof NetworkError) {
        setErrors({
          form: 'Unable to reach backend service. Please check your connection or server status.',
        });
      } else if (err instanceof ApiError) {
        setErrors({ form: err.message || 'Authentication failed. Please try again.' });
      } else {
        setErrors({
          form: 'An unexpected error occurred during login. Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotFeedback('Please contact your platform administrator to reset your credentials.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {errors.form && (
        <div
          role="alert"
          className="flex items-start space-x-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800 animate-fade-in"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1 font-medium leading-snug">{errors.form}</div>
        </div>
      )}

      {forgotFeedback && (
        <div
          role="status"
          className="flex items-start space-x-3 rounded-xl border border-indigo-200 bg-indigo-50/80 p-3.5 text-sm text-indigo-800 animate-fade-in"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
          <div className="flex-1 text-xs font-medium leading-snug">{forgotFeedback}</div>
        </div>
      )}

      {/* Email Input Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-[11px] font-bold uppercase tracking-wider text-slate-500"
        >
          EMAIL
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@college.edu"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          disabled={isSubmitting}
          className={`h-12 w-full rounded-2xl border bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.email
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
          }`}
        />
        {errors.email && (
          <p className="text-xs font-medium text-rose-500 animate-fade-in">{errors.email}</p>
        )}
      </div>

      {/* Password Input Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-[11px] font-bold uppercase tracking-wider text-slate-500"
        >
          PASSWORD
        </label>
        <div className="relative flex items-center">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            disabled={isSubmitting}
            className={`h-12 w-full rounded-2xl border bg-white px-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              errors.password
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs font-medium text-rose-500 animate-fade-in">{errors.password}</p>
        )}
      </div>

      {/* Remember Me & Forgot Password Row */}
      <div className="flex items-center justify-between pt-1">
        <label htmlFor="remember-me" className="flex items-center space-x-2.5 cursor-pointer select-none">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-sm font-medium text-slate-600">Remember me</span>
        </label>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors focus:outline-none"
        >
          Forgot password?
        </button>
      </div>

      {/* Primary Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.99] transition-all duration-200 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
              <span>Signing in...</span>
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </div>
    </form>
  );
};
