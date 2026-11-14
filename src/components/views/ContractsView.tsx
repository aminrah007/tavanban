/**
 * ContractsView
 * DEPUTY Management of Contractor Companies, Active Contracts, and Work Units
 */

import React, { useState } from 'react';
import { Building2, ShieldAlert, PlusCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits, formatPriceToman } from '../../utils/formatters';
import { canManageContractsAndCompanies } from '../../config/rolePermissions';

export const ContractsView: React.FC = () => {
  const { contracts, companies, currentRole, createCompany, createContract } = useApp();

  const canManage = canManageContractsAndCompanies(currentRole);

  // New Company Modal
  const [isCompOpen, setIsCompOpen] = useState(false);
  const [compName, setCompName] = useState('');
  const [compCode, setCompCode] = useState('');
  const [compPhone, setCompPhone] = useState('');
  const [compDesc, setCompDesc] = useState('');

  // New Contract Modal
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [cntTitle, setCntTitle] = useState('');
  const [cntNumber, setCntNumber] = useState('');
  const [cntCompanyId, setCntCompanyId] = useState(companies[0]?._id || 'comp-1');
  const [cntAmountToman, setCntAmountToman] = useState<number>(5000000000);
  const [cntStart, setCntStart] = useState('۱۴۰۳/۰۱/۰۱');
  const [cntEnd, setCntEnd] = useState('۱۴۰۴/۱۲/۲۹');

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) return;
    const ok = await createCompany({
      name: compName.trim(),
      code: compCode.trim() || `CMP-${companies.length + 101}`,
      phone: compPhone.trim(),
      description: compDesc.trim(),
    });
    if (ok) {
      setIsCompOpen(false);
      setCompName('');
      setCompCode('');
      setCompPhone('');
      setCompDesc('');
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cntTitle.trim()) return;
    const ok = await createContract({
      title: cntTitle.trim(),
      contractNumber: cntNumber.trim() || undefined,
      contractorCompanyId: cntCompanyId,
      totalAmount: cntAmountToman * 10,
      startDateJalali: cntStart,
      endDateJalali: cntEnd,
    });
    if (ok) {
      setIsContractOpen(false);
      setCntTitle('');
      setCntNumber('');
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>مدیریت شرکت‌های پیمانکار و قراردادها</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            نظارت راهبردی و ثبت قراردادهای نگهداری، تعمیرات و بهره‌برداری پست‌ها و خطوط انتقال برق منطقه‌ای
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-sky-400" />
              <span>ثبت شرکت پیمانکار</span>
            </button>
            <button
              onClick={() => setIsContractOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>ثبت قرارداد جدید</span>
            </button>
          </div>
        )}
      </div>

      {/* Security Warning */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-300 font-bold block mb-0.5">
            دستورالعمل حریم خصوصی و امنیت اطلاعات:
          </strong>
          طبق مصوبه حراست برق منطقه‌ای، ثبت اسناد و ضمائم دارای طبقه‌بندی محرمانه در سامانه ممنوع است. فقط عناوین و شاخص‌های کلی قراردادها ثبت می‌گردند.
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {contracts.map((contract) => {
          const contractor = companies.find((c) => c._id === contract.contractorCompanyId);

          return (
            <div
              key={contract._id}
              className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-amber-400">{toPersianDigits(contract.contractNumber)}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-emerald-400 font-semibold">قرارداد معتبر و جاری</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">نوع: {contract.type}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{contract.title}</h3>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block mb-0.5">مبلغ برآورد کل قرارداد:</span>
                  <div className="text-base font-bold text-emerald-400 tabular-nums">
                    {formatPriceToman(contract.totalAmount)}
                  </div>
                </div>
              </div>

              {contract.description && (
                <p className="text-xs text-slate-300 leading-relaxed">{contract.description}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">شرکت پیمانکار مجری:</span>
                  <span className="font-semibold text-white">{contractor?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">تاریخ شروع شمسی:</span>
                  <span className="text-amber-300 font-bold">{toPersianDigits(contract.startDateJalali)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">تاریخ پایان شمسی:</span>
                  <span className="text-amber-300 font-bold">{toPersianDigits(contract.endDateJalali)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Companies Grid */}
      <div className="pt-4">
        <h3 className="text-sm font-bold text-white mb-3">شرکت‌های پیمانکار طرف قرارداد</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {companies.map((comp) => (
            <div
              key={comp._id}
              className="p-4 rounded-2xl glass-panel border border-slate-800 bg-slate-900/50 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">{toPersianDigits(comp.code)}</span>
                <span className="text-emerald-400 font-medium">دارای صلاحیت رتبه ۱</span>
              </div>
              <h4 className="text-sm font-bold text-white">{comp.name}</h4>
              <p className="text-slate-400 text-[11px]">{comp.description || 'پیمانکار بهره‌برداری و تعمیرات شبکه'}</p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-[11px]">
                <span>تلفن: {toPersianDigits(comp.phone)}</span>
                <span>تعداد پرسنل فنی: {toPersianDigits(comp.totalPersonnelCount)} نفر</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Company Modal */}
      {isCompOpen && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">ثبت شرکت پیمانکار جدید</h3>
              <button onClick={() => setIsCompOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCompany} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">نام شرکت:</label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">کد ثبتی:</label>
                  <input
                    type="text"
                    value={compCode}
                    onChange={(e) => setCompCode(e.target.value)}
                    placeholder="CMP-205"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">تلفن تماس:</label>
                  <input
                    type="text"
                    value={compPhone}
                    onChange={(e) => setCompPhone(e.target.value)}
                    placeholder="021-88001122"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-center"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">حوزه تخصص:</label>
                <textarea
                  rows={2}
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCompOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  ثبت شرکت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Contract Modal */}
      {isContractOpen && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">ثبت قرارداد جدید</h3>
              <button onClick={() => setIsContractOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateContract} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">عنوان قرارداد:</label>
                <input
                  type="text"
                  required
                  value={cntTitle}
                  onChange={(e) => setCntTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">شماره قرارداد:</label>
                  <input
                    type="text"
                    value={cntNumber}
                    onChange={(e) => setCntNumber(e.target.value)}
                    placeholder="TR-1403/882"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">شرکت مجری:</label>
                  <select
                    value={cntCompanyId}
                    onChange={(e) => setCntCompanyId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right"
                  >
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">مبلغ برآورد (تومان):</label>
                <input
                  type="number"
                  value={cntAmountToman}
                  onChange={(e) => setCntAmountToman(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-center"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">تاریخ شروع:</label>
                  <input
                    type="text"
                    value={cntStart}
                    onChange={(e) => setCntStart(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">تاریخ پایان:</label>
                  <input
                    type="text"
                    value={cntEnd}
                    onChange={(e) => setCntEnd(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-center"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsContractOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  ثبت قرارداد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
