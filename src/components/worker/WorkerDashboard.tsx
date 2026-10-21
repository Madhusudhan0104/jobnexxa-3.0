import React from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Sparkles,
  Star,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const WorkerDashboard: React.FC = () => {
  const {
    currentWorker,
    firebaseUser,
    toggleWorkerAvailability,
    hireRequests,
    acceptHireRequest,
    declineHireRequest,
    completeJob,
    jobs,
    applications,
    applyToJob,
    setSelectedJobId,
    setActiveWorkerTab,
  } = useApp();

  // Pending request specifically for this worker
  const pendingRequest = hireRequests.find(
    (hr) =>
      (hr.workerId === currentWorker.id || (firebaseUser && hr.workerId === firebaseUser.uid)) &&
      hr.status?.toLowerCase() === 'pending'
  );

  // Active (Accepted) job for this worker
  const activeJob = hireRequests.find(
    (hr) =>
      (hr.workerId === currentWorker.id || (firebaseUser && hr.workerId === firebaseUser.uid)) &&
      hr.status?.toLowerCase() === 'accepted'
  );

  // Recommended jobs based on primarySkill
  const recommendedJobs = jobs.filter(
    (j) => j.status === 'Open' && (j.skillCategory === currentWorker.primarySkill || j.area === currentWorker.area)
  );

  // My applications
  const myApplications = applications.filter((a) => a.workerId === currentWorker.id);

  const isAvailable = currentWorker.availabilityStatus === 'available';
  const isHired = currentWorker.availabilityStatus === 'hired';

  return (
    <div className="space-y-5 pb-6">
      
      {/* Top Welcome Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={currentWorker.avatar}
            alt={currentWorker.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/80 shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                Hello, {currentWorker.name}!
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Verified
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{currentWorker.primarySkill}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {currentWorker.area}, {currentWorker.city}
              </span>
              <span>·</span>
              <span className="flex items-center text-amber-600 font-semibold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500 mr-0.5" />
                {currentWorker.rating} ({currentWorker.reviewCount})
              </span>
            </div>
          </div>
        </div>

        {/* Quick wage display */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <span className="text-xs text-slate-500">Expected Wage</span>
          <span className="text-base sm:text-lg font-extrabold text-[#1A3C6E]">
            ₹{currentWorker.expectedWage} / {currentWorker.wageType}
          </span>
        </div>
      </div>

      {/* Availability Status Card */}
      <div className={`rounded-2xl p-4 sm:p-5 border transition-all ${
        isHired
          ? 'bg-amber-50/70 border-amber-200'
          : isAvailable
          ? 'bg-emerald-50/60 border-emerald-200'
          : 'bg-slate-100/80 border-slate-200'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Work Availability Status
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 font-bold rounded-full ${
                  isHired
                    ? 'bg-amber-200 text-amber-900'
                    : isAvailable
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-slate-300 text-slate-800'
                }`}
              >
                {isHired ? 'Hired / In-Progress' : isAvailable ? 'Available Now' : 'Unavailable'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md">
              {isHired
                ? 'You are currently assigned to an active job. When finished, mark as complete to become available again.'
                : isAvailable
                ? 'Your profile is active in local employer availability counts for Bangalore.'
                : 'You are currently taking time off. Employers will not see you in live availability search.'}
            </p>
          </div>

          {!isHired && (
            <button
              onClick={() => toggleWorkerAvailability(currentWorker.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-transform active:scale-95 ${
                isAvailable
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-800 text-white'
              }`}
              title="Click to toggle availability"
            >
              {isAvailable ? (
                <>
                  <ToggleRight className="w-5 h-5 text-emerald-200" />
                  <span>Available</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-slate-300" />
                  <span>Go Online</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Active Hire Request Banner (if any) */}
      {pendingRequest && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl p-4 sm:p-5 shadow-md space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-100">
                  New Hire Request Received!
                </span>
                <h3 className="text-base sm:text-lg font-bold leading-snug">
                  {pendingRequest.jobTitle}
                </h3>
              </div>
            </div>
            <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-lg font-semibold shrink-0">
              ₹{pendingRequest.proposedWage} / day
            </span>
          </div>

          <div className="text-xs text-orange-50 bg-black/10 p-2.5 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">{pendingRequest.employerName}</span>
              <span>Start: {pendingRequest.startDate}</span>
            </div>
            <p className="line-clamp-2 italic">"{pendingRequest.message}"</p>
            <div className="flex items-center gap-1 text-[11px] text-orange-200 pt-0.5">
              <MapPin className="w-3 h-3" />
              <span>{pendingRequest.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => acceptHireRequest(pendingRequest.id)}
              className="flex-1 bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow transition-transform active:scale-95"
            >
              Accept Request
            </button>
            <button
              onClick={() => declineHireRequest(pendingRequest.id)}
              className="px-4 py-2.5 bg-black/20 hover:bg-black/30 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Active Job Card (when Hired) */}
      {activeJob && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-500 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Current Active Assignment
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Started: {activeJob.startDate}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {activeJob.jobTitle}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Employer: {activeJob.employerName}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {activeJob.location}
                </span>
                <span>·</span>
                <span>Term: Ongoing (Days or Years)</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-lg font-extrabold text-[#1A3C6E]">
                ₹{activeJob.proposedWage}
              </span>
              <span className="text-[10px] text-slate-500 block">per day</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <a
              href={`tel:${activeJob.employerPhone}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              Call Employer
            </a>

            <button
              onClick={() => completeJob(activeJob.id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-2 px-4 rounded-xl shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Conclude Job & Part Ways
            </button>
          </div>
        </div>
      )}

      {/* Recommended Jobs Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <h2 className="text-base font-bold text-slate-900">
              Recommended Jobs For You
            </h2>
          </div>
          <button
            onClick={() => setActiveWorkerTab('jobs')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700"
          >
            Browse All ({jobs.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {recommendedJobs.slice(0, 4).map((job) => {
            const hasApplied = applications.some(
              (a) => a.jobId === job.id && a.workerId === currentWorker.id
            );

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-slate-300 shadow-sm transition-all hover:shadow space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                      {job.skillCategory}
                    </span>
                    <span className="text-xs font-extrabold text-[#1A3C6E]">
                      ₹{job.payRate} / {job.payType}
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedJobId(job.id)}
                    className="text-sm sm:text-base font-bold text-slate-900 hover:text-orange-600 cursor-pointer transition-colors mt-1.5 line-clamp-1"
                  >
                    {job.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {job.description}
                  </p>

                  {job.aiMatchReason && (
                    <div className="mt-2 text-[11px] bg-slate-50 border border-slate-200/60 p-2 rounded-xl text-slate-600 flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{job.aiMatchReason}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1 truncate max-w-[150px]">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{job.area}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedJobId(job.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      Details
                    </button>
                    <button
                      disabled={hasApplied}
                      onClick={() => applyToJob(job.id)}
                      className={`text-xs font-bold py-1.5 px-3.5 rounded-xl transition-all shadow-sm ${
                        hasApplied
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
                      }`}
                    >
                      {hasApplied ? 'Applied' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* My Applications Section */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          My Job Applications ({myApplications.length})
        </h2>

        {myApplications.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/80 text-slate-500 text-xs">
            You haven't submitted any job applications yet. Browse recommended jobs above to apply!
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-sm overflow-hidden">
            {myApplications.map((app) => (
              <div key={app.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {app.jobTitle}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>Applied {app.appliedAt}</span>
                    <span>·</span>
                    <span>Proposed ₹{app.expectedWage}/day</span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    app.status === 'Accepted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : app.status === 'Declined'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
