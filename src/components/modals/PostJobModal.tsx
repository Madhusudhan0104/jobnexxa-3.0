import React, { useState } from 'react';
import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Plus,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { CITIES_AND_AREAS, SKILL_CATEGORIES } from '../../data/mockData.ts';
import { JobType, SkillCategory } from '../../types.ts';

export const PostJobModal: React.FC = () => {
  const {
    isPostJobOpen,
    setIsPostJobOpen,
    currentEmployer,
    createJobPosting,
    generateAIDescription,
    showToast,
  } = useApp();

  const [title, setTitle] = useState('');
  const [skillCategory, setSkillCategory] = useState<SkillCategory>('Plumber');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([
    'Inspect on-site requirements and diagnose faults',
    'Execute repairs with high-quality certified fittings',
  ]);
  const [newResp, setNewResp] = useState('');
  const [workersNeeded, setWorkersNeeded] = useState<number>(1);
  const [payRate, setPayRate] = useState<number>(1200);
  const [payType, setPayType] = useState<'Daily' | 'Hourly' | 'Fixed'>('Daily');
  const [jobType, setJobType] = useState<JobType>('Daily Wage');
  const [area, setArea] = useState<string>(currentEmployer.area);
  const duration = 'Ongoing (until mutually concluded)';
  const [deadline, setDeadline] = useState('2026-10-31');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  if (!isPostJobOpen) return null;

  const handleGenerateAI = async () => {
    if (!title.trim()) {
      showToast('Please enter a job title first so AI can generate details!');
      return;
    }
    setIsGeneratingAI(true);
    try {
      const result = await generateAIDescription(title, skillCategory);
      setDescription(result.description);
      setResponsibilities(result.responsibilities);
      showToast('AI generated description and responsibilities!');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddResp = () => {
    if (newResp.trim()) {
      setResponsibilities([...responsibilities, newResp.trim()]);
      setNewResp('');
    }
  };

  const handleRemoveResp = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please fill out the job title and description.');
      return;
    }

    createJobPosting({
      title,
      skillCategory,
      description,
      responsibilities,
      city: 'Bangalore',
      area,
      duration,
      payRate: Number(payRate),
      payType,
      jobType,
      workersNeeded: Number(workersNeeded),
      deadline,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-2xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col space-y-4 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                Employer Hiring Portal
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Post a New Requirement
            </h2>
            <p className="text-xs text-slate-500">
              Reach verified local workers instantly in Bangalore
            </p>
          </div>

          <button
            onClick={() => setIsPostJobOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pr-1 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Job Title <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Urgent Bathroom Pipeline Repair"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Required Skill Category <span className="text-orange-500">*</span>
              </label>
              <select
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value as SkillCategory)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium cursor-pointer"
              >
                {SKILL_CATEGORIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description & AI Generator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">
                Job Description <span className="text-orange-500">*</span>
              </label>
              <button
                type="button"
                disabled={isGeneratingAI}
                onClick={handleGenerateAI}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-xl border border-orange-200 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                {isGeneratingAI ? 'Generating with AI...' : 'Generate with AI'}
              </button>
            </div>
            <textarea
              rows={3}
              required
              placeholder="Describe the tasks, location details, tools needed, and expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 leading-relaxed"
            />
          </div>

          {/* Responsibilities list */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 block">
              Key Responsibilities
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a task or responsibility item..."
                value={newResp}
                onChange={(e) => setNewResp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddResp();
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={handleAddResp}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Add
              </button>
            </div>

            <div className="space-y-1">
              {responsibilities.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-lg text-slate-700 text-xs border border-slate-200/60"
                >
                  <span className="truncate mr-2">• {r}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveResp(i)}
                    className="text-slate-400 hover:text-rose-600 font-bold text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Stepper & Compensation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Workers Needed
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setWorkersNeeded(Math.max(1, workersNeeded - 1))}
                  className="px-3 py-2 bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200"
                >
                  -
                </button>
                <span className="flex-1 text-center font-bold text-slate-900 text-sm">
                  {workersNeeded}
                </span>
                <button
                  type="button"
                  onClick={() => setWorkersNeeded(workersNeeded + 1)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Pay Rate (₹)
              </label>
              <input
                type="number"
                required
                min={100}
                value={payRate}
                onChange={(e) => setPayRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Payment Type
              </label>
              <select
                value={payType}
                onChange={(e) => setPayType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="Daily">Daily</option>
                <option value="Hourly">Hourly</option>
                <option value="Fixed">Fixed Contract</option>
              </select>
            </div>
          </div>

          {/* Engagement Type and Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Job Engagement Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="Daily Wage">Daily Wage</option>
                <option value="Contract">Contract</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Full-Time">Full-Time</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Location Area
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                {CITIES_AND_AREAS.Bangalore.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-sky-50 border border-sky-200/80 p-3 rounded-xl text-xs text-sky-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>Engagement Term: Flexible (Days or Years)</span>
            </div>
            <p className="text-[11px] text-sky-800 leading-relaxed">
              No predetermined day count needed. The position remains active until you and the hired worker agree to conclude the assignment.
            </p>
          </div>

          {/* Deadline */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Application Deadline
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsPostJobOpen(false)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl shadow-md transition-transform active:scale-95"
            >
              Publish Job Post
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
