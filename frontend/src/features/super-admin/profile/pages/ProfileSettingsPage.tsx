import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '@/features/auth/context/AuthContext';
import { CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const authContext = React.useContext(AuthContext);
  const user = authContext?.user;

  const tabParam = searchParams.get('tab');
  const initialTab =
    tabParam === 'security' || tabParam === 'notifications' ? tabParam : 'profile';

  const [activeTab, setActiveTab] = React.useState<'profile' | 'security' | 'notifications'>(initialTab);

  React.useEffect(() => {
    if (tabParam === 'security' || tabParam === 'notifications' || tabParam === 'profile') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'profile' | 'security' | 'notifications') => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setFeedback(null);
  };

  // Feedback banner state
  const [feedback, setFeedback] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Profile tab state
  const [fullName, setFullName] = React.useState('Rahul Kumar');
  const [email, setEmail] = React.useState(user?.email || 'rahul.kumar@sunrise.edu.in');
  const [phone, setPhone] = React.useState('+91 98765 43210');
  const [bio, setBio] = React.useState('');

  // Security tab state
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);

  // Notification Preferences state
  const [notifications, setNotifications] = React.useState({
    assessmentReminders: true,
    labAssignmentDeadlines: true,
    contestAnnouncements: true,
    certificateIssued: true,
    ticketUpdates: false,
    marketingEmails: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({
      type: 'success',
      message: 'Profile information updated successfully.',
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setFeedback({
        type: 'error',
        message: 'Please enter your current password.',
      });
      return;
    }
    if (newPassword.length < 8) {
      setFeedback({
        type: 'error',
        message: 'New password must be at least 8 characters long.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({
        type: 'error',
        message: 'New passwords do not match.',
      });
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFeedback({
      type: 'success',
      message: 'Password updated successfully.',
    });
  };

  const handleSavePreferences = () => {
    setFeedback({
      type: 'success',
      message: 'Notification preferences saved successfully.',
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Profile Settings
        </h1>
      </div>

      {/* Tabs Navigation Strip */}
      <div className="flex items-center space-x-6 border-b border-slate-200">
        <button
          onClick={() => handleTabChange('profile')}
          className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'profile'
              ? 'text-[#4f46e5]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Profile
          {activeTab === 'profile' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4f46e5] rounded-full" />
          )}
        </button>

        <button
          onClick={() => handleTabChange('security')}
          className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'security'
              ? 'text-[#4f46e5]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Security
          {activeTab === 'security' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4f46e5] rounded-full" />
          )}
        </button>

        <button
          onClick={() => handleTabChange('notifications')}
          className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'notifications'
              ? 'text-[#4f46e5]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Notifications
          {activeTab === 'notifications' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4f46e5] rounded-full" />
          )}
        </button>
      </div>

      {/* Inline Feedback Alerts */}
      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs animate-fade-in ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:opacity-80 ml-4 font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab 1: Profile View */}
      {activeTab === 'profile' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Avatar Header Block */}
            <div className="flex items-center space-x-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#3b82f6] text-white text-2xl font-bold shadow-xs">
                {fullName.charAt(0).toUpperCase() || 'R'}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 leading-tight">
                  {fullName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Super Admin</p>
                <button
                  type="button"
                  onClick={() =>
                    setFeedback({
                      type: 'success',
                      message: 'Photo upload dialog triggered.',
                    })
                  }
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold mt-1 inline-block cursor-pointer transition-colors"
                >
                  Change Photo
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 pt-1">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  FULL NAME <span className="text-rose-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  EMAIL
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  PHONE
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  BIO
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  placeholder="Short bio..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all resize-none"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setFullName('Rahul Kumar');
                  setEmail(user?.email || 'rahul.kumar@sunrise.edu.in');
                  setPhone('+91 98765 43210');
                  setBio('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Security View */}
      {activeTab === 'security' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <h2 className="text-sm font-bold text-slate-900">Change Password</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  CURRENT PASSWORD <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  NEW PASSWORD <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  CONFIRM NEW PASSWORD <span className="text-rose-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
                />
              </div>

              {/* Password Requirements Guide */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs text-slate-500 space-y-1.5">
                <p className="font-semibold text-slate-700">Password requirements:</p>
                <ul className="space-y-1 pl-1">
                  <li className="flex items-center space-x-2">
                    <span className="text-slate-400">•</span>
                    <span>At least 8 characters</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-slate-400">•</span>
                    <span>At least 1 uppercase letter</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-slate-400">•</span>
                    <span>At least 1 number</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-slate-400">•</span>
                    <span>At least 1 special character</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Notifications View */}
      {activeTab === 'notifications' && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-900">
              Notification Preferences
            </h2>

            <div className="divide-y divide-slate-100">
              {/* Item 1 */}
              <div className="py-4 first:pt-0 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Assessment reminders
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Get notified before exams and quizzes
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications.assessmentReminders}
                  onClick={() => toggleNotification('assessmentReminders')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifications.assessmentReminders ? 'bg-[#4f46e5]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      notifications.assessmentReminders ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Item 2 */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Lab assignment deadlines
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Reminders 24h before due date
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications.labAssignmentDeadlines}
                  onClick={() => toggleNotification('labAssignmentDeadlines')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifications.labAssignmentDeadlines ? 'bg-[#4f46e5]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      notifications.labAssignmentDeadlines ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Item 3 */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Contest announcements
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    New contests and leaderboard updates
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications.contestAnnouncements}
                  onClick={() => toggleNotification('contestAnnouncements')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifications.contestAnnouncements ? 'bg-[#4f46e5]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      notifications.contestAnnouncements ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Item 4 */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Certificate issued
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    When you earn a new certificate
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications.certificateIssued}
                  onClick={() => toggleNotification('certificateIssued')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifications.certificateIssued ? 'bg-[#4f46e5]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      notifications.certificateIssued ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Item 5 */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Ticket updates
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Status changes on your support tickets
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications.ticketUpdates}
                  onClick={() => toggleNotification('ticketUpdates')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifications.ticketUpdates ? 'bg-[#4f46e5]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      notifications.ticketUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Item 6 */}
              <div className="py-4 last:pb-0 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Marketing emails
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tips, announcements, and feature updates
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications.marketingEmails}
                  onClick={() => toggleNotification('marketingEmails')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifications.marketingEmails ? 'bg-[#4f46e5]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      notifications.marketingEmails ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
