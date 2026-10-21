import React from 'react';
import {
  Home,
  Search,
  ClipboardList,
  Bell,
  User,
  BarChart3,
  Users,
  Briefcase,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { EmployerTab, WorkerTab } from '../../types.ts';

export const BottomNav: React.FC = () => {
  const {
    role,
    activeWorkerTab,
    setActiveWorkerTab,
    activeEmployerTab,
    setActiveEmployerTab,
    hireRequests,
    currentWorker,
    firebaseUser,
    notifications,
    applications,
    deviceMode,
  } = useApp();

  // Pending hire requests for this worker
  const pendingRequestsCount = hireRequests.filter(
    (hr) =>
      (hr.workerId === currentWorker.id || (firebaseUser && hr.workerId === firebaseUser.uid)) &&
      hr.status?.toLowerCase() === 'pending'
  ).length;

  // Unread notifications for role
  const unreadNotifs = notifications.filter(
    (n) => n.recipientRole === role && !n.read
  ).length;

  // Pending applications on open jobs for employer
  const pendingAppsCount = applications.filter(
    (a) => a.status === 'Pending'
  ).length;

  if (role === 'worker') {
    const tabs: { id: WorkerTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'jobs', label: 'Find Jobs', icon: Search },
      { id: 'requests', label: 'Requests', icon: ClipboardList, badge: pendingRequestsCount },
      { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadNotifs },
      { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
      <nav
        aria-label="Worker navigation"
        className={`bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 transition-all ${
          deviceMode === 'mobile-pwa'
            ? 'sticky bottom-0 w-full'
            : 'fixed bottom-0 left-0 right-0'
        }`}
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeWorkerTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveWorkerTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 transition-colors relative min-h-[44px] ${
                  isActive ? 'text-[#1A3C6E]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'scale-110 text-orange-600 stroke-[2.3]' : 'stroke-[1.8]'
                    }`}
                  />
                  {Boolean(tab.badge && tab.badge > 0) && (
                    <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap ${
                    isActive ? 'text-[#1A3C6E] font-bold' : 'text-slate-500'
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-0.5 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // Employer navigation tabs
  const employerTabs: { id: EmployerTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'availability', label: 'Availability', icon: BarChart3 },
    { id: 'workers', label: 'Workers', icon: Users },
    { id: 'my-jobs', label: 'My Jobs', icon: Briefcase, badge: pendingAppsCount },
    { id: 'profile', label: 'Profile', icon: Building2 },
  ];

  return (
    <nav
      aria-label="Employer navigation"
      className={`bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 transition-all ${
        deviceMode === 'mobile-pwa'
          ? 'sticky bottom-0 w-full'
          : 'fixed bottom-0 left-0 right-0'
      }`}
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {employerTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeEmployerTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveEmployerTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition-colors relative min-h-[44px] ${
                isActive ? 'text-[#1A3C6E]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-orange-600 stroke-[2.3]' : 'stroke-[1.8]'
                  }`}
                />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap ${
                  isActive ? 'text-[#1A3C6E] font-bold' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
