/**
 * NewReportView
 * Field Reporting Interface strictly for TECHNICIAN & GROUP_SUPERVISOR
 * Supports on-behalf-of reporting for GROUP_SUPERVISOR (direct to expert_review),
 * price catalog Snapshot, Extra Work, and Offline Sync Queue.
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Camera,
  Layers,
  Send,
  Search,
  ArrowRight,
  WifiOff,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReportItem, ExtraWorkItem, Attachment, PriceItem } from '../../types';
import { StationCommunication } from '../../data/stationsChecklist';
import { StationSelector } from '../common/StationSelector';
import { toPersianDigits, formatPriceToman } from '../../utils/formatters';
import {
  canCreateWorkReport,
  filterGroupsForRole,
  filterPriceItemsForRole,
} from '../../config/rolePermissions';

export const NewReportView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    users,
    priceItems,
    groups,
    tasks,
    stations,
    preselectedStationId,
    setPreselectedStationId,
    preselectedTaskId,
    setPreselectedTaskId,
    createReport,
    setCurrentRoute,
    isOnline,
    showToast,
  } = useApp();

  const hidePrices = currentRole === 'TECHNICIAN';

  // Strictly block non-field roles
  if (!canCreateWorkReport(currentRole)) {
    return (
      <div className="max-w-xl mx-auto p-6 rounded-2xl glass-panel border border-rose-500/30 bg-rose-950/20 text-right space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
          <ShieldAlert className="w-5 h-5" />
          <span>عدم مجوز ثبت گزارش کار میدانی</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          مطابق ساختار سازمانی توان‌بان، ثبت گزارش کار عملیاتی منحصراً در اختیار تکنسین فنی و سرپرست گروه است.
        </p>
        <button
          onClick={() => setCurrentRoute('dashboard')}
          className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
        >
          بازگشت به میز کار
        </button>
      </div>
    );
  }

  // Role-scoped Groups
  const userGroups = filterGroupsForRole(groups, currentUser);
  const [selectedGroupId, setSelectedGroupId] = useState(
    userGroups.length > 0 ? userGroups[0]._id : 'grp-1'
  );

  // On-behalf-of author selector (for GROUP_SUPERVISOR)
  const activeGroup = userGroups.find((g) => g._id === selectedGroupId) || userGroups[0];
  const groupMemberUsers = activeGroup
    ? users.filter((u) => activeGroup.memberIds.includes(u._id))
    : [currentUser];
  const [onBehalfOfUserId, setOnBehalfOfUserId] = useState<string>(currentUser._id);

  // Selected Work Location (Station)
  const [selectedStation, setSelectedStation] = useState<StationCommunication | null>(() => {
    if (preselectedStationId) {
      return stations.find((s) => s.id === preselectedStationId) || null;
    }
    return stations.find((s) => s.id === 'st-zahedan-230') || null;
  });

  // Description & Date
  const jalaliToday = '۱۴۰۳/۰۸/' + (new Date().getDate() % 30 + 1);
  const [reportDateJalali, setReportDateJalali] = useState(jalaliToday);
  const [description, setDescription] = useState('');
  const [linkedTaskId, setLinkedTaskId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (preselectedStationId) {
      const matched = stations.find((s) => s.id === preselectedStationId);
      if (matched) setSelectedStation(matched);
      setPreselectedStationId(null);
    }
  }, [preselectedStationId, stations, setPreselectedStationId]);

  useEffect(() => {
    if (preselectedTaskId) {
      const task = tasks.find((t) => t._id === preselectedTaskId);
      if (task) {
        setLinkedTaskId(task._id);
        setDescription((prev) => prev || `گزارش انجام مأموریت: ${task.title}`);
        if (task.stationId) {
          const st = stations.find((s) => s.id === task.stationId);
          if (st) setSelectedStation(st);
        }
      }
      setPreselectedTaskId(null);
    }
  }, [preselectedTaskId, tasks, stations, setPreselectedTaskId]);

  // Selected Items from Catalog
  const [selectedItems, setSelectedItems] = useState<{ priceItem: PriceItem; quantity: number }[]>([]);

  // Catalog Search (role-scoped price items)
  const scopedPriceItems = filterPriceItemsForRole(priceItems, currentUser);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Extra Work Items
  const [extraWorks, setExtraWorks] = useState<{ id: string; description: string }[]>([]);
  const [extraWorkInput, setExtraWorkInput] = useState('');

  // Attachments
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter Catalog
  const filteredCatalog = scopedPriceItems.filter((pi) => {
    if (!catalogSearch.trim()) return true;
    const q = catalogSearch.toLowerCase();
    return (
      pi.title.toLowerCase().includes(q) ||
      pi.code.toLowerCase().includes(q) ||
      (pi.category && pi.category.toLowerCase().includes(q))
    );
  });

  // Add Item to selected
  const handleAddItem = (pi: PriceItem) => {
    const existing = selectedItems.find((item) => item.priceItem._id === pi._id);
    if (existing) {
      setSelectedItems((prev) =>
        prev.map((i) => (i.priceItem._id === pi._id ? { ...i, quantity: i.quantity + 1 } : i))
      );
    } else {
      setSelectedItems((prev) => [...prev, { priceItem: pi, quantity: 1 }]);
    }
    showToast(`«${pi.title.slice(0, 24)}...» اضافه شد`, 'info');
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((i) => {
          if (i.priceItem._id === id) {
            const newQty = Math.max(0, i.quantity + delta);
            return { ...i, quantity: newQty };
          }
          return i;
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.priceItem._id !== id));
  };

  // Add Extra Work
  const handleAddExtraWork = () => {
    if (!extraWorkInput.trim()) return;
    setExtraWorks((prev) => [
      ...prev,
      { id: 'ew-' + Date.now(), description: extraWorkInput.trim() },
    ]);
    setExtraWorkInput('');
  };

  const handleRemoveExtraWork = (id: string) => {
    setExtraWorks((prev) => prev.filter((ew) => ew.id !== id));
  };

  // Photo upload
  const handleAddMockPhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500',
      'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=500',
    ];
    const picked = samplePhotos[attachments.length % samplePhotos.length];
    const newAtt: Attachment = {
      _id: 'att-' + Date.now(),
      kind: 'image',
      fileName: `field_photo_${Date.now().toString().slice(-4)}.jpg`,
      mimeType: 'image/jpeg',
      size: 1024 * 850,
      storagePath: `/uploads/field_${Date.now()}.jpg`,
      dataUrl: picked,
      uploadStatus: 'uploaded',
      createdAt: new Date().toISOString(),
    };
    setAttachments((prev) => [...prev, newAtt]);
    showToast('تصویر مستندات میدانی با موفقیت فشرده و افزوده شد.', 'info');
  };

  // Calculate Total
  const totalAmountRial = selectedItems.reduce(
    (acc, curr) => acc + curr.priceItem.unitPrice * curr.quantity,
    0
  );

  // Submit Handler
  const handleSubmitReport = async () => {
    if (selectedItems.length === 0 && extraWorks.length === 0) {
      showToast('حداقل یک آیتم فهرست بها یا شرح کار اضافی باید ثبت شود.', 'error');
      return;
    }

    setIsSubmitting(true);

    const snapshotItems: ReportItem[] = selectedItems.map((item, idx) => ({
      _id: `ri-${Date.now()}-${idx}`,
      reportId: '',
      priceItemId: item.priceItem._id,
      titleSnapshot: item.priceItem.title,
      unitSnapshot: item.priceItem.unit,
      unitPriceSnapshot: item.priceItem.unitPrice,
      quantity: item.quantity,
      totalAmount: item.priceItem.unitPrice * item.quantity,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const preparedExtraWorks: ExtraWorkItem[] = extraWorks.map((ew) => ({
      _id: ew.id,
      reportId: '',
      description: ew.description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const result = await createReport({
      groupId: selectedGroupId,
      stationId: selectedStation?.id,
      stationName: selectedStation ? `${selectedStation.persianName} (${selectedStation.name})` : undefined,
      dispatchCode: selectedStation?.dispatchCode || undefined,
      taskReferenceId: linkedTaskId,
      reportDateJalali,
      description: description.trim() || 'گزارش کار عملیات نگهداری و تعمیرات',
      items: snapshotItems,
      extraWorks: preparedExtraWorks,
      attachments,
      totalAmount: totalAmountRial,
      onBehalfOfUserId: currentRole === 'GROUP_SUPERVISOR' ? onBehalfOfUserId : undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      if (result.isOffline) {
        setCurrentRoute('offline-queue');
      } else {
        setCurrentRoute('reports');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-right">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <button
            onClick={() => setCurrentRoute('reports')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به فهرست گزارش‌ها</span>
          </button>
          <h2 className="text-xl font-extrabold text-white">
            {currentRole === 'GROUP_SUPERVISOR'
              ? 'ثبت گزارش کار میدانی (سرپرست گروه / به نام عضو)'
              : 'ثبت گزارش کار میدانی تکنسین'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ثبت سریع آیتم‌های فهرست بها با تثبیت نرخ مصوب و قابلیت ذخیره‌سازی آفلاین
          </p>
        </div>

        {!isOnline && (
          <div className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-300 text-xs font-medium flex items-center gap-1.5">
            <WifiOff className="w-4 h-4" />
            <span>حالت آفلاین فعال است (ذخیره در صف محلی)</span>
          </div>
        )}
      </div>

      {/* Group Supervisor On-Behalf-Of Notice */}
      {currentRole === 'GROUP_SUPERVISOR' && (
        <div className="p-4 rounded-2xl border border-sky-500/30 bg-sky-950/20 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
            <Users className="w-4 h-4" />
            <span>ثبت گزارش توسط سرپرست گروه (به نام خود یا اعضای تیم)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs text-slate-300 mb-1">ثبت گزارش به نام:</label>
              <select
                value={onBehalfOfUserId}
                onChange={(e) => setOnBehalfOfUserId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-sky-400"
              >
                {groupMemberUsers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.fullName} {m._id === currentUser._id ? '(خودم - سرپرست)' : '(عضو گروه)'}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              مطابق پروتکل عدم خودتاییدی، گزارش ثبت‌شده توسط سرپرست گروه مستقیماً به کارتابل <strong className="text-sky-300">کارشناس کارفرما</strong> ارسال می‌گردد.
            </p>
          </div>
        </div>
      )}

      {/* Basic Info: Work Location (Station), Group & Jalali Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl glass-panel border border-slate-800/80 bg-slate-900/60">
        <div className="sm:col-span-2">
          <StationSelector
            stations={stations}
            value={selectedStation?.id}
            onChange={(st) => setSelectedStation(st)}
            label="محل انجام کار (انتخاب از لیست ۱۰۷ پست برق و مرکز):"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            گروه کاری عملیاتی:
          </label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 text-right"
          >
            {userGroups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            تاریخ انجام کار (شمسی):
          </label>
          <input
            type="text"
            value={reportDateJalali}
            onChange={(e) => setReportDateJalali(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 text-right"
          />
        </div>
      </div>

      {/* Description Textarea */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 bg-slate-900/60">
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          شرح کلی اقدامات انجام شده:
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="شرح کامل عملیات میدانی، ایستگاه، شماره ترانس یا تجهیز مورد تست..."
          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed text-right"
        />
      </div>

      {/* Price Catalog Picker */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">آیتم‌های فهرست آحاد بهای گروه</h3>
            <p className="text-[11px] text-slate-400">
              قیمت ثبت شده در لحظه ثبت به عنوان نرخ قطعی گزارش ذخیره می‌شود.
            </p>
          </div>

          <button
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-300 text-xs font-medium hover:bg-amber-500/25 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isCatalogOpen ? 'بستن کاتالوگ' : 'افزودن از فهرست بها'}</span>
          </button>
        </div>

        {/* Catalog Dropdown Picker */}
        {isCatalogOpen && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-700/80 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="جستجو در عناوین یا کدهای فهرست بها..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 text-right"
                autoFocus
              />
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/60 pr-1">
              {filteredCatalog.map((pi) => (
                <div
                  key={pi._id}
                  className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-slate-900/60 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-400">{toPersianDigits(pi.code)}</span>
                      <span className="text-xs font-semibold text-slate-200 truncate">{pi.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {hidePrices
                        ? `واحد: ${pi.unit}`
                        : `واحد: ${pi.unit} · نرخ واحد: ${formatPriceToman(pi.unitPrice)}`}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddItem(pi)}
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0"
                  >
                    + انتخاب
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Items List with NumberStepper */}
        <div className="space-y-2">
          {selectedItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              هنوز هیچ آیتمی از فهرست بها انتخاب نشده است. از دکمه «افزودن از فهرست بها» استفاده کنید.
            </div>
          ) : (
            selectedItems.map(({ priceItem, quantity }) => {
              const subtotalToman = Math.round((priceItem.unitPrice * quantity) / 10);
              return (
                <div
                  key={priceItem._id}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400">{toPersianDigits(priceItem.code)}</span>
                      <span className="text-xs font-bold text-slate-200">{priceItem.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {hidePrices
                        ? `واحد: ${priceItem.unit}`
                        : `واحد: ${priceItem.unit} · نرخ پایه: ${formatPriceToman(priceItem.unitPrice)}`}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(priceItem._id, -1)}
                        className="px-2.5 py-1 text-slate-300 hover:bg-slate-800 text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-white min-w-[2.5rem] text-center">
                        {toPersianDigits(quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(priceItem._id, 1)}
                        className="px-2.5 py-1 text-slate-300 hover:bg-slate-800 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>

                    {!hidePrices && (
                      <div className="text-xs font-bold text-emerald-400 min-w-[5.5rem] text-left tabular-nums">
                        {formatPriceToman(subtotalToman * 10)}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(priceItem._id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="حذف آیتم"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Extra Work Section */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 bg-slate-900/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">ثبت کارهای اضافی و خارج از فهرست بها</h3>
          </div>
          <span className="text-[11px] text-purple-400">معادل‌سازی توسط نماینده مقیم</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={extraWorkInput}
            onChange={(e) => setExtraWorkInput(e.target.value)}
            placeholder="مثال: شستشوی مقره بوشینگ با حلال الکلی به دلیل نشت گازوییل ژنراتور..."
            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-400 text-right"
            onKeyDown={(e) => e.key === 'Enter' && handleAddExtraWork()}
          />
          <button
            type="button"
            onClick={handleAddExtraWork}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shrink-0"
          >
            + ثبت کار اضافی
          </button>
        </div>

        {extraWorks.length > 0 && (
          <div className="space-y-1.5 pt-2">
            {extraWorks.map((ew) => (
              <div
                key={ew.id}
                className="p-2.5 rounded-xl border border-purple-900/60 bg-purple-950/20 text-xs flex items-center justify-between gap-2"
              >
                <span className="text-slate-200">{ew.description}</span>
                <button
                  onClick={() => handleRemoveExtraWork(ew.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attachments */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 bg-slate-900/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">پیوست تصاویر مستندات میدانی</h3>
          </div>
          <button
            type="button"
            onClick={handleAddMockPhoto}
            className="px-3 py-1.5 rounded-xl border border-sky-500/40 bg-sky-500/15 text-sky-300 text-xs font-medium hover:bg-sky-500/25 transition-colors flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>افزودن عکس با دوربین</span>
          </button>
        </div>

        {attachments.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {attachments.map((att) => (
              <div key={att._id} className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 relative group">
                <img src={att.dataUrl} alt={att.fileName} className="w-full h-24 object-cover" />
                <button
                  type="button"
                  onClick={() => setAttachments((prev) => prev.filter((a) => a._id !== att._id))}
                  className="absolute top-1.5 left-1.5 p-1 rounded-md bg-black/70 text-rose-400 hover:text-rose-200"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <div className="p-1.5 text-[10px] text-slate-300 truncate text-center">{att.fileName}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 py-3 text-center border border-dashed border-slate-800 rounded-xl">
            هیچ تصویری پیوست نشده است. بارگذاری تصاویر مستند قبل و بعد کار به تایید سریع‌تر گزارش کمک می‌کند.
          </div>
        )}
      </div>

      {/* Footer Total & Submit Bar */}
      <div className="rounded-2xl glass-panel border border-amber-500/30 p-4 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 shadow-2xl">
        {hidePrices ? (
          <div>
            <div className="text-[11px] text-slate-400">خلاصه اقلام گزارش کار:</div>
            <div className="text-base font-black text-amber-400 tabular-nums">
              {toPersianDigits(selectedItems.length)} آیتم فهرست بها · {toPersianDigits(extraWorks.length)} کار اضافی
            </div>
          </div>
        ) : (
          <div>
            <div className="text-[11px] text-slate-400">جمع کل ارزش برآورد شده:</div>
            <div className="text-xl font-black text-amber-400 tabular-nums">
              {formatPriceToman(totalAmountRial)}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmitReport}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.32)]"
          >
            <Send className="w-4 h-4" />
            <span>{isOnline ? 'ارسال رسمی گزارش کار' : 'ذخیره در صف آفلاین'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
