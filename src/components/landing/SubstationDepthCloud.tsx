/**
 * SubstationDepthCloud.tsx
 * Signature OmniRoute-inspired 3D Spatial Parallax Cloud of Electrical Substations.
 * Uses vibrant multi-toned Phosphor Duotone emblems per voltage tier (400kV/230kV/132kV/63kV/PowerPlant/Control)
 * arranged across 3 Z-depth planes with smooth pointer parallax.
 */

import React, { useMemo, useRef, useState } from 'react';
import {
  Broadcast,
  Lightning,
  Buildings,
  Cpu,
  PlugsConnected,
  Pulse,
  ArrowUpLeft,
} from '@phosphor-icons/react';
import { StationCommunication, VoltageTier } from '../../data/stationsChecklist';
import { toPersianDigits } from '../../utils/formatters';

interface SubstationDepthCloudProps {
  stations: StationCommunication[];
  isDark?: boolean;
  onSelectStation: (stationId: string) => void;
  onOpenAllStations: () => void;
}

interface CloudNodeLayout {
  stationId: string;
  top: string;
  left: string;
  depth: 1 | 2 | 3; // 1 = foreground sharp, 2 = midground, 3 = background distant blur
}

const CLOUD_LAYOUT_COORDS: CloudNodeLayout[] = [
  // Foreground sharp layer (depth 1)
  { stationId: 'st-nabovat-400', top: '14%', left: '54%', depth: 1 },
  { stationId: 'st-zahedan-230', top: '24%', left: '36%', depth: 1 },
  { stationId: 'st-chabahar-230', top: '34%', left: '72%', depth: 1 },
  { stationId: 'st-sefid-abeh-400', top: '48%', left: '52%', depth: 1 },
  { stationId: 'st-eaoc', top: '57%', left: '34%', depth: 1 },
  { stationId: 'st-adimi-400', top: '65%', left: '70%', depth: 1 },
  { stationId: 'st-iranshahr-230', top: '76%', left: '50%', depth: 1 },
  { stationId: 'st-milnader-400', top: '22%', left: '76%', depth: 1 },
  { stationId: 'st-konarak-p-p', top: '52%', left: '16%', depth: 1 },
  { stationId: 'st-saravan-230', top: '80%', left: '25%', depth: 1 },

  // Midground layer (depth 2)
  { stationId: 'st-khash-230', top: '12%', left: '26%', depth: 2 },
  { stationId: 'st-scc', top: '26%', left: '62%', depth: 2 },
  { stationId: 'st-bampour-230', top: '39%', left: '42%', depth: 2 },
  { stationId: 'st-nikshahr-230', top: '44%', left: '84%', depth: 2 },
  { stationId: 'st-zahedan-p-p', top: '60%', left: '60%', depth: 2 },
  { stationId: 'st-pishin-132', top: '70%', left: '38%', depth: 2 },
  { stationId: 'st-zabol-1-63', top: '82%', left: '78%', depth: 2 },
  { stationId: 'st-mirjaveh-230', top: '18%', left: '8%', depth: 2 },
  { stationId: 'st-gharb-63', top: '66%', left: '10%', depth: 2 },
  { stationId: 'st-chabahar-c-c', top: '86%', left: '58%', depth: 2 },

  // Background distant depth layer (depth 3)
  { stationId: 'st-loutak-230', top: '8%', left: '44%', depth: 3 },
  { stationId: 'st-jakiguor-230', top: '32%', left: '18%', depth: 3 },
  { stationId: 'st-polan-230', top: '41%', left: '65%', depth: 3 },
  { stationId: 'st-zarabad-230', top: '52%', left: '86%', depth: 3 },
  { stationId: 'st-machkour-230', top: '72%', left: '88%', depth: 3 },
  { stationId: 'st-koteij-132', top: '36%', left: '4%', depth: 3 },
  { stationId: 'st-fanouj-230', top: '76%', left: '14%', depth: 3 },
  { stationId: 'st-dashtak-230', top: '14%', left: '68%', depth: 3 },
  { stationId: 'st-nosratabad-63', top: '88%', left: '41%', depth: 3 },
];

export const SubstationDepthCloud: React.FC<SubstationDepthCloudProps> = ({
  stations,
  isDark = true,
  onSelectStation,
  onOpenAllStations,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [hoveredStationId, setHoveredStationId] = useState<string | null>(null);

  const stationMap = useMemo(() => {
    const map = new Map<string, StationCommunication>();
    stations.forEach((s) => map.set(s.id, s));
    return map;
  }, [stations]);

  const nodes = useMemo(() => {
    return CLOUD_LAYOUT_COORDS.map((coord) => {
      const station = stationMap.get(coord.stationId);
      if (!station) return null;
      const downCount = station.channels.filter((c) => c.status === 'down').length;
      const okCount = station.channels.filter((c) => c.status === 'ok').length;
      return { ...coord, station, downCount, okCount };
    }).filter((n): n is NonNullable<typeof n> => n !== null);
  }, [stationMap]);

  const hoveredNode = useMemo(
    () => nodes.find((n) => n.station.id === hoveredStationId) || null,
    [nodes, hoveredStationId]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
    setPointer({ x: nx, y: ny });
  };

  const getTierVisual = (tier: VoltageTier, hasFault: boolean) => {
    if (hasFault) {
      return {
        Icon: tier === '400' ? Lightning : tier === '230' ? Broadcast : tier === 'powerplant' ? Cpu : Buildings,
        badgeCls: isDark
          ? 'bg-rose-500/20 text-rose-400 border-rose-500/35'
          : 'bg-rose-50 text-rose-600 border-rose-200',
      };
    }
    switch (tier) {
      case '400':
        return {
          Icon: Lightning,
          badgeCls: isDark
            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
            : 'bg-cyan-50 text-cyan-700 border-cyan-200',
        };
      case '230':
        return {
          Icon: Broadcast,
          badgeCls: isDark
            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/35'
            : 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case '132':
        return {
          Icon: PlugsConnected,
          badgeCls: isDark
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'powerplant':
        return {
          Icon: Cpu,
          badgeCls: isDark
            ? 'bg-orange-500/20 text-orange-300 border-orange-400/35'
            : 'bg-orange-50 text-orange-700 border-orange-200',
        };
      case 'control':
        return {
          Icon: Pulse,
          badgeCls: isDark
            ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/35'
            : 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
        };
      default:
        return {
          Icon: Buildings,
          badgeCls: isDark
            ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
            : 'bg-amber-50 text-amber-700 border-amber-200',
        };
    }
  };

  return (
    <section
      id="substations-cloud"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setPointer({ x: 0, y: 0 });
        setHoveredStationId(null);
      }}
      ref={containerRef}
      className={`relative rounded-3xl border overflow-hidden transition-colors duration-300 ${
        isDark
          ? 'bg-[#060A17] border-slate-800 text-slate-100 shadow-[0_32px_90px_-30px_rgba(0,0,0,0.9)]'
          : 'bg-white border-slate-200/90 text-slate-900 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.12)]'
      }`}
    >
      {/* Electric Cyan, Hyper Indigo & Solar Gold Ambient Aura */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${
          isDark ? 'omni-dark-aura' : 'omni-light-aura'
        }`}
      />

      {/* Section Header Row */}
      <div className="relative z-20 px-6 sm:px-10 pt-7 pb-3 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <span className={`text-xs font-bold block ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
            ۰۱. نقشه فضایی پست‌های تحت پوشش شبکه
          </span>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight">
            اتصال یکپارچه {toPersianDigits(stations.length)} پست انتقال، فوق‌توزیع و مرکز کنترل
          </h2>
          <p className={`text-xs sm:text-sm max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            برای مشاهده جزئیات ارتباطات DTS، خطوط PLC، تلفن داخلی و ثبت گزارش کار، روی هر ایستگاه کلیک کنید.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAllStations}
          className={`px-4 py-2.5 rounded-xl border text-xs font-bold inline-flex items-center gap-2 transition-all shrink-0 ${
            isDark
              ? 'border-slate-700 bg-[#0B1120]/90 hover:bg-cyan-400 hover:border-cyan-400 hover:text-slate-950 text-slate-100'
              : 'border-slate-200 bg-slate-50 hover:bg-indigo-600 hover:border-indigo-600 text-slate-800 hover:text-white'
          }`}
        >
          <span>مشاهده جدول کامل ارتباطات پست‌ها</span>
          <ArrowUpLeft weight="bold" className="w-4 h-4" />
        </button>
      </div>

      {/* 3D Depth Cloud Stage */}
      <div className="relative h-[460px] sm:h-[520px] w-full overflow-hidden select-none">
        {/* Giant Focal Count Watermark */}
        <div
          aria-hidden="true"
          style={{
            transform: `translate3d(${pointer.x * -10}px, ${pointer.y * -8}px, 0)`,
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="pointer-events-none absolute inset-0 flex items-center justify-start px-10 sm:px-20 z-10"
        >
          <div
            className={`text-[96px] sm:text-[148px] lg:text-[180px] font-black tracking-tighter leading-none tabular-nums ${
              isDark ? 'text-slate-700/35' : 'text-slate-900/10'
            }`}
          >
            {toPersianDigits(stations.length)}+
          </div>
        </div>

        {/* Floating Substation Chips distributed in 3 depth tiers */}
        <div className="hidden md:block absolute inset-0">
          {nodes.map((node) => {
            const { Icon, badgeCls } = getTierVisual(node.station.voltageTier, node.downCount > 0);
            const isHovered = hoveredStationId === node.station.id;

            // Parallax multiplier by depth layer
            const factor = node.depth === 1 ? 22 : node.depth === 2 ? 12 : 5;
            const tx = pointer.x * factor;
            const ty = pointer.y * factor;

            const depthStyles =
              node.depth === 1
                ? isDark
                  ? 'z-30 bg-[#0C1324]/92 border-slate-700/90 text-slate-100 shadow-[0_16px_36px_-10px_rgba(0,0,0,0.85)] opacity-100 scale-100'
                  : 'z-30 bg-white/95 border-slate-200 text-slate-900 shadow-[0_14px_30px_-12px_rgba(15,23,42,0.16)] opacity-100 scale-100'
                : node.depth === 2
                ? isDark
                  ? 'z-20 bg-[#0B1120]/80 border-slate-800/90 text-slate-300 opacity-85 scale-[0.93]'
                  : 'z-20 bg-white/85 border-slate-200/80 text-slate-700 opacity-85 scale-[0.93]'
                : isDark
                ? 'z-10 bg-[#070B18]/65 border-slate-800/60 text-slate-500 opacity-55 scale-[0.84] blur-[0.7px]'
                : 'z-10 bg-slate-100/75 border-slate-200/60 text-slate-500 opacity-60 scale-[0.84] blur-[0.7px]';

            return (
              <button
                key={node.station.id}
                type="button"
                onClick={() => onSelectStation(node.station.id)}
                onMouseEnter={() => setHoveredStationId(node.station.id)}
                onMouseLeave={() => setHoveredStationId(null)}
                style={{
                  top: node.top,
                  left: node.left,
                  transform: `translate(-50%, -50%) translate3d(${tx}px, ${ty}px, 0) ${
                    isHovered ? 'scale(1.09)' : ''
                  }`,
                  transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s, border-color 0.2s, box-shadow 0.2s, filter 0.2s',
                }}
                className={`absolute rounded-xl border px-2.5 py-1.5 flex items-center gap-2 whitespace-nowrap cursor-pointer hover:z-40 hover:opacity-100 hover:blur-none ${
                  isDark
                    ? 'hover:border-cyan-400/80 hover:shadow-[0_0_24px_rgba(34,211,238,0.22)]'
                    : 'hover:border-indigo-500 hover:shadow-[0_12px_28px_-8px_rgba(79,70,229,0.25)]'
                } ${depthStyles}`}
              >
                <span className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${badgeCls}`}>
                  <Icon weight="duotone" className="w-3.5 h-3.5" />
                </span>
                <span dir="ltr" className="text-xs font-bold tracking-tight">
                  {node.station.name}
                </span>
                {node.station.dispatchCode && node.depth === 1 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                      isDark
                        ? 'bg-slate-800/90 text-cyan-300'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {toPersianDigits(node.station.dispatchCode)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile / Compact View Responsive Grid */}
        <div className="md:hidden relative z-20 px-5 pb-6 grid grid-cols-2 gap-2.5 h-full overflow-y-auto pt-4">
          {nodes.slice(0, 14).map((node) => {
            const { Icon, badgeCls } = getTierVisual(node.station.voltageTier, node.downCount > 0);
            return (
              <button
                key={node.station.id}
                type="button"
                onClick={() => onSelectStation(node.station.id)}
                className={`rounded-xl border p-2.5 text-right flex items-center justify-between gap-2 ${
                  isDark
                    ? 'bg-[#0C1324]/90 border-slate-800 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="min-w-0">
                  <div dir="ltr" className="text-xs font-bold truncate text-right">
                    {node.station.name}
                  </div>
                  <div className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {node.station.persianName}
                  </div>
                </div>
                <span className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${badgeCls}`}>
                  <Icon weight="duotone" className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Station Inspector HUD Bar at bottom of Cloud */}
        <div
          className={`hidden md:flex absolute bottom-4 left-6 right-6 z-40 rounded-xl border px-4 py-2.5 items-center justify-between gap-4 text-xs transition-all backdrop-blur-md ${
            isDark
              ? 'bg-[#0B1120]/90 border-slate-800 text-slate-300'
              : 'bg-white/95 border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          {hoveredNode ? (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <span className={`font-black ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
                  {hoveredNode.station.persianName}
                </span>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>({hoveredNode.station.name})</span>
                {hoveredNode.station.dispatchCode && (
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold tabular-nums ${
                      isDark ? 'bg-cyan-500/15 text-cyan-300' : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    کد دیسپاچینگ: {toPersianDigits(hoveredNode.station.dispatchCode)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 tabular-nums">
                <span className={isDark ? 'text-emerald-400 font-bold' : 'text-emerald-600 font-bold'}>
                  {toPersianDigits(hoveredNode.okCount)} خط برقرار
                </span>
                {hoveredNode.downCount > 0 && (
                  <span className="text-rose-400 font-bold">
                    {toPersianDigits(hoveredNode.downCount)} خط قطع
                  </span>
                )}
                <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                  برای باز کردن چک‌لیست کلیک کنید ←
                </span>
              </div>
            </>
          ) : (
            <>
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                نشانگر ماوس را روی پست‌های شبکه حرکت دهید تا نمای سه‌بعدی و وضعیت ارتباطات لحظه‌ای هر ایستگاه نمایش داده شود.
              </span>
              <div className="flex items-center gap-4 shrink-0 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>۴۰۰ کیلوولت</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>۲۳۰ کیلوولت</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>ارتباط پایدار</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>دارای خط قطع</span>
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
