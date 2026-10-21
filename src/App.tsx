import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { TopBar } from './components/layout/TopBar.tsx';
import { BottomNav } from './components/layout/BottomNav.tsx';
import { AuthScreen } from './components/auth/AuthScreen.tsx';
import { OnboardingRoleModal } from './components/auth/OnboardingRoleModal.tsx';
import { WorkerDashboard } from './components/worker/WorkerDashboard.tsx';
import { WorkerJobs } from './components/worker/WorkerJobs.tsx';
import { WorkerHireRequests } from './components/worker/WorkerHireRequests.tsx';
import { WorkerNotifications } from './components/worker/WorkerNotifications.tsx';
import { WorkerProfileView } from './components/worker/WorkerProfile.tsx';
import { EmployerDashboard } from './components/employer/EmployerDashboard.tsx';
import { EmployerAvailability } from './components/employer/EmployerAvailability.tsx';
import { EmployerSearchWorkers } from './components/employer/EmployerSearchWorkers.tsx';
import { EmployerMyJobs } from './components/employer/EmployerMyJobs.tsx';
import { EmployerProfileView } from './components/employer/EmployerProfile.tsx';
import { JobDetailModal } from './components/modals/JobDetailModal.tsx';
import { WorkerProfileModal } from './components/modals/WorkerProfileModal.tsx';
import { SendHireRequestModal } from './components/modals/SendHireRequestModal.tsx';
import { JobApplicantsModal } from './components/modals/JobApplicantsModal.tsx';
import { PostJobModal } from './components/modals/PostJobModal.tsx';
import { LeaveReviewModal } from './components/modals/LeaveReviewModal.tsx';
import { Check, Sparkles, Wifi } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    role,
    activeWorkerTab,
    activeEmployerTab,
    deviceMode,
    toastMessage,
    isAuthenticated,
    authLoading,
  } = useApp();

  // Show loading state while checking Firebase Auth status
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#1A3C6E] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center font-black text-2xl shadow-xl animate-bounce">
          J
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Verifying authentication...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, render the AuthScreen and Onboarding modal
  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen />
        <OnboardingRoleModal />
      </>
    );
  }

  // Render worker tab screen
  const renderWorkerScreen = () => {
    switch (activeWorkerTab) {
      case 'home':
        return <WorkerDashboard />;
      case 'jobs':
        return <WorkerJobs />;
      case 'requests':
        return <WorkerHireRequests />;
      case 'alerts':
        return <WorkerNotifications />;
      case 'profile':
        return <WorkerProfileView />;
      default:
        return <WorkerDashboard />;
    }
  };

  // Render employer tab screen
  const renderEmployerScreen = () => {
    switch (activeEmployerTab) {
      case 'home':
        return <EmployerDashboard />;
      case 'availability':
        return <EmployerAvailability />;
      case 'workers':
        return <EmployerSearchWorkers />;
      case 'my-jobs':
        return <EmployerMyJobs />;
      case 'profile':
        return <EmployerProfileView />;
      default:
        return <EmployerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col">
      {/* Persistent Top Navigation Bar */}
      <TopBar />

      {/* Floating Real-time Toast Banner */}
      {toastMessage && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none">
          <div className="bg-slate-900/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-white/10 text-xs sm:text-sm font-semibold max-w-md text-center">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main View Area */}
      {deviceMode === 'mobile-pwa' ? (
        // Mobile PWA Frame Viewport Mode
        <div className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-[410px] h-[844px] bg-white rounded-[44px] border-[8px] border-slate-900 shadow-2xl flex flex-col overflow-hidden relative">
            
            {/* Phone Notch & Status bar */}
            <div className="h-9 bg-slate-900 text-white text-[11px] font-semibold px-6 flex items-center justify-between shrink-0 select-none">
              <span>9:41</span>
              <div className="w-24 h-4 bg-black rounded-b-xl mx-auto -mt-1" />
              <div className="flex items-center gap-1.5 text-[10px]">
                <Wifi className="w-3 h-3" />
                <span>5G</span>
                <div className="w-5 h-2.5 border border-white/60 rounded-sm p-0.5 flex items-center">
                  <div className="w-3 h-full bg-white rounded-xs" />
                </div>
              </div>
            </div>

            {/* Scrollable Mobile Screen Body */}
            <main className="flex-1 overflow-y-auto px-3.5 pt-3 pb-4">
              {role === 'worker' ? renderWorkerScreen() : renderEmployerScreen()}
            </main>

            {/* In-Frame Bottom Navigation */}
            <BottomNav />
          </div>
        </div>
      ) : (
        // Responsive Desktop & Tablet Container Mode
        <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-20">
          <main className="flex-1">
            {role === 'worker' ? renderWorkerScreen() : renderEmployerScreen()}
          </main>
          <BottomNav />
        </div>
      )}

      {/* Modals & Overlays */}
      <OnboardingRoleModal />
      <JobDetailModal />
      <WorkerProfileModal />
      <SendHireRequestModal />
      <JobApplicantsModal />
      <PostJobModal />
      <LeaveReviewModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
