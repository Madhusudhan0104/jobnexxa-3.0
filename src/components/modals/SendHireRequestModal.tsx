import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  MessageSquare,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const SendHireRequestModal: React.FC = () => {
  const {
    hireRequestWorkerId,
    setHireRequestWorkerId,
    workers,
    jobs,
    currentEmployer,
    sendHireRequest,
  } = useApp();

  if (!hireRequestWorkerId) return null;

  const targetWorker = workers.find((w) => w.id === hireRequestWorkerId);
  if (!targetWorker) return null;

  // Open jobs posted by this employer
  const myOpenJobs = jobs.filter(
    (j) => j.employerId === currentEmployer.id && j.status === 'Open'
  );

  const [selectedJobId, setSelectedJobId] = useState<string>(
    myOpenJobs.length > 0 ? myOpenJobs[0].id : 'custom'
  );

  const activeSelectedJob = myOpenJobs.find((j) => j.id === selectedJobId);

  const [jobTitle, setJobTitle] = useState(
    activeSelectedJob ? activeSelectedJob.title : `Urgent ${targetWorker.primarySkill} Work`
  );
  const [proposedWage, setProposedWage] = useState(
    activeSelectedJob ? activeSelectedJob.payRate : targetWorker.expectedWage
  );
  const [startDate, setStartDate] = useState('Tomorrow at 9:00 AM');
  const duration = 'Ongoing (until mutually concluded)';
  const [location, setLocation] = useState(
    `${currentEmployer.name}, ${currentEmployer.area}, Bangalore`
  );
  const [message, setMessage] = useState(
    `Hello ${targetWorker.name}, we would like to hire you for our work in Bangalore. This is an open-ended engagement that can last days or years until we mutually conclude it. Please review and accept.`
  );

  const handleJobSelectChange = (val: string) => {
    setSelectedJobId(val);
    if (val === 'custom') {
      setJobTitle(`Direct ${targetWorker.primarySkill} Hire`);
      setProposedWage(targetWorker.expectedWage);
    } else {
      const found = myOpenJobs.find((j) => j.id === val);
      if (found) {
        setJobTitle(found.title);
        setProposedWage(found.payRate);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendHireRequest({
      workerId: targetWorker.id,
      jobId: selectedJobId === 'custom' ? undefined : selectedJobId,
      jobTitle,
      proposedWage: Number(proposedWage),
      startDate,
      duration,
      location,
      message,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-lg max-h-[92vh] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col space-y-4 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <img
              src={targetWorker.avatar}
              alt={targetWorker.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/80"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                Direct Hire Proposal
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Hire {targetWorker.name}
              </h3>
              <p className="text-xs text-slate-500">
                {targetWorker.primarySkill} · Expected ₹{targetWorker.expectedWage}/day
              </p>
            </div>
          </div>

          <button
            onClick={() => setHireRequestWorkerId(null)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-3.5 pr-1 text-xs">
          
          {/* Associated Job Post Selector */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Link to Open Job Post (Optional)
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => handleJobSelectChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="custom">-- Custom Direct Hire Offer --</option>
              {myOpenJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} (₹{j.payRate}/{j.payType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Job Title / Task Description
            </label>
            <input
              type="text"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Proposed Daily Wage (₹)
              </label>
              <input
                type="number"
                required
                min={100}
                value={proposedWage}
                onChange={(e) => setProposedWage(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Work Start Time
              </label>
              <input
                type="text"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Work Location / Site Address
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="bg-sky-50 border border-sky-200/80 p-3 rounded-xl text-xs text-sky-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>Engagement Term: Flexible (Days or Years)</span>
            </div>
            <p className="text-[11px] text-sky-800 leading-relaxed">
              No fixed day count required. The worker remains actively hired until either you or the worker agree to conclude the assignment.
            </p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Message / Instructions for Worker
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 leading-relaxed"
            />
          </div>

          <div className="bg-orange-50/80 border border-orange-200 p-3 rounded-xl text-[11px] text-orange-900 space-y-0.5">
            <strong>Real-Time Workflow Note:</strong>
            <p>
              When {targetWorker.name} accepts this request, their availability counter will decrement by 1 across Bangalore in real-time.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setHireRequestWorkerId(null)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl shadow-md transition-transform active:scale-95"
            >
              Confirm & Send Offer
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
