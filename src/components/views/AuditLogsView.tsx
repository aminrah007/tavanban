/**
 * AuditLogsView
 * Role-Scoped Immutable Security & Operations Audit Logs
 */

import React, { useState } from 'react';
import { History, Search } from 'lucide-react';
import { useApp, getRolePersianName } from '../../context/AppContext';
import { filterAuditLogsForRole } from '../../config/rolePermissions';
import { toPersianDigits } from '../../utils/formatters';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, users, currentUser, currentRole } = useApp();

  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const scopedLogs = filterAuditLogsForRole(auditLogs, currentUser, users);

  const filteredLogs = scopedLogs.filter((log) => {
    if (filterAction !== 'all' && !log.action.includes(filterAction)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.resourceType.toLowerCase().includes(q) ||
        log.resourceId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getScopeDesc = () => {
    switch (currentRole) {
      case 'DEPUTY':
        return 'مشاهده جامع کلیه تراکنش‌های حساس، تغییر وضعیت‌ها و رویدادهای احراز هویت در کل سازمان';
      case 'EMPLOYER_MANAGER':
        return 'مشاهده نظارتی کلیه رویدادهای ثبت گزارش، ارجاع کارهای کارفرمایی و گردش تایید صورت‌وضعیت‌ها';
      case 'EMPLOYER_CEO':
        return 'نمایش رویدادها و تغییرات گزارش‌ها و کارهای محوله در محدوده واحد نظارتی شما';
      case 'EMPLOYER_EXPERT':
        return 'نمایش فعالیت‌ها و رویدادهای ثبت‌شده در گروه‌های تحت نظارت شما';
      case 'CONTRACTOR_CEO':
      case 'RESIDENT_REP':
      default:
        return 'نمایش رویدادها و فعالیت‌های عملیاتی پرسنل شرکت پیمانکار متبوع';
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>دفتر لاگ‌های ممیزی و حسابرسی امنیتی (Audit Logs)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{getScopeDesc()}</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setFilterAction('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
              filterAction === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            همه رویدادها ({toPersianDigits(scopedLogs.length)})
          </button>
          <button
            onClick={() => setFilterAction('REPORT')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
              filterAction === 'REPORT'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            گزارش‌های کار
          </button>
          <button
            onClick={() => setFilterAction('LOGIN')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
              filterAction === 'LOGIN'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ورود و احراز هویت
          </button>
          <button
            onClick={() => setFilterAction('EXTRA_WORK')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
              filterAction === 'EXTRA_WORK'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            معادل‌سازی
          </button>
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در نام کاربر، عملیات، منبع..."
            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">کاربر انجام‌دهنده</th>
                <th className="py-3 px-4">نقش سازمانی</th>
                <th className="py-3 px-4">عملیات ثبت‌شده</th>
                <th className="py-3 px-4">نوع و شناسه منبع</th>
                <th className="py-3 px-4">جزییات و متادیتا</th>
                <th className="py-3 px-4 text-left">نشانی پروتکل (IP)</th>
                <th className="py-3 px-4 text-left">زمان دقیق وقوع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    هیچ رویدادی در محدوده دسترسی شما ثبت نشده است.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{log.actorName}</td>
                    <td className="py-3 px-4 text-amber-400/90 font-medium text-[11px]">
                      {getRolePersianName(log.actorRole).split(' (')[0]}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-bold">
                      {log.resourceType}:{toPersianDigits(log.resourceId)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-left text-[11px] font-bold">
                      {toPersianDigits(log.ipAddress || '127.0.0.1')}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-left text-[11px] font-bold">
                      {new Date(log.createdAt).toLocaleTimeString('fa-IR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
