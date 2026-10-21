import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
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

export const EmployerSearchWorkers: React.FC = () => {
  const { workers, setSelectedWorkerId, setHireRequestWorkerId } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [availableOnly, setAvailableOnly] = useState<boolean>(true);
  const [maxWage, setMaxWage] = useState<number>(2000);
  const [sortBy, setSortBy] = useState<'rating' | 'wage' | 'experience'>('rating');

  const areas = ['All', ...CITIES_AND_AREAS.Bangalore];

  const filteredWorkers = workers
    .filter((w) => {
      const matchSearch =
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.primarySkill.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.secondarySkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        w.bio.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSkill = selectedSkill === 'All' || w.primarySkill === selectedSkill;
      const matchArea = selectedArea === 'All' || w.area.toLowerCase() === selectedArea.toLowerCase();
      const matchAvail = !availableOnly || w.availabilityStatus === 'available';
      const matchWage = w.expectedWage <= maxWage;

      return matchSearch && matchSkill && matchArea && matchAvail && matchWage;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'wage') return a.expectedWage - b.expectedWage;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      return 0;
    });

  return (
    <div className="space-y-4 pb-6">
      
      {/* Header and Search Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Search Workers Directory
            </h1>
            <p className="text-xs text-slate-500">
              Browse verified local tradespeople, view reviews, and send hire requests directly
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
            {filteredWorkers.length} Workers Matched
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by skill, name, or keywords (e.g. plumber, tile, MCB)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter Badges & Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="bg-slate-100 text-slate-700 py-1.5 px-3 rounded-xl border border-slate-200 focus:outline-none font-medium"
          >
            <option value="All">All Skill Domains</option>
            {SKILL_CATEGORIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="bg-slate-100 text-slate-700 py-1.5 px-3 rounded-xl border border-slate-200 focus:outline-none font-medium"
          >
            <option value="All">All Bangalore Areas</option>
            {areas.filter((a) => a !== 'All').map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-colors ${
              availableOnly
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {availableOnly ? '✓ Available Now Only' : 'Show All Workers'}
          </button>

          <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-100 font-bold text-slate-800 py-1.5 px-2.5 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="rating">Top Rated</option>
              <option value="wage">Lowest Wage</option>
              <option value="experience">Most Experience</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workers Grid */}
      {filteredWorkers.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No workers match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try expanding your search query or unchecking "Available Now Only" to see workers in other statuses.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSkill('All');
              setSelectedArea('All');
              setAvailableOnly(false);
            }}
            className="text-xs font-semibold text-orange-600 hover:underline pt-2 inline-block"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorkers.map((worker) => {
            const isAvail = worker.availabilityStatus === 'available';
            const isHired = worker.availabilityStatus === 'hired';

            return (
              <div
                key={worker.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-slate-300 shadow-sm transition-all hover:shadow-md flex flex-col justify-between space-y-3"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-500/80 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3
                            onClick={() => setSelectedWorkerId(worker.id)}
                            className="text-base font-bold text-slate-900 hover:text-orange-600 cursor-pointer transition-colors"
                          >
                            {worker.name}
                          </h3>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-semibold text-orange-600">
                            {worker.primarySkill}
                          </span>
                          <span>·</span>
                          <span>{worker.experienceYears} yrs exp</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAvail
                          ? 'bg-emerald-100 text-emerald-800'
                          : isHired
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isAvail ? 'Available' : isHired ? 'Hired' : 'Offline'}
                    </span>
                  </div>

                  {/* Wage and Rating strip */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                        {worker.rating}
                      </span>
                      <span className="text-slate-400">({worker.reviewCount} reviews)</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {worker.area}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#1A3C6E]">
                        ₹{worker.expectedWage}
                      </span>
                      <span className="text-[10px] text-slate-500">/{worker.wageType}</span>
                    </div>
                  </div>

                  {/* Bio snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 italic">
                    "{worker.bio}"
                  </p>

                  {/* Secondary skills chips */}
                  <div className="flex flex-wrap gap-1">
                    {worker.secondarySkills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                    {worker.secondarySkills.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{worker.secondarySkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setSelectedWorkerId(worker.id)}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Full Profile
                  </button>

                  <button
                    disabled={isHired}
                    onClick={() => setHireRequestWorkerId(worker.id)}
                    className={`text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-sm ${
                      isHired
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
                    }`}
                  >
                    {isHired ? 'Currently Hired' : 'Send Hire Request'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
