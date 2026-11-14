/**
 * PurchasesView
 * Role-Scoped Purchase Requests Workflow:
 * - TECHNICIAN, GROUP_SUPERVISOR, RESIDENT_REP can create
 * - RESIDENT_REP & CONTRACTOR_CEO can approve/reject
 * - Only RESIDENT_REP can mark paid
 */

import React, { useState } from 'react';
import {
  ShoppingCart,
  PlusCircle,
  CheckCircle,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PurchaseRequest } from '../../types';
import { toPersianDigits, formatPriceToman } from '../../utils/formatters';
import {
  filterPurchasesForRole,
  canCreatePurchase,
  canApprovePurchase,
  canPayPurchase,
} from '../../config/rolePermissions';

export const PurchasesView: React.FC = () => {
  const {
    purchases,
    currentRole,
    currentUser,
    createPurchaseRequest,
    updatePurchaseStatus,
  } = useApp();

  const scopedPurchases = filterPurchasesForRole(purchases, currentUser);
  const allowCreate = canCreatePurchase(currentRole);
  const allowApprove = canApprovePurchase(currentRole);
  const allowPay = canPayPurchase(currentRole);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amountToman, setAmountToman] = useState<number>(2500000);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('عدد');
  const [priority, setPriority] = useState<PurchaseRequest['priority']>('medium');

  // Reject modal
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredPurchases = scopedPurchases.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createPurchaseRequest({
      title,
      description,
      amount: amountToman * 10,
      quantity,
      unit,
      priority,
    });

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleConfirmReject = async () => {
    if (!rejectId) return;
    await updatePurchaseStatus(rejectId, 'rejected', rejectReason);
    setRejectId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-400" />
            <span>مدیریت درخواست‌های خرید قطعات و ملزومات</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentRole === 'CONTRACTOR_CEO'
              ? 'بررسی و تایید یا رد درخواست‌های خرید ثبت‌شده در شرکت پیمانکار'
              : currentRole === 'RESIDENT_REP'
              ? 'بررسی، تایید، رد و ثبت پرداخت نهایی درخواست‌های خرید تجهیزات شرکت'
              : 'ثبت و پیگیری درخواست‌های خرید قطعات یدکی و متریال تعمیراتی در محدوده دسترسی شما'}
          </p>
        </div>

        {allowCreate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.3)]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ثبت درخواست خرید جدید</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs w-fit overflow-x-auto">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
            filterStatus === 'all'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          همه درخواست‌ها ({toPersianDigits(scopedPurchases.length)})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
            filterStatus === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          در انتظار تایید ({toPersianDigits(scopedPurchases.filter((p) => p.status === 'pending').length)})
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
            filterStatus === 'approved'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          تایید شده ({toPersianDigits(scopedPurchases.filter((p) => p.status === 'approved').length)})
        </button>
        <button
          onClick={() => setFilterStatus('paid')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
            filterStatus === 'paid'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          پرداخت شده ({toPersianDigits(scopedPurchases.filter((p) => p.status === 'paid').length)})
        </button>
      </div>

      {/* Purchases List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPurchases.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-500 glass-panel rounded-2xl border border-slate-800">
            هیچ درخواست خریدی در محدوده شما ثبت نشده است.
          </div>
        ) : (
          filteredPurchases.map((pr) => (
            <div
              key={pr._id}
              className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-400">{toPersianDigits(pr._id)}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-medium border ${
                      pr.status === 'paid'
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                        : pr.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : pr.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {pr.status === 'paid'
                      ? 'خریداری و پرداخت شد'
                      : pr.status === 'approved'
                      ? 'تایید شده'
                      : pr.status === 'rejected'
                      ? 'رد شده'
                      : 'در انتظار تایید'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{pr.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {pr.description || 'بدون توضیحات تکمیلی.'}
                </p>

                <div className="flex items-center gap-4 text-xs pt-1">
                  <span className="text-slate-400">
                    مقدار:{' '}
                    <strong className="text-white">
                      {toPersianDigits(pr.quantity)} {pr.unit}
                    </strong>
                  </span>
                  <span className="text-slate-400">
                    برآورد قیمت:{' '}
                    <strong className="text-emerald-400 font-bold">
                      {formatPriceToman(pr.amount)}
                    </strong>
                  </span>
                </div>

                {pr.rejectionReason && (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-200">
                    دلیل رد: {pr.rejectionReason}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>درخواست‌کننده: {pr.requestedByName}</span>
                  {pr.approvedByName && <span>تاییدکننده: {pr.approvedByName}</span>}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                  {pr.status === 'pending' && allowApprove && (
                    <>
                      <button
                        onClick={() => updatePurchaseStatus(pr._id, 'approved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>تایید خرید</span>
                      </button>
                      <button
                        onClick={() => setRejectId(pr._id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-950/50 text-xs transition-colors"
                      >
                        رد
                      </button>
                    </>
                  )}

                  {pr.status === 'approved' && allowPay && (
                    <button
                      onClick={() => updatePurchaseStatus(pr._id, 'paid')}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>ثبت پرداخت (نماینده مقیم)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Purchase Modal */}
      {isModalOpen && allowCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right">
            <h3 className="text-base font-bold text-white mb-1">ثبت درخواست خرید اقلام و تجهیزات</h3>
            <p className="text-xs text-slate-400 mb-4">
              ارسال مستقیم برای بررسی نماینده مقیم و رییس شرکت پیمانکار
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  عنوان کالا / قطعه یدکی:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: کلمپ بی‌متال ۵۰۰، روغن سیلیکونی، گریس رسانا..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  شرح مشخصات فنی، استاندارد و دلیل نیاز:
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مشخصات استاندارد سازنده، ولتاژ عایقی یا نام تجهیز نیازمند قطعه..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    تعداد مورد نیاز:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-center focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    واحد اندازه‌گیری:
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="عدد / کیلوگرم / قوطی / دستگاه"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    برآورد قیمت تخمینی (تومان):
                  </label>
                  <input
                    type="number"
                    value={amountToman}
                    onChange={(e) => setAmountToman(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-center focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    اولویت تأمین:
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PurchaseRequest['priority'])}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-amber-400"
                  >
                    <option value="low">عادی</option>
                    <option value="medium">متوسط</option>
                    <option value="high">فوری</option>
                    <option value="urgent">بسیار حیاتی (خاموشی شبکه)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  ثبت و ارسال درخواست
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && allowApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right">
            <h3 className="text-base font-bold text-white mb-2">رد درخواست خرید</h3>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="ذکر دلیل رد درخواست (مثال: موجودی در انبار مرکزی، عدم انطباق استاندارد)..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-rose-400"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRejectId(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                ثبت رد درخواست
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
