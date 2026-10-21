import React from 'react';
import {
  Bell,
  Briefcase,
  CheckCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const WorkerNotifications: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveWorkerTab,
  } = useApp();

  const workerNotifs = notifications.filter((n) => n.recipientRole === 'worker');
  const unreadCount = workerNotifs.filter((n) => !n.read).length;

  const handleNotificationClick = (id: string, actionTab?: any) => {
    markNotificationRead(id);
    if (actionTab) {
      setActiveWorkerTab(actionTab);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'hire_request':
        return <UserCheck className="w-4 h-4 text-orange-600" />;
      case 'job_match':
        return <Sparkles className="w-4 h-4 text-sky-600" />;
      case 'application':
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4 pb-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">
            Notifications & Alerts
          </h1>
          <p className="text-xs text-slate-500">
            Stay updated on new hire requests and job matches
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllNotificationsRead('worker')}
            className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-xl transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {workerNotifs.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 space-y-2">
          <Bell className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No notifications yet</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You'll receive alerts here when employers contact you or recommend new jobs.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-sm overflow-hidden">
          {workerNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n.id, n.actionTab)}
              className={`p-4 transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-3.5 ${
                !n.read ? 'bg-orange-50/40' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  !n.read ? 'bg-white shadow-sm' : 'bg-slate-100'
                }`}
              >
                {getIcon(n.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {n.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {n.message}
                </p>
              </div>

              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
