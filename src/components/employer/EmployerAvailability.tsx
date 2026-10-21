import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  Briefcase,
  ChevronRight,
  Filter,
  Hammer,
  Map as MapIcon,
  MapPin,
  Paintbrush,
  Pipette,
  Radio,
  Search,
  Sparkles,
  Star,
  Truck,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { CITIES_AND_AREAS, SKILL_CATEGORIES } from '../../data/mockData.ts';
import { SkillCategory, WorkerProfile } from '../../types.ts';
import { EmployerWorkerMap } from './EmployerWorkerMap.tsx';

export const EmployerAvailability: React.FC = () => {
  const {
    getAvailabilityCount,
    getAvailableWorkersList,
    setSelectedWorkerId,
    setHireRequestWorkerId,
    currentEmployer,
  } = useApp();

  const [selectedCity, setSelectedCity] = useState('Bangalore');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [drillDownSkill, setDrillDownSkill] = useState<SkillCategory | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'grid' | 'comparison'>('map');

  const areas = ['All Areas', ...CITIES_AND_AREAS.Bangalore];

  // Helper icon for each skill category
  const getSkillIcon = (skill: SkillCategory) => {
    switch (skill) {
      case 'Plumber':
        return <Wrench className="w-5 h-5 text-sky-600" />;
      case 'Electrician':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Carpenter':
        return <Hammer className="w-5 h-5 text-orange-600" />;
      case 'Painter':
        return <Paintbrush className="w-5 h-5 text-purple-600" />;
      case 'Driver':
        return <Truck className="w-5 h-5 text-emerald-600" />;
      case 'Domestic Help':
        return <Users className="w-5 h-5 text-rose-500" />;
      default:
        return <Briefcase className="w-5 h-5 text-[#1A3C6E]" />;
    }
  };

  const drillDownWorkers: WorkerProfile[] = drillDownSkill
    ? getAvailableWorkersList(drillDownSkill, selectedCity, selectedArea)
    : [];

  return (
    <div className="space-y-5 pb-6">
      
      {/* Header & View Mode Switcher */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Live Availability Engine
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              Workforce Availability & Map
            </h1>
            <p className="text-xs text-slate-500">
              Real-time worker counts and interactive geographic locations across Bangalore
            </p>
          </div>

          {/* 3-Way View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto border border-slate-200/60">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'map'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Skill Domains</span>
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'comparison'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Radar</span>
            </button>
          </div>
        </div>

        {/* Global Filter bar (when in Grid or Comparison mode) */}
        {viewMode !== 'map' && (
          <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs border-t border-slate-100">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-semibold text-slate-700">City:</span>
              <span className="font-bold text-slate-900">Bangalore</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">Area:</span>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setSelectedArea(currentEmployer.area)}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl border border-orange-200 transition-colors"
            >
              My Area ({currentEmployer.area})
            </button>
          </div>
        )}
      </div>

      {/* Mode 1: Interactive Map View */}
      {viewMode === 'map' && <EmployerWorkerMap />}

      {/* Mode 2: Grid Mode (Domain Cards) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SKILL_CATEGORIES.map((skill) => {
            const count = getAvailabilityCount(skill, selectedCity, selectedArea);

            const isHigh = count >= 3;
            const isMedium = count >= 1 && count < 3;
            const isLow = count === 0;

            const badgeColor = isHigh
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : isMedium
              ? 'bg-amber-100 text-amber-800 border-amber-200'
              : 'bg-rose-100 text-rose-800 border-rose-200';

            const cardBorder = isHigh
              ? 'hover:border-emerald-400'
              : isMedium
              ? 'hover:border-amber-400'
              : 'hover:border-rose-400';

            return (
              <div
                key={skill}
                onClick={() => setDrillDownSkill(skill)}
                className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 ${cardBorder} shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group flex flex-col justify-between`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getSkillIcon(skill)}
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}
                  >
                    {isHigh ? 'High Supply' : isMedium ? 'Moderate' : 'Low / Busy'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {skill}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedArea === 'All Areas' ? 'Across all Bangalore' : `in ${selectedArea}`}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-black text-slate-900 tabular-nums leading-none">
                      {count}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Available Workers
                    </span>
                  </div>

                  <div className="flex items-center text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
                    <span>Inspect</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode 3: Comparison Mode (Area Breakdown) */}
      {viewMode === 'comparison' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Neighborhood Workforce Distribution
              </h2>
              <p className="text-xs text-slate-500">
                Compare available hands across major Bangalore hubs
              </p>
            </div>
            <span className="text-xs text-slate-400">Live Telemetry</span>
          </div>

          <div className="space-y-3 pt-2">
            {CITIES_AND_AREAS.Bangalore.map((areaName) => {
              const totalInArea = SKILL_CATEGORIES.reduce(
                (sum, skill) => sum + getAvailabilityCount(skill, 'Bangalore', areaName),
                0
              );

              return (
                <div key={areaName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      {areaName}
                    </span>
                    <span className="tabular-nums font-bold text-[#1A3C6E]">
                      {totalInArea} Active Workers
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(15, totalInArea * 20))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Drill-Down Modal / Sub-Sheet for Grid Mode */}
      {drillDownSkill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-2xl max-h-[85vh] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col space-y-4 overflow-hidden">
            
            {/* Sheet Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                    {drillDownSkill}
                  </span>
                  <span className="text-xs text-slate-500">
                    Location: {selectedArea}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Available {drillDownSkill}s ({drillDownWorkers.length})
                </h3>
              </div>

              <button
                onClick={() => setDrillDownSkill(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Workers List */}
            <div className="overflow-y-auto space-y-3 pr-1 max-h-[55vh]">
              {drillDownWorkers.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">
                    No {drillDownSkill}s currently available in {selectedArea}
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Workers may be currently hired or offline. Try selecting "All Areas" to search neighboring localities.
                  </p>
                </div>
              ) : (
                drillDownWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/80"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {worker.name}
                          </h4>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                            Available
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{worker.experienceYears} yrs exp</span>
                          <span>·</span>
                          <span className="flex items-center text-amber-600 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                            {worker.rating} ({worker.reviewCount})
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {worker.area}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1 italic">
                          "{worker.bio}"
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <span className="text-sm font-extrabold text-[#1A3C6E]">
                        ₹{worker.expectedWage}/day
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedWorkerId(worker.id);
                            setDrillDownSkill(null);
                          }}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            setHireRequestWorkerId(worker.id);
                            setDrillDownSkill(null);
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-1.5 px-3 rounded-xl shadow-sm transition-transform active:scale-95"
                        >
                          Send Offer
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setDrillDownSkill(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
