import React from 'react';
import {
  Bell,
  Briefcase,
  Hammer,
  Smartphone,
  Monitor,
  MapPin,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const TopBar: React.FC = () => {
  const {
    role,
    notifications,
    logout,
    deviceMode,
    setDeviceMode,
    setActiveWorkerTab,
    setActiveEmployerTab,
    currentWorker,
    currentEmployer,
    firebaseUser,
  } = useApp();

  const unreadCount = notifications.filter(
    (n) => n.recipientRole === role && !n.read
  ).length;

  const handleAlertsClick = () => {
    if (role === 'worker') {
      setActiveWorkerTab('alerts');
    } else {
      setActiveEmployerTab('my-jobs');
    }
  };

  const displayName =
    role === 'worker'
      ? currentWorker?.name || firebaseUser?.displayName || 'Worker'
      : currentEmployer?.name || firebaseUser?.displayName || 'Employer';

  const displaySubtitle =
    role === 'worker'
      ? currentWorker?.primarySkill || 'Tradesperson'
      : currentEmployer?.businessType || 'Employer';

  const avatarUrl =
    role === 'worker'
      ? currentWorker?.avatar || firebaseUser?.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80'
      : currentEmployer?.logo || firebaseUser?.photoURL || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80';

  return (
    <header className="sticky top-0 z-30 bg-[#1A3C6E] text-white border-b border-[#122B50] shadow-sm select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Brand Zone */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-lg sm:text-xl text-white shadow-sm">
            J
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
              Jobnexa
            </span>
            <span className="text-[10px] text-slate-300 hidden sm:inline-block leading-none">
              Bangalore Local Workforce
            </span>
          </div>
        </div>

        {/* Locked Role Badge determined during registration */}
        <div className="flex items-center gap-2">
          {role === 'worker' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 text-orange-300 border border-orange-400/30 rounded-xl text-xs font-bold shadow-xs">
              <Hammer className="w-3.5 h-3.5 text-orange-400" />
              <span>Worker Account</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/20 text-sky-200 border border-sky-400/30 rounded-xl text-xs font-bold shadow-xs">
              <Briefcase className="w-3.5 h-3.5 text-sky-400" />
              <span>Employer Account</span>
            </div>
          )}
        </div>

        {/* Right Actions: Viewport Toggle, Notifications & Authenticated Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Device Frame View Toggle */}
          <button
            onClick={() => setDeviceMode(deviceMode === 'responsive' ? 'mobile-pwa' : 'responsive')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
            title={deviceMode === 'responsive' ? 'Preview inside mobile PWA frame' : 'Switch to responsive desktop view'}
          >
            {deviceMode === 'responsive' ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden lg:inline">Mobile PWA Frame</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden lg:inline">Desktop View</span>
              </>
            )}
          </button>

          {/* Location indicator */}
          <div className="hidden xl:flex items-center gap-1 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span>Bangalore, IN</span>
          </div>

          {/* Notifications button */}
          <button
            onClick={handleAlertsClick}
            className="relative p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors focus:outline-none focus:ring-1 focus:ring-orange-400 min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Real Authenticated Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/15">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-500/80"
              referrerPolicy="no-referrer"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-300 leading-none truncate max-w-[120px]">
                {displaySubtitle}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/80 text-white transition-colors ml-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
