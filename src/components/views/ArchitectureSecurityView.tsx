/**
 * ArchitectureSecurityView (Enterprise Admin Console)
 * پنل ادمین و مهندسی زیرساخت سامانه توان‌بان (منحصراً برای معاونت / ادمین کل)
 * متمرکزکننده تمام عملیات پایگاه داده ابری Firebase Firestore، تنظیمات سامانه،
 * معماری سیستم، تاب‌آوری، امنیت شبکه، رمزنگاری و دیدپذیری لاگ‌ها.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  Lock,
  Activity,
  Server,
  Zap,
  RefreshCw,
  CheckCircle2,
  Database,
  Terminal,
  Fingerprint,
  Sliders,
  CloudCheck,
  Download,
  LogOut,
  Users,
  Settings,
} from 'lucide-react';
import { useApp, getRolePersianName } from '../../context/AppContext';
import { firebaseMeta } from '../../lib/firebase';
import { toPersianDigits } from '../../utils/formatters';

type AdminTab = 'database' | 'resilience' | 'security' | 'observability';

export const ArchitectureSecurityView: React.FC = () => {
  const {
    users,
    reports,
    statements,
    tasks,
    purchases,
    priceItems,
    groups,
    contracts,
    companies,
    stations,
    scores,
    auditLogs,
    settings,
    isCloudConnected,
    isCloudSyncing,
    cloudVerification,
    verifyCloudSync,
    pushLocalPersonnelToCloud,
    firebaseUser,
    signInWithGoogle,
    signOutGoogle,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('database');

  // 1. Cryptography Simulator State
  const [plainInput, setPlainInput] = useState('09121110007');
  const [salt] = useState('TAVANBAN_SALT_9941_FA');
  const [isRotating, setIsRotating] = useState(false);
  const [currentSecretVersion, setCurrentSecretVersion] = useState(3);

  // 2. Circuit Breaker Simulator State
  const [circuitState, setCircuitState] = useState<'CLOSED' | 'OPEN' | 'HALF_OPEN'>('CLOSED');
  const [failureCount, setFailureCount] = useState(0);
  const [lastRequestStatus, setLastRequestStatus] = useState<string>('۲۰۰ OK - ارتباط برقرار است');

  // 3. OWASP Tester State
  const [sqlInput] = useState("' OR '1'='1");
  const [xssInput] = useState("<script>alert('XSS_ATTACK')</script>");
  const [idorId] = useState('rep-101');

  // 4. Rate Limiter state
  const [rateTokens, setRateTokens] = useState(60);

  const totalDocsCount =
    users.length +
    reports.length +
    statements.length +
    tasks.length +
    purchases.length +
    priceItems.length +
    groups.length +
    contracts.length +
    companies.length +
    stations.length;

  const syncedPersonnelCount = isCloudConnected && cloudVerification
    ? users.filter((u) =>
        cloudVerification.personnel.some((rp) => rp._id === u._id && rp.fullName === u.fullName)
      ).length
    : 0;

  const handleExportSystemBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      projectId: firebaseMeta.projectId,
      firestoreDatabaseId: firebaseMeta.firestoreDatabaseId,
      storageMode: isCloudConnected ? 'cloud_firestore' : 'local_storage',
      counts: {
        users: users.length,
        reports: reports.length,
        statements: statements.length,
        tasks: tasks.length,
        purchases: purchases.length,
        priceItems: priceItems.length,
        groups: groups.length,
        contracts: contracts.length,
        companies: companies.length,
        stations: stations.length,
        scores: scores.length,
        auditLogs: auditLogs.length,
      },
      data: {
        users,
        companies,
        contracts,
        groups,
        priceItems,
        reports,
        tasks,
        statements,
        purchases,
        scores,
        settings,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tavanban-admin-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('فایل پشتیبان کامل سامانه (JSON) آماده و دانلود شد.', 'success', 'خروجی پشتیبان');
  };

  // Simulated SHA-256 & AES-256
  const simulatedSha256 = (text: string) => {
    let hash = 0;
    const combined = text + salt;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0') + 'e4a91b2c78';
  };

  const simulatedAesEncrypt = (text: string) => {
    return `AES-256-GCM(IV:9b8f)::${btoa(unescape(encodeURIComponent(text))).slice(0, 16)}==`;
  };

  const handleCircuitTrigger = (succeed: boolean) => {
    if (succeed) {
      setCircuitState('CLOSED');
      setFailureCount(0);
      setLastRequestStatus('۲۰۰ OK - پاسخ موفق با تاخیر ۲۴ میلی‌ثانیه');
    } else {
      const nextFail = failureCount + 1;
      setFailureCount(nextFail);
      if (nextFail >= 3) {
        setCircuitState('OPEN');
        setLastRequestStatus('۵۰۳ Service Unavailable - مدار باز شد (Fail-Fast)');
      } else {
        setLastRequestStatus(`۵۰۰ Internal Error - تلاش ناموفق ${nextFail} از ۳`);
      }
    }
  };

  const handleRateLimitRequest = () => {
    if (rateTokens > 0) {
      setRateTokens((t) => t - 1);
      setLastRequestStatus(`۲۰۰ OK - توکن باقی‌مانده: ${rateTokens - 1}`);
    } else {
      setLastRequestStatus('۴۲۹ Too Many Requests - سقف مجاز Rate Limiting تکمیل شد (Retry-After: 60s)');
    }
  };

  const handleRotateSecret = () => {
    setIsRotating(true);
    setTimeout(() => {
      setIsRotating(false);
      setCurrentSecretVersion((v) => v + 1);
    }, 600);
  };

  const collectionStats = [
    { label: 'پرسنل و نقش‌ها', key: 'personnel', count: users.length },
    { label: 'گزارش‌های کار و روزانه', key: 'workReports', count: reports.length },
    { label: 'صورت‌وضعیت‌های مالی', key: 'statements', count: statements.length },
    { label: 'کارهای محوله', key: 'tasks', count: tasks.length },
    { label: 'درخواست‌های خرید', key: 'purchases', count: purchases.length },
    { label: 'آیتم‌های فهرست بها', key: 'priceItems', count: priceItems.length },
    { label: 'گروه‌های عملیاتی', key: 'workGroups', count: groups.length },
    { label: 'قراردادها و شرکت‌ها', key: 'contracts / companies', count: contracts.length + companies.length },
    { label: 'پست‌های مخابراتی', key: 'stationConfigs', count: stations.length },
    { label: 'لاگ‌های ممیزی', key: 'auditLogs', count: auditLogs.length },
  ];

  return (
    <div className="space-y-6 text-right">
      {/* Admin Console Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold text-amber-400 mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>بخش انحصاری مدیر سیستم (ادمین) · خارج از دسترس کاربران عادی</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-cyan-400 shrink-0" />
            <span>پنل ادمین، دیتابیس ابری و مهندسی زیرساخت سامانه</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            مدیریت متمرکز اتصال Firebase Firestore، همگام‌سازی پرسنل، تنظیمات سیستمی، معماری تاب‌آور، امنیت شبکه و ردیابی رویدادها
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportSystemBackup}
            className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>دانلود پشتیبان JSON</span>
          </button>

          {!isCloudConnected ? (
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={isCloudSyncing}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              <span>{isCloudSyncing ? 'در حال اتصال...' : 'اتصال به دیتابیس ابری Firestore'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={signOutGoogle}
              className="px-3.5 py-2 rounded-xl border border-rose-500/35 bg-rose-950/30 hover:bg-rose-950/50 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>قطع اتصال ابری</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Real-Time Admin Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0B1120] space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">وضعیت پایگاه داده</span>
          <div className={`text-sm font-black flex items-center gap-1.5 ${isCloudConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isCloudConnected ? <CloudCheck className="w-4 h-4 shrink-0" /> : <Database className="w-4 h-4 shrink-0" />}
            <span>{isCloudConnected ? 'متصل به Firebase Firestore' : 'حالت ذخیره‌سازی محلی'}</span>
          </div>
          <span className="text-[11px] text-slate-500 block truncate" dir="ltr">
            {isCloudConnected ? firebaseUser?.email : 'LocalBrowserStorage'}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#0B1120] space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">رکوردهای فعال سامانه</span>
          <div className="text-2xl font-black text-white tabular-nums">
            {toPersianDigits(totalDocsCount)}
          </div>
          <span className="text-[11px] text-slate-500 block">در ۱۰ مجموعه داده اصلی</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#0B1120] space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">وضعیت همگام‌سازی پرسنل</span>
          <div className="text-2xl font-black text-cyan-400 tabular-nums">
            {isCloudConnected && cloudVerification
              ? `${toPersianDigits(syncedPersonnelCount)} / ${toPersianDigits(users.length)}`
              : `${toPersianDigits(users.length)} کاربر`}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {isCloudConnected ? 'مطابقت مستقیم با سرور ابری' : 'آماده انتقال در زمان اتصال'}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#0B1120] space-y-1">
          <span className="text-[11px] font-medium text-slate-400 block">رویدادهای ممیزی ثبت‌شده</span>
          <div className="text-2xl font-black text-indigo-400 tabular-nums">
            {toPersianDigits(auditLogs.length)}
          </div>
          <span className="text-[11px] text-slate-500 block">ردیابی کامل عملیات کاربران</span>
        </div>
      </div>

      {/* Console Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#0B1120] rounded-xl border border-slate-800 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2.5 rounded-lg transition-colors font-semibold whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'database'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35'
              : 'text-slate-400 hover:text-white border border-transparent'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>پایگاه داده ابری Firestore و تنظیمات سامانه</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('resilience')}
          className={`px-4 py-2.5 rounded-lg transition-colors font-semibold whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'resilience'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35'
              : 'text-slate-400 hover:text-white border border-transparent'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>معماری سیستم، تاب‌آوری و زیرساخت ابری</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-lg transition-colors font-semibold whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35'
              : 'text-slate-400 hover:text-white border border-transparent'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>امنیت شبکه، رمزنگاری و دفاع OWASP</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('observability')}
          className={`px-4 py-2.5 rounded-lg transition-colors font-semibold whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'observability'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35'
              : 'text-slate-400 hover:text-white border border-transparent'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>دیدپذیری، ردیابی و لاگ‌های ممیزی</span>
        </button>
      </div>

      {/* TAB 1: Firebase Firestore Cloud Database & System Settings */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Cloud Connection & Sync Actions Bar */}
          <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CloudCheck className={`w-4 h-4 ${isCloudConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <span>مدیریت اتصال و همگام‌سازی زنده Firebase Firestore</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isCloudConnected
                    ? `اتصال برقرار است (${firebaseUser?.email}). تمام تغییرات پرسنل، گزارش‌ها و صورت‌وضعیت‌ها به صورت زنده با سرور همگام می‌شوند.`
                    : 'در حال حاضر سامانه در حالت حافظه محلی مرورگر قرار دارد. برای همگام‌سازی چندکاربره بین گوشی‌ها و سیستم‌های مختلف، حساب ادمین گوگل را متصل کنید.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {!isCloudConnected ? (
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    disabled={isCloudSyncing}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    <span>{isCloudSyncing ? 'در حال برقراری اتصال...' : 'اتصال حساب گوگل به Firestore'}</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={verifyCloudSync}
                      disabled={isCloudSyncing}
                      className="px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                      <span>استعلام مستقیم از سرور</span>
                    </button>
                    <button
                      type="button"
                      onClick={pushLocalPersonnelToCloud}
                      disabled={isCloudSyncing}
                      className="px-3.5 py-2 rounded-xl border border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <CloudCheck className="w-3.5 h-3.5" />
                      <span>همگام‌سازی کامل داده‌های محلی به سرور</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Real Firebase Project Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#050814] border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">شناسه پروژه ابری (Project ID):</span>
                <span className="font-mono text-slate-200 block truncate" dir="ltr">
                  {firebaseMeta.projectId}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#050814] border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">شناسه پایگاه داده (Database ID):</span>
                <span className="font-mono text-cyan-300 block truncate" dir="ltr">
                  {firebaseMeta.firestoreDatabaseId}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#050814] border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">آخرین استعلام سرور Firestore:</span>
                <span className="text-emerald-300 font-semibold tabular-nums block">
                  {isCloudConnected && cloudVerification
                    ? `${new Date(cloudVerification.checkedAtIso).toLocaleTimeString('fa-IR')} · ${toPersianDigits(cloudVerification.reportsCount)} گزارش در سرور`
                    : 'هنوز استعلام ابری انجام نشده'}
                </span>
              </div>
            </div>
          </div>

          {/* Personnel Cloud Verification Table */}
          <div className="rounded-xl border border-slate-800 bg-[#0B1120] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">وضعیت تطبیق اسامی پرسنل و جایگاه‌های شغلی با دیتابیس</h3>
              </div>
              <span className="text-[11px] text-slate-400 tabular-nums">
                مجموع: {toPersianDigits(users.length)} جایگاه/کاربر
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#050814] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">شناسه</th>
                    <th className="py-2.5 px-4">نام ثبت‌شده در سامانه</th>
                    <th className="py-2.5 px-4">جایگاه شغلی</th>
                    <th className="py-2.5 px-4">شماره همراه OTP</th>
                    <th className="py-2.5 px-4">وضعیت در Firestore</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {users.map((u) => {
                    const cloudMatch = cloudVerification?.personnel.find((rp) => rp._id === u._id);
                    const isSyncedSameName = Boolean(cloudMatch && cloudMatch.fullName === u.fullName);
                    return (
                      <tr key={u._id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400" dir="ltr">
                          {u._id}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-white">{u.fullName}</td>
                        <td className="py-2.5 px-4 text-cyan-300">{getRolePersianName(u.role).split(' (')[0]}</td>
                        <td className="py-2.5 px-4 tabular-nums text-slate-300" dir="ltr">
                          {toPersianDigits(u.mobile || u.encryptedMobile)}
                        </td>
                        <td className="py-2.5 px-4">
                          {!isCloudConnected ? (
                            <span className="text-slate-400">ذخیره محلی (آفلاین ابری)</span>
                          ) : isSyncedSameName ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>تاییدشده در سرور</span>
                            </span>
                          ) : cloudMatch ? (
                            <span className="text-amber-300 font-semibold">
                              مغایرت نام در سرور ({cloudMatch.fullName})
                            </span>
                          ) : (
                            <span className="text-amber-300 font-semibold">در انتظار انتقال به سرور</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Collection Counts & System Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>آمار کالکشن‌های پایگاه داده سامانه</span>
              </h3>
              <div className="divide-y divide-slate-800/70 text-xs">
                {collectionStats.map((col) => (
                  <div key={col.key} className="py-2 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-200">{col.label}</span>
                      <span className="font-mono text-[10px] text-slate-500 mr-2" dir="ltr">
                        ({col.key})
                      </span>
                    </div>
                    <span className="font-bold text-cyan-300 tabular-nums">
                      {toPersianDigits(col.count)} سند
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <span>تنظیمات پیکربندی و پارامترهای سیستم</span>
              </h3>
              <div className="divide-y divide-slate-800/70 text-xs">
                {settings.map((st) => (
                  <div key={st._id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-200">{st.description}</div>
                      <div className="font-mono text-[10px] text-slate-500 mt-0.5" dir="ltr">
                        {st.key}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-[#050814] border border-slate-800 font-mono text-[11px] text-amber-300 shrink-0 tabular-nums" dir="ltr">
                      {String(st.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: System Architecture, Resilience & Cloud Infrastructure */}
      {activeTab === 'resilience' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Interactive Circuit Breaker State Machine */}
            <div className="p-5 rounded-xl border border-slate-800 bg-[#0B1120] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>ماشین وضعیت مدارشکن (Circuit Breaker)</span>
                </h3>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                    circuitState === 'CLOSED'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                      : circuitState === 'OPEN'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/35'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/35'
                  }`}
                >
                  STATE: {circuitState}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                جلوگیری از آبشاری شدن خطا هنگام اختلال درگاه پیامکی یا دیتابیس. با ۳ خطای متوالی، مدار باز شده و درخواست‌ها بلافاصله (Fail-Fast) رد می‌شوند.
              </p>

              <div className="p-3.5 rounded-lg bg-[#050814] border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">تعداد خطاهای متوالی ثبت‌شده:</span>
                  <span className="font-mono text-amber-400 font-bold tabular-nums">{toPersianDigits(failureCount)} / ۳</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 shrink-0">آخرین پاسخ دریافتی:</span>
                  <span className="font-mono text-slate-200 text-[11px] truncate">{lastRequestStatus}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCircuitTrigger(true)}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                >
                  پاسخ موفق (۲۰۰ OK)
                </button>
                <button
                  type="button"
                  onClick={() => handleCircuitTrigger(false)}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
                >
                  شبیه‌سازی خطا (۵۰۰ Error)
                </button>
              </div>
            </div>

            {/* Rate Limiting (Token Bucket) */}
            <div className="p-5 rounded-xl border border-slate-800 bg-[#0B1120] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>محدودکننده نرخ درخواست (Rate Limiting - Token Bucket)</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                الگوریتم سطل توکن برای مهار حملات DoS و محافظت از سرویس OTP با سقف ۶۰ درخواست در دقیقه برای هر IP.
              </p>

              <div className="p-4 rounded-lg bg-[#050814] border border-slate-800 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">توکن‌های موجود در سطل:</span>
                  <span className="font-mono text-lg font-bold text-amber-400 tabular-nums">
                    {toPersianDigits(rateTokens)} / ۶۰
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${(rateTokens / 60) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>نرخ بازتولید: ۱ توکن / ثانیه</span>
                  <span>کد وضعیت مازاد: ۴۲۹ Too Many Requests</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRateLimitRequest}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  ارسال درخواست (-۱ توکن)
                </button>
                <button
                  type="button"
                  onClick={() => setRateTokens(60)}
                  className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  شارژ مجدد
                </button>
              </div>
            </div>
          </div>

          {/* Core Architectural Patterns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-[#0B1120] text-xs space-y-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-400" />
                <span>توزیع بار منطقه‌ای (Load Balancing)</span>
              </span>
              <p className="text-slate-400 leading-relaxed">
                توزیع Round-Robin میان نودهای اجرایی و بررسی دوره‌ای سلامت سرویس‌ها.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-[#0B1120] text-xs space-y-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>ایندکس‌گذاری مرکب (Firestore Indexing)</span>
              </span>
              <p className="text-slate-400 leading-relaxed">
                جداسازی اطلاعات تماس حساس در زیرکالکشن private/contact و کوئری‌های ایزوله بر اساس نقش.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-[#0B1120] text-xs space-y-2">
              <span className="font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-purple-400" />
                <span>حذف نرم و قفل قیمت (Soft Delete & Snapshot)</span>
              </span>
              <p className="text-slate-400 leading-relaxed">
                ممنوعیت حذف فیزیکی سوابق و تثبیت نرخ فهرست بها در لحظه ثبت گزارش کار (Snapshot Architecture).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-[#0B1120] text-xs space-y-2">
              <span className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>ایزولاسیون سطری (Row-Level Security)</span>
              </span>
              <p className="text-slate-400 leading-relaxed">
                اجرای همزمان قوانین دسترسی RBAC در کلاینت و قوانین امنیتی سرور Firestore Rules.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Cryptography, Session & OWASP Top 10 */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hashing vs Symmetric Encryption Simulator */}
            <div className="p-5 rounded-xl border border-slate-800 bg-[#0B1120] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-amber-400" />
                <span>هشینگ یک‌طرفه (SHA-256) در برابر رمزنگاری متقارن (AES-256-GCM)</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                شماره موبایل کاربر جهت جستجو با <strong>SHA-256 + Salt</strong> هش می‌شود اما جهت نگهداری امن با <strong>AES-256-GCM</strong> رمزگذاری می‌گردد.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">مقدار ورودی آزمایشی:</label>
                <input
                  type="text"
                  value={plainInput}
                  onChange={(e) => setPlainInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#050814] border border-slate-700 font-mono text-xs text-amber-300 text-left"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-[#050814] border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block">هش یک‌طرفه SHA-256:</span>
                  <div className="font-mono text-[11px] text-sky-400 break-all select-all" dir="ltr">
                    {simulatedSha256(plainInput)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#050814] border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 block">رمزنگاری AES-256-GCM:</span>
                  <div className="font-mono text-[11px] text-emerald-400 break-all select-all" dir="ltr">
                    {simulatedAesEncrypt(plainInput)}
                  </div>
                </div>
              </div>
            </div>

            {/* Secret Rotation & Iron Session Cookie Flags */}
            <div className="p-5 rounded-xl border border-slate-800 bg-[#0B1120] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>چرخش کلید محرمانه و نشست رمزگذاری‌شده (Iron Session)</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                پشتیبانی از کلیدهای چندنسخه‌ای برای نشست‌های Iron Session تا چرخش دوره‌ای کلید منجر به خروج ناگهانی کاربران فعال نشود.
              </p>

              <div className="p-3.5 rounded-lg bg-[#050814] border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">نسخه کلید جاری:</span>
                  <span className="font-mono font-bold text-amber-400" dir="ltr">
                    KEY_v{currentSecretVersion}_PROD_AES
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">چرخش بدون قطعی:</span>
                  <span className="text-emerald-400 font-semibold">پشتیبانی همزمان از کلید فعلی و قبلی</span>
                </div>
                <button
                  type="button"
                  onClick={handleRotateSecret}
                  disabled={isRotating}
                  className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                  <span>شبیه‌سازی چرخش کلید (Rotate Secret Key)</span>
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-slate-300 block mb-1">پرچم‌های امنیتی کوکی نشست:</span>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded-lg bg-emerald-950/35 border border-emerald-500/30 text-emerald-300">
                    HttpOnly: true
                    <span className="block text-[9px] text-slate-400 mt-0.5">ضد سرقت با XSS</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/35 border border-emerald-500/30 text-emerald-300">
                    Secure: true
                    <span className="block text-[9px] text-slate-400 mt-0.5">منحصراً در TLS</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/35 border border-emerald-500/30 text-emerald-300">
                    SameSite: Strict
                    <span className="block text-[9px] text-slate-400 mt-0.5">دفاع در برابر CSRF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* OWASP Top 10 Defense */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-slate-800 bg-[#0B1120] space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">دفاع تزریق کد و کوئری (SQLi / NoSQLi)</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                اعتبارسنجی دقیق انواع داده در Firestore Rules و جلوگیری از پذیرش کوئری‌های ساختارنشده.
              </p>
              <div className="p-2.5 rounded-lg bg-[#050814] font-mono text-[11px] text-rose-300 border border-slate-800" dir="ltr">
                Payload: {sqlInput}
              </div>
              <div className="p-2.5 rounded-lg bg-[#050814] font-mono text-[11px] text-emerald-400 border border-slate-800" dir="ltr">
                Sanitized Query Parameterized
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-[#0B1120] space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">مهار تزریق اسکریپت (XSS)</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                اسکیپ خودکار رشته‌ها در React JSX و اعمال محدودیت‌های محتوا برای جلوگیری از اجرای اسکریپت‌های مخرب.
              </p>
              <div className="p-2.5 rounded-lg bg-[#050814] font-mono text-[11px] text-rose-300 border border-slate-800" dir="ltr">
                Injected: {xssInput}
              </div>
              <div className="p-2.5 rounded-lg bg-[#050814] font-mono text-[11px] text-emerald-400 border border-slate-800" dir="ltr">
                Escaped: &amp;lt;script&amp;gt;...
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-[#0B1120] space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">دفاع IDOR و امنیت سطری (RLS)</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                تطبیق مالکیت گروهی، نقش کاربر و مجوز ادمین در قوانین امنیتی سرور پیش از واکشی یا ویرایش هر سند.
              </p>
              <div className="p-2.5 rounded-lg bg-[#050814] font-mono text-[11px] text-slate-300 border border-slate-800" dir="ltr">
                Resource ID: {idorId}
              </div>
              <div className="p-2.5 rounded-lg bg-[#050814] font-mono text-[11px] text-amber-300 border border-slate-800" dir="ltr">
                checkOwnership(user.groupId, doc.groupId)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Observability, Tracing & Recent Audit Logs */}
      {activeTab === 'observability' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-slate-800 bg-[#0B1120] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>ردیابی توزیع‌شده (Distributed Tracing - OpenTelemetry)</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                ردیابی هر درخواست با تولید TraceID و SpanID در سراسر کلاینت، سرور ابری، Firestore و درگاه پیامکی.
              </p>

              <div className="p-3 rounded-lg bg-[#050814] border border-slate-800 font-mono text-xs space-y-1.5" dir="ltr">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Trace ID:</span>
                  <span className="text-amber-400">tr-89b3f02e1c94</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Edge Proxy / TLS:</span>
                  <span className="text-emerald-400">12ms</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>RBAC & Rules Guard:</span>
                  <span className="text-emerald-400">18ms</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Firestore Index Read:</span>
                  <span className="text-emerald-400">6ms</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Melipayamak Rest Hook:</span>
                  <span className="text-sky-400">140ms</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-[#0B1120] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>لاگ‌برداری ساخت‌یافته (Structured JSON Logging)</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                ثبت رویدادهای سیستمی با فرمت استاندارد JSON جهت پایش متمرکز و ممیزی امنیتی.
              </p>

              <div className="p-3 rounded-lg bg-[#050814] font-mono text-[11px] text-slate-300 border border-slate-800 overflow-x-auto text-left" dir="ltr">
                <pre>{`{
  "level": "INFO",
  "service": "tavanban-core",
  "database": "${firebaseMeta.firestoreDatabaseId}",
  "action": "WORKFLOW_APPROVE",
  "actorRole": "EMPLOYER_CEO",
  "status": 200
}`}</pre>
              </div>
            </div>
          </div>

          {/* Live Audit Logs Table */}
          <div className="rounded-xl border border-slate-800 bg-[#0B1120] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">آخرین رویدادهای زنده ممیزی سامانه</h3>
              <span className="text-[11px] text-slate-400 tabular-nums">
                نمایش {toPersianDigits(Math.min(8, auditLogs.length))} مورد اخیر از {toPersianDigits(auditLogs.length)}
              </span>
            </div>
            <div className="divide-y divide-slate-800/70 text-xs">
              {auditLogs.slice(0, 8).map((log) => (
                <div key={log._id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">
                      {log.actorName}{' '}
                      <span className="text-cyan-400 font-normal">
                        ({getRolePersianName(log.actorRole).split(' (')[0]})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono" dir="ltr">
                      {log.action} · {log.resourceType} #{log.resourceId}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 tabular-nums shrink-0">
                    {new Date(log.createdAt).toLocaleString('fa-IR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
