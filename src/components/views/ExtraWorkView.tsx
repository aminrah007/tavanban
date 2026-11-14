/**
 * ExtraWorkView
 * Resident Representative (RESIDENT_REP) Workflow for Mapping Extra Work to Price Items
 */

import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits, formatPriceToman } from '../../utils/formatters';
import {
  filterReportsForRole,
  filterPriceItemsForRole,
  canMapExtraWork,
} from '../../config/rolePermissions';

export const ExtraWorkView: React.FC = () => {
  const {
    reports,
    priceItems,
    groups,
    currentRole,
    currentUser,
    mapExtraWork,
    rejectExtraWork,
    setSelectedReportId,
    setCurrentRoute,
  } = useApp();

  const scopedReports = filterReportsForRole(reports, currentUser, groups);
  const scopedPriceItems = filterPriceItemsForRole(priceItems, currentUser);
  const canMap = canMapExtraWork(currentRole);

  // Extract all extra works from role-scoped reports
  const allExtraWorks = scopedReports.flatMap((r) =>
    r.extraWorks.map((ew) => ({
      ...ew,
      reportId: r._id,
      reportDate: r.reportDateJalali,
      userName: r.userName,
      groupName: r.groupName,
    }))
  );

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'mapped' | 'rejected'>('pending');
  const [selectedExtraWorkId, setSelectedExtraWorkId] = useState<string | null>(null);

  // Mapping Form state
  const [selectedPriceItemId, setSelectedPriceItemId] = useState<string>(
    scopedPriceItems.length > 0 ? scopedPriceItems[0]._id : ''
  );
  const [mappedQuantity, setMappedQuantity] = useState<number>(1);
  const [mappingNote, setMappingNote] = useState<string>('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectNote, setRejectNote] = useState<string>('');

  const filteredExtraWorks = allExtraWorks.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const activeWork = allExtraWorks.find((w) => w._id === selectedExtraWorkId);
  const selectedPriceItem = scopedPriceItems.find((p) => p._id === selectedPriceItemId);
  const computedAmountToman = selectedPriceItem
    ? Math.round((selectedPriceItem.unitPrice * mappedQuantity) / 10)
    : 0;

  const handleConfirmMapping = async () => {
    if (!selectedExtraWorkId || !selectedPriceItemId) return;
    const ok = await mapExtraWork(
      selectedExtraWorkId,
      selectedPriceItemId,
      mappedQuantity,
      mappingNote
    );
    if (ok) {
      setSelectedExtraWorkId(null);
      setMappingNote('');
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedExtraWorkId) return;
    const ok = await rejectExtraWork(selectedExtraWorkId, rejectNote);
    if (ok) {
      setIsRejectModalOpen(false);
      setSelectedExtraWorkId(null);
      setRejectNote('');
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-bold text-purple-400 mb-1">
            کارتابل نماینده مقیم پیمانکار
          </div>
          <h2 className="text-xl font-extrabold text-white">معادل‌سازی کارهای اضافی و خارج از فهرست بها</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تطبیق فعالیت‌های فنی اضطراری ثبت‌شده توسط تکنسین با ردیف‌های متناظر فهرست بها جهت ورود به صورت‌وضعیت
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              filterStatus === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            در انتظار معادل‌سازی ({toPersianDigits(allExtraWorks.filter((w) => w.status === 'pending').length)})
          </button>
          <button
            onClick={() => setFilterStatus('mapped')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              filterStatus === 'mapped'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            معادل‌سازی شده ({toPersianDigits(allExtraWorks.filter((w) => w.status === 'mapped').length)})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              filterStatus === 'rejected'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            رد شده ({toPersianDigits(allExtraWorks.filter((w) => w.status === 'rejected').length)})
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredExtraWorks.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 glass-panel rounded-2xl border border-slate-800">
            هیچ کار اضافی با این وضعیت در محدوده شرکت شما ثبت نشده است.
          </div>
        ) : (
          filteredExtraWorks.map((work) => (
            <div
              key={work._id}
              className="p-4 rounded-2xl glass-panel border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-400">{toPersianDigits(work._id)}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <button
                    onClick={() => {
                      setSelectedReportId(work.reportId);
                      setCurrentRoute('reports');
                    }}
                    className="text-xs font-semibold text-slate-300 hover:text-amber-400 underline transition-colors"
                  >
                    گزارش شماره: {toPersianDigits(work.reportId)}
                  </button>
                  <span className="text-xs text-slate-400">({work.userName})</span>
                </div>

                <div className="text-xs font-bold text-white leading-relaxed">{work.description}</div>

                {work.mappingNote && (
                  <div className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-900/50 p-2 rounded-lg">
                    یادداشت فنی: {work.mappingNote}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                {work.status === 'mapped' ? (
                  <div className="text-left sm:text-right">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block mb-1">
                      معادل‌سازی تایید شد
                    </span>
                    <div className="text-xs font-bold text-emerald-400">
                      {formatPriceToman(work.mappedAmount || 0)}
                    </div>
                  </div>
                ) : work.status === 'rejected' ? (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    رد شده توسط نماینده مقیم
                  </span>
                ) : canMap ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedExtraWorkId(work._id)}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    >
                      معادل‌سازی با فهرست بها
                    </button>
                    <button
                      onClick={() => {
                        setSelectedExtraWorkId(work._id);
                        setIsRejectModalOpen(true);
                      }}
                      className="px-3 py-2 rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-950/40 text-xs transition-colors"
                    >
                      رد
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-amber-400">در انتظار معادل‌سازی</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mapping Dialog Modal */}
      {canMap && selectedExtraWorkId && !isRejectModalOpen && activeWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 shadow-2xl text-right">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <span>معادل‌سازی کار اضافی</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              شرح تکنسین: <strong className="text-slate-200">«{activeWork.description}»</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  انتخاب ردیف معادل از فهرست آحاد بها:
                </label>
                <select
                  value={selectedPriceItemId}
                  onChange={(e) => setSelectedPriceItemId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-400 text-right"
                >
                  {scopedPriceItems.map((pi) => (
                    <option key={pi._id} value={pi._id}>
                      {pi.code} - {pi.title} (واحد: {pi.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  تعداد یا متراژ معادل:
                </label>
                <input
                  type="number"
                  min={1}
                  value={mappedQuantity}
                  onChange={(e) => setMappedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-400 text-right"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span>نرخ واحد آیتم انتخابی:</span>
                  <span className="font-bold">{formatPriceToman(selectedPriceItem?.unitPrice || 0)}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-emerald-400 pt-2 border-t border-slate-800">
                  <span>مجموع مبلغ معادل‌سازی شده:</span>
                  <span className="text-sm font-black">{formatPriceToman(computedAmountToman * 10)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  یادداشت و استدلال فنی نماینده مقیم:
                </label>
                <textarea
                  rows={2}
                  value={mappingNote}
                  onChange={(e) => setMappingNote(e.target.value)}
                  placeholder="دلایل انطباق کار اضافی با این ردیف فهرست بها..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-400 text-right"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedExtraWorkId(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs hover:bg-slate-800 transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmMapping}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-[0_0_12px_rgba(168,85,247,0.3)]"
              >
                تایید معادل‌سازی نهایی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {canMap && isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right">
            <h3 className="text-base font-bold text-white mb-2">رد کار اضافی</h3>
            <p className="text-xs text-slate-400 mb-4">
              لطفا دلیل عدم انطباق با قرارداد یا فهرست بها را ثبت فرمایید:
            </p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="دلیل رد..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-400 text-right"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                ثبت رد کار اضافی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
