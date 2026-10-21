import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Hammer,
  MapPin,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { CITIES_AND_AREAS, SKILL_CATEGORIES } from '../../data/mockData.ts';
import { SkillCategory, UserRole } from '../../types.ts';

export const OnboardingRoleModal: React.FC = () => {
  const {
    isNewUserOnboarding,
    onboardingUser,
    completeRegistration,
    role: initialRole,
  } = useApp();

  if (!isNewUserOnboarding || !onboardingUser) return null;

  const [role, setRole] = useState<UserRole>(initialRole || 'worker');

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  // Worker fields
  const [primarySkill, setPrimarySkill] = useState<SkillCategory>('Plumber');
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [expectedWage, setExpectedWage] = useState<number>(850);
  const [workerPhone, setWorkerPhone] = useState<string>('+91 98450 00000');
  const [workerArea, setWorkerArea] = useState<string>('Koramangala');
  const [workerBio, setWorkerBio] = useState<string>('Experienced tradesperson dedicated to reliable, punctual service in Bangalore.');

  // Employer fields
  const [companyName, setCompanyName] = useState<string>(
    onboardingUser.displayName ? `${onboardingUser.displayName}'s Ventures` : 'My Enterprise'
  );
  const [businessType, setBusinessType] = useState<string>('Private Household');
  const [employerPhone, setEmployerPhone] = useState<string>('+91 98450 00000');
  const [employerArea, setEmployerArea] = useState<string>('Koramangala');
  const [employerDesc, setEmployerDesc] = useState<string>(
    'Local business looking to regularly hire verified skilled labor for on-demand assignments.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'worker') {
      completeRegistration({
        role: 'worker',
        phone: workerPhone,
        primarySkill,
        experienceYears: Number(experienceYears),
        expectedWage: Number(expectedWage),
        area: workerArea,
        bio: workerBio,
      });
    } else {
      completeRegistration({
        role: 'employer',
        companyName,
        businessType,
        phone: employerPhone,
        area: employerArea,
        description: employerDesc,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
            Account Registration
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Welcome, {onboardingUser.displayName || 'Friend'}!
          </h2>
          <p className="text-xs text-slate-500">
            Please tell us how you plan to use Jobnexa to configure your account.
          </p>
        </div>

        {/* Role Switcher */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Are you a Worker or an Employer?
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setRole('worker')}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                role === 'worker'
                  ? 'border-orange-500 bg-orange-50/60 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <Hammer className={`w-5 h-5 ${role === 'worker' ? 'text-orange-600' : 'text-slate-400'}`} />
                {role === 'worker' && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
              </div>
              <strong className="text-xs sm:text-sm font-bold text-slate-900 block mt-1.5">
                Worker
              </strong>
              <span className="text-[10px] text-slate-500 block">
                Find local daily wage & contract work
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole('employer')}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                role === 'employer'
                  ? 'border-orange-500 bg-orange-50/60 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <Briefcase className={`w-5 h-5 ${role === 'employer' ? 'text-orange-600' : 'text-slate-400'}`} />
                {role === 'employer' && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
              </div>
              <strong className="text-xs sm:text-sm font-bold text-slate-900 block mt-1.5">
                Employer
              </strong>
              <span className="text-[10px] text-slate-500 block">
                Post jobs and hire local tradespeople
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Role Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {role === 'worker' ? (
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                Worker Profile Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Primary Skill
                  </label>
                  <select
                    value={primarySkill}
                    onChange={(e) => setPrimarySkill(e.target.value as SkillCategory)}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                  >
                    {SKILL_CATEGORIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={workerPhone}
                    onChange={(e) => setWorkerPhone(e.target.value)}
                    placeholder="+91 98450 00000"
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Bangalore Area
                  </label>
                  <select
                    value={workerArea}
                    onChange={(e) => setWorkerArea(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                  >
                    {CITIES_AND_AREAS.Bangalore.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Short Work Bio
                </label>
                <textarea
                  rows={2}
                  value={workerBio}
                  onChange={(e) => setWorkerBio(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                Employer Profile Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Company / Household Name
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Business Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Property Management, Cafe, Private Household"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={employerPhone}
                    onChange={(e) => setEmployerPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Area in Bangalore
                  </label>
                  <select
                    value={employerArea}
                    onChange={(e) => setEmployerArea(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                  >
                    {CITIES_AND_AREAS.Bangalore.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Business Description
                </label>
                <textarea
                  rows={2}
                  value={employerDesc}
                  onChange={(e) => setEmployerDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-3 px-5 rounded-2xl shadow-lg transition-transform active:scale-95"
          >
            Complete Registration & Open Dashboard →
          </button>
        </form>

      </div>
    </div>
  );
};
