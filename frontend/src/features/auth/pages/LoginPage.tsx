import * as React from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAuth } from '@/features/auth/context/useAuth';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // If already authenticated with SUPER_ADMIN role, redirect to dashboard
  if (isAuthenticated && user?.role === 'SUPER_ADMIN') {
    return <Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left Column: White Login Panel (50% desktop) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-white min-h-screen">
        <div className="w-full max-w-[420px] flex flex-col justify-center">
          {/* Dezolver Brand Header */}
          <div className="flex items-center space-x-3.5 mb-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-lg shadow-indigo-600/30 select-none">
              D
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Dezolver
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-0.5">
                EDTECH PLATFORM
              </span>
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 font-normal">
              Sign in to your Dezolver account.
            </p>
          </div>

          {/* Core Authentication Form */}
          <LoginForm />
        </div>
      </div>

      {/* Right Column: Deep Indigo/Purple Branded Marketing Panel (50% desktop) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden bg-[#241a6b] p-12 xl:p-16 text-center text-white min-h-screen select-none">
        {/* Subtle Ambient Radial Lighting */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />

        <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
          {/* Centered Large Dezolver Brand Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-500 to-indigo-400 text-white font-black text-4xl shadow-2xl shadow-indigo-950/80 mb-8 border border-white/15 ring-4 ring-white/5">
            D
          </div>

          {/* Main Feature Headline */}
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Learning, Assessment &amp; Lab Automation
          </h2>

          {/* Supporting Description */}
          <p className="text-sm xl:text-base text-indigo-200/90 leading-relaxed max-w-md mx-auto mb-12 font-normal">
            Dezolver powers colleges with end-to-end academic tools — from course delivery to automated coding labs, assessments, contests, and certification.
          </p>

          {/* 3 Metrics / Stat Cards */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            <div className="bg-white/[0.08] border border-white/10 backdrop-blur-md rounded-2xl py-5 px-3 text-center shadow-lg transition-transform hover:scale-[1.02]">
              <div className="text-2xl xl:text-3xl font-black text-white tracking-tight">
                54+
              </div>
              <div className="text-xs font-medium text-indigo-200/80 mt-1">
                Colleges
              </div>
            </div>

            <div className="bg-white/[0.08] border border-white/10 backdrop-blur-md rounded-2xl py-5 px-3 text-center shadow-lg transition-transform hover:scale-[1.02]">
              <div className="text-2xl xl:text-3xl font-black text-white tracking-tight">
                48K+
              </div>
              <div className="text-xs font-medium text-indigo-200/80 mt-1">
                Students
              </div>
            </div>

            <div className="bg-white/[0.08] border border-white/10 backdrop-blur-md rounded-2xl py-5 px-3 text-center shadow-lg transition-transform hover:scale-[1.02]">
              <div className="text-2xl xl:text-3xl font-black text-white tracking-tight">
                2.1M+
              </div>
              <div className="text-xs font-medium text-indigo-200/80 mt-1">
                Submissions
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
