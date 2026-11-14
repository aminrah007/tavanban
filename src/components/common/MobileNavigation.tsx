/**
 * MobileNavigation Component
 * Replaces the horizontal scrolling top strip with native-style mobile UX:
 * 1. Fixed Glassmorphic Bottom Tab Bar (top 4 role-scoped tabs + "منو" drawer trigger)
 * 2. Smooth RTL Slide-Over Drawer displaying all role-scoped sections cleanly vertically
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { List, X } from '@phosphor-icons/react';
import { useApp, getRolePersianName } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/formatters';
import { useRoleNavigation } from './navigationItems';
import { BrandLogo } from './BrandLogo';

interface MobileNavigationProps {
  isDrawerOpen: boolean;
  onOpenDrawer: () => void;
  onCloseDrawer: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isDrawerOpen,
  onOpenDrawer,
  onCloseDrawer,
}) => {
  const {
    currentRoute,
    setCurrentRoute,
    currentRole,
    currentUser,
    theme,
    periodicSelection,
    setPeriodicSelection,
  } = useApp();
  const isDark = theme === 'dark';
  const visibleItems = useRoleNavigation();

  // Primary 4 quick-access items for the fixed bottom dock
  const primaryTabs = visibleItems.slice(0, 4);
  const overflowItems = visibleItems.slice(4);
  const overflowHasBadge = overflowItems.some((item) => item.badge && item.badge > 0);
  const isOverflowRouteActive = overflowItems.some((item) => item.id === currentRoute);

  // Close drawer on route change or Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        onCloseDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, onCloseDrawer]);

  const handleSelectRoute = (route: typeof currentRoute) => {
    setCurrentRoute(route);
    onCloseDrawer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* 1. Native Fixed Mobile Bottom Tab Dock */}
      <nav
        aria-label="ناوبری موبایل"
        className={`lg:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-xl px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors ${
          isDark
            ? 'border-slate-800/90 bg-[#070C1A]/95 shadow-[0_-12px_30px_rgba(2,6,23,0.75)]'
            : 'border-slate-700/70 bg-[#0F172A]/95 shadow-[0_-12px_30px_rgba(15,23,42,0.5)]'
        }`}
      >
        <div className="grid grid-cols-5 items-stretch gap-1 max-w-lg mx-auto">
          {primaryTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectRoute(item.id)}
                className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-500/12'
                    : 'text-slate-400 hover:text-slate-200 active:scale-95'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 inset-x-4 h-0.5 rounded-full bg-gradient-to-l from-cyan-400 to-indigo-400 shadow-[0_0_8px_#22D3EE]" />
                )}
                <div className="relative">
                  <Icon
                    weight="duotone"
                    className={`w-5 h-5 transition-transform ${
                      isActive ? `${item.accentClass} scale-105` : ''
                    }`}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -left-2 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center tabular-nums shadow">
                      {toPersianDigits(item.badge > 9 ? '۹+' : item.badge)}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] leading-tight truncate max-w-full ${isActive ? 'font-bold text-white' : 'font-medium'}`}>
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}

          {/* 5th Tab: Open Full RTL Drawer */}
          <button
            type="button"
            onClick={isDrawerOpen ? onCloseDrawer : onOpenDrawer}
            className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl transition-all ${
              isDrawerOpen || isOverflowRouteActive
                ? 'text-cyan-300 bg-cyan-500/12'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
          >
            {(isDrawerOpen || isOverflowRouteActive) && (
              <span className="absolute top-0 inset-x-4 h-0.5 rounded-full bg-gradient-to-l from-cyan-400 to-indigo-400 shadow-[0_0_8px_#22D3EE]" />
            )}
            <div className="relative">
              <List weight="bold" className="w-5 h-5" />
              {overflowHasBadge && (
                <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#F43F5E]" />
              )}
            </div>
            <span className={`text-[10px] leading-tight ${isDrawerOpen || isOverflowRouteActive ? 'font-bold text-white' : 'font-medium'}`}>
              همه منوها
            </span>
          </button>
        </div>
      </nav>

      {/* 2. Smooth RTL Slide-Over Navigation Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex justify-start" dir="rtl">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseDrawer}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
            />

            {/* Drawer Panel sliding from Right edge in RTL */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 290 }}
              className={`relative z-10 w-[82vw] max-w-[320px] h-full flex flex-col justify-between border-l shadow-2xl overflow-y-auto p-4 ${
                isDark
                  ? 'border-slate-800 bg-[#070C1A] text-slate-100'
                  : 'border-slate-700/80 bg-[#0F172A] text-slate-100'
              }`}
            >
              <div className="space-y-4">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/90">
                  <div className="flex items-center gap-2.5">
                    <BrandLogo isDark={true} size="sm" />
                    <div className="text-right">
                      <div className="font-black text-sm text-white">توان‌بان</div>
                      <div className="text-[10px] text-slate-400">منوی دسترسی جایگاه شغلی</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onCloseDrawer}
                    aria-label="بستن منو"
                    className="p-2 rounded-xl border border-slate-800 bg-[#0B1120] text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                  >
                    <X weight="bold" className="w-4 h-4" />
                  </button>
                </div>

                {/* User Snapshot Card */}
                <div className="p-3.5 rounded-2xl border border-slate-800 bg-[#0B1120]/90 text-right">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/25 to-indigo-500/25 border border-cyan-400/40 flex items-center justify-center font-bold text-sm text-cyan-300">
                      {currentUser.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate text-white">{currentUser.fullName}</div>
                      <div className="text-[11px] truncate text-cyan-400 font-semibold">
                        {getRolePersianName(currentRole).split(' (')[0]}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/90 text-slate-400">
                    <span>کد پرسنلی:</span>
                    <span className="font-bold text-slate-200">
                      {toPersianDigits(currentUser._id)}
                    </span>
                  </div>
                  {currentRole === 'TECHNICIAN' && currentUser.score !== undefined && (
                    <div className="flex items-center justify-between text-[11px] mt-1 text-slate-400">
                      <span>امتیاز فنی کسب‌شده:</span>
                      <span className="font-bold tabular-nums text-amber-400">
                        {toPersianDigits(currentUser.score)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Vertical Navigation List */}
                <nav className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentRoute === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (
                            item.id === 'periodic-tests' &&
                            item.periodicDomains &&
                            item.periodicDomains.length > 0
                          ) {
                            const firstDomain = item.periodicDomains[0];
                            const hasCurrentDomain = item.periodicDomains.some(
                              (d) => d.id === periodicSelection.domain
                            );
                            if (!hasCurrentDomain) {
                              const firstSec = firstDomain.sections[0];
                              setPeriodicSelection({
                                domain: firstDomain.id,
                                sectionId: firstSec.id,
                                subSectionId: firstSec.subSections?.[0]?.id,
                              });
                            }
                          }
                          handleSelectRoute(item.id);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-l from-cyan-500/20 via-indigo-500/12 to-transparent text-white border border-cyan-400/35 shadow-[0_0_16px_rgba(34,211,238,0.12)] font-semibold'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            weight="duotone"
                            className={`w-[18px] h-[18px] shrink-0 ${
                              isActive ? item.accentClass : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`px-1.5 py-0.5 text-[11px] font-bold rounded-md border tabular-nums ${
                              item.badgeColor || 'bg-slate-800 text-slate-200 border-slate-700'
                            }`}
                          >
                            {toPersianDigits(item.badge)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Footer */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-right">
                <div className="text-[11px] flex items-center justify-between text-slate-400">
                  <span>نسخه عملیاتی:</span>
                  <span className="font-bold text-cyan-400">{toPersianDigits('نسخه ۲.۴')}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  برق منطقه‌ای سیستان و بلوچستان
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
