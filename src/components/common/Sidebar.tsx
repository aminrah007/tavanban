/**
 * Sidebar Navigation Component
 * Strictly role-scoped menu items, personalized Persian labels per role,
 * Phosphor Duotone icons, and vibrant Midnight Obsidian / Electric Cyan accents.
 */

import React from 'react';
import { useApp, getRolePersianName } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/formatters';
import { useRoleNavigation } from './navigationItems';

export const Sidebar: React.FC = () => {
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

  return (
    <aside
      className={`w-64 shrink-0 border-l p-4 flex flex-col justify-between hidden lg:flex h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto transition-colors ${
        isDark
          ? 'border-slate-800/90 bg-[#070C1A]/95 text-slate-100'
          : 'border-slate-700/60 bg-[#0F172A]/95 text-slate-100'
      }`}
    >
      {/* Current User Snapshot Card */}
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl border border-slate-800 bg-[#0B1120]/90 text-right shadow-sm">
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

        {/* Navigation list */}
        <nav className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'periodic-tests' && item.periodicDomains && item.periodicDomains.length > 0) {
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
                  setCurrentRoute(item.id);
                }}
                className={`group w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-l from-cyan-500/18 via-indigo-500/12 to-transparent text-white border border-cyan-400/35 shadow-[0_0_16px_rgba(34,211,238,0.12)] font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    weight="duotone"
                    className={`w-[18px] h-[18px] shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? item.accentClass : 'text-slate-400 group-hover:text-cyan-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[11px] font-bold rounded-md border tabular-nums shrink-0 ${
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

      {/* Bottom Quick Info */}
      <div className="pt-4 border-t border-slate-800/80 text-right">
        <div className="text-[11px] flex items-center justify-between text-slate-400">
          <span>نسخه عملیاتی:</span>
          <span className="font-bold text-cyan-400">{toPersianDigits('نسخه ۲.۴')}</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          پرتال نظارت و عملیات توان‌بان
        </div>
      </div>
    </aside>
  );
};
