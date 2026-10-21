import React, { useState } from 'react';
import {
  Briefcase,
  Calendar,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { CITIES_AND_AREAS, SKILL_CATEGORIES } from '../../data/mockData.ts';
import { SkillCategory } from '../../types.ts';

export const WorkerJobs: React.FC = () => {
  const { jobs, currentWorker, applications, applyToJob, setSelectedJobId } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [payFilter, setPayFilter] = useState<number>(0);
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('All');

  const areas = CITIES_AND_AREAS.Bangalore;

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.employerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || job.skillCategory === selectedCategory;

    const matchesArea =
      selectedArea === 'All' || job.area.toLowerCase() === selectedArea.toLowerCase();

    const matchesPay = job.payRate >= payFilter;

    const matchesType =
      jobTypeFilter === 'All' || job.jobType === jobTypeFilter;

    return matchesSearch && matchesCategory && matchesArea && matchesPay && job.status === 'Open';
  });

  return (
    <div className="space-y-4 pb-6">
      
      {/* Header and Search */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Find Local Jobs
            </h1>
            <p className="text-xs text-slate-500">
              Discover verified daily wage and contract work in Bangalore
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
            {filteredJobs.length} Jobs Available
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by job title, skill, or employer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-100 text-slate-700 py-1.5 px-3 rounded-xl border border-slate-200 focus:outline-none shrink-0"
          >
            <option value="All">All Skills</option>
            {SKILL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="bg-slate-100 text-slate-700 py-1.5 px-3 rounded-xl border border-slate-200 focus:outline-none shrink-0"
          >
            <option value="All">All Neighborhoods</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSelectedCategory(currentWorker.primarySkill);
              setSelectedArea(currentWorker.area);
            }}
            className="px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 font-semibold rounded-xl border border-orange-200 shrink-0 flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Near Me ({currentWorker.area})
          </button>

          <button
            onClick={() => setPayFilter(payFilter === 1000 ? 0 : 1000)}
            className={`px-3 py-1.5 rounded-xl font-semibold border shrink-0 transition-colors ${
              payFilter === 1000
                ? 'bg-[#1A3C6E] text-white border-[#1A3C6E]'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            ₹1000+/day
          </button>
        </div>
      </div>

      {/* Jobs Listing Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 space-y-2">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No jobs match your search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your category or area filters to see more job openings nearby.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSelectedArea('All');
              setPayFilter(0);
            }}
            className="text-xs font-semibold text-orange-600 hover:underline pt-2 inline-block"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const hasApplied = applications.some(
              (a) => a.jobId === job.id && a.workerId === currentWorker.id
            );

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-slate-300 shadow-sm transition-all hover:shadow-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                        {job.skillCategory}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {job.jobType}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base sm:text-lg font-extrabold text-[#1A3C6E]">
                        ₹{job.payRate}
                      </span>
                      <span className="text-[11px] text-slate-500 block leading-none">
                        /{job.payType}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h2
                      onClick={() => setSelectedJobId(job.id)}
                      className="text-base font-bold text-slate-900 hover:text-orange-600 cursor-pointer transition-colors leading-snug"
                    >
                      {job.title}
                    </h2>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {job.description}
                    </p>
                  </div>

                  {job.aiMatchReason && (
                    <div className="text-[11px] bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl text-slate-600 flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{job.aiMatchReason}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      {job.employerName}
                    </span>
                    <span>·</span>
                    <span className="flex items-center text-amber-600">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500 mr-0.5" />
                      {job.employerRating}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {job.area}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {job.duration}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {job.workersHired}/{job.workersNeeded} Hired
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedJobId(job.id)}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      disabled={hasApplied}
                      onClick={() => applyToJob(job.id)}
                      className={`text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-sm ${
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
      )}

    </div>
  );
};
