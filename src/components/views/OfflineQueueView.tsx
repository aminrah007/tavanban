/**
 * OfflineQueueView
 * IndexedDB/SyncQueue simulator with Idempotency Key validation and exponential backoff
 */

import React from 'react';
import { CloudOff, RefreshCw, CheckCircle2, Wifi, WifiOff, Key, Database } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/formatters';

export const OfflineQueueView: React.FC = () => {
  const { syncQueue, processSyncQueue, isOnline, setIsOnline } = useApp();

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <CloudOff className="w-5 h-5 text-amber-400" />
            <span>صف همگام‌سازی آفلاین (Sync Queue & Idempotency)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            پشتیبانی از ثبت عملیات در محیط‌های فاقد آنتن‌دهی (پست‌های فوق توزیع دورافتاده) با تضمین عدم ثبت تکراری
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isOnline
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                : 'bg-rose-950/40 text-rose-300 border-rose-500/40 hover:bg-rose-900/40'
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isOnline ? 'تغییر وضعیت به آفلاین' : 'تغییر وضعیت به آنلاین'}</span>
          </button>

          <button
            onClick={processSyncQueue}
            disabled={!isOnline || syncQueue.length === 0}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-[0_0_16px_rgba(245,158,11,0.3)]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>ارسال و همگام‌سازی دستی</span>
          </button>
        </div>
      </div>

      {/* Architecture details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 bg-slate-900/60 text-xs space-y-1">
          <span className="text-slate-400 block">پایگاه داده محلی مرورگر:</span>
          <div className="font-bold text-white text-sm flex items-center gap-1.5">
            <Database className="w-4 h-4 text-amber-400" />
            <span>IndexedDB (TavanBanCache_v1)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 bg-slate-900/60 text-xs space-y-1">
          <span className="text-slate-400 block">کلید یکتا ضدتکرار (Idempotency):</span>
          <div className="font-bold text-white text-sm flex items-center gap-1.5">
            <Key className="w-4 h-4 text-sky-400" />
            <span>UUID v4 + SHA-256 Signature</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 bg-slate-900/60 text-xs space-y-1">
          <span className="text-slate-400 block">استراتژی ارسال مجدد:</span>
          <div className="font-bold text-white text-sm flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Exponential Backoff with Jitter</span>
          </div>
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-3">
        {syncQueue.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 glass-panel rounded-2xl border border-slate-800">
            صف همگام‌سازی خالی است. تمام داده‌ها با سرور مرکزی همگام هستند.
          </div>
        ) : (
          syncQueue.map((item) => (
            <div
              key={item._id}
              className="p-4 rounded-2xl glass-panel border border-slate-800 bg-slate-900/60 text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold">{toPersianDigits(item._id)}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {item.method} {item.endpoint}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                کلید یکتا (Idempotency Key): {toPersianDigits(item.idempotencyKey)}
              </div>
              <div className="text-[11px] text-slate-300">
                شرح محتوا: {item.payload?.description || 'بدون توضیحات'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
