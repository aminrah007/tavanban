/**
 * ReportsView
 * Role-Isolated 3-Step Work Report Approval Workflow, Daily Reports Tab,
 * Deputy Accounting Settlement, Technician Redo Resubmission, and Snapshot Price Inspection
 */

import React, { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Download,
  Layers,
  Image as ImageIcon,
  History,
  DollarSign,
  X,
  PlusCircle,
  MapPin,
  ClipboardEdit,
  Send,
} from 'lucide-react';
import { useApp, getRolePersianName, getStatusPersianBadge } from '../../context/AppContext';
import { toPersianDigits, formatPriceToman } from '../../utils/formatters';
import {
  filterReportsForRole,
  filterGroupsForRole,
  canCreateWorkReport,
  canCreateDailyReport,
  canViewDailyReports,
  canApproveReportAtStatus,
  canSettleReport,
  canResubmitReport,
} from '../../config/rolePermissions';

export const ReportsView: React.FC = () => {
  const {
    reports,
    groups,
    stations,
    currentRole,
    currentUser,
    advanceReportWorkflow,
    resubmitReport,
    createDailyReport,
    setCurrentRoute,
    selectedReportId,
    setSelectedReportId,
    showToast,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'issues' | 'daily'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [modalActionType, setModalActionType] = useState<'approve' | 'reject' | 'redo' | 'dispute' | 'settle'>('approve');
  const [actionReason, setActionReason] = useState('');

  // Technician redo resubmit modal
  const [resubmitDesc, setResubmitDesc] = useState('');
  const [isResubmitOpen, setIsResubmitOpen] = useState(false);

  // Expert daily report modal
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [dailyDate, setDailyDate] = useState('۱۴۰۳/۰۸/۲۵');
  const [dailyGroupId, setDailyGroupId] = useState(
    () => filterGroupsForRole(groups, currentUser)[0]?._id || groups[0]?._id || 'grp-1'
  );
  const [dailyStationId, setDailyStationId] = useState(stations[0]?.id || '');
  const [dailyDesc, setDailyDesc] = useState('');

  // Role-isolated report list
  const roleScopedReports = filterReportsForRole(reports, currentUser, groups);
  const workReportsOnly = roleScopedReports.filter((r) => r.reportType !== 'daily_report');
  const dailyReportsOnly = roleScopedReports.filter((r) => r.reportType === 'daily_report');
  const scopedGroups = filterGroupsForRole(groups, currentUser);

  const activeReport = roleScopedReports.find((r) => r._id === selectedReportId) || null;

  const hidePrices = currentRole === 'TECHNICIAN';
  const canExportCSV = ['DEPUTY', 'CONTRACTOR_CEO', 'EMPLOYER_CEO'].includes(currentRole);

  // Filtered reports by tab & search
  const filteredReports = roleScopedReports.filter((rep) => {
    if (statusFilter === 'daily') {
      if (rep.reportType !== 'daily_report') return false;
    } else {
      if (rep.reportType === 'daily_report') return false;
      if (statusFilter === 'pending') {
        if (!['supervisor_review', 'expert_review', 'employer_ceo_review'].includes(rep.status)) {
          return false;
        }
      } else if (statusFilter === 'approved') {
        if (!['approved', 'settled'].includes(rep.status)) return false;
      } else if (statusFilter === 'issues') {
        if (!['rejected', 'redo_requested', 'disputed'].includes(rep.status)) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = rep._id.toLowerCase().includes(q);
      const matchDesc = rep.description?.toLowerCase().includes(q) || false;
      const matchUser = rep.userName.toLowerCase().includes(q);
      const matchDate = rep.reportDateJalali.includes(q);
      const matchStation =
        rep.stationName?.toLowerCase().includes(q) || rep.dispatchCode?.toLowerCase().includes(q) || false;
      if (!matchId && !matchDesc && !matchUser && !matchDate && !matchStation) return false;
    }

    return true;
  });

  const handleOpenAction = (action: 'approve' | 'reject' | 'redo' | 'dispute' | 'settle') => {
    setModalActionType(action);
    setActionReason('');
    setIsActionModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!activeReport) return;
    const res = await advanceReportWorkflow(activeReport._id, modalActionType, actionReason);
    if (res.success) {
      setIsActionModalOpen(false);
    } else {
      showToast(res.error || 'خطا در ثبت عملیات', 'error');
    }
  };

  const handleOpenResubmit = () => {
    if (!activeReport) return;
    setResubmitDesc(activeReport.description || '');
    setIsResubmitOpen(true);
  };

  const handleConfirmResubmit = async () => {
    if (!activeReport) return;
    const ok = await resubmitReport(activeReport._id, resubmitDesc);
    if (ok) {
      setIsResubmitOpen(false);
    }
  };

  const handleDailySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyDesc.trim()) return;
    const st = stations.find((s) => s.id === dailyStationId);
    const ok = await createDailyReport({
      reportDateJalali: dailyDate,
      groupId: dailyGroupId,
      description: dailyDesc,
      stationId: st?.id,
      stationName: st ? `${st.persianName} (${st.name})` : undefined,
      dispatchCode: st?.dispatchCode || undefined,
    });
    if (ok) {
      setIsDailyModalOpen(false);
      setDailyDesc('');
      setStatusFilter('daily');
    }
  };

  // Export to CSV (only for DEPUTY, CONTRACTOR_CEO, EMPLOYER_CEO)
  const handleExportCSV = () => {
    const headers = ['شناسه گزارش', 'ثبت‌کننده', 'محل انجام کار', 'تاریخ', 'وضعیت', 'مبلغ (ریال)', 'شرح'];
    const rows = filteredReports.map((r) => [
      r._id,
      r.userName,
      `"${r.stationName || r.groupName}"`,
      r.reportDateJalali,
      r.status,
      r.totalAmount,
      `"${r.description?.replace(/"/g, '""') || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tavanban_reports_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('فایل اکسل گزارش‌ها با موفقیت استخراج شد.', 'success');
  };

  const getModalActionLabel = (action: typeof modalActionType) => {
    switch (action) {
      case 'approve':
        return 'تایید مرحله‌ای گزارش';
      case 'reject':
        return 'رد رسمی گزارش';
      case 'redo':
        return 'درخواست اصلاح و انجام مجدد (Redo)';
      case 'dispute':
        return 'ثبت اختلاف فنی';
      case 'settle':
        return 'تسویه قطعی حسابداری';
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
              statusFilter === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            همه گزارش‌های کار ({toPersianDigits(workReportsOnly.length)})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
              statusFilter === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            در انتظار بررسی ({toPersianDigits(workReportsOnly.filter((r) => ['supervisor_review', 'expert_review', 'employer_ceo_review'].includes(r.status)).length)})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
              statusFilter === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تایید و تسویه‌شده ({toPersianDigits(workReportsOnly.filter((r) => ['approved', 'settled'].includes(r.status)).length)})
          </button>
          <button
            onClick={() => setStatusFilter('issues')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
              statusFilter === 'issues'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            نیازمند اصلاح / رد ({toPersianDigits(workReportsOnly.filter((r) => ['redo_requested', 'rejected', 'disputed'].includes(r.status)).length)})
          </button>
          {canViewDailyReports(currentRole) && (
            <button
              onClick={() => setStatusFilter('daily')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
                statusFilter === 'daily'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              گزارش‌های روزانه ناظران ({toPersianDigits(dailyReportsOnly.length)})
            </button>
          )}
        </div>

        {/* Search & Role-Restricted New/Export actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو با کد، نام، پست، تاریخ..."
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-amber-400 text-right"
            />
          </div>

          {canExportCSV && (
            <button
              onClick={handleExportCSV}
              className="p-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
              title="خروجی اکسل CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {canCreateWorkReport(currentRole) && (
            <button
              onClick={() => setCurrentRoute('report-new')}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-[0_0_14px_rgba(245,158,11,0.3)] shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>ثبت گزارش کار جدید</span>
            </button>
          )}

          {canCreateDailyReport(currentRole) && (
            <button
              onClick={() => setIsDailyModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <ClipboardEdit className="w-4 h-4" />
              <span>ثبت گزارش روزانه</span>
            </button>
          )}
        </div>
      </div>

      {/* Reports Table Grid */}
      <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">شناسه</th>
                <th className="py-3 px-4 font-semibold">ثبت‌کننده</th>
                <th className="py-3 px-4 font-semibold">پست / گروه</th>
                <th className="py-3 px-4 font-semibold">تاریخ شمسی</th>
                <th className="py-3 px-4 font-semibold">
                  {statusFilter === 'daily' ? 'نوع گزارش' : 'تعداد آیتم'}
                </th>
                {!hidePrices && <th className="py-3 px-4 font-semibold text-left">مبلغ کل (تومان)</th>}
                <th className="py-3 px-4 font-semibold text-center">وضعیت گردش کار</th>
                <th className="py-3 px-4 font-semibold text-center">اقدام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={hidePrices ? 7 : 8} className="py-12 text-center text-slate-500">
                    هیچ گزارشی در محدوده دسترسی شما با فیلترهای انتخابی یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const statusBadge = getStatusPersianBadge(report.status);
                  const isSelected = selectedReportId === report._id;

                  return (
                    <tr
                      key={report._id}
                      onClick={() => setSelectedReportId(report._id)}
                      className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-500/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-amber-400">
                        {toPersianDigits(report._id)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        <div>{report.userName}</div>
                        <div className="text-[10px] text-slate-400">{report.companyName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="truncate max-w-[220px] font-semibold text-orange-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0 text-orange-400" />
                          <span className="truncate">{report.stationName || report.groupName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[220px]">
                          {report.groupName}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {toPersianDigits(report.reportDateJalali)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {report.reportType === 'daily_report' ? (
                          <span className="text-sky-400 font-semibold">گزارش روزانه ناظر</span>
                        ) : (
                          <>
                            {toPersianDigits(report.itemCount)} آیتم
                            {report.extraWorks.length > 0 && (
                              <span className="mr-1 text-[10px] text-purple-400">
                                (+{toPersianDigits(report.extraWorks.length)} اضافی)
                              </span>
                            )}
                          </>
                        )}
                      </td>
                      {!hidePrices && (
                        <td className="py-3.5 px-4 font-bold text-left text-slate-100 tabular-nums">
                          {report.reportType === 'daily_report' ? '—' : formatPriceToman(report.totalAmount)}
                        </td>
                      )}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium border ${statusBadge.bg} ${statusBadge.color}`}
                        >
                          {report.reportType === 'daily_report' ? 'ثبت‌شده برای رییس' : statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReportId(report._id);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                        >
                          مشاهده جزییات
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Details Slide-over / Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl glass-panel border border-slate-700 bg-slate-900/95 p-6 shadow-2xl text-right relative">
            <button
              onClick={() => setSelectedReportId(null)}
              className="absolute top-5 left-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-400">{toPersianDigits(activeReport._id)}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                      getStatusPersianBadge(activeReport.status).bg
                    } ${getStatusPersianBadge(activeReport.status).color}`}
                  >
                    {activeReport.reportType === 'daily_report'
                      ? 'گزارش روزانه ناظر کارفرما'
                      : getStatusPersianBadge(activeReport.status).label}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {activeReport.reportType === 'daily_report'
                    ? 'جزییات گزارش روزانه کارشناس'
                    : 'بررسی تفصیلی گزارش کار عملیاتی'}
                </h3>
              </div>
            </div>

            {/* General Info Grid */}
            <div
              className={`grid grid-cols-2 ${
                hidePrices ? 'sm:grid-cols-4' : 'sm:grid-cols-5'
              } gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs mb-6`}
            >
              <div>
                <span className="text-slate-400 block mb-0.5">ثبت‌کننده:</span>
                <span className="font-semibold text-white">{activeReport.userName}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">محل انجام کار (پست):</span>
                <span className="font-bold text-orange-400 block truncate">
                  {activeReport.stationName || 'ثبت عمومی'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">تاریخ ثبت:</span>
                <span className="text-amber-400 font-semibold">
                  {toPersianDigits(activeReport.reportDateJalali)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">گروه کاری:</span>
                <span className="font-semibold text-slate-200 truncate block">{activeReport.groupName}</span>
              </div>
              {!hidePrices && (
                <div>
                  <span className="text-slate-400 block mb-0.5">مبلغ کل برآورد:</span>
                  <span className="font-bold text-emerald-400">
                    {activeReport.reportType === 'daily_report'
                      ? 'بدون مبلغ مالی'
                      : `${formatPriceToman(activeReport.totalAmount)} تومان`}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-300 mb-1.5">شرح عملیات / مشاهدات:</h4>
              <p className="text-xs text-slate-300 p-3 rounded-xl bg-slate-950/40 border border-slate-800 leading-relaxed">
                {activeReport.description || 'توضیحاتی ثبت نشده است.'}
              </p>
            </div>

            {/* Snapshot Price Items Table */}
            {activeReport.items.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span>آیتم‌های فهرست بها (نرخ تثبیت‌شده در زمان ثبت)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {toPersianDigits(activeReport.items.length)} آیتم ثبت‌شده
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">کد</th>
                        <th className="py-2.5 px-3">شرح آیتم در زمان ثبت</th>
                        <th className="py-2.5 px-3">واحد</th>
                        <th className="py-2.5 px-3">تعداد</th>
                        {!hidePrices && <th className="py-2.5 px-3">نرخ ثبت‌شده (ریال)</th>}
                        {!hidePrices && <th className="py-2.5 px-3 text-left">مجموع (تومان)</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
                      {activeReport.items.map((item) => (
                        <tr key={item._id}>
                          <td className="py-2.5 px-3 font-semibold text-amber-400">
                            {toPersianDigits(item.priceItemId)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-200">{item.titleSnapshot}</td>
                          <td className="py-2.5 px-3 text-slate-400">{item.unitSnapshot}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-100">{toPersianDigits(item.quantity)}</td>
                          {!hidePrices && (
                            <td className="py-2.5 px-3 text-slate-300">
                              {toPersianDigits(item.unitPriceSnapshot.toLocaleString('fa-IR'))}
                            </td>
                          )}
                          {!hidePrices && (
                            <td className="py-2.5 px-3 font-bold text-left text-emerald-400 tabular-nums">
                              {formatPriceToman(item.totalAmount)}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Extra Work Items */}
            {activeReport.extraWorks.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>کارهای اضافی و خارج از فهرست بها ({toPersianDigits(activeReport.extraWorks.length)} مورد)</span>
                </h4>
                <div className="space-y-2">
                  {activeReport.extraWorks.map((ew) => (
                    <div
                      key={ew._id}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-medium text-slate-200">{ew.description}</div>
                        {ew.mappingNote && (
                          <div className="text-[11px] text-amber-400 mt-0.5">
                            یادداشت معادل‌سازی: {ew.mappingNote}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-left sm:text-right">
                        {ew.status === 'mapped' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {hidePrices
                              ? 'معادل‌سازی شد'
                              : `معادل‌سازی شد (${formatPriceToman(ew.mappedAmount || 0)})`}
                          </span>
                        ) : ew.status === 'rejected' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            رد شد
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            در انتظار معادل‌سازی نماینده مقیم
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {activeReport.attachments.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  <span>مستندات و عکس‌های میدانی پیوست ({toPersianDigits(activeReport.attachments.length)})</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeReport.attachments.map((att) => (
                    <div key={att._id} className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60">
                      <img
                        src={att.dataUrl || 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400'}
                        alt={att.fileName}
                        referrerPolicy="no-referrer"
                        className="w-full h-28 object-cover hover:scale-105 transition-transform"
                      />
                      <div className="p-2 text-[10px] text-slate-300 truncate">{att.fileName}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approval History Timeline */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-400" />
                <span>تاریخچه و رویدادهای گردش کار</span>
              </h4>
              <div className="space-y-2 border-r-2 border-slate-800 pr-3">
                {activeReport.events.map((ev) => (
                  <div key={ev._id} className="text-xs relative pr-2">
                    <span className="font-semibold text-slate-200">{ev.actorName}</span>{' '}
                    <span className="text-[11px] text-slate-400">
                      ({getRolePersianName(ev.actorRole).split(' (')[0]})
                    </span>
                    :<span className="mr-2 text-amber-300">{ev.action}</span>
                    {ev.reason && (
                      <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2 rounded-lg mt-1 border border-slate-800/80">
                        توضیحات: {ev.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Strictly Enforced Workflow Action Bar */}
            {activeReport.reportType !== 'daily_report' && (
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  وضعیت دسترسی نقش{' '}
                  <strong className="text-white">{getRolePersianName(currentRole).split(' (')[0]}</strong>:
                  {['CONTRACTOR_CEO', 'RESIDENT_REP', 'EMPLOYER_MANAGER'].includes(currentRole) && (
                    <span className="mr-2 text-amber-400">
                      {currentRole === 'EMPLOYER_MANAGER'
                        ? 'نظارت خواندنی (مدیر کارفرما در تایید گزارش کارهای پیمانکار نقشی ندارد)'
                        : 'فقط مشاهده (بدون حق تایید نظارتی)'}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Step 1: GROUP_SUPERVISOR on supervisor_review */}
                  {activeReport.status === 'supervisor_review' &&
                    canApproveReportAtStatus(currentRole, activeReport.status) && (
                      <>
                        <button
                          onClick={() => handleOpenAction('approve')}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          تایید مرحله اول (سرپرست گروه)
                        </button>
                        <button
                          onClick={() => handleOpenAction('redo')}
                          className="px-3 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-4 h-4" />
                          درخواست اصلاح (Redo)
                        </button>
                        <button
                          onClick={() => handleOpenAction('reject')}
                          className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          رد گزارش
                        </button>
                      </>
                    )}

                  {/* Step 2: EMPLOYER_EXPERT on expert_review */}
                  {activeReport.status === 'expert_review' &&
                    canApproveReportAtStatus(currentRole, activeReport.status) && (
                      <>
                        <button
                          onClick={() => handleOpenAction('approve')}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          تایید مرحله دوم (کارشناس کارفرما)
                        </button>
                        <button
                          onClick={() => handleOpenAction('redo')}
                          className="px-3 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-4 h-4" />
                          درخواست اصلاح (Redo)
                        </button>
                        <button
                          onClick={() => handleOpenAction('reject')}
                          className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          رد گزارش
                        </button>
                      </>
                    )}

                  {/* Step 3: EMPLOYER_CEO on employer_ceo_review */}
                  {activeReport.status === 'employer_ceo_review' &&
                    canApproveReportAtStatus(currentRole, activeReport.status) && (
                      <>
                        <button
                          onClick={() => handleOpenAction('approve')}
                          className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        >
                          <CheckCircle className="w-4 h-4" />
                          تایید نهایی (رییس کارفرما + اعطای امتیاز)
                        </button>
                        <button
                          onClick={() => handleOpenAction('dispute')}
                          className="px-3 py-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          ایجاد اختلاف فنی
                        </button>
                        <button
                          onClick={() => handleOpenAction('reject')}
                          className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          رد نهایی
                        </button>
                      </>
                    )}

                  {/* Deputy ONLY Settles approved reports */}
                  {canSettleReport(currentRole, activeReport.status) && (
                    <button
                      onClick={() => handleOpenAction('settle')}
                      className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      تسویه قطعی حسابداری (معاونت)
                    </button>
                  )}

                  {/* Technician Redo Resubmit */}
                  {canResubmitReport(
                    currentRole,
                    activeReport.status,
                    activeReport.userId,
                    currentUser._id
                  ) && (
                    <button
                      onClick={handleOpenResubmit}
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4" />
                      اصلاح و ارسال مجدد به سرپرست
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation & Reason Modal */}
      {isActionModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right">
            <h3 className="text-base font-bold text-white mb-2">
              {getModalActionLabel(modalActionType)}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              این عملیات به صورت تغییر وضعیت رسمی در سیستم و لاگ ممیزی با امضای دیجیتال کاربر شما ثبت خواهد شد.
            </p>

            {(modalActionType === 'reject' || modalActionType === 'redo' || modalActionType === 'dispute') && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  توضیحات و دلیل الزامی:
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="ذکر دقیق نواقص، استانداردهای مغایر یا بندهای فهرست بها..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 text-right"
                  autoFocus
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsActionModalOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs hover:bg-slate-800 transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
              >
                ثبت و اعمال تغییرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Technician Resubmit Modal */}
      {isResubmitOpen && activeReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right">
            <h3 className="text-base font-bold text-white mb-2">اصلاح گزارش و ارسال مجدد</h3>
            <p className="text-xs text-slate-400 mb-3">
              توضیحات اصلاح‌شده گزارش شماره {toPersianDigits(activeReport._id)} را وارد کنید تا مجدداً به کارتابل سرپرست گروه ارسال گردد:
            </p>
            <textarea
              rows={4}
              value={resubmitDesc}
              onChange={(e) => setResubmitDesc(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-orange-400"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsResubmitOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmResubmit}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs"
              >
                ارسال مجدد به سرپرست
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employer Expert Daily Report Modal */}
      {isDailyModalOpen && canCreateDailyReport(currentRole) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">ثبت گزارش روزانه ناظر کارفرما</h3>
              <button onClick={() => setIsDailyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleDailySubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">تاریخ شمسی:</label>
                  <input
                    type="text"
                    value={dailyDate}
                    onChange={(e) => setDailyDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">گروه نظارتی:</label>
                  <select
                    value={dailyGroupId}
                    onChange={(e) => setDailyGroupId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right"
                  >
                    {scopedGroups.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">پست بازدیدشده:</label>
                <select
                  value={dailyStationId}
                  onChange={(e) => setDailyStationId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right"
                >
                  {stations.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.persianName} ({st.name})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">شرح مشاهدات نظارتی روزانه:</label>
                <textarea
                  rows={4}
                  required
                  value={dailyDesc}
                  onChange={(e) => setDailyDesc(e.target.value)}
                  placeholder="مشاهدات فنی، بررسی ایمنی، پیشرفت عملیات اکیپ..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDailyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
                >
                  ثبت گزارش روزانه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
