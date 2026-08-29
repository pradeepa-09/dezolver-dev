import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Download } from 'lucide-react';
import type { PlatformAnalytics } from '@/types/analytics';

export const PlatformAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState<'1M' | '3M' | '6M' | '12M'>('6M');

  const {
    data: analytics,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PlatformAnalytics, Error>({
    queryKey: ['platform-analytics'],
    queryFn: () => analyticsApi.getPlatformAnalytics(),
    staleTime: 30_000,
  });

  const timeRanges: Array<'1M' | '3M' | '6M' | '12M'> = ['1M', '3M', '6M', '12M'];

  // Top Colleges by Engagement list
  const topColleges = [
    { rank: 1, name: 'Clearwater University', score: 90 },
    { rank: 2, name: 'Eastbrook Engineering', score: 78 },
    { rank: 3, name: 'Westgate Polytechnic', score: 62 },
    { rank: 4, name: 'Sunrise Institute', score: 58 },
    { rank: 5, name: 'Pinehurst Community', score: 32 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Platform Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Cross-tenant reporting &mdash; Dezprox business metrics
          </p>
        </div>
        <LoadingState
          title="Loading Platform Analytics"
          description="Fetching cross-tenant reporting and engagement metrics..."
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Platform Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Cross-tenant reporting &mdash; Dezprox business metrics
          </p>
        </div>
        <ErrorState
          title="Failed to Load Platform Analytics"
          message={error?.message || 'A network error occurred while querying analytics data.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Platform Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Cross-tenant reporting &mdash; Dezprox business metrics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time Range Filter Controls */}
          <div className="inline-flex rounded-xl bg-slate-100/90 p-1 border border-slate-200/60 shadow-2xs">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={() => {
              const dataStr = JSON.stringify(analytics, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `platform_analytics_${Date.now()}.json`;
              a.click();
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main 2x2 Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Monthly Recurring Revenue (₹) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 mb-6">
            Monthly Recurring Revenue (₹)
          </h2>

          <div className="relative h-56 w-full">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 500 200"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Dotted Gridlines */}
              <line x1="45" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="45" y1="60" x2="490" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="45" y1="100" x2="490" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="45" y1="140" x2="490" y2="140" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="45" y1="180" x2="490" y2="180" stroke="#e2e8f0" />

              {/* Y-Axis Labels */}
              <text x="5" y="24" className="text-[10px] fill-slate-400 font-mono">₹14.0L</text>
              <text x="5" y="64" className="text-[10px] fill-slate-400 font-mono">₹10.5L</text>
              <text x="5" y="104" className="text-[10px] fill-slate-400 font-mono">₹7.0L</text>
              <text x="5" y="144" className="text-[10px] fill-slate-400 font-mono">₹3.5L</text>
              <text x="5" y="184" className="text-[10px] fill-slate-400 font-mono">₹0.0L</text>

              {/* Area Fill */}
              <path
                d="M 50 110 C 100 95, 140 105, 190 115 C 240 120, 280 85, 330 80 C 380 75, 410 90, 450 85 C 470 82, 480 65, 490 60 L 490 180 L 50 180 Z"
                fill="url(#mrrGradient)"
              />

              {/* Curved Line */}
              <path
                d="M 50 110 C 100 95, 140 105, 190 115 C 240 120, 280 85, 330 80 C 380 75, 410 90, 450 85 C 470 82, 480 65, 490 60"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* X-Axis Labels */}
              <text x="45" y="198" className="text-[10px] fill-slate-400 font-medium">Feb</text>
              <text x="133" y="198" className="text-[10px] fill-slate-400 font-medium">Mar</text>
              <text x="221" y="198" className="text-[10px] fill-slate-400 font-medium">Apr</text>
              <text x="310" y="198" className="text-[10px] fill-slate-400 font-medium">May</text>
              <text x="400" y="198" className="text-[10px] fill-slate-400 font-medium">Jun</text>
              <text x="480" y="198" className="text-[10px] fill-slate-400 font-medium">Jul</text>
            </svg>
          </div>
        </div>

        {/* Chart 2: Active Colleges Over Time */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 mb-6">
            Active Colleges Over Time
          </h2>

          <div className="relative h-56 w-full">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 500 200"
              preserveAspectRatio="none"
            >
              {/* Dotted Gridlines */}
              <line x1="35" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="35" y1="60" x2="490" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="35" y1="100" x2="490" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="35" y1="140" x2="490" y2="140" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="35" y1="180" x2="490" y2="180" stroke="#e2e8f0" />

              {/* Y-Axis Labels */}
              <text x="15" y="24" className="text-[10px] fill-slate-400 font-mono">60</text>
              <text x="15" y="64" className="text-[10px] fill-slate-400 font-mono">45</text>
              <text x="15" y="104" className="text-[10px] fill-slate-400 font-mono">30</text>
              <text x="15" y="144" className="text-[10px] fill-slate-400 font-mono">15</text>
              <text x="20" y="184" className="text-[10px] fill-slate-400 font-mono">0</text>

              {/* Trend Line */}
              <path
                d="M 50 100 L 135 85 L 225 72 L 315 60 L 405 50 L 485 38"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              <circle cx="50" cy="100" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="135" cy="85" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="225" cy="72" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="315" cy="60" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="405" cy="50" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="485" cy="38" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />

              {/* X-Axis Labels */}
              <text x="45" y="198" className="text-[10px] fill-slate-400 font-medium">Feb</text>
              <text x="130" y="198" className="text-[10px] fill-slate-400 font-medium">Mar</text>
              <text x="220" y="198" className="text-[10px] fill-slate-400 font-medium">Apr</text>
              <text x="310" y="198" className="text-[10px] fill-slate-400 font-medium">May</text>
              <text x="400" y="198" className="text-[10px] fill-slate-400 font-medium">Jun</text>
              <text x="480" y="198" className="text-[10px] fill-slate-400 font-medium">Jul</text>
            </svg>
          </div>
        </div>

        {/* Chart 3: Enrollment Trend (All Colleges) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 mb-6">
            Enrollment Trend (All Colleges)
          </h2>

          <div className="relative h-56 w-full">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 500 200"
              preserveAspectRatio="none"
            >
              {/* Dotted Gridlines */}
              <line x1="35" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="35" y1="60" x2="490" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="35" y1="100" x2="490" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="35" y1="140" x2="490" y2="140" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="35" y1="180" x2="490" y2="180" stroke="#e2e8f0" />

              {/* Y-Axis Labels */}
              <text x="10" y="24" className="text-[10px] fill-slate-400 font-mono">220</text>
              <text x="10" y="64" className="text-[10px] fill-slate-400 font-mono">165</text>
              <text x="10" y="104" className="text-[10px] fill-slate-400 font-mono">110</text>
              <text x="15" y="144" className="text-[10px] fill-slate-400 font-mono">55</text>
              <text x="20" y="184" className="text-[10px] fill-slate-400 font-mono">0</text>

              {/* Vertical Bars (Emerald/Teal) */}
              <rect x="50" y="95" width="30" height="85" rx="3" fill="#10b981" />
              <rect x="105" y="70" width="30" height="110" rx="3" fill="#10b981" />
              <rect x="160" y="76" width="30" height="104" rx="3" fill="#10b981" />
              <rect x="215" y="55" width="30" height="125" rx="3" fill="#10b981" />
              <rect x="270" y="100" width="30" height="80" rx="3" fill="#10b981" />
              <rect x="325" y="135" width="30" height="45" rx="3" fill="#10b981" />
              <rect x="380" y="48" width="30" height="132" rx="3" fill="#10b981" />
              <rect x="435" y="32" width="30" height="148" rx="3" fill="#10b981" />

              {/* X-Axis Labels */}
              <text x="54" y="198" className="text-[10px] fill-slate-400 font-medium">Aug</text>
              <text x="109" y="198" className="text-[10px] fill-slate-400 font-medium">Sep</text>
              <text x="165" y="198" className="text-[10px] fill-slate-400 font-medium">Oct</text>
              <text x="219" y="198" className="text-[10px] fill-slate-400 font-medium">Nov</text>
              <text x="274" y="198" className="text-[10px] fill-slate-400 font-medium">Dec</text>
              <text x="330" y="198" className="text-[10px] fill-slate-400 font-medium">Jan</text>
              <text x="385" y="198" className="text-[10px] fill-slate-400 font-medium">Feb</text>
              <text x="438" y="198" className="text-[10px] fill-slate-400 font-medium">Mar</text>
            </svg>
          </div>
        </div>

        {/* Card 4: Top Colleges by Engagement */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-6">
              Top Colleges by Engagement
            </h2>

            <div className="space-y-4">
              {topColleges.map((college) => (
                <div key={college.rank} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="text-xs font-bold text-indigo-400 w-3 shrink-0">
                        {college.rank}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">
                        {college.name}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 shrink-0 ml-2">
                      {college.score}%
                    </span>
                  </div>

                  <div className="pl-6 w-full">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#5b52e0] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${college.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: AVG SEAT UTILIZATION */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            AVG SEAT UTILIZATION
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            73%
          </p>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Across active colleges
          </p>
        </div>

        {/* Card 2: AVG HEALTH SCORE */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            AVG HEALTH SCORE
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            71.2
          </p>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Platform-wide
          </p>
        </div>

        {/* Card 3: TOTAL ASSESSMENTS TAKEN */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            TOTAL ASSESSMENTS TAKEN
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            1.2M
          </p>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Last 30 days
          </p>
        </div>

        {/* Card 4: CERTIFICATES ISSUED */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            CERTIFICATES ISSUED
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            8,420
          </p>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Last 30 days
          </p>
        </div>
      </div>
    </div>
  );
};
