/**
 * PriceItemsView
 * Role-Scoped Price Catalog (فهرست بها) with Snapshot Integrity Proof
 * Only CONTRACTOR_CEO can create or edit rates; all other allowed roles are strictly Read-Only.
 */

import React, { useState } from 'react';
import { Tag, Plus, ShieldAlert, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PriceItem } from '../../types';
import { toPersianDigits, formatPriceToman } from '../../utils/formatters';
import { filterPriceItemsForRole, canManagePriceItems } from '../../config/rolePermissions';

export const PriceItemsView: React.FC = () => {
  const {
    priceItems,
    currentRole,
    currentUser,
    createPriceItem,
    updatePriceItem,
  } = useApp();

  const scopedPriceItems = filterPriceItemsForRole(priceItems, currentUser);
  const canEditCatalog = canManagePriceItems(currentRole);
  const hidePrices = currentRole === 'TECHNICIAN';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingItem, setEditingItem] = useState<PriceItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form inputs for new item
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newUnit, setNewUnit] = useState('دستگاه');
  const [newPriceToman, setNewPriceToman] = useState<number>(1000000);
  const [newCategory, setNewCategory] = useState('تجهیزات پست');

  const categories = Array.from(new Set(scopedPriceItems.map((p) => p.category || 'عمومی')));

  const filteredItems = scopedPriceItems.filter((pi) => {
    if (selectedCategory !== 'all' && pi.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return pi.title.toLowerCase().includes(q) || pi.code.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    await updatePriceItem(editingItem._id, {
      title: editingItem.title,
      unitPrice: editingItem.unitPrice,
      unit: editingItem.unit,
    });
    setEditingItem(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await createPriceItem({
      code: newCode || `FA-${Math.floor(Math.random() * 9000 + 1000)}`,
      title: newTitle,
      unit: newUnit,
      unitPrice: newPriceToman * 10,
      category: newCategory,
      contractId: 'cnt-1',
      groupIds: ['grp-1'],
    });

    setIsNewModalOpen(false);
    setNewTitle('');
    setNewCode('');
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-400" />
            <span>فهرست آحاد بها و نرخ‌های پایه (Price Items)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {canEditCatalog
              ? 'مدیریت، تعریف و به‌روزرسانی نرخ آیتم‌های قراردادی شرکت پیمانکار'
              : hidePrices
              ? 'مشاهده عناوین و واحدهای فهرست بهای مجاز برای گروه شما (مبالغ ریالی برای کارشناس فنی نمایش داده نمی‌شود)'
              : 'مشاهده فهرست آحاد بهای مجاز برای گروه و محدوده شغلی شما (حالت فقط خواندنی)'}
          </p>
        </div>

        {canEditCatalog && (
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن آیتم جدید</span>
          </button>
        )}
      </div>

      {/* Snapshot Architecture Callout Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-slate-300">
          <strong className="text-amber-300 font-bold block mb-1">
            اصل تثبیت نرخ در زمان ثبت گزارش کار:
          </strong>
          هرگونه تغییر در مبلغ یا عنوان آیتم‌های این فهرست (منحصراً توسط رییس شرکت پیمانکار)، روی گزارش‌های ثبت‌شده قبلی اثری نمی‌گذارد و هر گزارش نرخ لحظه ثبت خود را حفظ می‌کند.
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            همه دسته‌ها
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو با عنوان یا کد آیتم..."
            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">کد ردیف</th>
                <th className="py-3 px-4">شرح کامل آیتم</th>
                <th className="py-3 px-4">دسته‌بندی</th>
                <th className="py-3 px-4">واحد</th>
                {!hidePrices && <th className="py-3 px-4 text-left">نرخ پایه جاری (تومان)</th>}
                {canEditCatalog && <th className="py-3 px-4 text-center">عملیات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((pi) => (
                <tr key={pi._id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-amber-400">{toPersianDigits(pi.code)}</td>
                  <td className="py-3 px-4 font-medium text-slate-200">{pi.title}</td>
                  <td className="py-3 px-4 text-slate-400">{pi.category || 'عمومی'}</td>
                  <td className="py-3 px-4 text-slate-300">{pi.unit}</td>
                  {!hidePrices && (
                    <td className="py-3 px-4 font-bold text-left text-emerald-400 tabular-nums">
                      {formatPriceToman(pi.unitPrice)}
                    </td>
                  )}
                  {canEditCatalog && (
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setEditingItem(pi)}
                        className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                      >
                        ویرایش نرخ
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal (CONTRACTOR_CEO ONLY) */}
      {canEditCatalog && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right">
            <h3 className="text-base font-bold text-white mb-1">ویرایش نرخ آیتم فهرست بها</h3>
            <p className="text-xs text-amber-400/90 mb-4">
              نکته: گزارش‌های قبلی که با نرخ قبلی ثبت شده‌اند تحت‌الشعاع این تغییر قرار نمی‌گیرند.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">عنوان آیتم:</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">نرخ جدید (ریال):</label>
                <input
                  type="number"
                  value={editingItem.unitPrice}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, unitPrice: parseInt(e.target.value) || 0 })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-center focus:outline-none focus:border-amber-400"
                />
                <span className="text-[11px] text-emerald-400 mt-1 block">
                  معادل {formatPriceToman(editingItem.unitPrice)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
              >
                ذخیره تغییرات نرخ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Item Modal (CONTRACTOR_CEO ONLY) */}
      {canEditCatalog && isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right">
            <h3 className="text-base font-bold text-white mb-3">افزودن آیتم جدید به فهرست بها</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  کد ردیف (اختیاری):
                </label>
                <input
                  type="text"
                  placeholder="FA-1007"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-center focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">شرح آیتم:</label>
                <input
                  type="text"
                  required
                  placeholder="عنوان دقیق خدمات..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">واحد:</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    نرخ پایه (تومان):
                  </label>
                  <input
                    type="number"
                    value={newPriceToman}
                    onChange={(e) => setNewPriceToman(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-center focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">دسته‌بندی:</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  افزودن آیتم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
