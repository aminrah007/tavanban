/**
 * PeriodicTestsView.tsx
 * Foundational Workspace for Monthly Substation Periodic Testing («تست دوره‌ای»)
 * Supports 3 specialized technical domains:
 *  1. مخابرات (7 sections + 4 SDH/PDH sub-sections)
 *  2. تله‌متری (RTU periodic test)
 *  3. اسکادا (SCADA periodic test)
 * Ready to mount real Excel-derived sheet forms one by one upon receiving .md & .json specs.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ClipboardCheck,
  Calendar,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Radio,
  Cpu,
  Network,
  PhoneCall,
  Mic,
  Cable,
  Activity,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StationSelector } from '../common/StationSelector';
import { toPersianDigits } from '../../utils/formatters';
import {
  ALL_PERIODIC_DOMAIN_IDS,
  JALALI_MONTH_OPTIONS,
  PERIODIC_DOMAINS,
  PeriodicDomainId,
  getUserPeriodicSpecialties,
  resolveGroupSpecialty,
} from '../../data/periodicTestConfig';
import { FiberPassiveTestSheet } from '../periodic/FiberPassiveTestSheet';
import { WirelessTestSheet } from '../periodic/WirelessTestSheet';

export const PeriodicTestsView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    groups,
    stations,
    setCurrentRoute,
    periodicSelection,
    setPeriodicSelection,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>(JALALI_MONTH_OPTIONS[7]); // آبان ۱۴۰۴
  const [selectedStationId, setSelectedStationId] = useState<string>('');

  const allowedDomainIds = useMemo(
    () => getUserPeriodicSpecialties(currentUser, groups),
    [currentUser, groups]
  );

  const isFieldScoped = currentRole === 'TECHNICIAN' || currentRole === 'GROUP_SUPERVISOR';
  const hasUnassignedFieldGroup = isFieldScoped && allowedDomainIds.length === 0;

  const visibleDomainIds: PeriodicDomainId[] = hasUnassignedFieldGroup
    ? ALL_PERIODIC_DOMAIN_IDS
    : allowedDomainIds;

  // Keep periodicSelection synced to an allowed domain when switching users/groups
  useEffect(() => {
    if (!visibleDomainIds.includes(periodicSelection.domain)) {
      const nextDomainId = visibleDomainIds[0] || 'telecom';
      const nextDomain = PERIODIC_DOMAINS[nextDomainId];
      const firstSec = nextDomain.sections[0];
      setPeriodicSelection({
        domain: nextDomainId,
        sectionId: firstSec.id,
        subSectionId: firstSec.subSections?.[0]?.id,
      });
    }
  }, [visibleDomainIds, periodicSelection.domain, setPeriodicSelection]);

  const activeDomain = PERIODIC_DOMAINS[periodicSelection.domain] || PERIODIC_DOMAINS.telecom;
  const activeSection =
    activeDomain.sections.find((s) => s.id === periodicSelection.sectionId) ||
    activeDomain.sections[0];
  const activeSubSection = activeSection.subSections
    ? activeSection.subSections.find((sub) => sub.id === periodicSelection.subSectionId) ||
      activeSection.subSections[0]
    : undefined;

  const selectedStation = useMemo(
    () => stations.find((s) => s.id === selectedStationId) || null,
    [stations, selectedStationId]
  );

  const userActiveGroups = useMemo(
    () =>
      groups.filter(
        (g) =>
          g.isActive &&
          (currentUser.groupIds?.includes(g._id) ||
            g.memberIds.includes(currentUser._id) ||
            g.supervisorUserId === currentUser._id)
      ),
    [groups, currentUser]
  );

  // Flatten all sheet slots in visible domains for the readiness tracker
  const testSheetSlots = useMemo(() => {
    const slots: Array<{
      key: string;
      domainId: PeriodicDomainId;
      domainTitle: string;
      sectionId: string;
      sectionTitle: string;
      subSectionId?: string;
      subSectionTitle?: string;
      sheetStatus: 'pending_spec' | 'ready';
    }> = [];

    for (const dId of visibleDomainIds) {
      const domain = PERIODIC_DOMAINS[dId];
      for (const sec of domain.sections) {
        if (sec.subSections && sec.subSections.length > 0) {
          for (const sub of sec.subSections) {
            slots.push({
              key: `${dId}:${sec.id}:${sub.id}`,
              domainId: dId,
              domainTitle: domain.groupTitle,
              sectionId: sec.id,
              sectionTitle: sec.title,
              subSectionId: sub.id,
              subSectionTitle: sub.title,
              sheetStatus: sub.sheetStatus,
            });
          }
        } else {
          slots.push({
            key: `${dId}:${sec.id}`,
            domainId: dId,
            domainTitle: domain.groupTitle,
            sectionId: sec.id,
            sectionTitle: sec.title,
            sheetStatus: sec.sheetStatus,
          });
        }
      }
    }
    return slots;
  }, [visibleDomainIds]);

  const readyCount = testSheetSlots.filter((s) => s.sheetStatus === 'ready').length;

  const selectDomain = (domainId: PeriodicDomainId) => {
    const domain = PERIODIC_DOMAINS[domainId];
    const firstSec = domain.sections[0];
    setPeriodicSelection({
      domain: domainId,
      sectionId: firstSec.id,
      subSectionId: firstSec.subSections?.[0]?.id,
    });
  };

  const selectSection = (sectionId: string) => {
    const sec = activeDomain.sections.find((s) => s.id === sectionId);
    setPeriodicSelection({
      domain: activeDomain.id,
      sectionId,
      subSectionId: sec?.subSections?.[0]?.id,
    });
  };

  const selectSubSection = (subSectionId: string) => {
    setPeriodicSelection({
      domain: activeDomain.id,
      sectionId: activeSection.id,
      subSectionId,
    });
  };

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'wireless':
        return Radio;
      case 'plc':
        return ZapIconFallback;
      case 'fiber-passive':
        return Cable;
      case 'switch':
        return Network;
      case 'voice-recorder':
        return Mic;
      case 'pbx':
        return PhoneCall;
      case 'sdh-pdh':
        return Layers;
      case 'rtu':
        return Cpu;
      default:
        return Activity;
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-cyan-400" />
              <span>
                {isFieldScoped && !hasUnassignedFieldGroup && visibleDomainIds.length === 1
                  ? activeDomain.title
                  : 'پیکربندی و ثبت تست‌های دوره‌ای ماهانه'}
              </span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-lg border border-cyan-500/35 bg-cyan-500/10 text-cyan-300 text-[11px] font-bold">
              دوره {activeDomain.cycleLabel}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{activeDomain.description}</p>
        </div>

        {/* Active User Group(s) Summary */}
        <div className="flex flex-wrap items-center gap-2">
          {userActiveGroups.length > 0 ? (
            userActiveGroups.map((g) => (
              <span
                key={g._id}
                className="px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900/80 text-[11px] text-slate-200 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="font-semibold">{g.name}</span>
                <span className="text-slate-400">
                  ({resolveGroupSpecialty(g) === 'telecom'
                    ? 'مخابرات'
                    : resolveGroupSpecialty(g) === 'telemetry'
                    ? 'تله‌متری'
                    : resolveGroupSpecialty(g) === 'scada'
                    ? 'اسکادا'
                    : 'عمومی'})
                </span>
              </span>
            ))
          ) : (
            <span className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 text-[11px] text-slate-400">
              دسترسی نظارتی / مدیریتی کل بخش‌ها
            </span>
          )}
        </div>
      </div>

      {/* Warning Banner when Technician/Supervisor's group doesn't have a specialty assigned yet */}
      {hasUnassignedFieldGroup && (
        <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-950/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-300">
                تخصص گروه کاری شما هنوز به یکی از بخش‌های مخابرات، تله‌متری یا اسکادا متصل نشده است
              </div>
              <p className="text-slate-300 leading-relaxed">
                برای نمایش اختصاصی منوی تست دوره‌ای گروه شما در تسک‌بار سمت راست، رییس پیمانکار می‌تواند از بخش «گروه‌های کاری» تخصص گروه را به مخابرات، تله‌متری یا اسکادا تغییر دهد. در ادامه نمای کلی هر ۳ بخش به‌صورت پیش‌نمایش نمایش داده شده است.
              </p>
            </div>
          </div>
          {currentRole === 'GROUP_SUPERVISOR' && (
            <button
              type="button"
              onClick={() => setCurrentRoute('groups')}
              className="px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 font-bold whitespace-nowrap"
            >
              مشاهده گروه‌های کاری
            </button>
          )}
        </div>
      )}

      {/* Top Context Controls: Month Cycle & Substation Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 rounded-2xl glass-panel border border-slate-800 bg-slate-900/60">
        <div className="lg:col-span-7">
          <StationSelector
            stations={stations}
            value={selectedStationId}
            onChange={(st) => setSelectedStationId(st ? st.id : '')}
            label="محل انجام تست دوره‌ای (پست برق / مرکز کنترل):"
            placeholder="انتخاب پست برق جهت ثبت یا مشاهده تست دوره‌ای..."
          />
        </div>

        <div className="lg:col-span-5">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            دوره ماهانه تست دوره‌ای:
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-cyan-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-500/60 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {JALALI_MONTH_OPTIONS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Domain Switcher (only shown when user has access to > 1 domain) */}
      {visibleDomainIds.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          {visibleDomainIds.map((dId) => {
            const domain = PERIODIC_DOMAINS[dId];
            const isActive = activeDomain.id === dId;
            return (
              <button
                key={dId}
                type="button"
                onClick={() => selectDomain(dId)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'border-cyan-400/60 bg-gradient-to-l from-cyan-500/20 to-indigo-500/15 text-white shadow-[0_0_16px_rgba(34,211,238,0.18)]'
                    : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{domain.groupTitle}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-slate-950/80 text-[10px] text-cyan-300 tabular-nums">
                  {toPersianDigits(
                    domain.sections.reduce(
                      (acc, sec) => acc + (sec.subSections ? sec.subSections.length : 1),
                      0
                    )
                  )}{' '}
                  شیت
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Sections Grid for Active Domain */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200">
            بخش‌های تست دوره‌ای {activeDomain.groupTitle}:
          </span>
          <span className="text-[11px] text-slate-400">
            {toPersianDigits(activeDomain.sections.length)} بخش تعریف‌شده
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {activeDomain.sections.map((section) => {
            const Icon = getSectionIcon(section.id);
            const isSelected = activeSection.id === section.id;
            const subCount = section.subSections?.length || 0;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => selectSection(section.id)}
                className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-cyan-400/60 bg-gradient-to-br from-cyan-500/15 via-slate-900 to-indigo-500/10 text-white shadow-[0_0_20px_rgba(34,211,238,0.12)]'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${
                        isSelected
                          ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold truncate">{section.title}</span>
                  </div>
                  {subCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md border border-indigo-500/35 bg-indigo-500/15 text-indigo-300 text-[10px] font-bold shrink-0">
                      {toPersianDigits(subCount)} زیرمجموعه
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {section.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* SDH / PDH Sub-sections selector when SDH/PDH is active */}
      {activeSection.subSections && activeSection.subSections.length > 0 && (
        <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/15 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>زیرمجموعه‌های تجهیزات {activeSection.title}:</span>
            </span>
            <span className="text-[11px] text-slate-400">
              انتخاب برند / سامانه جهت تکمیل تست‌شیت
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {activeSection.subSections.map((sub) => {
              const isSubActive = activeSubSection?.id === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => selectSubSection(sub.id)}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    isSubActive
                      ? 'border-indigo-400/60 bg-indigo-500/20 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{sub.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {sub.sheetStatus === 'ready' ? 'تست‌شیت فعال' : 'آماده اتصال فایل ساختار'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Sheet Workspace */}
      {activeDomain.id === 'telecom' && activeSection.id === 'fiber-passive' ? (
        <FiberPassiveTestSheet
          selectedStation={selectedStation}
          onSelectStationById={(stationId) => setSelectedStationId(stationId)}
          selectedMonth={selectedMonth}
          onSelectMonth={(month) => setSelectedMonth(month)}
        />
      ) : activeDomain.id === 'telecom' && activeSection.id === 'wireless' ? (
        <WirelessTestSheet
          selectedStation={selectedStation}
          onSelectStationById={(stationId) => setSelectedStationId(stationId)}
          selectedMonth={selectedMonth}
          onSelectMonth={(month) => setSelectedMonth(month)}
        />
      ) : (
        <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-[#0B1120] to-slate-900/80 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="space-y-1.5">
              {/* Path Breadcrumb */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-cyan-400 font-semibold">
                <span>{activeDomain.groupTitle}</span>
                <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>{activeSection.title}</span>
                {activeSubSection && (
                  <>
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-indigo-300">{activeSubSection.title}</span>
                  </>
                )}
              </div>

              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                <span>
                  فرم تست دوره‌ای: {activeSubSection ? `${activeSection.shortTitle} — ${activeSubSection.title}` : activeSection.title}
                </span>
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-200 font-semibold">
                دوره: {selectedMonth}
              </span>
              <span
                className={`px-3 py-1.5 rounded-xl border font-semibold ${
                  selectedStation
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                    : 'border-amber-500/35 bg-amber-950/20 text-amber-300'
                }`}
              >
                {selectedStation
                  ? `پست: ${selectedStation.persianName}`
                  : 'پست برق انتخاب نشده'}
              </span>
            </div>
          </div>

          {/* Ready-for-Excel-Spec Placeholder Body (Zero Invented Fields) */}
          <div className="p-6 rounded-2xl border border-dashed border-cyan-500/40 bg-slate-950/70 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/15 border border-cyan-400/35 flex items-center justify-center text-cyan-300">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-white">
              زیرساخت این تست‌شیت آماده پیاده‌سازی دقیق بر اساس فایل اکسل شماست
            </div>
            <p className="text-xs text-slate-300 max-w-2xl mx-auto leading-relaxed">
              در انتظار دریافت فایل‌های <span className="text-cyan-300 font-bold" dir="ltr">.md</span> و{' '}
              <span className="text-cyan-300 font-bold" dir="ltr">.json</span> مربوط به{' '}
              <strong className="text-white">
                {activeSubSection ? `${activeSection.title} (${activeSubSection.title})` : activeSection.title}
              </strong>{' '}
              از شما هستیم تا جدول‌های اندازه‌گیری، پارامترهای فنی، وضعیت‌ها و ثبت مستقیم نتایج جایگزین فایل اکسل سنتی در همین بخش ساخته شود.
            </p>
          </div>
        </div>
      )}

      {/* Readiness Checklist of All Test Sheet Slots */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white">
              وضعیت پیکربندی تست‌شیت‌های بخش‌های مجاز ({toPersianDigits(testSheetSlots.length)} تست‌شیت)
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              پس از ارسال فایل‌های هر بخش و تایید نهایی شما، تست‌شیت بعدی به‌صورت مرحله‌ای فعال می‌شود.
            </p>
          </div>
          <span className="px-3 py-1 rounded-xl border border-slate-700 bg-slate-950 text-xs font-bold text-cyan-300 tabular-nums self-start sm:self-auto">
            {toPersianDigits(readyCount)} از {toPersianDigits(testSheetSlots.length)} تست‌شیت فعال‌شده
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {testSheetSlots.map((slot, index) => {
            const isSlotSelected =
              periodicSelection.domain === slot.domainId &&
              periodicSelection.sectionId === slot.sectionId &&
              (slot.subSectionId ? periodicSelection.subSectionId === slot.subSectionId : true);

            return (
              <button
                key={slot.key}
                type="button"
                onClick={() =>
                  setPeriodicSelection({
                    domain: slot.domainId,
                    sectionId: slot.sectionId,
                    subSectionId: slot.subSectionId,
                  })
                }
                className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between gap-2 ${
                  isSlotSelected
                    ? 'border-cyan-400/55 bg-cyan-500/12 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 font-medium">
                    {toPersianDigits(index + 1)}. {slot.domainTitle}
                  </div>
                  <div className="text-xs font-bold truncate mt-0.5">
                    {slot.subSectionTitle
                      ? `${slot.sectionTitle} — ${slot.subSectionTitle}`
                      : slot.sectionTitle}
                  </div>
                </div>
                {slot.sheetStatus === 'ready' ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    فعال
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-400 text-[10px] font-semibold shrink-0">
                    منتظر فایل
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Local clean icon helper for PLC power-line carrier
const ZapIconFallback: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
