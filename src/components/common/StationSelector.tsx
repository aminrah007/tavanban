/**
 * StationSelector.tsx
 * Searchable selector for "محل انجام کار" (Substation / Power Plant / Control Center)
 * Populated with all 107 stations & dispatching codes from the communications checklist.
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, Search, ChevronDown, X } from 'lucide-react';
import { StationCommunication, VOLTAGE_TIER_LABELS } from '../../data/stationsChecklist';
import { toPersianDigits } from '../../utils/formatters';

interface StationSelectorProps {
  stations: StationCommunication[];
  value?: string;
  onChange: (station: StationCommunication | null) => void;
  label?: string;
  placeholder?: string;
}

export const StationSelector: React.FC<StationSelectorProps> = ({
  stations,
  value,
  onChange,
  label = 'محل انجام کار (پست برق / مرکز کنترل):',
  placeholder = 'انتخاب یا جستجوی پست برق (مثال: زاهدان ۲۳۰، نبوت ۴۰۰، کد ۱۰۰۱)...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedStation = useMemo(
    () => stations.find((s) => s.id === value) || null,
    [stations, value]
  );

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const filteredStations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stations;
    return stations.filter(
      (s) =>
        s.persianName.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.dispatchCode.toLowerCase().includes(q)
    );
  }, [stations, query]);

  return (
    <div ref={containerRef} className="relative text-right">
      {label && (
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-amber-500/60 text-xs text-white focus:outline-none focus:border-amber-400 flex items-center justify-between gap-2 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          {selectedStation ? (
            <span className="truncate font-semibold text-white">
              {selectedStation.persianName}{' '}
              <span className="text-slate-400 font-normal">({selectedStation.name})</span>
              {selectedStation.dispatchCode && (
                <span className="mr-1.5 text-amber-400 font-bold">
                  · کد {toPersianDigits(selectedStation.dispatchCode)}
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-400 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedStation && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  onChange(null);
                }
              }}
              className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
              title="حذف انتخاب محل"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 rounded-xl bg-slate-950 border border-slate-700 shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-slate-800 relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی نام پست، نام لاتین یا کد دیسپاچینگ..."
              className="w-full pr-3 pl-8 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 text-right"
              autoFocus
            />
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/50">
            {filteredStations.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                پستی با این مشخصات یافت نشد.
              </div>
            ) : (
              filteredStations.map((st) => {
                const isSelected = st.id === value;
                const downCount = st.channels.filter((c) => c.status === 'down').length;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      onChange(st);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className={`w-full px-3 py-2 text-right hover:bg-slate-900 transition-colors flex items-center justify-between gap-2 ${
                      isSelected ? 'bg-amber-500/15' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-100 truncate">
                        {st.persianName}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{st.name}</span>
                        <span>·</span>
                        <span>{VOLTAGE_TIER_LABELS[st.voltageTier]}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {downCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                          {toPersianDigits(downCount)} خط قطع
                        </span>
                      )}
                      {st.dispatchCode && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold tabular-nums">
                          {toPersianDigits(st.dispatchCode)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
