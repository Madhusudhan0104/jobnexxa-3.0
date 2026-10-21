import React from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Share2,
  Star,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const WorkerProfileModal: React.FC = () => {
  const {
    selectedWorkerId,
    setSelectedWorkerId,
    workers,
    reviews,
    setHireRequestWorkerId,
    showToast,
  } = useApp();

  if (!selectedWorkerId) return null;

  const worker = workers.find((w) => w.id === selectedWorkerId);
  if (!worker) return null;

  const workerReviews = reviews.filter((r) => r.targetId === worker.id);
  const isAvailable = worker.availabilityStatus === 'available';
  const isHired = worker.availabilityStatus === 'hired';

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Worker profile link copied!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col space-y-4 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-500/80 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {worker.name}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isAvailable
                      ? 'bg-emerald-100 text-emerald-800'
                      : isHired
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isAvailable ? 'Available' : isHired ? 'Hired' : 'Offline'}
                </span>
              </div>
              <p className="text-xs text-orange-600 font-semibold mt-0.5">
                {worker.primarySkill} · {worker.experienceYears} Years Experience
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              title="Share profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedWorkerId(null)}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 font-bold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto space-y-4 pr-1 text-xs sm:text-sm">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 block font-medium">Daily Wage</span>
              <strong className="text-sm sm:text-base font-extrabold text-[#1A3C6E]">
                ₹{worker.expectedWage}
              </strong>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 block font-medium">Rating</span>
              <strong className="text-sm sm:text-base font-extrabold text-amber-600 inline-flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                {worker.rating}
              </strong>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 block font-medium">Location</span>
              <strong className="text-xs font-bold text-slate-800 flex items-center justify-center gap-0.5 truncate mt-0.5">
                <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                {worker.area}
              </strong>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
              Professional Bio
            </h4>
            <p className="text-slate-600 leading-relaxed text-xs">
              {worker.bio}
            </p>
          </div>

          {/* Skills */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
              Skill Categories & Specializations
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <span className="bg-[#1A3C6E] text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                {worker.primarySkill}
              </span>
              {worker.secondarySkills.map((s) => (
                <span
                  key={s}
                  className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg border border-slate-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Work History */}
          {worker.pastExperience && worker.pastExperience.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Past Work Experience
              </h4>
              <div className="space-y-2">
                {worker.pastExperience.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs space-y-0.5"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{exp.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{exp.duration}</span>
                    </div>
                    <p className="text-orange-600 font-medium">{exp.companyOrClient}</p>
                    <p className="text-slate-500 text-[11px]">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client Reviews */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Past Reviews ({workerReviews.length})
              </h4>
              <span className="text-xs text-amber-600 font-bold">
                {worker.rating} Stars Avg
              </span>
            </div>

            {workerReviews.length === 0 ? (
              <p className="text-xs text-slate-400">No client reviews yet.</p>
            ) : (
              <div className="space-y-2">
                {workerReviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-800">{r.reviewerName}</strong>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 italic leading-snug">
                      "{r.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => setSelectedWorkerId(null)}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Back
          </button>

          <button
            disabled={isHired}
            onClick={() => {
              setHireRequestWorkerId(worker.id);
              setSelectedWorkerId(null);
            }}
            className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all ${
              isHired
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
            }`}
          >
            {isHired ? 'Worker is Currently Hired' : `Send Hire Request to ${worker.name.split(' ')[0]}`}
          </button>
        </div>

      </div>
    </div>
  );
};
