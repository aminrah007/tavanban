/**
 * StationCommunicationsView.tsx
 * Dedicated "ارتباطات پست‌ها" page displaying full DTS/PLC/EXTENSION/MOBILE/IP Phone checklist
 * across all 107 substations, power plants, and dispatching centers + Analytical Charts & Live Editing.
 */

import React, { useMemo, useState, useEffect } from 'react';
import {
  Broadcast,
  MagnifyingGlass,
  CheckCircle,
  XCircle,
  Clock,
  MinusCircle,
  Phone,
  PencilSimple,
  PlusCircle,
  DownloadSimple,
  X,
  Warning,
  WifiHigh,
  DeviceMobile,
  Cpu,
  PhoneCall,
} from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';
import {
  StationCommunication,
  ChannelType,
  ChannelHealthStatus,
  VoltageTier,
  VOLTAGE_TIER_LABELS,
  CHECKLIST_REVISION_DATE,
  CHECKLIST_OPERATOR_PHONES,
} from '../../data/stationsChecklist';
import {
  ChannelHealthStackedChart,
  VoltageTierReadinessChart,
  FaultRootCauseChart,
  NetworkReadinessSummaryCard,
  classifyFaultNote,
} from '../charts/AnalyticalCharts';
import { toPersianDigits } from '../../utils/formatters';
import {
  canCreateWorkReport,
  canCreateTask,
  canEditStationChannel,
} from '../../config/rolePermissions';

export const StationCommunicationsView: React.FC = () => {
  const {
    stations,
    currentRole,
    updateStationChannel,
    setCurrentRoute,
    setPreselectedStationId,
    focusedCommStationId,
    setFocusedCommStationId,
    theme,
    showToast,
  } = useApp();

  const canReportStation = canCreateWorkReport(currentRole);
  const canAssignStationTask = canCreateTask(currentRole);
  const canEditChannels = canEditStationChannel(currentRole);

  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<VoltageTier | 'all'>('all');
  const [healthFilter, setHealthFilter] = useState<'all' | 'faulty' | 'healthy'>('all');
  const [causeFilter, setCauseFilter] = useState<string | null>(null);
  const [channelTypeFilter, setChannelTypeFilter] = useState<ChannelType | null>(null);

  // Edit channel modal state
  const [editingTarget, setEditingTarget] = useState<{
    station: StationCommunication;
    channelType: ChannelType;
    status: ChannelHealthStatus;
    number: string;
    note: string;
  } | null>(null);

  // If navigated from 3D cloud chip, scroll/focus that station
  useEffect(() => {
    if (focusedCommStationId) {
      const target = stations.find((s) => s.id === focusedCommStationId);
      if (target) {
        setSearchQuery(target.name);
        setTierFilter('all');
        setHealthFilter('all');
        setCauseFilter(null);
      }
      const timer = setTimeout(() => setFocusedCommStationId(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [focusedCommStationId, stations, setFocusedCommStationId]);

  const filteredStations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stations.filter((st) => {
      if (tierFilter !== 'all' && st.voltageTier !== tierFilter) return false;

      const hasDown = st.channels.some((c) => c.status === 'down');
      if (healthFilter === 'faulty' && !hasDown) return false;
      if (healthFilter === 'healthy' && hasDown) return false;

      if (causeFilter) {
        const matchesCause = st.channels.some(
          (ch) => (ch.status === 'down' || ch.note.trim().length > 0) && classifyFaultNote(ch.note) === causeFilter
        );
        if (!matchesCause) return false;
      }

      if (channelTypeFilter) {
        const hasFaultyInChannel = st.channels.some(
          (ch) => ch.type === channelTypeFilter && (ch.status === 'down' || ch.status === 'pending')
        );
        if (!hasFaultyInChannel) return false;
      }

      if (q) {
        const hitStation =
          st.name.toLowerCase().includes(q) ||
          st.persianName.toLowerCase().includes(q) ||
          st.dispatchCode.toLowerCase().includes(q);
        const hitChannel = st.channels.some(
          (ch) =>
            ch.number.toLowerCase().includes(q) ||
            ch.note.toLowerCase().includes(q) ||
            ch.type.toLowerCase().includes(q)
        );
        if (!hitStation && !hitChannel) return false;
      }

      return true;
    });
  }, [stations, searchQuery, tierFilter, healthFilter, causeFilter, channelTypeFilter]);

  // Global stats
  const globalStats = useMemo(() => {
    let ok = 0;
    let down = 0;
    let theft = 0;
    let stationsWithFault = 0;

    stations.forEach((st) => {
      let stFault = false;
      st.channels.forEach((ch) => {
        if (ch.status === 'ok') ok++;
        if (ch.status === 'down') {
          down++;
          stFault = true;
        }
        if (ch.note.includes('سرقت')) theft++;
      });
      if (stFault) stationsWithFault++;
    });

    return { ok, down, theft, stationsWithFault };
  }, [stations]);

  const handleOpenReportForStation = (stationId: string) => {
    setPreselectedStationId(stationId);
    setCurrentRoute('report-new');
    showToast('پست انتخاب‌شده در فرم ثبت گزارش کار بارگذاری شد.', 'info');
  };

  const handleExportCSV = () => {
    const headers = ['نام پست', 'عنوان فارسی', 'کد دیسپاچینگ', 'نوع کانال', 'شماره تماس', 'وضعیت', 'توضیحات'];
    const rows: string[] = [];
    filteredStations.forEach((st) => {
      st.channels.forEach((ch) => {
        rows.push(
          [
            `"${st.name}"`,
            `"${st.persianName}"`,
            `"${st.dispatchCode}"`,
            `"${ch.type}"`,
            `"${ch.number || '*'}"`,
            `"${ch.rawStatus || ch.status}"`,
            `"${(ch.note || '').replace(/"/g, '""')}"`,
          ].join(',')
        );
      });
    });

    const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `station_communications_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('گزارش چک‌لیست ارتباطات پست‌ها با فرمت CSV استخراج شد.', 'success');
  };

  const getChannelIcon = (type: ChannelType) => {
    switch (type) {
      case 'DTS':
        return PhoneCall;
      case 'PLC':
        return Cpu;
      case 'IP Phone':
        return WifiHigh;
      case 'MOBILE':
        return DeviceMobile;
      default:
        return Phone;
    }
  };

  const getStatusBadge = (status: ChannelHealthStatus) => {
    switch (status) {
      case 'ok':
        return {
          label: 'برقرار (√)',
          icon: CheckCircle,
          cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        };
      case 'down':
        return {
          label: 'قطع (X)',
          icon: XCircle,
          cls: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        };
      case 'pending':
        return {
          label: 'نیاز به بررسی',
          icon: Clock,
          cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        };
      default:
        return {
          label: 'ناموجود (*)',
          icon: MinusCircle,
          cls: isDark
            ? 'bg-slate-800/80 text-slate-400 border-slate-700'
            : 'bg-slate-100 text-slate-500 border-slate-200',
        };
    }
  };

  const surfaceCls = isDark
    ? 'bg-[#0B1120]/90 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200/90 text-slate-900 shadow-sm';
  const mutedCls = isDark ? 'text-slate-400' : 'text-slate-500';
  const innerCardCls = isDark
    ? 'bg-[#050814]/80 border-slate-800'
    : 'bg-slate-50 border-slate-200/80';

  return (
    <div className="space-y-6 text-right">
      {/* Header Banner */}
      <div className={`rounded-2xl border p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${surfaceCls}`}>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span
              className={`px-2.5 py-0.5 rounded-lg border font-bold ${
                isDark
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
            >
              چک‌لیست رسمی DTS · PLC · IP Phone
            </span>
            <span className={mutedCls}>تاریخ بازبینی مرجع: {CHECKLIST_REVISION_DATE}</span>
            <span className={mutedCls}>· اقدام‌کننده: {CHECKLIST_OPERATOR_PHONES}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2.5">
            <Broadcast weight="duotone" className={`w-6 h-6 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
            <span>پایش و مدیریت ارتباطات پست‌های برق ({toPersianDigits(stations.length)} ایستگاه و مرکز)</span>
          </h2>
          <p className={`text-xs max-w-3xl leading-relaxed ${mutedCls}`}>
            مرجع جامع وضعیت خطوط دیسپاچینگ (DTS)، سیستم کاریر (PLC)، تلفن‌های داخلی، موبایل‌های عملیاتی و تلفن تحت شبکه (IP Phone) به همراه نمودارهای تحلیلی و ارجاع مستقیم ثبت گزارش رفع نقص.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isDark
                ? 'border-slate-700 bg-[#050814]/80 hover:bg-slate-800 text-slate-200'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <DownloadSimple weight="duotone" className="w-4 h-4" />
            <span>خروجی اکسل CSV</span>
          </button>
          {canReportStation && (
            <button
              onClick={() => setCurrentRoute('report-new')}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                isDark
                  ? 'bg-gradient-to-l from-cyan-400 to-indigo-400 hover:brightness-110 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <PlusCircle weight="duotone" className="w-4 h-4" />
              <span>ثبت گزارش رفع خرابی</span>
            </button>
          )}
          {!canReportStation && canAssignStationTask && (
            <button
              onClick={() => setCurrentRoute('tasks')}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                isDark
                  ? 'bg-gradient-to-l from-cyan-400 to-indigo-400 hover:brightness-110 text-slate-950'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <PlusCircle weight="duotone" className="w-4 h-4" />
              <span>ارجاع مأموریت بررسی پست</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Quick Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-2xl border p-4 ${surfaceCls}`}>
          <div className={`text-xs font-medium ${mutedCls}`}>تعداد کل پست‌ها و مراکز</div>
          <div className={`text-2xl font-black mt-1.5 tabular-nums ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
            {toPersianDigits(stations.length)}
          </div>
          <div className={`text-[11px] font-semibold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            شامل ۴۰۰، ۲۳۰، ۱۳۲، ۶۳ کیلوولت و نیروگاه‌ها
          </div>
        </div>
        <div className={`rounded-2xl border p-4 ${surfaceCls}`}>
          <div className={`text-xs font-medium ${mutedCls}`}>مسیرهای ارتباطی برقرار (√)</div>
          <div className="text-2xl font-black text-emerald-400 mt-1.5 tabular-nums">{toPersianDigits(globalStats.ok)}</div>
          <div className={`text-[11px] mt-1 ${mutedCls}`}>تست‌شده در دوره‌های پایداری شبکه</div>
        </div>
        <div className={`rounded-2xl border p-4 ${surfaceCls}`}>
          <div className={`text-xs font-medium ${mutedCls}`}>کانال‌های قطع / معیوب (X)</div>
          <div className="text-2xl font-black text-rose-400 mt-1.5 tabular-nums">{toPersianDigits(globalStats.down)}</div>
          <div className={`text-[11px] mt-1 ${mutedCls}`}>
            در {toPersianDigits(globalStats.stationsWithFault)} ایستگاه دارای حداقل یک اختلال
          </div>
        </div>
        <div className={`rounded-2xl border p-4 ${surfaceCls}`}>
          <div className={`text-xs font-medium ${mutedCls}`}>موارد سرقت کابل ثبت‌شده</div>
          <div className="text-2xl font-black text-amber-400 mt-1.5 tabular-nums">{toPersianDigits(globalStats.theft)}</div>
          <div className={`text-[11px] mt-1 ${mutedCls}`}>نیازمند جایگزینی مسیر یا راه‌اندازی گیت‌وی</div>
        </div>
      </div>

      {/* Analytical Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <ChannelHealthStackedChart
            stations={stations}
            isDark={isDark}
            onSelectChannelFilter={(ch) => {
              setChannelTypeFilter((prev) => (prev === ch ? null : ch));
              setHealthFilter('faulty');
            }}
          />
        </div>
        <div className="lg:col-span-5">
          <NetworkReadinessSummaryCard stations={stations} isDark={isDark} />
        </div>
        <div className="lg:col-span-7">
          <VoltageTierReadinessChart
            stations={stations}
            isDark={isDark}
            onSelectTierFilter={(t) => setTierFilter(t)}
          />
        </div>
        <div className="lg:col-span-5">
          <FaultRootCauseChart
            stations={stations}
            isDark={isDark}
            activeCauseFilter={causeFilter}
            onSelectCauseFilter={(c) => setCauseFilter(c)}
          />
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className={`rounded-2xl border p-4 space-y-3 ${surfaceCls}`}>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <MagnifyingGlass weight="bold" className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${mutedCls}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس نام فارسی، کد لاتین پست (ZAHEDAN-230)، کد دیسپاچینگ (1001)، شماره تلفن یا شرح نقص..."
              className={`w-full pr-3.5 pl-10 py-2.5 rounded-xl border text-xs focus:outline-none text-right ${
                isDark
                  ? 'bg-[#050814] border-slate-700 text-white focus:border-cyan-400'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Health Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setHealthFilter('all')}
              className={`px-3 py-2 rounded-xl border font-bold transition-colors ${
                healthFilter === 'all'
                  ? isDark
                    ? 'bg-cyan-400 text-slate-950 border-cyan-400'
                    : 'bg-indigo-600 text-white border-indigo-600'
                  : isDark
                  ? 'border-slate-700 bg-[#050814] text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              همه وضعیت‌ها
            </button>
            <button
              onClick={() => setHealthFilter('faulty')}
              className={`px-3 py-2 rounded-xl border font-bold transition-colors flex items-center gap-1.5 ${
                healthFilter === 'faulty'
                  ? 'bg-rose-500 text-white border-rose-500'
                  : isDark
                  ? 'border-slate-700 bg-[#050814] text-rose-400 hover:bg-slate-800'
                  : 'border-slate-200 bg-slate-50 text-rose-600 hover:bg-slate-100'
              }`}
            >
              <Warning weight="duotone" className="w-4 h-4" />
              <span>فقط دارای قطعی ({toPersianDigits(globalStats.stationsWithFault)})</span>
            </button>
            <button
              onClick={() => setHealthFilter('healthy')}
              className={`px-3 py-2 rounded-xl border font-bold transition-colors flex items-center gap-1.5 ${
                healthFilter === 'healthy'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                  : isDark
                  ? 'border-slate-700 bg-[#050814] text-emerald-400 hover:bg-slate-800'
                  : 'border-slate-200 bg-slate-50 text-emerald-700 hover:bg-slate-100'
              }`}
            >
              <CheckCircle weight="duotone" className="w-4 h-4" />
              <span>کاملاً سالم</span>
            </button>
          </div>
        </div>

        {/* Voltage Tier Segmented Tabs + Active Filter Indicators */}
        <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            {(
              [
                ['all', 'همه سطوح ولتاژ'],
                ['400', '۴۰۰ کیلوولت'],
                ['230', '۲۳۰ کیلوولت'],
                ['132', '۱۳۲ کیلوولت'],
                ['63', '۶۳ کیلوولت'],
                ['powerplant', 'نیروگاه‌ها'],
                ['control', 'مراکز کنترل'],
              ] as [VoltageTier | 'all', string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTierFilter(key)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  tierFilter === key
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                      : 'bg-indigo-600 text-white border border-indigo-600'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            {(causeFilter || channelTypeFilter || searchQuery || tierFilter !== 'all' || healthFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTierFilter('all');
                  setHealthFilter('all');
                  setCauseFilter(null);
                  setChannelTypeFilter(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold"
              >
                پاک‌سازی فیلترها
              </button>
            )}
            <span className={`font-semibold tabular-nums ${mutedCls}`}>
              نمایش {toPersianDigits(filteredStations.length)} از {toPersianDigits(stations.length)} پست
            </span>
          </div>
        </div>
      </div>

      {/* Stations Checklist Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredStations.length === 0 ? (
          <div className={`col-span-full rounded-2xl border py-16 text-center text-xs ${surfaceCls} ${mutedCls}`}>
            هیچ پستی با فیلترهای انتخاب‌شده یافت نشد.
          </div>
        ) : (
          filteredStations.map((station) => {
            const downCount = station.channels.filter((c) => c.status === 'down').length;
            const okCount = station.channels.filter((c) => c.status === 'ok').length;

            return (
              <div
                key={station.id}
                className={`rounded-2xl border p-5 space-y-4 transition-all ${
                  isDark ? 'hover:border-cyan-400/50' : 'hover:border-indigo-400'
                } ${surfaceCls}`}
              >
                {/* Station Header */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black truncate">
                        {station.persianName}
                      </h3>
                      {station.dispatchCode && (
                        <span
                          className={`px-2 py-0.5 rounded-md border text-[11px] font-bold tabular-nums ${
                            isDark
                              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          کد دیسپاچینگ: {toPersianDigits(station.dispatchCode)}
                        </span>
                      )}
                    </div>
                    <div className={`text-[11px] mt-1 flex items-center gap-2 ${mutedCls}`}>
                      <span className="font-semibold">{station.name}</span>
                      <span>·</span>
                      <span>{VOLTAGE_TIER_LABELS[station.voltageTier]}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {downCount > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[11px] font-bold">
                        {toPersianDigits(downCount)} مسیر قطع
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                        {toPersianDigits(okCount)} مسیر برقرار
                      </span>
                    )}

                    {canReportStation && (
                      <button
                        onClick={() => handleOpenReportForStation(station.id)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors flex items-center gap-1 ${
                          isDark
                            ? 'bg-cyan-500/15 hover:bg-cyan-400 text-cyan-300 hover:text-slate-950 border-cyan-500/35'
                            : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border-indigo-200'
                        }`}
                        title="ثبت گزارش کار یا رفع نقص برای این پست"
                      >
                        <PlusCircle weight="duotone" className="w-3.5 h-3.5" />
                        <span>ثبت گزارش کار</span>
                      </button>
                    )}

                    {canAssignStationTask && (
                      <button
                        onClick={() => {
                          setPreselectedStationId(station.id);
                          setCurrentRoute('tasks');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500 text-sky-300 hover:text-white border border-sky-500/30 text-[11px] font-bold transition-colors"
                        title="ارجاع مأموریت بررسی به اکیپ برای این پست"
                      >
                        ارجاع مأموریت
                      </button>
                    )}
                  </div>
                </div>

                {/* Channels Matrix */}
                <div className="space-y-2">
                  {station.channels.map((ch) => {
                    const ChIcon = getChannelIcon(ch.type);
                    const badge = getStatusBadge(ch.status);
                    const StatusIcon = badge.icon;

                    return (
                      <div
                        key={ch.type}
                        className={`rounded-xl border p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${innerCardCls}`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                              isDark
                                ? 'bg-slate-900 border-slate-700 text-cyan-400'
                                : 'bg-white border-slate-200 text-indigo-600'
                            }`}
                          >
                            <ChIcon weight="duotone" className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold">{ch.labelFa}</span>
                              {ch.number && (
                                <span
                                  dir="ltr"
                                  className={`px-2 py-0.5 rounded font-bold text-[11px] tabular-nums ${
                                    isDark
                                      ? 'bg-slate-800 text-cyan-300'
                                      : 'bg-indigo-50 text-indigo-700'
                                  }`}
                                >
                                  {toPersianDigits(ch.number)}
                                </span>
                              )}
                            </div>
                            {ch.note && (
                              <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                                یادداشت فنی: {toPersianDigits(ch.note)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                          <span
                            className={`px-2 py-1 rounded-lg border text-[11px] font-bold inline-flex items-center gap-1 ${badge.cls}`}
                          >
                            <StatusIcon weight="duotone" className="w-3.5 h-3.5" />
                            <span>{badge.label}</span>
                          </span>

                          {canEditChannels && (
                            <button
                              type="button"
                              onClick={() =>
                                setEditingTarget({
                                  station,
                                  channelType: ch.type,
                                  status: ch.status,
                                  number: ch.number,
                                  note: ch.note,
                                })
                              }
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isDark
                                  ? 'border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-cyan-300'
                                  : 'border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-indigo-600'
                              }`}
                              title="بروزرسانی وضعیت کانال و یادداشت"
                            >
                              <PencilSimple weight="duotone" className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Station Channel Modal */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-md rounded-2xl border p-6 text-right space-y-4 shadow-2xl ${surfaceCls}`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div>
                <h3 className="text-base font-black">بروزرسانی ارتباط {editingTarget.channelType}</h3>
                <p className={`text-xs mt-0.5 ${mutedCls}`}>
                  {editingTarget.station.persianName} ({editingTarget.station.name})
                </p>
              </div>
              <button
                onClick={() => setEditingTarget(null)}
                className={`p-1 rounded-lg ${mutedCls} hover:opacity-80`}
              >
                <X weight="bold" className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1.5">وضعیت فعلی مسیر ارتباطی:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['ok', 'برقرار (√)'],
                      ['down', 'قطع / معیوب (X)'],
                      ['pending', 'در حال بررسی'],
                      ['na', 'ناموجود (*)'],
                    ] as [ChannelHealthStatus, string][]
                  ).map(([val, lbl]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setEditingTarget({ ...editingTarget, status: val })}
                      className={`p-2 rounded-xl border font-bold transition-colors ${
                        editingTarget.status === val
                          ? isDark
                            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                            : 'border-indigo-600 bg-indigo-600 text-white'
                          : isDark
                          ? 'border-slate-700 bg-[#050814] text-slate-300'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1.5">شماره تماس / داخلی / IP:</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editingTarget.number}
                  onChange={(e) => setEditingTarget({ ...editingTarget, number: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white focus:border-cyan-400'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1.5">توضیحات فنی / علت قطعی:</label>
                <textarea
                  rows={3}
                  value={editingTarget.note}
                  onChange={(e) => setEditingTarget({ ...editingTarget, note: e.target.value })}
                  placeholder="مثال: سرقت کابل برطرف شد / نیاز به نصب گیت‌وی..."
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none text-right ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white focus:border-cyan-400'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            <div className={`flex items-center justify-end gap-2.5 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setEditingTarget(null)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold ${
                  isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'
                }`}
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  updateStationChannel(editingTarget.station.id, editingTarget.channelType, {
                    status: editingTarget.status,
                    number: editingTarget.number,
                    note: editingTarget.note,
                  });
                  setEditingTarget(null);
                }}
                className={`px-5 py-2 rounded-xl font-bold text-xs transition-colors ${
                  isDark
                    ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                ذخیره و ثبت در ممیزی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
