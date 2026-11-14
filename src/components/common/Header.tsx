/**
 * Header Component - Production Enterprise Edition
 * - Uses bespoke geometric SVG BrandLogo (no raw emoji)
 * - Uses crisp Phosphor Duotone icons
 * - Clicking Logo + توان‌بان always navigates to Landing Page ('#/landing')
 */

import React, { useState } from 'react';
import {
  BellRinging,
  WifiHigh,
  WifiSlash,
  CaretDown,
  SignOut,
  ShieldCheck,
  DeviceMobile,
  SunHorizon,
  MoonStars,
  ClockCounterClockwise,
  SquaresFour,
  List,
} from '@phosphor-icons/react';
import { useApp, getRolePersianName } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/formatters';
import {
  canAccessRoute,
  filterNotificationsForRole,
  ROLE_NAV_LABELS,
} from '../../config/rolePermissions';
import { BrandLogo } from './BrandLogo';
import {
  getUserPeriodicSpecialties,
  getPeriodicNavLabelForUser,
} from '../../data/periodicTestConfig';

interface HeaderProps {
  onOpenOtpModal: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenOtpModal, onOpenMobileMenu }) => {
  const {
    currentUser,
    currentRole,
    currentRoute,
    setCurrentRoute,
    isOnline,
    setIsOnline,
    notifications,
    markNotificationRead,
    syncQueue,
    logout,
    theme,
    toggleTheme,
    groups,
  } = useApp();

  const isDark = theme === 'dark';

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const scopedNotifications = filterNotificationsForRole(notifications, currentUser);
  const unreadCount = scopedNotifications.filter((n) => !n.isRead).length;

  const canViewOfflineQueue = canAccessRoute(currentRole, 'offline-queue');
  const canViewSecurity = canAccessRoute(currentRole, 'architecture-security');
  const canViewAuditLogs = canAccessRoute(currentRole, 'audit-logs');

  const getBreadcrumbTitle = () => {
    if (currentRoute === 'periodic-tests') {
      return getPeriodicNavLabelForUser(
        currentRole,
        getUserPeriodicSpecialties(currentUser, groups)
      );
    }
    const customLabel = ROLE_NAV_LABELS[currentRole]?.[currentRoute];
    if (customLabel) return customLabel;
    switch (currentRoute) {
      case 'dashboard':
        return 'میز کار و داشبورد پایش عملیاتی';
      case 'reports':
        return 'کارتابل گردش کار گزارش‌ها';
      case 'report-new':
        return 'ثبت گزارش کار میدانی';
      case 'tasks':
        return 'کارهای محوله و مأموریت‌ها';
      case 'station-communications':
        return 'ارتباطات پست‌ها (DTS · PLC · IP Phone)';
      case 'extra-work':
        return 'معادل‌سازی کارهای خارج از فهرست';
      case 'statements':
        return 'مدیریت صورت‌وضعیت‌های مالی';
      case 'purchases':
        return 'درخواست‌های خرید و تأمین متریال';
      case 'price-items':
        return 'فهرست آحاد بها و نرخ‌های مصوب';
      case 'groups':
        return 'گروه‌های عملیاتی و تفکیک دسترسی';
      case 'contracts':
        return 'شرکت‌ها و قراردادهای بهره‌برداری';
      case 'technicians':
        return 'پرسنل، امتیازات و سوابق فنی';
      case 'offline-queue':
        return 'صف همگام‌سازی آفلاین';
      case 'audit-logs':
        return 'دفتر ثبت رویدادها و ممیزی';
      case 'architecture-security':
        return 'پنل ادمین و زیرساخت سامانه';
      default:
        return 'سامانه یکپارچه توان‌بان';
    }
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    onOpenOtpModal();
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Landing Page Header Mode
  if (currentRoute === 'landing') {
    return (
      <header
        className={`sticky top-0 z-40 flex items-center justify-between gap-4 px-4 sm:px-8 py-3 border-b backdrop-blur-xl transition-colors ${
          isDark
            ? 'border-slate-800/80 bg-[#050814]/82 text-slate-100'
            : 'border-slate-200/90 bg-white/85 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#/landing"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 group"
            title="توان‌بان - برق منطقه‌ای سیستان و بلوچستان"
          >
            <BrandLogo isDark={isDark} size="sm" />
            <div className="flex flex-col text-right">
              <span
                className={`font-black text-sm sm:text-base tracking-tight transition-colors ${
                  isDark ? 'text-white group-hover:text-cyan-400' : 'text-slate-900 group-hover:text-indigo-600'
                }`}
              >
                توان‌بان
              </span>
              <span className={`text-[10px] font-medium hidden sm:inline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                برق منطقه‌ای سیستان و بلوچستان
              </span>
            </div>
          </a>
        </div>

        {/* Landing Anchor Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => scrollToSection('substations-cloud')}
            className={`transition-colors whitespace-nowrap ${
              isDark ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            نقشه فضایی پست‌ها
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('workflows')}
            className={`transition-colors whitespace-nowrap ${
              isDark ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            گردش کار تاییدها
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('roles')}
            className={`transition-colors whitespace-nowrap ${
              isDark ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            ساختار ۸ نقش
          </button>
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'تغییر به حالت روشن' : 'تغییر به حالت تیره'}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'border-slate-700/80 bg-[#0B1120] text-cyan-400 hover:bg-slate-800 hover:border-cyan-400/50'
                : 'border-slate-200 bg-slate-100 text-indigo-600 hover:bg-slate-200/80'
            }`}
          >
            {isDark ? <MoonStars weight="duotone" className="w-4 h-4" /> : <SunHorizon weight="duotone" className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onOpenOtpModal}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors hidden sm:flex items-center gap-1.5 whitespace-nowrap ${
              isDark
                ? 'border-slate-700/80 bg-[#0B1120]/90 hover:bg-slate-800 text-slate-200'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs'
            }`}
          >
            <DeviceMobile weight="duotone" className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
            <span>ورود با OTP</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentRoute('dashboard')}
            className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isDark
                ? 'bg-gradient-to-l from-cyan-400 via-sky-400 to-indigo-400 hover:brightness-110 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.35)]'
                : 'bg-gradient-to-l from-indigo-600 to-cyan-600 hover:brightness-110 text-white shadow-md shadow-indigo-500/20'
            }`}
          >
            <SquaresFour weight="duotone" className="w-4 h-4" />
            <span>ورود به میز کار</span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`sticky top-0 z-40 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b backdrop-blur-xl transition-colors ${
        isDark
          ? 'border-slate-800/90 bg-[#070B18]/92 text-slate-100'
          : 'border-slate-700/60 bg-[#0F172A]/95 text-slate-100'
      }`}
    >
      {/* Zone 1: Mobile Menu Trigger + Organization Branding & Logo (Clicking returns to Landing Page) */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="باز کردن منوی کارتابل"
            className="lg:hidden p-2 rounded-xl border border-slate-700/80 bg-[#0B1120] text-cyan-300 hover:bg-slate-800 hover:border-cyan-400/50 transition-colors shrink-0"
          >
            <List weight="bold" className="w-4 h-4" />
          </button>
        )}
        <a
          href="#/landing"
          onClick={(e) => {
            e.preventDefault();
            setCurrentRoute('landing');
          }}
          className="flex items-center gap-2.5 sm:gap-3 group min-w-0"
          title="مشاهده صفحه اصلی توان‌بان"
        >
          <BrandLogo isDark={true} size="sm" />
          <div className="flex flex-col text-right min-w-0">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-cyan-400 transition-colors truncate">
              توان‌بان
            </span>
            <span className="text-[10px] font-medium hidden sm:inline text-slate-400">
              برق منطقه‌ای سیستان و بلوچستان · {getRolePersianName(currentRole).split(' (')[0]}
            </span>
          </div>
        </a>
      </div>

      {/* Zone 2: Contextual Navigation Breadcrumb */}
      <div className="hidden lg:flex items-center gap-2 text-xs">
        <span className="text-slate-500">پرتال عملیات</span>
        <span aria-hidden="true" className="text-slate-600">/</span>
        <span className="font-semibold text-slate-200">{getBreadcrumbTitle()}</span>
        {canViewOfflineQueue && syncQueue.length > 0 && (
          <button
            onClick={() => setCurrentRoute('offline-queue')}
            className="mr-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] border bg-amber-500/15 text-amber-300 border-amber-500/35 hover:bg-amber-500/25 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            {toPersianDigits(syncQueue.length)} مورد در صف آفلاین
          </button>
        )}
      </div>

      {/* Zone 3: Operational Controls & User Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Theme Mode Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'تغییر به حالت روشن' : 'تغییر به حالت تیره'}
          className="p-2 rounded-xl border border-slate-700/80 bg-[#0B1120] text-cyan-400 hover:bg-slate-800 hover:border-cyan-400/50 transition-colors"
        >
          {isDark ? <MoonStars weight="duotone" className="w-4 h-4" /> : <SunHorizon weight="duotone" className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Network Connectivity Status Toggle (Visible across all roles as requested) */}
        <button
          type="button"
          onClick={() => setIsOnline(!isOnline)}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            isOnline
              ? 'text-emerald-300 border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500/20'
              : 'text-rose-300 border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25'
          }`}
          title={
            isOnline
              ? 'وضعیت اتصال سرور: آنلاین (برای تست حالت آفلاین کلیک کنید)'
              : 'وضعیت: آفلاین (ذخیره‌سازی در صف محلی دستگاه)'
          }
        >
          {isOnline ? (
            <>
              <WifiHigh weight="duotone" className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">آنلاین</span>
            </>
          ) : (
            <>
              <WifiSlash weight="duotone" className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">آفلاین</span>
            </>
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-xl border border-slate-800 bg-[#0B1120]/80 text-slate-300 hover:text-cyan-300 hover:border-slate-700 transition-colors relative"
            aria-label="اعلان‌های کارتابل"
            title="اعلان‌ها و پیام‌های کارتابل"
          >
            <BellRinging weight="duotone" className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22D3EE]"></span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute left-0 mt-2 w-80 rounded-2xl border border-slate-700/80 bg-[#0B1120]/98 text-slate-100 shadow-2xl p-3 z-50 text-right backdrop-blur-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <span className="font-semibold">اعلان‌های کارتابل شما</span>
                <span className="text-cyan-400 font-bold">{toPersianDigits(unreadCount)} جدید</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/80 mt-1">
                {scopedNotifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    هیچ اعلانی در کارتابل شما ثبت نشده است
                  </div>
                ) : (
                  scopedNotifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => markNotificationRead(notif._id)}
                      className={`p-2.5 text-xs transition-colors cursor-pointer rounded-xl hover:bg-slate-800/70 ${
                        !notif.isRead ? 'bg-cyan-500/8' : 'opacity-70'
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between gap-1 mb-1">
                        <span>{notif.title}</span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                        )}
                      </div>
                      <div className="text-[11px] leading-relaxed text-slate-300">
                        {notif.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Real Production User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-700/80 bg-[#0B1120] hover:bg-slate-800/80 hover:border-cyan-400/40 transition-all"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/25 to-indigo-500/25 border border-cyan-400/40 flex items-center justify-center text-xs font-bold text-cyan-300">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold leading-tight text-white">
                {currentUser.fullName}
              </div>
              <div className="text-[10px] font-medium text-cyan-400">
                {getRolePersianName(currentRole).split(' (')[0]}
              </div>
            </div>
            <CaretDown weight="bold" className="w-3 h-3 text-slate-400" />
          </button>

          {/* User Account & Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-700/80 bg-[#0B1120]/98 text-slate-100 shadow-2xl p-3 z-50 text-right space-y-3 backdrop-blur-xl">
              {/* Profile Card */}
              <div className="p-3 rounded-xl border border-slate-800 bg-[#050814]/80 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/25 to-indigo-500/25 border border-cyan-400/40 flex items-center justify-center font-bold text-sm text-cyan-300">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate text-white">{currentUser.fullName}</div>
                    <div className="text-[10px] truncate text-cyan-400">
                      {getRolePersianName(currentRole)}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">کد پرسنلی:</span>
                    <span className="font-semibold text-slate-200">{toPersianDigits(currentUser._id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">شماره همراه:</span>
                    <span className="text-slate-200">{toPersianDigits(currentUser.encryptedMobile)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">آخرین ورود به سیستم:</span>
                    <span className="text-slate-200">{currentUser.lastLoginAt || 'امروز'}</span>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="space-y-1 text-xs">

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenOtpModal();
                  }}
                  className="w-full text-right px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-2"
                >
                  <DeviceMobile weight="duotone" className="w-4 h-4 text-cyan-400" />
                  <span>تغییر حساب / ورود با شماره همراه (OTP)</span>
                </button>

                {canViewSecurity ? (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setCurrentRoute('architecture-security');
                    }}
                    className="w-full text-right px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-2"
                  >
                    <ShieldCheck weight="duotone" className="w-4 h-4 text-indigo-400" />
                    <span>پنل ادمین و زیرساخت سامانه</span>
                  </button>
                ) : (
                  canViewAuditLogs && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setCurrentRoute('audit-logs');
                      }}
                      className="w-full text-right px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-2"
                    >
                      <ClockCounterClockwise weight="duotone" className="w-4 h-4 text-indigo-400" />
                      <span>رویدادها و لاگ ممیزی</span>
                    </button>
                  )
                )}

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full text-right px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/30 transition-colors flex items-center gap-2"
                  >
                    <SignOut weight="duotone" className="w-4 h-4" />
                    <span>خروج از حساب کاربری</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
