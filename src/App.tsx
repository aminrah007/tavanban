/**
 * App.tsx
 * TavanBan (سامانه جامع توان‌بان) - Root Application Component
 * Supports Landing Page via Logo/Brand click + Strict Role-Based Operational Portal
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { CustomCursor } from './components/common/CustomCursor';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileNavigation } from './components/common/MobileNavigation';
import { ToastContainer } from './components/common/ToastContainer';
import { OtpLoginModal } from './components/auth/OtpLoginModal';
import { canAccessRoute } from './config/rolePermissions';

// Route Views
import { LandingPageView } from './components/views/LandingPageView';
import { DashboardView } from './components/views/DashboardView';
import { ReportsView } from './components/views/ReportsView';
import { NewReportView } from './components/views/NewReportView';
import { TasksView } from './components/views/TasksView';
import { ExtraWorkView } from './components/views/ExtraWorkView';
import { StatementsView } from './components/views/StatementsView';
import { PurchasesView } from './components/views/PurchasesView';
import { PriceItemsView } from './components/views/PriceItemsView';
import { GroupsView } from './components/views/GroupsView';
import { ContractsView } from './components/views/ContractsView';
import { TechniciansView } from './components/views/TechniciansView';
import { OfflineQueueView } from './components/views/OfflineQueueView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { ArchitectureSecurityView } from './components/views/ArchitectureSecurityView';
import { StationCommunicationsView } from './components/views/StationCommunicationsView';
import { PeriodicTestsView } from './components/views/PeriodicTestsView';

const MainLayout: React.FC = () => {
  const { currentRoute, currentRole, theme } = useApp();
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLanding = currentRoute === 'landing';
  const isLight = theme === 'light';

  const renderActiveView = () => {
    const safeRoute = canAccessRoute(currentRole, currentRoute) ? currentRoute : 'dashboard';
    switch (safeRoute) {
      case 'landing':
        return <LandingPageView onOpenOtpModal={() => setIsOtpModalOpen(true)} />;
      case 'dashboard':
        return <DashboardView />;
      case 'reports':
        return <ReportsView />;
      case 'report-new':
        return <NewReportView />;
      case 'periodic-tests':
        return <PeriodicTestsView />;
      case 'tasks':
        return <TasksView />;
      case 'station-communications':
        return <StationCommunicationsView />;
      case 'extra-work':
        return <ExtraWorkView />;
      case 'statements':
        return <StatementsView />;
      case 'purchases':
        return <PurchasesView />;
      case 'price-items':
        return <PriceItemsView />;
      case 'groups':
        return <GroupsView />;
      case 'contracts':
        return <ContractsView />;
      case 'technicians':
        return <TechniciansView />;
      case 'offline-queue':
        return <OfflineQueueView />;
      case 'audit-logs':
        return <AuditLogsView />;
      case 'architecture-security':
        return <ArchitectureSecurityView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isLight
          ? isLanding
            ? 'bg-[#F8FAFC] text-[#0F172A]'
            : 'bg-[#172136] text-slate-100'
          : 'bg-[#050814] text-slate-100'
      }`}
    >
      <CustomCursor isLight={isLight} />
      <Header
        onOpenOtpModal={() => setIsOtpModalOpen(true)}
        onOpenMobileMenu={!isLanding ? () => setIsMobileMenuOpen(true) : undefined}
      />

      {isLanding ? (
        <main className="flex-1 w-full">
          <LandingPageView onOpenOtpModal={() => setIsOtpModalOpen(true)} />
        </main>
      ) : (
        <div className="flex-1 flex w-full mx-auto max-w-[1600px]">
          <Sidebar />
          <main className="flex-1 min-w-0 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentRole}-${currentRoute}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                {renderActiveView()}
              </motion.div>
            </AnimatePresence>
          </main>
          <MobileNavigation
            isDrawerOpen={isMobileMenuOpen}
            onOpenDrawer={() => setIsMobileMenuOpen(true)}
            onCloseDrawer={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}

      <ToastContainer />
      <OtpLoginModal isOpen={isOtpModalOpen} onClose={() => setIsOtpModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
