/**
 * StatementsView
 * 4-Stage Statement Approval Pipeline:
 * 1. CONTRACTOR_CEO creates statement -> employer_ceo_review
 * 2. EMPLOYER_CEO approves/rejects -> employer_manager_review
 * 3. EMPLOYER_MANAGER approves/rejects -> deputy_review
 * 4. DEPUTY approves/rejects -> approved -> DEPUTY pays -> paid
 */

import React, { useState } from 'react';
import {
  FileCheck2,
  PlusCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  Printer,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Statement } from '../../types';
import { toPersianDigits, formatPriceToman } from '../../utils/formatters';
import {
  filterStatementsForRole,
  filterReportsForRole,
  canCreateStatement,
  canReviewStatement,
  canApproveStatementAtStatus,
  canPayStatement,
} from '../../config/rolePermissions';

export const StatementsView: React.FC = () => {
  const {
    statements,
    contracts,
    reports,
    groups,
    currentRole,
    currentUser,
    createStatement,
    updateStatementStatus,
    showToast,
  } = useApp();

  const scopedStatements = filterStatementsForRole(statements, currentUser);
  const scopedReports = filterReportsForRole(reports, currentUser, groups);

  const allowCreate = canCreateStatement(currentRole);
  const allowReview = canReviewStatement(currentRole);

  const companyContracts =
    currentRole === 'CONTRACTOR_CEO' && currentUser.companyId
      ? contracts.filter((c) => c.contractorCompanyId === currentUser.companyId)
      : contracts;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(
    companyContracts.length > 0 ? companyContracts[0]._id : ''
  );
  const [periodStart, setPeriodStart] = useState('۱۴۰۳/۰۸/۰۱');
  const [periodEnd, setPeriodEnd] = useState('۱۴۰۳/۰۸/۳۰');

  // Rejection modal
  const [rejectStmtId, setRejectStmtId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Eligible approved reports preview
  const eligibleReports = scopedReports.filter(
    (r) =>
      r.reportType === 'work_report' &&
      r.contractId === selectedContractId &&
      r.status === 'approved'
  );
  const eligibleTotalToman = Math.round(
    eligibleReports.reduce((sum, r) => sum + r.totalAmount, 0) / 10
  );

  const handleCreate = async () => {
    const ok = await createStatement(selectedContractId, periodStart, periodEnd);
    if (ok) {
      setIsCreateModalOpen(false);
    }
  };

  const handleApprove = async (id: string) => {
    await updateStatementStatus(id, 'approved');
  };

  const handleMarkPaid = async (id: string) => {
    await updateStatementStatus(id, 'paid');
  };

  const handleConfirmReject = async () => {
    if (!rejectStmtId) return;
    await updateStatementStatus(rejectStmtId, 'rejected', rejectReason);
    setRejectStmtId(null);
    setRejectReason('');
  };

  const getStatementStatusMeta = (status: Statement['status']) => {
    switch (status) {
      case 'paid':
        return {
          label: 'تسویه و پرداخت شد',
          cls: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
          stepIndex: 4,
        };
      case 'approved':
        return {
          label: 'تایید نهایی معاونت (آماده پرداخت)',
          cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          stepIndex: 3,
        };
      case 'deputy_review':
        return {
          label: 'در انتظار تایید معاونت بهره‌برداری (مرحله ۳)',
          cls: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          stepIndex: 2,
        };
      case 'employer_manager_review':
        return {
          label: 'در انتظار تایید مدیر کارفرما (مرحله ۲)',
          cls: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
          stepIndex: 1,
        };
      case 'rejected':
        return {
          label: 'رد شده',
          cls: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          stepIndex: -1,
        };
      case 'employer_ceo_review':
      case 'pending':
      default:
        return {
          label: 'در انتظار تایید رییس کارفرما (مرحله ۱)',
          cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          stepIndex: 0,
        };
    }
  };

  const getApproveButtonLabel = () => {
    if (currentRole === 'EMPLOYER_CEO') return 'تایید رییس کارفرما و ارسال به مدیر کارفرما';
    if (currentRole === 'EMPLOYER_MANAGER') return 'تایید مدیر کارفرما و ارسال به معاونت';
    return 'تایید نهایی صورت‌وضعیت (معاونت)';
  };

  const getSubtitle = () => {
    if (allowCreate) {
      return 'تجمیع گزارش‌های کار تایید نهایی شده و ارسال در مسیر رییس کارفرما ← مدیر کارفرما ← معاونت بهره‌برداری';
    }
    if (currentRole === 'EMPLOYER_CEO') {
      return 'مرحله ۱ تایید صورت‌وضعیت‌ها پس از صدور پیمانکار و ارجاع به مدیر کارفرما';
    }
    if (currentRole === 'EMPLOYER_MANAGER') {
      return 'مرحله ۲ تایید صورت‌وضعیت‌ها پس از رییس کارفرما و ارجاع به معاونت بهره‌برداری';
    }
    return 'مرحله نهایی بررسی، تایید و ثبت حواله پرداخت قطعی صورت‌وضعیت‌ها توسط معاونت بهره‌برداری';
  };

  const stages = [
    '۱. رییس کارفرما',
    '۲. مدیر کارفرما',
    '۳. معاونت بهره‌برداری',
    '۴. پرداخت قطعی',
  ];

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-amber-400" />
            <span>مدیریت صورت‌وضعیت‌های مالی (Statements)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{getSubtitle()}</p>
        </div>

        {allowCreate && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.3)]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>صدور صورت‌وضعیت جدید</span>
          </button>
        )}
      </div>

      {/* Statements List */}
      <div className="space-y-4">
        {scopedStatements.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 glass-panel rounded-2xl border border-slate-800">
            هیچ صورت‌وضعیتی در محدوده دسترسی شما ثبت نشده است.
          </div>
        ) : (
          scopedStatements.map((stmt) => {
            const statusMeta = getStatementStatusMeta(stmt.status);
            const canApproveNow = canApproveStatementAtStatus(currentRole, stmt.status);
            const canPayNow = canPayStatement(currentRole, stmt.status);

            return (
              <div
                key={stmt._id}
                className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400">{toPersianDigits(stmt.code)}</span>
                      <h3 className="text-sm font-bold text-white">{stmt.title}</h3>
                    </div>
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                      <span>پیمانکار: {stmt.contractorCompanyName}</span>
                      <span>·</span>
                      <span>
                        دوره: {toPersianDigits(stmt.periodStartJalali)} الی{' '}
                        {toPersianDigits(stmt.periodEndJalali)}
                      </span>
                      <span>·</span>
                      <span>تعداد گزارش‌ها: {toPersianDigits(stmt.reportsCount)} فقره</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 text-left sm:text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${statusMeta.cls}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>
                </div>

                {/* 4-Stage Pipeline Indicator */}
                {statusMeta.stepIndex >= 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    {stages.map((stLabel, idx) => {
                      const done = statusMeta.stepIndex > idx;
                      const current = statusMeta.stepIndex === idx;
                      return (
                        <div
                          key={stLabel}
                          className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-1 ${
                            done
                              ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300 font-semibold'
                              : current
                              ? 'border-orange-500/40 bg-orange-950/30 text-orange-300 font-bold'
                              : 'border-slate-800 bg-slate-950/40 text-slate-500'
                          }`}
                        >
                          <span className="truncate">{stLabel}</span>
                          {idx < stages.length - 1 && (
                            <ArrowLeft className="w-3 h-3 shrink-0 opacity-60 hidden sm:inline" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Amount & Description */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{stmt.description}</p>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left sm:text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block mb-0.5">مبلغ صورت‌وضعیت:</span>
                    <div className="text-lg font-black text-emerald-400 tabular-nums">
                      {formatPriceToman(stmt.amount)}
                    </div>
                  </div>
                </div>

                {stmt.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-200">
                    دلیل رد: {stmt.rejectionReason}
                  </div>
                )}

                {/* Strictly Guarded Action Buttons per Stage */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">قرارداد مرتبط: {stmt.contractTitle}</div>

                  <div className="flex flex-wrap items-center gap-2">
                    {canApproveNow && (
                      <>
                        <button
                          onClick={() => handleApprove(stmt._id)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{getApproveButtonLabel()}</span>
                        </button>
                        <button
                          onClick={() => setRejectStmtId(stmt._id)}
                          className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-950/50 text-xs transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>رد</span>
                        </button>
                      </>
                    )}

                    {canPayNow && (
                      <button
                        onClick={() => handleMarkPaid(stmt._id)}
                        className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>ثبت حواله و پرداخت قطعی</span>
                      </button>
                    )}

                    <button
                      onClick={() => showToast('در حال آماده‌سازی نسخه چاپی استاندارد...', 'info')}
                      className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-colors"
                      title="چاپ صورت‌وضعیت"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Statement Modal (CONTRACTOR_CEO ONLY) */}
      {isCreateModalOpen && allowCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right">
            <h3 className="text-base font-bold text-white mb-1">صدور صورت‌وضعیت جدید پیمانکار</h3>
            <p className="text-xs text-slate-400 mb-4">
              فقط گزارش‌های کار با وضعیت «تایید نهایی شده (approved)» شرکت شما در این صورت‌وضعیت لحاظ شده و پس از صدور به کارتابل رییس کارفرما ارسال می‌گردند.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  انتخاب قرارداد:
                </label>
                <select
                  value={selectedContractId}
                  onChange={(e) => setSelectedContractId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 text-right"
                >
                  {companyContracts.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.contractNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    از تاریخ شمسی:
                  </label>
                  <input
                    type="text"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-center focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    تا تاریخ شمسی:
                  </label>
                  <input
                    type="text"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-center focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span>گزارش‌های تایید نهایی آماده صدور:</span>
                  <span className="font-bold text-amber-400">
                    {toPersianDigits(eligibleReports.length)} فقره
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-slate-800">
                  <span>مجموع ارزش مالی قابل دریافت:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {formatPriceToman(eligibleTotalToman * 10)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleCreate}
                disabled={eligibleReports.length === 0}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors"
              >
                صدور و ارسال به رییس کارفرما
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal (EMPLOYER_CEO, EMPLOYER_MANAGER, DEPUTY) */}
      {rejectStmtId && allowReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right">
            <h3 className="text-base font-bold text-white mb-2">رد صورت‌وضعیت مالی</h3>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="ذکر دقیق مغایرت‌های مالی، کسورات یا محاسبات نادرست..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-rose-400"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRejectStmtId(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-slate-300 text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                ثبت رد صورت‌وضعیت
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
