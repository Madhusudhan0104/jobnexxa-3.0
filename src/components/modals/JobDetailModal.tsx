import React from 'react';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Share2,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const JobDetailModal: React.FC = () => {
  const {
    selectedJobId,
    setSelectedJobId,
    jobs,
    currentWorker,
    applications,
    applyToJob,
    showToast,
  } = useApp();

  if (!selectedJobId) return null;

  const job = jobs.find((j) => j.id === selectedJobId);
  if (!job) return null;

  const hasApplied = applications.some(
    (a) => a.jobId === job.id && a.workerId === currentWorker.id
  );

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Job listing copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col space-y-4 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <img
              src={job.employerLogo}
              alt={job.employerName}
              className="w-11 h-11 rounded-xl object-cover border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  {job.skillCategory}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {job.jobType}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mt-1">
                {job.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              title="Share job"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedJobId(null)}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 font-bold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-4 pr-1 text-xs sm:text-sm">
          
          {/* Pay Rate & Employer Row */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Compensation</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-[#1A3C6E]">
                  ₹{job.payRate}
                </span>
                <span className="text-xs text-slate-500">/{job.payType}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-900 block">
                {job.employerName}
              </span>
              <span className="text-xs text-amber-600 font-semibold inline-flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                {job.employerRating} Star Employer
              </span>
            </div>
          </div>

          {/* AI Match Score Breakdown (PRD 5.16) */}
          {job.aiMatchReason && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 p-3.5 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-orange-800">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>AI Skill & Proximity Match ({job.matchScore || 95}%)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {job.aiMatchReason}
              </p>
            </div>
          )}

          {/* Details strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <span className="text-slate-400 block text-[10px]">Location</span>
              <strong className="text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                {job.area}, Bangalore
              </strong>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <span className="text-slate-400 block text-[10px]">Engagement</span>
              <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-sky-500" />
                Ongoing (Days or Years)
              </strong>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 col-span-2 sm:col-span-1">
              <span className="text-slate-400 block text-[10px]">Openings</span>
              <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
                <Users className="w-3 h-3 text-emerald-500" />
                {job.workersHired} of {job.workersNeeded} Hired
              </strong>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
              Job Description
            </h4>
            <p className="text-slate-600 leading-relaxed text-xs">
              {job.description}
            </p>
          </div>

          {/* Responsibilities list */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Responsibilities & Tasks
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-[11px] text-slate-400 pt-1">
            Application Deadline: {job.deadline} · Posted: {job.createdAt}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => setSelectedJobId(null)}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>

          <button
            disabled={hasApplied}
            onClick={() => {
              applyToJob(job.id);
              setSelectedJobId(null);
            }}
            className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all ${
              hasApplied
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
            }`}
          >
            {hasApplied ? 'Application Already Submitted' : 'Apply for This Job Now'}
          </button>
        </div>

      </div>
    </div>
  );
};
