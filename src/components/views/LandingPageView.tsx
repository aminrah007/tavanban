/**
 * LandingPageView.tsx
 * Hyper-Grid Midnight Obsidian & Electric Cyan / Hyper Indigo / Solar Gold Landing Page
 * Dedicated to Sistan & Baluchestan Regional Electric Company (برق منطقه‌ای سیستان و بلوچستان)
 * Accessible via Brand/Logo click in Header (not listed in Sidebar).
 */

import React from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Lightning,
  DeviceMobile,
  SealCheck,
  GitMerge,
  Stack,
  CheckCircle,
  Crown,
  Briefcase,
  UserCheck,
  ClipboardText,
  Buildings,
  Scales,
  UsersThree,
  Wrench,
} from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';
import { WebGLRibbonCanvas } from '../landing/WebGLRibbonCanvas';
import { SubstationDepthCloud } from '../landing/SubstationDepthCloud';
import { toPersianDigits } from '../../utils/formatters';

interface LandingPageViewProps {
  onOpenOtpModal: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onOpenOtpModal }) => {
  const {
    theme,
    stations,
    reports,
    statements,
    setCurrentRoute,
    setFocusedCommStationId,
  } = useApp();

  const isDark = theme === 'dark';

  const handleSelectStation = (stationId: string) => {
    setFocusedCommStationId(stationId);
    setCurrentRoute('station-communications');
  };

  const healthyChannels = stations.reduce(
    (sum, st) => sum + st.channels.filter((c) => c.status === 'ok').length,
    0
  );
  const totalActiveChannels = stations.reduce(
    (sum, st) => sum + st.channels.filter((c) => c.status !== 'na').length,
    0
  );
  const readinessPct =
    totalActiveChannels > 0 ? Math.round((healthyChannels / totalActiveChannels) * 100) : 0;

  const pageText = isDark ? 'text-slate-100' : 'text-slate-900';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-600';
  const surfaceCard = isDark
    ? 'bg-[#0B1120]/85 border-slate-800/90 backdrop-blur-xl'
    : 'bg-white/95 border-slate-200/90 shadow-sm backdrop-blur-xl';
  const subtleCard = isDark
    ? 'bg-[#050814]/75 border-slate-800'
    : 'bg-slate-50/90 border-slate-200/80';

  const rolesShowcase = [
    {
      title: 'معاونت بهره‌برداری',
      tag: 'راهبری کل سازمان',
      desc: 'مدیریت شرکت‌ها و قراردادها، تسویه قطعی گزارش‌ها و تایید نهایی و پرداخت صورت‌وضعیت‌ها.',
      icon: Crown,
      iconBox: isDark
        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        : 'bg-amber-50 text-amber-600 border-amber-200',
      tagColor: isDark ? 'text-amber-400' : 'text-amber-600',
    },
    {
      title: 'مدیر کارفرما',
      tag: 'نظارت کلان و تایید صورت‌وضعیت',
      desc: 'نظارت بر گزارش‌ها و پست‌ها، ارجاع کار به رییس و کارشناسان کارفرما و تایید مرحله ۲ صورت‌وضعیت پس از رییس کارفرما.',
      icon: Briefcase,
      iconBox: isDark
        ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
        : 'bg-orange-50 text-orange-600 border-orange-200',
      tagColor: isDark ? 'text-orange-400' : 'text-orange-600',
    },
    {
      title: 'رییس کارفرما',
      tag: 'تایید نهایی گزارش و مرحله ۱ صورت‌وضعیت',
      desc: 'تایید نهایی گزارش‌های کار پیمانکار (ارجاع به معاونت) و تایید مرحله اول صورت‌وضعیت پیش از مدیر کارفرما.',
      icon: UserCheck,
      iconBox: isDark
        ? 'bg-violet-500/15 text-violet-400 border-violet-500/30'
        : 'bg-violet-50 text-violet-600 border-violet-200',
      tagColor: isDark ? 'text-violet-400' : 'text-violet-600',
    },
    {
      title: 'کارشناس کارفرما (ناظر مقیم)',
      tag: 'انطباق فنی و گزارش روزانه',
      desc: 'بررسی فنی گزارش‌های تاییدشده سرپرست، ارجاع مأموریت و ثبت گزارش روزانه نظارتی برای رییس کارفرما.',
      icon: ClipboardText,
      iconBox: isDark
        ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
        : 'bg-cyan-50 text-cyan-600 border-cyan-200',
      tagColor: isDark ? 'text-cyan-400' : 'text-cyan-600',
    },
    {
      title: 'رییس شرکت پیمانکار',
      tag: 'نرخ‌گذاری و صدور صورت‌وضعیت',
      desc: 'مدیریت نیروها و گروه‌ها، به‌روزرسانی فهرست بها با تثبیت نرخ مصوب و صدور صورت‌وضعیت.',
      icon: Buildings,
      iconBox: isDark
        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        : 'bg-emerald-50 text-emerald-600 border-emerald-200',
      tagColor: isDark ? 'text-emerald-400' : 'text-emerald-600',
    },
    {
      title: 'نماینده مقیم پیمانکار',
      tag: 'معادل‌سازی کار اضافی و خرید',
      desc: 'تطبیق کارهای خارج از فهرست با ردیف‌های مصوب و مدیریت و پرداخت درخواست‌های خرید.',
      icon: Scales,
      iconBox: isDark
        ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
        : 'bg-indigo-50 text-indigo-600 border-indigo-200',
      tagColor: isDark ? 'text-indigo-400' : 'text-indigo-600',
    },
    {
      title: 'سرپرست گروه عملیاتی',
      tag: 'تایید مرحله اول و مدیریت اکیپ',
      desc: 'کنترل گزارش‌های اعضای گروه، سپردن کار به تکنسین‌ها و ثبت گزارش کار میدانی بدون خودتاییدی.',
      icon: UsersThree,
      iconBox: isDark
        ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
        : 'bg-sky-50 text-sky-600 border-sky-200',
      tagColor: isDark ? 'text-sky-400' : 'text-sky-600',
    },
    {
      title: 'کارشناس فنی (تکنسین)',
      tag: 'اجرای عملیات میدانی و حالت آفلاین',
      desc: 'ثبت گزارش عملیات و کار اضافی در پست‌ها (با صف آفلاین و عدم نمایش نرخ‌های ریالی فهرست بها).',
      icon: Wrench,
      iconBox: isDark
        ? 'bg-teal-500/15 text-teal-400 border-teal-500/30'
        : 'bg-teal-50 text-teal-600 border-teal-200',
      tagColor: isDark ? 'text-teal-400' : 'text-teal-600',
    },
  ];

  return (
    <div className={`relative min-h-screen overflow-x-clip ${pageText}`}>
      {/* Interactive 3D WebGL Flowing Ribbon Canvas */}
      <WebGLRibbonCanvas isDark={isDark} />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16 space-y-20">
        {/* HERO SECTION */}
        <section className="relative pt-4 sm:pt-8">
          <div className="max-w-4xl space-y-6 text-right">
            <div className={`inline-flex items-center gap-2 text-xs font-bold ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
              <Lightning weight="duotone" className="w-4 h-4" />
              <span>شرکت سهامی برق منطقه‌ای سیستان و بلوچستان · سامانه یکپارچه عملیات</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.2] tracking-tight">
              <span className="hero-line">
                <span className="hero-line__inner">
                  هوشمندسازی چرخه نگهداری پست‌ها با{' '}
                  <span className={`hero-product ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>توان‌بان</span>
                </span>
              </span>
              <span className="hero-line mt-1">
                <span className="hero-line__inner text-2xl sm:text-4xl lg:text-[2.6rem] font-extrabold opacity-90">
                  از دیسپاچینگ میدانی تا تایید صورت‌وضعیت و پایش مخابراتی
                </span>
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentRoute('dashboard')}
                className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                  isDark
                    ? 'bg-gradient-to-l from-cyan-400 via-sky-400 to-indigo-400 hover:brightness-110 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.35)]'
                    : 'bg-gradient-to-l from-indigo-600 to-cyan-600 hover:brightness-110 text-white shadow-lg shadow-indigo-500/25'
                }`}
              >
                <span>ورود به میز کار عملیاتی</span>
                <ArrowLeft weight="bold" className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenOtpModal}
                className={`px-5 py-3 rounded-xl border font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${
                  isDark
                    ? 'border-slate-700 bg-[#0B1120]/90 hover:bg-slate-800 text-slate-100'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs'
                }`}
              >
                <DeviceMobile weight="duotone" className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
                <span>احراز هویت و ورود با OTP</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 01: 3D SPATIAL SUBSTATION CLOUD */}
        <SubstationDepthCloud
          stations={stations}
          isDark={isDark}
          onSelectStation={handleSelectStation}
          onOpenAllStations={() => setCurrentRoute('station-communications')}
        />

        {/* SECTION 02: DUAL WORKFLOW PIPELINES */}
        <section id="workflows" className="space-y-6">
          <div className="space-y-1.5">
            <span className={`text-xs font-bold block ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
              ۰۲. چرخه گردش کار چندمرحله‌ای و کنترل داخلی
            </span>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight">
              تفکیک دقیق مسیر تایید گزارش‌های کار از صورت‌وضعیت‌های مالی
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* WorkReport Workflow */}
            <div className={`rounded-2xl border p-6 space-y-4 ${surfaceCard}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                      isDark
                        ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                        : 'bg-cyan-50 border-cyan-200 text-cyan-600'
                    }`}
                  >
                    <GitMerge weight="duotone" className="w-5 h-5" />
                  </span>
                  <h3 className="text-base font-extrabold">گردش کار ۳ مرحله‌ای گزارش‌های کار پیمانکار</h3>
                </div>
                <span className={`text-[11px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  تسویه در معاونت
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className={`p-3 rounded-xl border ${subtleCard} flex items-center justify-between`}>
                  <span className="font-bold">۱. ثبت عملیات میدانی</span>
                  <span className={mutedText}>کارشناس فنی یا سرپرست گروه (ثبت آفلاین + تثبیت نرخ مصوب)</span>
                </div>
                <div className={`p-3 rounded-xl border ${subtleCard} flex items-center justify-between`}>
                  <span className="font-bold">۲. تایید سرپرست گروه</span>
                  <span className={mutedText}>کنترل اولیه اکیپ و ارسال به ناظر کارفرما</span>
                </div>
                <div className={`p-3 rounded-xl border ${subtleCard} flex items-center justify-between`}>
                  <span className="font-bold">۳. تایید کارشناس کارفرما</span>
                  <span className={mutedText}>انطباق فنی میدانی و امکان درخواست اصلاح (Redo)</span>
                </div>
                <div className={`p-3 rounded-xl border ${subtleCard} flex items-center justify-between`}>
                  <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
                    ۴. تایید نهایی رییس کارفرما ← معاونت
                  </span>
                  <span className={mutedText}>اعطای امتیاز خودکار و ارجاع مستقیم به معاونت جهت تسویه</span>
                </div>
              </div>

              <div
                className={`p-3.5 rounded-xl border text-[11px] leading-relaxed ${
                  isDark
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                    : 'border-amber-200 bg-amber-50 text-amber-900'
                }`}
              >
                مدیر کارفرما بر تمامی گزارش‌های کار نظارت خواندنی دارد اما در تایید یا رد گزارش کارهای پیمانکار دخالتی نداشته و گزارش‌ها پس از تایید رییس کارفرما مستقیم به معاونت ارجاع می‌شوند.
              </div>
            </div>

            {/* Statement Approval Workflow */}
            <div className={`rounded-2xl border p-6 space-y-4 ${surfaceCard}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                      isDark
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    }`}
                  >
                    <SealCheck weight="duotone" className="w-5 h-5" />
                  </span>
                  <h3 className="text-base font-extrabold">چرخه تایید ۴ مرحله‌ای صورت‌وضعیت مالی</h3>
                </div>
                <span className={`text-[11px] font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  با حضور مدیر کارفرما
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className={`p-3 rounded-xl border ${subtleCard} flex items-center justify-between`}>
                  <span className="font-bold">۱. صدور توسط رییس شرکت پیمانکار</span>
                  <span className={mutedText}>تجمیع خودکار گزارش‌های کار تایید نهایی‌شده قرارداد</span>
                </div>
                <div className={`p-3 rounded-xl border ${subtleCard} flex items-center justify-between`}>
                  <span className={`font-bold ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>
                    ۲. تایید مرحله اول: رییس کارفرما
                  </span>
                  <span className={mutedText}>بررسی و تایید واحد کارفرما پیش از ارسال به مدیر</span>
                </div>
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDark
                      ? 'border-orange-500/40 bg-orange-500/12'
                      : 'border-indigo-200 bg-indigo-50/90'
                  }`}
                >
                  <span className={`font-bold ${isDark ? 'text-orange-300' : 'text-indigo-700'}`}>
                    ۳. تایید مرحله دوم: مدیر کارفرما
                  </span>
                  <span className={mutedText}>کنترل مدیریتی صورت‌وضعیت پس از رییس کارفرما و ارسال به معاونت</span>
                </div>
                <div className={`p-3 rounded-xl border ${subtleCard} flex items-center justify-between`}>
                  <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    ۴. تایید نهایی و پرداخت: معاونت بهره‌برداری
                  </span>
                  <span className={mutedText}>تایید نهایی و ثبت حواله پرداخت قطعی</span>
                </div>
              </div>

              <div
                className={`p-3.5 rounded-xl border text-[11px] leading-relaxed ${
                  isDark
                    ? 'border-indigo-500/35 bg-indigo-500/12 text-indigo-200'
                    : 'border-indigo-200 bg-indigo-50 text-indigo-900'
                }`}
              >
                علاوه بر تایید صورت‌وضعیت، مدیر کارفرما امکان ارجاع کار و مأموریت مستقیم به رییس کارفرما و کارشناسان کارفرما را در سامانه دارد.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 03: 8 ORGANIZATIONAL ROLES */}
        <section id="roles" className="space-y-6">
          <div className="space-y-1.5">
            <span className={`text-xs font-bold block ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
              ۰۳. ساختار دسترسی نقش‌محور (RBAC) در ۸ سطح سازمانی
            </span>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight">
              کارتابل اختصاصی متناسب با شرح وظایف هر جایگاه شغلی
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rolesShowcase.map((role) => {
              const RoleIcon = role.icon;
              return (
                <div
                  key={role.title}
                  className={`ci-layer-card rounded-2xl border p-5 flex flex-col justify-between gap-3 ${surfaceCard}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${role.iconBox}`}>
                        <RoleIcon weight="duotone" className="w-5 h-5" />
                      </span>
                      <span className={`text-[11px] font-bold ${role.tagColor}`}>
                        {role.tag}
                      </span>
                    </div>
                    <h3 className="text-sm font-black">{role.title}</h3>
                    <p className={`text-xs leading-relaxed ${mutedText}`}>{role.desc}</p>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 text-[11px] font-semibold pt-2 border-t ${
                      isDark ? 'border-slate-800 text-cyan-400' : 'border-slate-100 text-indigo-600'
                    }`}
                  >
                    <ShieldCheck weight="duotone" className="w-4 h-4" />
                    <span>تفکیک دقیق دسترسی جایگاه‌ها</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CTA BANNER */}
        <section
          className={`rounded-3xl border p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${surfaceCard}`}
        >
          <div className="space-y-2 max-w-2xl">
            <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
              <CheckCircle weight="duotone" className="w-4 h-4" />
              <span>آماده بهره‌برداری در شبکه انتقال و فوق‌توزیع سیستان و بلوچستان</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              ورود به کارتابل عملیات یا تغییر نشست کاربری با کد یک‌بارمصرف (OTP)
            </h2>
            <p className={`text-xs sm:text-sm ${mutedText}`}>
              کلیه فعالیت‌ها، تاییدهای صورت‌وضعیت، ارجاع کارها و تغییرات خطوط مخابراتی با ثبت خودکار در دفتر لاگ ممیزی نگهداری می‌شوند.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenOtpModal}
              className={`px-5 py-3 rounded-xl font-black text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
                isDark
                  ? 'bg-gradient-to-l from-cyan-400 to-indigo-400 hover:brightness-110 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.28)]'
                  : 'bg-gradient-to-l from-indigo-600 to-cyan-600 hover:brightness-110 text-white shadow-md'
              }`}
            >
              <DeviceMobile weight="duotone" className="w-4 h-4" />
              <span>ورود با شماره همراه (OTP)</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentRoute('dashboard')}
              className={`px-5 py-3 rounded-xl border font-bold text-xs transition-colors flex items-center gap-2 whitespace-nowrap ${
                isDark
                  ? 'border-slate-700 bg-[#050814]/80 hover:bg-slate-800 text-slate-100'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900'
              }`}
            >
              <Stack weight="duotone" className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
              <span>مشاهده میز کار جاری</span>
            </button>
          </div>
        </section>

        {/* BOTTOM OVERVIEW & LIVE NETWORK SUMMARY METRIC CARDS */}
        <section className="space-y-6 pt-2">
          <p className={`text-sm sm:text-base max-w-4xl leading-relaxed ${mutedText}`}>
            پلتفرم عملیاتی یکپارچه برای پایش {toPersianDigits(stations.length)} پست انتقال، فوق‌توزیع و مراکز کنترل استان سیستان و بلوچستان، مدیریت ۸ جایگاه شغلی با تفکیک دسترسی دقیق، ثبت آفلاین عملیات کارگاهی و گردش کار چندمرحله‌ای صورت‌وضعیت‌ها.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`rounded-2xl border p-5 space-y-1.5 ${surfaceCard}`}>
              <span className={`text-[11px] font-semibold ${mutedText}`}>پست‌های تحت پوشش</span>
              <div className={`text-2xl sm:text-3xl font-black tabular-nums ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                {toPersianDigits(stations.length)}
              </div>
              <div className={`text-[11px] ${mutedText}`}>۴۰۰ / ۲۳۰ / ۱۳۲ / ۶۳ کیلوولت</div>
            </div>

            <div className={`rounded-2xl border p-5 space-y-1.5 ${surfaceCard}`}>
              <span className={`text-[11px] font-semibold ${mutedText}`}>پایداری ارتباطات شبکه</span>
              <div className={`text-2xl sm:text-3xl font-black tabular-nums ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {toPersianDigits(readinessPct)}٪
              </div>
              <div className={`text-[11px] ${mutedText}`}>خطوط DTS، PLC و IP Phone</div>
            </div>

            <div className={`rounded-2xl border p-5 space-y-1.5 ${surfaceCard}`}>
              <span className={`text-[11px] font-semibold ${mutedText}`}>گزارش‌های کار ثبت‌شده</span>
              <div className={`text-2xl sm:text-3xl font-black tabular-nums ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {toPersianDigits(reports.length)}
              </div>
              <div className={`text-[11px] ${mutedText}`}>دارای تثبیت نرخ مصوب</div>
            </div>

            <div className={`rounded-2xl border p-5 space-y-1.5 ${surfaceCard}`}>
              <span className={`text-[11px] font-semibold ${mutedText}`}>صورت‌وضعیت‌های در گردش</span>
              <div className={`text-2xl sm:text-3xl font-black tabular-nums ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                {toPersianDigits(statements.length)}
              </div>
              <div className={`text-[11px] ${mutedText}`}>تایید ۴ مرحله‌ای شفاف</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
