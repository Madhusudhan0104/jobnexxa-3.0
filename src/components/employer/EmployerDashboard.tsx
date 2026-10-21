import React, { useState } from 'react';
import {
  BarChart3,
  Briefcase,
  ChevronRight,
  Clock,
  Compass,
  MapPin,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { CITIES_AND_AREAS, SKILL_CATEGORIES } from '../../data/mockData.ts';
import { SkillCategory } from '../../types.ts';

export const EmployerDashboard: React.FC = () => {
  const {
    currentEmployer,
    getAvailabilityCount,
    jobs,
    hireRequests,
    applications,
    setApplicantsJobId,
    setIsPostJobOpen,
    setActiveEmployerTab,
    setSelectedJobId,
    setSelectedWorkerId,
    firebaseUser,
  } = useApp();

  const [selectedSkill, setSelectedSkill] = useState<SkillCategory>('Plumber');
  const [selectedArea, setSelectedArea] = useState<string>(currentEmployer.area);

  // Dynamic live count for this selected skill & area!
  const liveCount = getAvailabilityCount(selectedSkill, 'Bangalore', selectedArea);

  // Status indicator based on threshold
  const countStatus = liveCount >= 3 ? 'High' : liveCount >= 1 ? 'Moderate' : 'Low';
  const statusColor =
    countStatus === 'High'
      ? 'text-emerald-700 bg-emerald-100 border-emerald-300'
      : countStatus === 'Moderate'
      ? 'text-amber-700 bg-amber-100 border-amber-300'
      : 'text-rose-700 bg-rose-100 border-rose-300';

  // Employer's active job posts
  const myJobs = jobs.filter((j) => j.employerId === currentEmployer.id || (firebaseUser && j.employerId === firebaseUser.uid));
  const openJobs = myJobs.filter((j) => j.status === 'Open');

  // Recent hire requests sent by this employer
  const recentRequests = hireRequests.filter(
    (r) => r.employerId === currentEmployer.id || (firebaseUser && r.employerId === firebaseUser.uid)
  );

  return (
    <div className="space-y-5 pb-6">
      
      {/* Top Welcome Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={currentEmployer.logo}
            alt={currentEmployer.name}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-orange-500/80 shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              {currentEmployer.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentEmployer.businessType} · {currentEmployer.area}, Bangalore
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPostJobOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Post New Job
        </button>
      </div>

      {/* Hero Availability Stats Card (PRD 5.10 & 2.11) */}
      <div className="bg-gradient-to-br from-[#1A3C6E] to-[#122B50] text-white rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
                Real-Time Worker Availability
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Workforce Supply Near You
            </h2>
          </div>

          {/* Skill & Area Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value as SkillCategory)}
              className="bg-white/10 text-white text-xs font-semibold py-2 px-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
            >
              {SKILL_CATEGORIES.map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-white">
                  {s}
                </option>
              ))}
            </select>

            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-white/10 text-white text-xs font-semibold py-2 px-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
            >
              <option value="All Areas" className="bg-slate-900 text-white">
                All Bangalore
              </option>
              {CITIES_AND_AREAS.Bangalore.map((a) => (
                <option key={a} value={a} className="bg-slate-900 text-white">
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter Display */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white tabular-nums">
              {liveCount}
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-white block">
                Available {selectedSkill}s Right Now
              </span>
              <span className="text-xs text-sky-200">
                in {selectedArea} · Ready for immediate dispatch
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColor}`}
            >
              Supply: {countStatus}
            </span>

            <button
              onClick={() => setActiveEmployerTab('availability')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>View on Map</span>
            </button>

            <button
              onClick={() => setActiveEmployerTab('availability')}
              className="bg-white text-[#1A3C6E] hover:bg-slate-100 font-bold text-xs py-2 px-3.5 rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Explore Domains</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-sky-200/80">
          * Counter automatically decrements in real-time whenever a worker accepts a hire request or is booked.
        </p>
      </div>

      {/* Quick Search Shortcut */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-slate-600 flex-1">
          <Search className="w-4 h-4 text-orange-500" />
          <span>Looking to hire someone specific?</span>
        </div>
        <button
          onClick={() => setActiveEmployerTab('workers')}
          className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3.5 py-1.5 rounded-xl border border-orange-200"
        >
          Search Workers Directory →
        </button>
      </div>

      {/* Active Job Posts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#1A3C6E]" />
            My Active Job Posts ({openJobs.length})
          </h2>

          <button
            onClick={() => setActiveEmployerTab('my-jobs')}
            className="text-xs font-semibold text-orange-600 hover:underline"
          >
            Manage All
          </button>
        </div>

        {openJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 space-y-2">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No active job posts</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Post a job to get matched with available skilled workers nearby.
            </p>
            <button
              onClick={() => setIsPostJobOpen(true)}
              className="text-xs font-bold text-orange-600 bg-orange-50 px-3.5 py-1.5 rounded-xl border border-orange-200 inline-block mt-1"
            >
              Post a Job Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {openJobs.map((job) => {
              const jobApps = applications.filter((a) => a.jobId === job.id);
              const pendingCount = jobApps.filter((a) => a.status === 'Pending').length;

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-slate-300 shadow-sm transition-all hover:shadow space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md">
                        {job.skillCategory}
                      </span>
                      <span className="text-xs font-extrabold text-[#1A3C6E]">
                        ₹{job.payRate} / {job.payType}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {job.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {job.area}
                      </span>
                      <span>·</span>
                      <span>{job.duration}</span>
                    </div>

                    {/* Progress of workers needed vs hired */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                        <span>Workers needed:</span>
                        <span>
                          <strong>{job.workersHired}</strong> of {job.workersNeeded} hired
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all"
                          style={{
                            width: `${(job.workersHired / job.workersNeeded) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{jobApps.length} Applicants</span>
                      {pendingCount > 0 && (
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {pendingCount} new
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setApplicantsJobId(job.id)}
                      className="text-xs font-bold text-[#1A3C6E] hover:text-orange-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      View Applicants
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Hire Activity */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          Recent Hire Requests & Status
        </h2>

        {recentRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/80 text-xs text-slate-500">
            No hire requests sent yet. Search workers or inspect availability to send an offer!
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-sm overflow-hidden">
            {recentRequests.slice(0, 4).map((req) => (
              <div key={req.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={req.workerAvatar}
                    alt={req.workerName}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {req.workerName} ({req.workerSkill})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {req.jobTitle} · ₹{req.proposedWage}/day
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      req.status === 'Accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'Completed'
                        ? 'bg-sky-100 text-sky-800'
                        : req.status === 'Declined'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {req.createdAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
