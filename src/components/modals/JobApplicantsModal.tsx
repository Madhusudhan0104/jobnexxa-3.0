import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  MapPin,
  Star,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const JobApplicantsModal: React.FC = () => {
  const {
    applicantsJobId,
    setApplicantsJobId,
    jobs,
    applications,
    acceptApplication,
    declineApplication,
    setSelectedWorkerId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Applicants' | 'Hired'>('Applicants');

  if (!applicantsJobId) return null;

  const job = jobs.find((j) => j.id === applicantsJobId);
  if (!job) return null;

  const jobApps = applications.filter((a) => a.jobId === job.id);
  const pendingApplicants = jobApps.filter((a) => a.status === 'Pending');
  const hiredApplicants = jobApps.filter((a) => a.status === 'Accepted');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col space-y-4 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
              Job Screening & Applicants
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              {job.title}
            </h3>
            <p className="text-xs text-slate-500">
              {job.area} · Budget: ₹{job.payRate}/{job.payType}
            </p>
          </div>

          <button
            onClick={() => setApplicantsJobId(null)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Stats Strip */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-center text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Total Applied</span>
            <strong className="text-sm font-extrabold text-slate-900">
              {jobApps.length}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Hired / Needed</span>
            <strong className="text-sm font-extrabold text-emerald-600">
              {job.workersHired} of {job.workersNeeded}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Status</span>
            <strong
              className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${
                job.status === 'Open'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-sky-100 text-sky-800'
              }`}
            >
              {job.status}
            </strong>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('Applicants')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'Applicants'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Applicants ({pendingApplicants.length})
          </button>
          <button
            onClick={() => setActiveTab('Hired')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'Hired'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hired Workers ({hiredApplicants.length})
          </button>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto space-y-3 pr-1 max-h-[50vh]">
          {activeTab === 'Applicants' && (
            pendingApplicants.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No pending applicants to review right now.
              </div>
            ) : (
              pendingApplicants.map((app) => (
                <div
                  key={app.id}
                  className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={app.workerAvatar}
                        alt={app.workerName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/80"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900">
                            {app.workerName}
                          </h4>
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded">
                            {app.workerSkill}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{app.workerExperienceYears} yrs experience</span>
                          <span>·</span>
                          <span className="flex items-center text-amber-600 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                            {app.workerRating}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Applied {app.appliedAt} · Match Score: {app.matchScore}%
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#1A3C6E]">
                        ₹{app.expectedWage}
                      </span>
                      <span className="text-[10px] text-slate-500 block">/day</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedWorkerId(app.workerId)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100"
                    >
                      View Profile
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => declineApplication(app.id)}
                        className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors"
                      >
                        Decline
                      </button>

                      <button
                        onClick={() => acceptApplication(app.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-4 rounded-xl shadow-sm transition-transform active:scale-95 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Hire Worker
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === 'Hired' && (
            hiredApplicants.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No workers hired for this posting yet.
              </div>
            ) : (
              hiredApplicants.map((app) => (
                <div
                  key={app.id}
                  className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={app.workerAvatar}
                      alt={app.workerName}
                      className="w-10 h-10 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {app.workerName} ({app.workerSkill})
                      </h4>
                      <span className="text-[11px] text-emerald-800 font-medium">
                        Hired for this assignment at ₹{app.expectedWage}/day
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Active on Job
                  </span>
                </div>
              ))
            )
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 text-right">
          <button
            onClick={() => setApplicantsJobId(null)}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
