import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Hammer,
  MapPin,
  Phone,
  ShieldCheck,
  UserPlus,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { CITIES_AND_AREAS, SKILL_CATEGORIES } from '../../data/mockData.ts';
import { SkillCategory, UserRole } from '../../types.ts';

export const AuthScreen: React.FC = () => {
  const {
    signInWithGoogle,
    authLoading,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('worker');

  // Registration profile preferences
  const [regPhone, setRegPhone] = useState('');
  const [regSkill, setRegSkill] = useState<SkillCategory>('Plumber');
  const [regArea, setRegArea] = useState<string>('Koramangala');
  const [regWage, setRegWage] = useState<number>(850);
  const [companyName, setCompanyName] = useState<string>('');
  const [businessType, setBusinessType] = useState<string>('Private Household');

  // Error and notice states
  const [authError, setAuthError] = useState<string | null>(null);
  const [notRegisteredNotice, setNotRegisteredNotice] = useState<boolean>(false);
  const [showAccountNotFoundModal, setShowAccountNotFoundModal] = useState<boolean>(false);

  // Sign In with Google (detects registered role automatically from Firestore)
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setNotRegisteredNotice(false);

    const res = await signInWithGoogle(undefined, false);
    if (!res.success && res.error) {
      setAuthError(res.error);
      if (res.notRegistered) {
        setNotRegisteredNotice(true);
        setShowAccountNotFoundModal(true);
      }
    }
  };

  // Register with Google
  const handleGoogleRegister = async () => {
    setAuthError(null);

    const res = await signInWithGoogle(selectedRole, true, {
      phone: regPhone.trim() || undefined,
      area: regArea,
      primarySkill: selectedRole === 'worker' ? regSkill : undefined,
      expectedWage: selectedRole === 'worker' ? Number(regWage) : undefined,
      companyName: selectedRole === 'employer' ? companyName.trim() || undefined : undefined,
      businessType: selectedRole === 'employer' ? businessType : undefined,
    });

    if (!res.success && res.error) {
      setAuthError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#122B50] to-[#1A3C6E] text-white flex flex-col justify-between p-4 sm:p-6 select-none">
      
      {/* Top Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500 flex items-center justify-center font-black text-xl text-white shadow-lg">
            J
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-white block leading-tight">
              Jobnexa
            </span>
            <span className="text-[10px] text-slate-300">
              Local Worker · Employer Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
          <MapPin className="w-3.5 h-3.5 text-orange-400" />
          <span>Bangalore, India</span>
        </div>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md mx-auto w-full my-6 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 space-y-5">
        
        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {activeTab === 'login' ? 'Sign In with Google' : 'Register with Google'}
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {activeTab === 'login'
              ? 'Access your registered account, local assignments, and active hires'
              : 'Choose your account type and join Bangalore’s local skill marketplace'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setAuthError(null);
              setNotRegisteredNotice(false);
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In with Google
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setAuthError(null);
              setNotRegisteredNotice(false);
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register with Google
          </button>
        </div>

        {/* Error / Notification Banner */}
        {notRegisteredNotice && (
          <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-2xl text-slate-900 space-y-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-black text-slate-900">
                  Account Not Found — Register If New
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No Jobnexa profile was found for this Google account. Please register to choose whether you are a <strong>Worker</strong> or an <strong>Employer</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setNotRegisteredNotice(false);
                setAuthError(null);
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md text-xs sm:text-sm transition-transform active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Account Now & Select Role</span>
            </button>
          </div>
        )}

        {!notRegisteredNotice && authError && (
          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-amber-900 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{authError}</p>
            </div>
          </div>
        )}

        {/* View 1: Sign In with Google */}
        {activeTab === 'login' ? (
          <div className="space-y-4 pt-1">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-center space-y-3">
              <div className="space-y-1">
                <span className="text-xs text-slate-700 font-bold block">
                  Sign in with your Google Account
                </span>
                <p className="text-[11px] text-slate-500">
                  Your registered role (Worker or Employer) is automatically detected and loaded.
                </p>
              </div>

              {/* Big Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full bg-[#1A3C6E] hover:bg-[#122B50] text-white font-bold text-sm sm:text-base py-3.5 px-4 rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 cursor-pointer"
              >
                {authLoading ? (
                  <span className="flex items-center gap-2 text-white text-xs sm:text-sm">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting with Google...
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.7 0 3 .7 3.7 1.4l2.8-2.8C16.8 2.1 14.6 1.3 12 1.3 7.8 1.3 4.2 3.8 2.6 7.4l3.5 2.7C7 7.2 9.2 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M6.1 14.6c-.3-.8-.4-1.7-.4-2.6s.1-1.8.4-2.6L2.6 6.7C1.6 8.7 1 10.8 1 13s.6 4.3 1.6 6.3l3.5-2.7z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23.7c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-2.8 0-5-2.2-5.9-5.1L2.6 16.6C4.2 20.2 7.8 23.7 12 23.7z"
                      />
                    </svg>
                    <span>
                      Sign In with Google
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Benefits */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant single-click authentication</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>No password required — always secure</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Synchronizes across desktop and mobile devices</span>
              </div>
            </div>

            <p className="text-[11px] text-center text-slate-500 pt-2 border-t border-slate-100">
              New to Jobnexa?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setAuthError(null);
                  setNotRegisteredNotice(false);
                }}
                className="font-bold text-orange-600 hover:underline cursor-pointer"
              >
                Register with Google & choose your role
              </button>
            </p>
          </div>
        ) : (
          /* View 2: Register with Google (Role Selection + Profile Setup) */
          <div className="space-y-4">
            {/* Step 1: Account Type Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Select Your Account Type:
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedRole('worker')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-1.5 cursor-pointer ${
                    selectedRole === 'worker'
                      ? 'border-orange-500 bg-orange-50/70 shadow-sm ring-1 ring-orange-500/30'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Hammer className={`w-4 h-4 ${selectedRole === 'worker' ? 'text-orange-600' : 'text-slate-400'}`} />
                    {selectedRole === 'worker' && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">
                      I am a Worker
                    </strong>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      Tradesperson looking for local work
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('employer')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-1.5 cursor-pointer ${
                    selectedRole === 'employer'
                      ? 'border-orange-500 bg-orange-50/70 shadow-sm ring-1 ring-orange-500/30'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Briefcase className={`w-4 h-4 ${selectedRole === 'employer' ? 'text-orange-600' : 'text-slate-400'}`} />
                    {selectedRole === 'employer' && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">
                      I am an Employer
                    </strong>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      Business or homeowner hiring
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Role Details */}
            <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Bangalore Area
                  </label>
                  <select
                    value={regArea}
                    onChange={(e) => setRegArea(e.target.value)}
                    className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                  >
                    {CITIES_AND_AREAS.Bangalore.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Contact Phone (for WhatsApp/calls)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98450 00000"
                      className="w-full pl-8 pr-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {selectedRole === 'worker' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Primary Trade / Skill
                    </label>
                    <select
                      value={regSkill}
                      onChange={(e) => setRegSkill(e.target.value as SkillCategory)}
                      className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                    >
                      {SKILL_CATEGORIES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Expected Daily Wage (₹)
                    </label>
                    <input
                      type="number"
                      min={100}
                      step={50}
                      value={regWage}
                      onChange={(e) => setRegWage(Number(e.target.value))}
                      className="w-full py-2 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Company / Household Name (optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Facilities or Residence"
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              )}
            </div>

            {/* Big Google Register Button */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={authLoading}
              className="w-full bg-[#1A3C6E] hover:bg-[#122B50] text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 cursor-pointer"
            >
              {authLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting with Google...
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.7 0 3 .7 3.7 1.4l2.8-2.8C16.8 2.1 14.6 1.3 12 1.3 7.8 1.3 4.2 3.8 2.6 7.4l3.5 2.7C7 7.2 9.2 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M6.1 14.6c-.3-.8-.4-1.7-.4-2.6s.1-1.8.4-2.6L2.6 6.7C1.6 8.7 1 10.8 1 13s.6 4.3 1.6 6.3l3.5-2.7z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.7c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-2.8 0-5-2.2-5.9-5.1L2.6 16.6C4.2 20.2 7.8 23.7 12 23.7z"
                    />
                  </svg>
                  <span>
                    Continue with Google as {selectedRole === 'worker' ? 'Worker' : 'Employer'}
                  </span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-500 pt-1">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setAuthError(null);
                  setNotRegisteredNotice(false);
                }}
                className="font-bold text-orange-600 hover:underline cursor-pointer"
              >
                Sign In with Google
              </button>
            </p>
          </div>
        )}

      </div>

      {/* Footer Feature Trust Badges */}
      <div className="max-w-3xl mx-auto w-full grid grid-cols-3 gap-2 text-center text-xs text-slate-300 py-3">
        <div className="flex flex-col items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px]">Verified Tradespeople</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-[11px]">Real-Time Availability</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <MapPin className="w-4 h-4 text-orange-400" />
          <span className="text-[11px]">Hyperlocal Bangalore</span>
        </div>
      </div>

      {/* Pop Up Modal: Account Not Found */}
      {showAccountNotFoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 text-slate-900 relative space-y-5 animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-not-found-modal-title"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowAccountNotFoundModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Icon */}
            <div className="flex items-center gap-3.5 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-sm">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2
                  id="account-not-found-modal-title"
                  className="text-lg sm:text-xl font-black text-slate-900 tracking-tight"
                >
                  Account Not Found
                </h2>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block mt-0.5">
                  Register with Google
                </span>
              </div>
            </div>

            {/* Message Box */}
            <div className="p-4 bg-orange-50/80 border border-orange-200/70 rounded-2xl space-y-2">
              <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                We couldn't find an existing registered profile for this Google Account.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Please register to select whether you want to use Jobnexa as a <strong className="text-orange-700">Worker</strong> or an <strong className="text-[#1A3C6E]">Employer</strong>.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowAccountNotFoundModal(false);
                  setActiveTab('register');
                  setAuthError(null);
                  setNotRegisteredNotice(false);
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register with Google Now</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                type="button"
                onClick={() => setShowAccountNotFoundModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
