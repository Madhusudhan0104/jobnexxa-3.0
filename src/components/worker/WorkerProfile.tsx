import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Share2,
  Sparkles,
  Star,
  ToggleLeft,
  ToggleRight,
  User,
  Wrench,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { SKILL_CATEGORIES } from '../../data/mockData.ts';
import { SkillCategory } from '../../types.ts';

export const WorkerProfileView: React.FC = () => {
  const {
    currentWorker,
    setRole,
    toggleWorkerAvailability,
    reviews,
    updateWorkerProfile,
    enhanceBioWithAI,
    showToast,
    logout,
    firebaseUser,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  // Form states for editing
  const [name, setName] = useState(currentWorker.name);
  const [primarySkill, setPrimarySkill] = useState<SkillCategory>(currentWorker.primarySkill);
  const [expectedWage, setExpectedWage] = useState(currentWorker.expectedWage);
  const [area, setArea] = useState(currentWorker.area);
  const [bio, setBio] = useState(currentWorker.bio);
  const [experienceYears, setExperienceYears] = useState(currentWorker.experienceYears);

  // Reviews for this worker
  const workerReviews = reviews.filter((r) => r.targetId === currentWorker.id);

  const isAvailable = currentWorker.availabilityStatus === 'available';

  const handleEnhanceBio = async () => {
    setIsGeneratingBio(true);
    try {
      const enhanced = await enhanceBioWithAI(bio, primarySkill, experienceYears);
      setBio(enhanced);
      showToast('Bio enhanced with AI!');
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleSave = () => {
    updateWorkerProfile(currentWorker.id, {
      name,
      primarySkill,
      expectedWage: Number(expectedWage),
      area,
      bio,
      experienceYears: Number(experienceYears),
    });
    setIsEditing(false);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Profile link copied to clipboard!');
  };

  return (
    <div className="space-y-4 pb-6">
      
      {/* Profile Card Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="relative">
            <img
              src={currentWorker.avatar}
              alt={currentWorker.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-orange-500/80 shadow-md"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {currentWorker.name}
              </h1>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                {currentWorker.primarySkill}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {currentWorker.area}, {currentWorker.city}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {currentWorker.experienceYears} Years Exp
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-600 font-semibold">
                <Phone className="w-3.5 h-3.5 text-orange-500" />
                {currentWorker.phone || '+91 98450 00000'}
              </span>
              {currentWorker.username && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-600 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    @{currentWorker.username}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share Profile
              </button>

              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-center sm:text-right shrink-0 w-full sm:w-auto">
            <span className="text-[11px] font-medium text-slate-500 block">
              Daily Expected Wage
            </span>
            <span className="text-xl font-black text-[#1A3C6E]">
              ₹{currentWorker.expectedWage}
            </span>
            <span className="text-[10px] text-slate-400 block">per {currentWorker.wageType}</span>
          </div>
        </div>

        {/* Availability Toggle Bar */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">
              Live Visibility:
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isAvailable ? 'Available for Work' : 'Unavailable'}
            </span>
          </div>

          <button
            onClick={() => toggleWorkerAvailability(currentWorker.id)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            {isAvailable ? (
              <ToggleRight className="w-6 h-6 text-emerald-600" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Edit Form Modal or Inline Expansion */}
      {isEditing && (
        <div className="bg-white rounded-2xl p-5 border-2 border-orange-400/80 shadow-md space-y-4 animate-in fade-in duration-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-orange-500" />
            Edit Worker Profile Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Skill</label>
              <select
                value={primarySkill}
                onChange={(e) => setPrimarySkill(e.target.value as SkillCategory)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {SKILL_CATEGORIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Experience (Years)</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Daily Expected Wage (₹)</label>
              <input
                type="number"
                value={expectedWage}
                onChange={(e) => setExpectedWage(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Neighborhood / Area</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700">Bio & Summary</label>
                <button
                  type="button"
                  disabled={isGeneratingBio}
                  onClick={handleEnhanceBio}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200"
                >
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  {isGeneratingBio ? 'Enhancing...' : 'AI Enhance Bio'}
                </button>
              </div>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow"
            >
              Save Profile
            </button>
          </div>
        </div>
      )}

      {/* Bio Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
        <h2 className="text-sm font-bold text-slate-900">About & Specialization</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {currentWorker.bio}
        </p>

        <div className="pt-2">
          <span className="text-xs font-bold text-slate-700 block mb-1.5">
            Skills & Services
          </span>
          <div className="flex flex-wrap gap-1.5">
            <span className="bg-[#1A3C6E] text-white text-xs font-semibold px-3 py-1 rounded-lg">
              {currentWorker.primarySkill}
            </span>
            {currentWorker.secondarySkills.map((s) => (
              <span
                key={s}
                className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-lg border border-slate-200/80"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Past Work Experience Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-slate-500" />
          Verified Work History
        </h2>

        {currentWorker.pastExperience && currentWorker.pastExperience.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {currentWorker.pastExperience.map((exp) => (
              <div key={exp.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                    {exp.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {exp.duration}
                  </span>
                </div>
                <p className="text-xs text-orange-600 font-medium">
                  {exp.companyOrClient}
                </p>
                <p className="text-xs text-slate-500">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No past entries recorded yet.</p>
        )}
      </div>

      {/* Reviews Received */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            Client Reviews ({workerReviews.length})
          </h2>
          <span className="text-xs font-bold text-slate-700">
            Average {currentWorker.rating} / 5.0
          </span>
        </div>

        {workerReviews.length === 0 ? (
          <p className="text-xs text-slate-400">No client reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {workerReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    {rev.reviewerName}
                  </span>
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Job: {rev.jobTitle} · {rev.date}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
