/**
 * AnalyticalCharts.tsx
 * Hyper-Grid Obsidian & Electric Cyan / Hyper Indigo / Solar Amber Telemetry Charts
 * Supports Dark & Light modes with full RTL Persian digits and Phosphor Duotone icons.
 */

import React, { useMemo, useState } from 'react';
import {
  Pulse,
  Warning,
  CheckCircle,
  Broadcast,
  ShieldWarning,
  TrendUp,
} from '@phosphor-icons/react';
import {
  StationCommunication,
  ChannelType,
  VoltageTier,
  VOLTAGE_TIER_LABELS,
} from '../../data/stationsChecklist';
import { toPersianDigits } from '../../utils/formatters';

interface ChartsProps {
  stations: StationCommunication[];
  isDark?: boolean;
  onSelectChannelFilter?: (channel: ChannelType | null) => void;
  onSelectTierFilter?: (tier: VoltageTier | 'all') => void;
  onSelectCauseFilter?: (causeKey: string | null) => void;
  activeCauseFilter?: string | null;
}

const CHANNEL_ORDER: ChannelType[] = ['DTS', 'PLC', 'EXTENSION', 'MOBILE', 'IP Phone'];
const CHANNEL_TITLES: Record<ChannelType, string> = {
  DTS: 'تلفن دیسپاچینگ (DTS)',
  PLC: 'خط کاریر (PLC)',
  EXTENSION: 'داخلی / شهری',
  MOBILE: 'موبایل عملیاتی',
  'IP Phone': 'تلفن IP Phone',
};

export interface FaultCauseBucket {
  key: string;
  label: string;
  count: number;
  color: string;
  keywords: string[];
}

export function classifyFaultNote(note: string): string {
  const n = note.trim();
  if (!n) return 'other';
  if (n.includes('سرقت')) return 'theft';
  if (n.includes('گیت وی') || n.includes('گت وی') || n.includes('سوئیچ') || n.includes('IP') || n.includes('it') || n.includes('ot')) {
    return 'gateway';
  }
  if (n.includes('خراب') || n.includes('باتری') || n.includes('بلند گو') || n.includes('معیوب') || n.includes('گوشی')) {
    return 'hardware';
  }
  if (n.includes('صدا') || n.includes('نویز') || n.includes('ضعیف')) return 'audio';
  if (n.includes('پاسخگو') || n.includes('خاموش') || n.includes('اشغال') || n.includes('بوق')) return 'no_answer';
  return 'other';
}

export const FAULT_CAUSE_DEFINITIONS: Omit<FaultCauseBucket, 'count'>[] = [
  { key: 'theft', label: 'سرقت کابل', color: '#F43F5E', keywords: ['سرقت'] },
  { key: 'gateway', label: 'نیاز به گیت‌وی / سوئیچ IT', color: '#22D3EE', keywords: ['گیت وی', 'گت وی', 'سوئیچ', 'IP', 'it', 'ot'] },
  { key: 'hardware', label: 'خرابی PLC / گوشی / باتری', color: '#F59E0B', keywords: ['خراب', 'باتری', 'معیوب', 'گوشی'] },
  { key: 'audio', label: 'افت کیفیت صدا و نویز', color: '#818CF8', keywords: ['صدا', 'نویز', 'ضعیف'] },
  { key: 'no_answer', label: 'عدم پاسخگویی / خاموش', color: '#38BDF8', keywords: ['پاسخگو', 'خاموش', 'بوق'] },
  { key: 'other', label: 'سایر موارد قطع / نیازمند بررسی', color: '#64748B', keywords: [] },
];

/**
 * 1. Stacked Bar Chart per Communication Channel
 */
export const ChannelHealthStackedChart: React.FC<ChartsProps> = ({
  stations,
  isDark = true,
  onSelectChannelFilter,
}) => {
  const [hoveredChannel, setHoveredChannel] = useState<ChannelType | null>(null);

  const channelStats = useMemo(() => {
    return CHANNEL_ORDER.map((type) => {
      let ok = 0;
      let down = 0;
      let pending = 0;
      let na = 0;

      stations.forEach((st) => {
        st.channels.forEach((ch) => {
          if (ch.type !== type) return;
          if (ch.status === 'ok') ok++;
          else if (ch.status === 'down') down++;
          else if (ch.status === 'pending') pending++;
          else na++;
        });
      });

      const activeTotal = Math.max(1, ok + down + pending);
      const total = ok + down + pending + na;
      const healthPct = Math.round((ok / activeTotal) * 100);

      return {
        type,
        title: CHANNEL_TITLES[type],
        ok,
        down,
        pending,
        na,
        total,
        healthPct,
      };
    });
  }, [stations]);

  const cardSurface = isDark
    ? 'bg-[#0B1120]/90 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200/90 text-slate-900 shadow-sm';

  const subtleBarBg = isDark ? 'bg-[#050814] border-slate-800' : 'bg-slate-100 border-slate-200';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 transition-colors ${cardSurface}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Broadcast weight="duotone" className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
            <h3 className="text-sm sm:text-base font-extrabold">
              تحلیل تجمیعی سلامت کانال‌های ارتباطی (DTS · PLC · IP Phone)
            </h3>
          </div>
          <p className={`text-[11px] mt-1 ${mutedText}`}>
            تفکیک وضعیت برقرار، قطع/معیوب، در حال پیگیری و ناموجود در تمامی {toPersianDigits(stations.length)} پست و مرکز
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span className={mutedText}>برقرار (√)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
            <span className={mutedText}>قطع (X)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
            <span className={mutedText}>بررسی / پیگیری</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm inline-block ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
            <span className={mutedText}>ناموجود (*)</span>
          </span>
        </div>
      </div>

      {/* Stacked Bars */}
      <div className="space-y-4">
        {channelStats.map((row) => {
          const denom = Math.max(1, row.total);
          const okPct = (row.ok / denom) * 100;
          const downPct = (row.down / denom) * 100;
          const pendingPct = (row.pending / denom) * 100;
          const naPct = (row.na / denom) * 100;
          const isHovered = hoveredChannel === row.type;

          return (
            <div
              key={row.type}
              onMouseEnter={() => setHoveredChannel(row.type)}
              onMouseLeave={() => setHoveredChannel(null)}
              onClick={() => onSelectChannelFilter && onSelectChannelFilter(row.type)}
              className={`group rounded-xl p-2.5 -mx-2.5 transition-colors ${
                onSelectChannelFilter ? 'cursor-pointer' : ''
              } ${isHovered ? (isDark ? 'bg-slate-800/50' : 'bg-slate-50') : ''}`}
            >
              <div className="flex items-center justify-between gap-3 text-xs mb-2">
                <div className="flex items-center gap-2 font-bold">
                  <span>{row.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold tabular-nums ${
                      row.healthPct >= 80
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : row.healthPct >= 60
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {toPersianDigits(row.healthPct)}٪ آمادگی خطوط فعال
                  </span>
                </div>

                <div className={`flex items-center gap-3 text-[11px] tabular-nums ${mutedText}`}>
                  <span className="text-emerald-400 font-semibold">{toPersianDigits(row.ok)} برقرار</span>
                  <span className="text-rose-400 font-semibold">{toPersianDigits(row.down)} قطع</span>
                  {row.pending > 0 && (
                    <span className="text-amber-400 font-semibold">{toPersianDigits(row.pending)} پیگیری</span>
                  )}
                  <span className="hidden sm:inline">{toPersianDigits(row.na)} ناموجود</span>
                </div>
              </div>

              {/* Segmented Stacked Progress Bar */}
              <div className={`h-3.5 w-full rounded-lg overflow-hidden border flex ${subtleBarBg}`}>
                {row.ok > 0 && (
                  <div
                    style={{ width: `${okPct}%` }}
                    className="h-full bg-gradient-to-l from-emerald-500 to-cyan-400 transition-all duration-700"
                    title={`برقرار: ${toPersianDigits(row.ok)}`}
                  />
                )}
                {row.down > 0 && (
                  <div
                    style={{ width: `${downPct}%` }}
                    className="h-full bg-gradient-to-l from-rose-600 to-rose-400 transition-all duration-700"
                    title={`قطع: ${toPersianDigits(row.down)}`}
                  />
                )}
                {row.pending > 0 && (
                  <div
                    style={{ width: `${pendingPct}%` }}
                    className="h-full bg-amber-400 transition-all duration-700"
                    title={`در انتظار بررسی: ${toPersianDigits(row.pending)}`}
                  />
                )}
                {row.na > 0 && (
                  <div
                    style={{ width: `${naPct}%` }}
                    className={`h-full transition-all duration-700 ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`}
                    title={`ناموجود: ${toPersianDigits(row.na)}`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 2. Voltage Tier Readiness Bar & Comparative Chart
 */
export const VoltageTierReadinessChart: React.FC<ChartsProps> = ({
  stations,
  isDark = true,
  onSelectTierFilter,
}) => {
  const tierOrder: VoltageTier[] = ['400', '230', '132', '63', 'powerplant', 'control'];

  const tierMetrics = useMemo(() => {
    return tierOrder.map((tier) => {
      const list = stations.filter((s) => s.voltageTier === tier);
      let ok = 0;
      let down = 0;
      let totalActive = 0;

      list.forEach((s) => {
        s.channels.forEach((ch) => {
          if (ch.status === 'ok') {
            ok++;
            totalActive++;
          } else if (ch.status === 'down' || ch.status === 'pending') {
            if (ch.status === 'down') down++;
            totalActive++;
          }
        });
      });

      const pct = totalActive > 0 ? Math.round((ok / totalActive) * 100) : 0;
      const stationsWithFault = list.filter((s) => s.channels.some((c) => c.status === 'down')).length;

      return {
        tier,
        label: VOLTAGE_TIER_LABELS[tier],
        stationCount: list.length,
        ok,
        down,
        pct,
        stationsWithFault,
      };
    });
  }, [stations]);

  const cardSurface = isDark
    ? 'bg-[#0B1120]/90 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200/90 text-slate-900 shadow-sm';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';
  const itemBg = isDark
    ? 'bg-[#050814]/80 border-slate-800 hover:border-cyan-400/60'
    : 'bg-slate-50 border-slate-200 hover:border-indigo-500';

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 transition-colors ${cardSurface}`}>
      <div className="flex items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <TrendUp weight="duotone" className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
            <h3 className="text-sm sm:text-base font-extrabold">
              نرخ پایداری ارتباطات بر اساس سطح ولتاژ شبکه
            </h3>
          </div>
          <p className={`text-[11px] mt-1 ${mutedText}`}>
            مقایسه درصد برقراری ارتباطات حیاتی در پست‌های ۴۰۰، ۲۳۰، ۱۳۲، ۶۳ کیلوولت و نیروگاه‌ها
          </p>
        </div>
      </div>

      {/* Vertical Columns + Detailed Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {tierMetrics.map((m) => (
          <button
            key={m.tier}
            type="button"
            onClick={() => onSelectTierFilter && onSelectTierFilter(m.tier)}
            className={`rounded-xl border p-3.5 text-right flex flex-col justify-between gap-3 transition-all ${itemBg}`}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`text-[11px] font-bold tabular-nums ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
                {toPersianDigits(m.stationCount)} پست
              </span>
              {m.stationsWithFault > 0 ? (
                <span className="text-[10px] font-bold text-rose-400 tabular-nums">
                  {toPersianDigits(m.stationsWithFault)} خطا
                </span>
              ) : (
                <CheckCircle weight="duotone" className="w-4 h-4 text-emerald-400" />
              )}
            </div>

            {/* Vertical animated bar gauge */}
            <div className="h-24 w-full flex items-end justify-center px-3">
              <div
                className={`w-full h-full rounded-lg overflow-hidden flex flex-col justify-end ${
                  isDark ? 'bg-slate-800/80' : 'bg-slate-200/80'
                }`}
              >
                <div
                  style={{ height: `${m.pct}%` }}
                  className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 via-cyan-500 to-emerald-400 transition-all duration-700 relative"
                >
                  <span className="sr-only">{toPersianDigits(m.pct)}٪</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-lg font-black tabular-nums leading-none">
                {toPersianDigits(m.pct)}٪
              </div>
              <div className={`text-[11px] font-semibold leading-snug ${mutedText}`}>
                {m.label}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * 3. Fault Root-Cause Distribution Chart
 */
export const FaultRootCauseChart: React.FC<ChartsProps> = ({
  stations,
  isDark = true,
  onSelectCauseFilter,
  activeCauseFilter,
}) => {
  const buckets = useMemo(() => {
    const counts: Record<string, number> = {};
    FAULT_CAUSE_DEFINITIONS.forEach((d) => (counts[d.key] = 0));

    stations.forEach((st) => {
      st.channels.forEach((ch) => {
        if (ch.status === 'down' || ch.note.trim().length > 0) {
          const key = classifyFaultNote(ch.note);
          counts[key] = (counts[key] || 0) + 1;
        }
      });
    });

    return FAULT_CAUSE_DEFINITIONS.map((d) => ({
      ...d,
      count: counts[d.key] || 0,
    })).sort((a, b) => b.count - a.count);
  }, [stations]);

  const totalFaultEvents = Math.max(
    1,
    buckets.reduce((sum, b) => sum + b.count, 0)
  );

  const cardSurface = isDark
    ? 'bg-[#0B1120]/90 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200/90 text-slate-900 shadow-sm';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 transition-colors ${cardSurface}`}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldWarning weight="duotone" className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm sm:text-base font-extrabold">
              دسته‌بندی علل ریشه‌ای قطعی و اختلالات ثبت‌شده
            </h3>
          </div>
          <p className={`text-[11px] mt-1 ${mutedText}`}>
            استخراج هوشمند از یادداشت‌های فنی چک‌لیست ({toPersianDigits(totalFaultEvents)} مورد ثبت‌شده)
          </p>
        </div>

        {activeCauseFilter && onSelectCauseFilter && (
          <button
            type="button"
            onClick={() => onSelectCauseFilter(null)}
            className={`text-[11px] font-bold hover:underline ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}
          >
            پاک کردن فیلتر علت
          </button>
        )}
      </div>

      {/* Horizontal proportional stacked ribbon */}
      <div className={`h-3 w-full rounded-full overflow-hidden flex mb-5 ${isDark ? 'bg-[#050814]' : 'bg-slate-200'}`}>
        {buckets.map((b) => {
          const pct = (b.count / totalFaultEvents) * 100;
          if (b.count === 0) return null;
          return (
            <div
              key={b.key}
              style={{ width: `${pct}%`, backgroundColor: b.color }}
              className="h-full transition-all duration-500"
              title={`${b.label}: ${toPersianDigits(b.count)} مورد`}
            />
          );
        })}
      </div>

      <div className="space-y-2.5">
        {buckets.map((b) => {
          const pct = Math.round((b.count / totalFaultEvents) * 100);
          const isSelected = activeCauseFilter === b.key;
          return (
            <button
              key={b.key}
              type="button"
              onClick={() => onSelectCauseFilter && onSelectCauseFilter(isSelected ? null : b.key)}
              className={`w-full text-right rounded-xl p-2.5 border transition-all flex items-center justify-between gap-3 ${
                isSelected
                  ? isDark
                    ? 'border-cyan-400 bg-cyan-500/12'
                    : 'border-indigo-500 bg-indigo-50'
                  : isDark
                  ? 'border-slate-800 bg-[#050814]/70 hover:border-slate-700'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: b.color }}
                />
                <span className="text-xs font-bold truncate">{b.label}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0 tabular-nums">
                <span className={`text-[11px] ${mutedText}`}>{toPersianDigits(pct)}٪</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-extrabold ${
                    isDark ? 'bg-slate-800 text-slate-100' : 'bg-slate-200 text-slate-900'
                  }`}
                >
                  {toPersianDigits(b.count)} مورد
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 4. Overall Network Communication Health Radial + Telemetry Summary Card
 */
export const NetworkReadinessSummaryCard: React.FC<{ stations: StationCommunication[]; isDark?: boolean }> = ({
  stations,
  isDark = true,
}) => {
  const stats = useMemo(() => {
    let ok = 0;
    let down = 0;
    let pending = 0;
    let fullyHealthyStations = 0;

    stations.forEach((st) => {
      let stHasDown = false;
      st.channels.forEach((ch) => {
        if (ch.status === 'ok') ok++;
        else if (ch.status === 'down') {
          down++;
          stHasDown = true;
        } else if (ch.status === 'pending') {
          pending++;
        }
      });
      if (!stHasDown) fullyHealthyStations++;
    });

    const active = Math.max(1, ok + down + pending);
    const readiness = Math.round((ok / active) * 100);
    return { ok, down, pending, fullyHealthyStations, readiness };
  }, [stations]);

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (stats.readiness / 100) * circumference;

  const cardSurface = isDark
    ? 'bg-[#0B1120]/90 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200/90 text-slate-900 shadow-sm';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 flex flex-col justify-between gap-4 transition-colors ${cardSurface}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Pulse weight="duotone" className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
            <h3 className="text-sm sm:text-base font-extrabold">شاخص کل آمادگی مخابراتی</h3>
          </div>
          <p className={`text-[11px] mt-1 ${mutedText}`}>
            نسبت خطوط برقرار به کل کانال‌های تعریف‌شده شبکه
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-5 py-2">
        {/* Radial Progress SVG */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 108 108">
            <circle
              cx="54"
              cy="54"
              r={radius}
              strokeWidth="10"
              fill="none"
              className={isDark ? 'stroke-slate-800' : 'stroke-slate-200'}
            />
            <circle
              cx="54"
              cy="54"
              r={radius}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              stroke="url(#tavanbanGrad)"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="tavanbanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="55%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black tabular-nums">{toPersianDigits(stats.readiness)}٪</span>
            <span className={`text-[10px] font-semibold ${mutedText}`}>پایداری</span>
          </div>
        </div>

        {/* Metrics List */}
        <div className="flex-1 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className={mutedText}>پست‌های بدون قطعی:</span>
            <span className={`font-extrabold tabular-nums ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {toPersianDigits(stats.fullyHealthyStations)} از {toPersianDigits(stations.length)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={mutedText}>کانال‌های برقرار (√):</span>
            <span className="font-extrabold tabular-nums">{toPersianDigits(stats.ok)} خط</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={mutedText}>کانال‌های قطع (X):</span>
            <span className="font-extrabold text-rose-400 tabular-nums">{toPersianDigits(stats.down)} خط</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={mutedText}>نیازمند پیگیری فنی:</span>
            <span className={`font-extrabold tabular-nums ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              {toPersianDigits(stats.pending)} مورد
            </span>
          </div>
        </div>
      </div>

      {/* Mini Live Sparkline Bar */}
      <div className={`pt-3 border-t flex items-center justify-between text-[11px] ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <span className={`flex items-center gap-1.5 ${mutedText}`}>
          <Warning weight="duotone" className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`} />
          آخرین بازبینی چک‌لیست: ۱۴۰۵/۰۶/۰۱
        </span>
        <span className={`font-bold tabular-nums ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
          {toPersianDigits(stations.length)} مرکز فعال
        </span>
      </div>
    </div>
  );
};
