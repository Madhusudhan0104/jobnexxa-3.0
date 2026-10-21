import React, { useState } from 'react';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  Users,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { JobStatus } from '../../types.ts';

export const EmployerMyJobs: React.FC = () => {
  const {
    jobs,
    currentEmployer,
    applications,
    setApplicantsJobId,
    setIsPostJobOpen,
    firebaseUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<JobStatus>('Open');

  // Filter jobs posted by this employer
  const myJobs = jobs.filter(
    (j) => j.employerId === currentEmployer.id || (firebaseUser && j.employerId === firebaseUser.uid)
  );

  const openJobs = myJobs.filter((j) => j.status === 'Open');
  const filledJobs = myJobs.filter((j) => j.status === 'Filled');
  const closedJobs = myJobs.filter((j) => j.status === 'Closed');

  const displayedJobs =
    activeTab === 'Open' ? openJobs : activeTab === 'Filled' ? filledJobs : closedJobs;

  return (
    <div className="space-y-4 pb-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Manage Job Postings
            </h1>
            <p className="text-xs text-slate-500">
              Track open listings, screen applicant profiles, and finalize hiring
            </p>
          </div>

          <button
            onClick={() => setIsPostJobOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('Open')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'Open'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Open ({openJobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('Filled')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'Filled'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Filled ({filledJobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('Closed')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'Closed'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Closed ({closedJobs.length})</span>
          </button>
        </div>
      </div>

      {/* Jobs list */}
      {displayedJobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 space-y-2">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">
            No {activeTab.toLowerCase()} jobs found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'Open'
              ? 'Publish a job post to attract skilled workers across Bangalore.'
              : 'Jobs move here once all positions have been hired or closed.'}
          </p>
          {activeTab === 'Open' && (
            <button
              onClick={() => setIsPostJobOpen(true)}
              className="text-xs font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-xl border border-orange-200 inline-block mt-2"
            >
              Post a Job Now
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayedJobs.map((job) => {
            const jobApps = applications.filter((a) => a.jobId === job.id);
            const pendingApps = jobApps.filter((a) => a.status === 'Pending');
            const percentFilled = Math.min(
              100,
              Math.round((job.workersHired / job.workersNeeded) * 100)
            );

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md">
                        {job.skillCategory}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          job.status === 'Open'
                            ? 'bg-emerald-100 text-emerald-800'
                            : job.status === 'Filled'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1.5 leading-snug">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {job.description}
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="text-base sm:text-lg font-extrabold text-[#1A3C6E]">
                      ₹{job.payRate}
                    </span>
                    <span className="text-[11px] text-slate-500"> / {job.payType}</span>
                    <span className="text-[11px] text-slate-400 block">{job.createdAt}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Positions: {job.workersHired} of {job.workersNeeded} Hired
                    </span>
                    <span className="tabular-nums text-slate-500">
                      {percentFilled}% Filled
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        job.workersHired >= job.workersNeeded
                          ? 'bg-emerald-500'
                          : 'bg-orange-500'
                      }`}
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {job.area}
                    </span>
                    <span>·</span>
                    <span>Duration: {job.duration}</span>
                    <span>·</span>
                    <span>Deadline: {job.deadline}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setApplicantsJobId(job.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1A3C6E] hover:bg-[#15315B] px-3.5 py-2 rounded-xl shadow-sm transition-transform active:scale-95"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Review Applicants ({jobApps.length})</span>
                      {pendingApps.length > 0 && (
                        <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                          {pendingApps.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
