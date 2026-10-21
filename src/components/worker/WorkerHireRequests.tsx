import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const WorkerHireRequests: React.FC = () => {
  const {
    hireRequests,
    currentWorker,
    firebaseUser,
    acceptHireRequest,
    declineHireRequest,
    completeJob,
    setReviewModalData,
    reviews,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Pending' | 'Active' | 'History'>('Pending');

  // Filter requests for the current active worker (by profile id or authenticated uid)
  const myRequests = hireRequests.filter(
    (r) =>
      r.workerId === currentWorker.id ||
      (firebaseUser && r.workerId === firebaseUser.uid)
  );

  const pendingRequests = myRequests.filter((r) => r.status?.toLowerCase() === 'pending');
  const activeRequests = myRequests.filter((r) => r.status?.toLowerCase() === 'accepted');
  const historyRequests = myRequests.filter(
    (r) =>
      r.status?.toLowerCase() === 'completed' ||
      r.status?.toLowerCase() === 'declined'
  );

  return (
    <div className="space-y-4 pb-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">
            Hire Requests & Contracts
          </h1>
          <p className="text-xs text-slate-500">
            Manage incoming direct offers, active gigs, and past completed projects
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('Pending')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'Pending'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Pending</span>
            {pendingRequests.length > 0 && (
              <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('Active')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'Active'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Active</span>
            {activeRequests.length > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {activeRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('History')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'History'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>History</span>
            <span className="text-slate-400 text-[10px]">({historyRequests.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Pending Requests */}
      {activeTab === 'Pending' && (
        <div className="space-y-3">
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No pending hire requests</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When an employer discovers your profile and requests your services, it will appear right here.
              </p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-orange-300 shadow-sm space-y-4 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.employerLogo || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80'}
                      alt={req.employerName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {req.jobTitle}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium">
                        From: {req.employerName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base sm:text-lg font-extrabold text-[#1A3C6E]">
                      ₹{req.proposedWage}
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-none">
                      /{req.payType}
                    </span>
                  </div>
                </div>

                {/* Offer Details */}
                <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-xs border border-slate-200/60">
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Start: <strong>{req.startDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Term: <strong>Days or Years (until ended)</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{req.location}</span>
                  </div>

                  {req.message && (
                    <div className="pt-1 text-slate-700 italic border-t border-slate-200/40">
                      "{req.message}"
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => acceptHireRequest(req.id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept Offer
                  </button>
                  <button
                    onClick={() => declineHireRequest(req.id)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Active (Accepted) Gigs */}
      {activeTab === 'Active' && (
        <div className="space-y-3">
          {activeRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No active jobs right now</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once you accept an offer, you can coordinate with the employer and mark it completed here.
              </p>
            </div>
          ) : (
            activeRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-500/80 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        In Progress
                      </span>
                      <span className="text-xs text-slate-500">
                        Since {req.startDate}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {req.jobTitle}
                    </h3>
                    <p className="text-xs text-slate-600">
                      Employer: {req.employerName}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base sm:text-lg font-extrabold text-[#1A3C6E]">
                      ₹{req.proposedWage}
                    </span>
                    <span className="text-[10px] text-slate-500 block">/day</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Location: {req.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Engagement: <strong>Active (Days or Years until agreed to part ways)</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <a
                    href={`tel:${req.employerPhone}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Employer
                  </a>

                  <button
                    onClick={() => completeJob(req.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-2 px-4 rounded-xl shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Conclude Assignment & Part Ways
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'History' && (
        <div className="space-y-3">
          {historyRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 text-xs text-slate-500">
              No past work history recorded yet.
            </div>
          ) : (
            historyRequests.map((req) => {
              const alreadyReviewed = reviews.some(
                (r) => r.targetId === req.employerId && r.reviewerRole === 'worker'
              );

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            req.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {req.status}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {req.createdAt}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                        {req.jobTitle}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Employer: {req.employerName}
                      </p>
                    </div>

                    <span className="text-sm font-bold text-slate-700">
                      ₹{req.proposedWage}/day
                    </span>
                  </div>

                  {req.status === 'Completed' && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Completed & Verified
                      </span>

                      {!alreadyReviewed ? (
                        <button
                          onClick={() =>
                            setReviewModalData({
                              isOpen: true,
                              jobTitle: req.jobTitle,
                              targetId: req.employerId,
                              targetName: req.employerName,
                              reviewerRole: 'worker',
                            })
                          }
                          className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200"
                        >
                          Rate Employer
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Review Submitted
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
