/**
 * WirelessTestSheet.tsx
 * Organized Digital Implementation of the VHF Radio / Wireless Periodic Test Sheet
 * («تست شیت نگهداری و اندازه‌گیری سیستم رادیویی VHF»)
 * - Exact structural fidelity to attached Excel templates (Raw + Polan Substation)
 * - Supports 1 (Main) & 2 (Repeater) radio columns + multi-unit tabs per substation
 * - Fixed physical units (w, dB, m, V, Ah), automatic live VSWR calculation, review chips
 * - Real camera/gallery test photo attachments + AppContext / Firestore / offline queue sync
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Radio,
  Plus,
  Trash2,
  Copy,
  Camera,
  Upload,
  Save,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Eye,
  X,
  WifiOff,
  BatteryCharging,
  Info,
  Gauge,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StationCommunication } from '../../data/stationsChecklist';
import {
  PeriodicTestAttachment,
  PeriodicTestRecord,
  PeriodicTestStatus,
  WirelessRadioColumns,
  WirelessUnitTestSheet,
} from '../../types';
import {
  AGL_GUIDE_TEXT,
  createDefaultWirelessUnit,
  createPolanWirelessSampleUnit,
} from '../../data/wirelessSamples';
import { toPersianDigits } from '../../utils/formatters';

interface WirelessTestSheetProps {
  selectedStation: StationCommunication | null;
  onSelectStationById: (stationId: string) => void;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}

const REVIEW_PRESETS = ['سالم', 'قابل قبول', 'معیوب', '*'] as const;

function normalizeNumericDecimal(raw: string): string {
  const english = raw
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[،,]/g, '.');
  const cleaned = english.replace(/[^0-9.]/g, '');
  const dot = cleaned.indexOf('.');
  if (dot === -1) return cleaned;
  return `${cleaned.slice(0, dot + 1)}${cleaned.slice(dot + 1).replace(/\./g, '')}`;
}

function computeVswrBadge(txStr: string, refStr: string): {
  ratioText: string;
  statusLabel: string;
  className: string;
} | null {
  const pf = parseFloat(normalizeNumericDecimal(txStr));
  const pr = parseFloat(normalizeNumericDecimal(refStr));
  if (!pf || pf <= 0 || Number.isNaN(pr) || pr < 0) return null;
  if (pr >= pf) {
    return {
      ratioText: 'خطای بازگشت کامل',
      statusLabel: 'بحرانی',
      className: 'border-rose-500/50 bg-rose-500/20 text-rose-300',
    };
  }
  const rho = Math.sqrt(pr / pf);
  const vswr = (1 + rho) / (1 - rho);
  if (vswr <= 1.5) {
    return {
      ratioText: `VSWR ${vswr.toFixed(2)}`,
      statusLabel: 'عالی',
      className: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
    };
  }
  if (vswr <= 2.0) {
    return {
      ratioText: `VSWR ${vswr.toFixed(2)}`,
      statusLabel: 'قابل قبول',
      className: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
    };
  }
  return {
    ratioText: `VSWR ${vswr.toFixed(2)}`,
    statusLabel: 'بازگشت بالا',
    className: 'border-rose-500/50 bg-rose-500/20 text-rose-300',
  };
}

async function compressImageFile(file: File): Promise<{ dataUrl: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 960;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: String(reader.result || ''), size: file.size });
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.68);
        resolve({
          dataUrl: compressed,
          size: Math.round((compressed.length * 3) / 4),
        });
      };
      img.onerror = () => reject(new Error('Image decode failed'));
      img.src = String(reader.result || '');
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

function getPeriodicStatusBadge(status: PeriodicTestStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'supervisor_approved':
      return {
        label: 'تایید سرپرست گروه',
        className: 'border-sky-500/40 bg-sky-500/15 text-sky-300',
      };
    case 'expert_approved':
      return {
        label: 'تایید نهایی ناظر کارفرما',
        className: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
      };
    case 'redo_requested':
      return {
        label: 'نیازمند اصلاح و بازنگری',
        className: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
      };
    default:
      return {
        label: 'ثبت‌شده (در انتظار تایید)',
        className: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
      };
  }
}

export const WirelessTestSheet: React.FC<WirelessTestSheetProps> = ({
  selectedStation,
  onSelectStationById,
  selectedMonth,
  onSelectMonth,
}) => {
  const {
    currentUser,
    currentRole,
    groups,
    stations,
    contracts,
    periodicTests,
    savePeriodicTest,
    reviewPeriodicTest,
    isOnline,
    showToast,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const activeContract = contracts[0];
  const userGroup = useMemo(
    () =>
      groups.find(
        (g) =>
          g.isActive &&
          (currentUser.groupIds?.includes(g._id) ||
            g.memberIds.includes(currentUser._id) ||
            g.supervisorUserId === currentUser._id)
      ),
    [groups, currentUser]
  );

  // Record metadata
  const [editingRecordId, setEditingRecordId] = useState<string | undefined>(undefined);
  const [pmDateJalali, setPmDateJalali] = useState('۱۴۰۵/۰۷/۲۵');
  const [preparerName, setPreparerName] = useState(currentUser.fullName);
  const [approverName, setApproverName] = useState('');

  // Units (1 or more wireless radios per substation)
  const [units, setUnits] = useState<WirelessUnitTestSheet[]>(() => [
    createDefaultWirelessUnit('دستگاه بی‌سیم ۱', selectedStation?.persianName || ''),
  ]);
  const [activeUnitIndex, setActiveUnitIndex] = useState(0);

  // Photos
  const [attachments, setAttachments] = useState<PeriodicTestAttachment[]>([]);
  const [uploadUnitTag, setUploadUnitTag] = useState<string>('کلی پست');
  const [previewPhoto, setPreviewPhoto] = useState<PeriodicTestAttachment | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPreparerName(currentUser.fullName);
  }, [currentUser.fullName]);

  // Keep sourceStation defaulted when station changes if blank
  useEffect(() => {
    if (!selectedStation) return;
    setUnits((prev) =>
      prev.map((u, i) =>
        i === 0 && !u.sourceStation.trim()
          ? { ...u, sourceStation: selectedStation.persianName }
          : u
      )
    );
  }, [selectedStation]);

  const activeUnit = units[activeUnitIndex] || units[0];

  const updateActiveUnit = (
    updater: (unit: WirelessUnitTestSheet) => WirelessUnitTestSheet
  ) => {
    setUnits((prev) => prev.map((u, idx) => (idx === activeUnitIndex ? updater(u) : u)));
  };

  const updateRadioColumn = (
    column: 'primaryRadio' | 'repeaterRadio',
    field: keyof WirelessRadioColumns,
    value: string
  ) => {
    updateActiveUnit((u) => ({
      ...u,
      [column]: {
        ...u[column],
        [field]: value,
      },
    }));
  };

  const handleAddUnit = () => {
    const nextIdx = units.length + 1;
    const next = createDefaultWirelessUnit(
      `دستگاه بی‌سیم ${toPersianDigits(nextIdx)}`,
      selectedStation?.persianName || ''
    );
    setUnits((prev) => [...prev, next]);
    setActiveUnitIndex(units.length);
    showToast(`دستگاه بی‌سیم ${toPersianDigits(nextIdx)} به این پست اضافه شد.`, 'info');
  };

  const handleDuplicateUnit = () => {
    if (!activeUnit) return;
    const copy: WirelessUnitTestSheet = {
      ...activeUnit,
      id: `wunit-${Date.now()}`,
      unitTitle: `${activeUnit.unitTitle} (کپی)`,
      primaryRadio: { ...activeUnit.primaryRadio },
      repeaterRadio: { ...activeUnit.repeaterRadio },
    };
    setUnits((prev) => [...prev, copy]);
    setActiveUnitIndex(units.length);
  };

  const handleRemoveUnit = (idxToRemove: number) => {
    if (units.length <= 1) {
      showToast('هر تست بی‌سیم باید حداقل شامل یک دستگاه رادیویی باشد.', 'warning');
      return;
    }
    setUnits((prev) => prev.filter((_, idx) => idx !== idxToRemove));
    setActiveUnitIndex((prev) => (prev >= idxToRemove ? Math.max(0, prev - 1) : prev));
  };

  const handleLoadPolanSample = () => {
    const polanStation = stations.find(
      (s) => s.persianName.includes('پلان') || s.name.toLowerCase().includes('polan')
    );
    if (polanStation) {
      onSelectStationById(polanStation.id);
    }
    setEditingRecordId(undefined);
    setPreparerName('رضا زور');
    setPmDateJalali('۱۴۰۵/۰۷/۲۵');
    setUnits([createPolanWirelessSampleUnit()]);
    setActiveUnitIndex(0);
    showToast(
      'نمونه پرشده تست بی‌سیم پست پلان (Motorola GM339 - مسیر پیرسهراب و نگور) بارگذاری شد.',
      'success'
    );
  };

  const handleResetEmptyForm = () => {
    setEditingRecordId(undefined);
    setApproverName('');
    setPreparerName(currentUser.fullName);
    setUnits([createDefaultWirelessUnit('دستگاه بی‌سیم ۱', selectedStation?.persianName || '')]);
    setActiveUnitIndex(0);
    setAttachments([]);
    showToast('فرم خام جدید تست بی‌سیم آماده شد.', 'info');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (attachments.length >= 15) {
      showToast('حداکثر ۱۵ تصویر پیوست برای هر تست دوره‌ای مجاز است.', 'warning');
      return;
    }

    const availableSlots = 15 - attachments.length;
    const pickedFiles = Array.from(files).slice(0, availableSlots);
    const nextAttachments: PeriodicTestAttachment[] = [];

    for (const file of pickedFiles) {
      try {
        const { dataUrl, size } = await compressImageFile(file);
        nextAttachments.push({
          _id: `pt-att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          kind: 'image',
          fileName: file.name,
          mimeType: 'image/jpeg',
          size,
          storagePath: `/periodic-tests/wireless/${file.name}`,
          dataUrl,
          uploadStatus: 'uploaded',
          routeId: activeUnit?.id,
          routeTitle: uploadUnitTag || activeUnit?.unitTitle || 'کلی پست',
          caption: '',
          createdAt: new Date().toISOString(),
        });
      } catch {
        showToast(`خطا در خواندن فایل ${file.name}`, 'error');
      }
    }

    if (nextAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...nextAttachments]);
      showToast(`${toPersianDigits(nextAttachments.length)} تصویر با موفقیت پیوست شد.`, 'success');
    }
    e.target.value = '';
  };

  const handleAddSamplePhoto = () => {
    if (attachments.length >= 15) {
      showToast('حداکثر ۱۵ تصویر مجاز است.', 'warning');
      return;
    }
    const samplePhotos = [
      {
        url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600',
        caption: 'تست توان خروجی و بازگشتی فرستنده VHF با وات‌متر',
      },
      {
        url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600',
        caption: 'وضعیت اتصالات فیدر، کانکتورها و تغذیه بیسیم',
      },
    ];
    const picked = samplePhotos[attachments.length % samplePhotos.length];
    const newAtt: PeriodicTestAttachment = {
      _id: `pt-att-${Date.now()}`,
      kind: 'image',
      fileName: `wireless_test_${Date.now().toString().slice(-4)}.jpg`,
      mimeType: 'image/jpeg',
      size: 64000,
      storagePath: `/periodic-tests/wireless/sample_${Date.now()}.jpg`,
      dataUrl: picked.url,
      uploadStatus: 'uploaded',
      routeId: activeUnit?.id,
      routeTitle: uploadUnitTag || activeUnit?.unitTitle || 'کلی پست',
      caption: picked.caption,
      createdAt: new Date().toISOString(),
    };
    setAttachments((prev) => [...prev, newAtt]);
    showToast('تصویر مستندات تست بی‌سیم اضافه شد.', 'info');
  };

  const handleSubmit = async () => {
    if (!selectedStation) {
      showToast('لطفاً ابتدا «محل انجام تست دوره‌ای (پست برق)» را از بالای صفحه انتخاب کنید.', 'error');
      return;
    }
    if (units.some((u) => !u.unitTitle.trim())) {
      showToast('عنوان تمام دستگاه‌های بی‌سیم باید مشخص باشد.', 'error');
      return;
    }

    setIsSaving(true);
    const result = await savePeriodicTest({
      _id: editingRecordId,
      domain: 'telecom',
      sectionId: 'wireless',
      stationId: selectedStation.id,
      stationName: `${selectedStation.persianName} (${selectedStation.name})`,
      dispatchCode: selectedStation.dispatchCode || undefined,
      groupId: userGroup?._id,
      groupName: userGroup?.name,
      monthJalali: selectedMonth,
      pmDateJalali: pmDateJalali.trim() || selectedMonth,
      documentTitle: 'تست شیت نگهداری و اندازه‌گیری سیستم رادیویی VHF',
      contractTitle:
        activeContract?.title || 'انجام عملیات نگهداری و تعمیرات دیسپاچینگ سیستان و بلوچستان',
      contractNumber: activeContract?.contractNumber || '1404/88',
      attachmentPagesCount: attachments.length,
      preparerUserId: currentUser._id,
      preparerName: preparerName.trim() || currentUser.fullName,
      approverName: approverName.trim() || undefined,
      status: 'submitted',
      routes: [],
      wirelessUnits: units,
      attachments,
    });
    setIsSaving(false);

    if (result.success && result.id) {
      setEditingRecordId(result.id);
    }
  };

  const handleLoadRecord = (rec: PeriodicTestRecord) => {
    setEditingRecordId(rec._id);
    onSelectStationById(rec.stationId);
    onSelectMonth(rec.monthJalali);
    setPmDateJalali(rec.pmDateJalali);
    setPreparerName(rec.preparerName);
    setApproverName(rec.approverName || '');
    setUnits(
      rec.wirelessUnits && rec.wirelessUnits.length > 0
        ? rec.wirelessUnits
        : [createDefaultWirelessUnit('دستگاه بی‌سیم ۱', rec.stationName)]
    );
    setActiveUnitIndex(0);
    setAttachments(rec.attachments || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`تست دوره‌ای بی‌سیم «${rec.stationName}» در فرم بارگذاری شد.`, 'info');
  };

  const savedWirelessTests = useMemo(
    () => periodicTests.filter((t) => t.domain === 'telecom' && t.sectionId === 'wireless'),
    [periodicTests]
  );

  const primaryVswr = computeVswrBadge(
    activeUnit.primaryRadio.txPowerW,
    activeUnit.primaryRadio.reflectedPowerW
  );
  const repeaterVswr = computeVswrBadge(
    activeUnit.repeaterRadio.txPowerW,
    activeUnit.repeaterRadio.reflectedPowerW
  );

  const canReviewAsSupervisor = currentRole === 'GROUP_SUPERVISOR';
  const canReviewAsEmployer = currentRole === 'EMPLOYER_EXPERT' || currentRole === 'EMPLOYER_CEO';

  const renderReviewControl = (
    label: string,
    value: string,
    onChange: (val: string) => void
  ) => (
    <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-200">{label}</span>
        <div className="flex flex-wrap gap-1">
          {REVIEW_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(value === preset ? '' : preset)}
              className={`px-2 py-0.5 rounded-md border text-[10.5px] font-bold transition-colors ${
                value === preset
                  ? preset === 'سالم'
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                    : preset === 'قابل قبول'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                    : preset === 'معیوب'
                    ? 'border-rose-400 bg-rose-500/20 text-rose-200'
                    : 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {preset === '*' ? 'ثبت *' : preset}
            </button>
          ))}
        </div>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="یا توضیح وضعیت را وارد کنید..."
        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
      />
    </div>
  );

  return (
    <div className="space-y-6 text-right">
      {/* Top Banner & Quick Sample Helper */}
      <div className="p-4 rounded-2xl glass-panel border border-cyan-500/35 bg-gradient-to-l from-cyan-950/35 via-slate-900/90 to-slate-900/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-extrabold text-white">
              تست شیت نگهداری و اندازه‌گیری سیستم رادیویی VHF
            </h3>
            {editingRecordId && (
              <span className="px-2 py-0.5 rounded-md border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                در حال ویرایش ({toPersianDigits(editingRecordId)})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            ثبت منظم مشخصات فرستنده و تکرارکننده (Repeater)، آنتن و دکل، منبع تغذیه و باتری به‌همراه پیوست تصاویر تست در محل پست
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadPolanSample}
            className="px-3 py-2 rounded-xl border border-amber-500/45 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>بارگذاری نمونه پرشده پست پلان</span>
          </button>

          <button
            type="button"
            onClick={handleResetEmptyForm}
            className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>فرم خام جدید</span>
          </button>
        </div>
      </div>

      {/* Multi-Unit Selector Strip */}
      <div className="p-4 rounded-2xl glass-panel border border-indigo-500/35 bg-indigo-950/15 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-white">
              دستگاه‌های بی‌سیم این پست ({toPersianDigits(units.length)} دستگاه)
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              در صورتی که پست دارای چند سامانه رادیویی مجزا است، می‌توانید برای هر دستگاه یک تب جداگانه ثبت کنید.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddUnit}
            className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 self-start transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>افزودن دستگاه بی‌سیم</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {units.map((u, idx) => {
            const isTabActive = idx === activeUnitIndex;
            return (
              <div
                key={u.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                  isTabActive
                    ? 'border-cyan-400/70 bg-slate-950 text-white shadow-[0_0_14px_rgba(34,211,238,0.2)]'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveUnitIndex(idx)}
                  className="flex items-center gap-2 text-xs font-bold"
                >
                  <span className="text-cyan-400 tabular-nums">{toPersianDigits(idx + 1)}.</span>
                  <span>{u.unitTitle || 'دستگاه بی‌سیم'}</span>
                  {u.model && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300" dir="ltr">
                      {u.model}
                    </span>
                  )}
                </button>
                {units.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveUnit(idx)}
                    className="p-0.5 rounded text-slate-500 hover:text-rose-400"
                    title="حذف این دستگاه"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Structured Test Sheet Form for Active Wireless Unit */}
      <div className="space-y-5 p-4 sm:p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/70">
        {/* Identification & Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <h4 className="text-sm font-extrabold text-cyan-300">
            شناسنامه پرونده و مشخصات دستگاه بی‌سیم
          </h4>
          <button
            type="button"
            onClick={handleDuplicateUnit}
            className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold flex items-center gap-1 self-start"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>کپی از این دستگاه</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">عنوان تب دستگاه:</label>
            <input
              type="text"
              value={activeUnit.unitTitle}
              onChange={(e) => updateActiveUnit((u) => ({ ...u, unitTitle: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">شماره پرونده:</label>
            <input
              type="text"
              value={activeUnit.caseNumber}
              onChange={(e) => updateActiveUnit((u) => ({ ...u, caseNumber: e.target.value }))}
              placeholder="شماره پرونده رادیویی"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">تاریخ تست:</label>
            <input
              type="text"
              value={pmDateJalali}
              onChange={(e) => setPmDateJalali(e.target.value)}
              placeholder="۱۴۰۵/۰۷/۲۵"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">تنظیم‌کننده:</label>
            <input
              type="text"
              value={preparerName}
              onChange={(e) => setPreparerName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">ایستگاه مبدأ:</label>
            <input
              type="text"
              value={activeUnit.sourceStation}
              onChange={(e) =>
                updateActiveUnit((u) => ({ ...u, sourceStation: e.target.value }))
              }
              placeholder="مثال: پلان"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">ایستگاه‌های مقصد:</label>
            <input
              type="text"
              value={activeUnit.destinationStations}
              onChange={(e) =>
                updateActiveUnit((u) => ({ ...u, destinationStations: e.target.value }))
              }
              placeholder="مثال: پیرسهراب - نگور"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">سریال نامبر بیسیم:</label>
            <input
              type="text"
              dir="ltr"
              value={activeUnit.radioSerialNumber}
              onChange={(e) =>
                updateActiveUnit((u) => ({ ...u, radioSerialNumber: e.target.value }))
              }
              placeholder="103TELE768"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-left focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">برند:</label>
              <input
                type="text"
                dir="ltr"
                value={activeUnit.brand}
                onChange={(e) => updateActiveUnit((u) => ({ ...u, brand: e.target.value }))}
                placeholder="Motorola"
                className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-left focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">مدل:</label>
              <input
                type="text"
                dir="ltr"
                value={activeUnit.model}
                onChange={(e) => updateActiveUnit((u) => ({ ...u, model: e.target.value }))}
                placeholder="GM339"
                className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-left focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* SECTION 1: Radio & Antenna (1a + 1b) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 pt-2">
          {/* 1a) Transmitter & Antenna Table (Main vs Repeater) */}
          <div className="xl:col-span-6 p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <h5 className="text-xs font-extrabold text-cyan-300 flex items-center gap-1.5">
                <Gauge className="w-4 h-4" />
                <span>۱-الف) مشخصات فرستنده و آنتن (۱: اصلی | ۲: Repeater)</span>
              </h5>
              <div className="flex items-center gap-1.5">
                {primaryVswr && (
                  <span
                    className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${primaryVswr.className}`}
                    dir="ltr"
                  >
                    ۱: {primaryVswr.ratioText} ({primaryVswr.statusLabel})
                  </span>
                )}
                {repeaterVswr && (
                  <span
                    className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${repeaterVswr.className}`}
                    dir="ltr"
                  >
                    ۲: {repeaterVswr.ratioText}
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-[11px] text-slate-400 border-b border-slate-800">
                    <th className="py-2 px-2 text-right">پارامتر</th>
                    <th className="py-2 px-2 text-center w-16">واحد</th>
                    <th className="py-2 px-2 text-center">۱ (اصلی)</th>
                    <th className="py-2 px-2 text-center">۲ (Repeater)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  <tr>
                    <td className="py-2 px-2 font-semibold text-slate-200" dir="ltr">
                      TX power
                    </td>
                    <td className="py-2 px-2 text-center text-cyan-300 font-bold" dir="ltr">
                      (w)
                    </td>
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        inputMode="decimal"
                        dir="ltr"
                        value={activeUnit.primaryRadio.txPowerW}
                        onChange={(e) =>
                          updateRadioColumn(
                            'primaryRadio',
                            'txPowerW',
                            normalizeNumericDecimal(e.target.value)
                          )
                        }
                        placeholder="19"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-center tabular-nums focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        inputMode="decimal"
                        dir="ltr"
                        value={activeUnit.repeaterRadio.txPowerW}
                        onChange={(e) =>
                          updateRadioColumn(
                            'repeaterRadio',
                            'txPowerW',
                            normalizeNumericDecimal(e.target.value)
                          )
                        }
                        placeholder="—"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-center tabular-nums focus:outline-none"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-2 font-semibold text-slate-200" dir="ltr">
                      Reflected power
                    </td>
                    <td className="py-2 px-2 text-center text-cyan-300 font-bold" dir="ltr">
                      (w)
                    </td>
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        inputMode="decimal"
                        dir="ltr"
                        value={activeUnit.primaryRadio.reflectedPowerW}
                        onChange={(e) =>
                          updateRadioColumn(
                            'primaryRadio',
                            'reflectedPowerW',
                            normalizeNumericDecimal(e.target.value)
                          )
                        }
                        placeholder="0.5"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-center tabular-nums focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        inputMode="decimal"
                        dir="ltr"
                        value={activeUnit.repeaterRadio.reflectedPowerW}
                        onChange={(e) =>
                          updateRadioColumn(
                            'repeaterRadio',
                            'reflectedPowerW',
                            normalizeNumericDecimal(e.target.value)
                          )
                        }
                        placeholder="—"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-center tabular-nums focus:outline-none"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-2 font-semibold text-slate-200" dir="ltr">
                      Antenna type
                    </td>
                    <td className="py-2 px-2 text-center text-slate-500">—</td>
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        dir="ltr"
                        value={activeUnit.primaryRadio.antennaType}
                        onChange={(e) =>
                          updateRadioColumn('primaryRadio', 'antennaType', e.target.value)
                        }
                        placeholder="4-dipole"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-center focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        dir="ltr"
                        value={activeUnit.repeaterRadio.antennaType}
                        onChange={(e) =>
                          updateRadioColumn('repeaterRadio', 'antennaType', e.target.value)
                        }
                        placeholder="—"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-center focus:outline-none"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-2 font-semibold text-slate-200" dir="ltr">
                      Antenna Gain
                    </td>
                    <td className="py-2 px-2 text-center text-cyan-300 font-bold" dir="ltr">
                      (dB)
                    </td>
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        inputMode="decimal"
                        dir="ltr"
                        value={activeUnit.primaryRadio.antennaGainDb}
                        onChange={(e) =>
                          updateRadioColumn(
                            'primaryRadio',
                            'antennaGainDb',
                            normalizeNumericDecimal(e.target.value)
                          )
                        }
                        placeholder="6"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-center tabular-nums focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        inputMode="decimal"
                        dir="ltr"
                        value={activeUnit.repeaterRadio.antennaGainDb}
                        onChange={(e) =>
                          updateRadioColumn(
                            'repeaterRadio',
                            'antennaGainDb',
                            normalizeNumericDecimal(e.target.value)
                          )
                        }
                        placeholder="—"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-center tabular-nums focus:outline-none"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-2 font-semibold text-slate-200">
                      <span dir="ltr">AGL</span>{' '}
                      <span className="text-[10px] text-slate-400">(ارتفاع از سطح زمین)</span>
                    </td>
                    <td className="py-2 px-2 text-center text-cyan-300 font-bold" dir="ltr">
                      (m)
                    </td>
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        inputMode="decimal"
                        dir="ltr"
                        value={activeUnit.primaryRadio.aglMeters}
                        onChange={(e) =>
                          updateRadioColumn(
                            'primaryRadio',
                            'aglMeters',
                            normalizeNumericDecimal(e.target.value)
                          )
                        }
                        placeholder="12"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-center tabular-nums focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        inputMode="decimal"
                        dir="ltr"
                        value={activeUnit.repeaterRadio.aglMeters}
                        onChange={(e) =>
                          updateRadioColumn(
                            'repeaterRadio',
                            'aglMeters',
                            normalizeNumericDecimal(e.target.value)
                          )
                        }
                        placeholder="—"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-center tabular-nums focus:outline-none"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-2 font-semibold text-slate-200" dir="ltr">
                      Channel No.
                    </td>
                    <td className="py-2 px-2 text-center text-slate-500">—</td>
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        dir="ltr"
                        value={activeUnit.primaryRadio.channelNo}
                        onChange={(e) =>
                          updateRadioColumn('primaryRadio', 'channelNo', e.target.value)
                        }
                        placeholder="5"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-center tabular-nums focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        dir="ltr"
                        value={activeUnit.repeaterRadio.channelNo}
                        onChange={(e) =>
                          updateRadioColumn('repeaterRadio', 'channelNo', e.target.value)
                        }
                        placeholder="—"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-center tabular-nums focus:outline-none"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 1b) Tower, Feeder & Physical Inspection */}
          <div className="xl:col-span-6 p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h5 className="text-xs font-extrabold text-cyan-300">
                ۱-ب) مشخصات دکل، کابل فیدر و بازبینی ظاهری
              </h5>
              <span className="text-[11px] text-slate-400">ساختار و اتصالات آنتن</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1" dir="ltr">
                  Tower type (نوع دکل / پایه):
                </label>
                <input
                  type="text"
                  value={activeUnit.towerType}
                  onChange={(e) => updateActiveUnit((u) => ({ ...u, towerType: e.target.value }))}
                  placeholder="مثال: تیر برق / دکل مهاری"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1" dir="ltr">
                  Tower Height (ارتفاع دکل - m):
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    value={activeUnit.towerHeightM}
                    onChange={(e) =>
                      updateActiveUnit((u) => ({
                        ...u,
                        towerHeightM: normalizeNumericDecimal(e.target.value),
                      }))
                    }
                    placeholder="12"
                    className="w-full pl-12 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-left tabular-nums focus:outline-none focus:border-cyan-400"
                  />
                  <span className="absolute left-2.5 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] font-bold text-cyan-300 pointer-events-none">
                    m
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1" dir="ltr">
                  Feeder (نوع کابل فیدر):
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={activeUnit.feederType}
                  onChange={(e) => updateActiveUnit((u) => ({ ...u, feederType: e.target.value }))}
                  placeholder="RG-213"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-left focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1" dir="ltr">
                  Feeder length (طول فیدر - m):
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    value={activeUnit.feederLengthM}
                    onChange={(e) =>
                      updateActiveUnit((u) => ({
                        ...u,
                        feederLengthM: normalizeNumericDecimal(e.target.value),
                      }))
                    }
                    placeholder="30"
                    className="w-full pl-12 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-left tabular-nums focus:outline-none focus:border-cyan-400"
                  />
                  <span className="absolute left-2.5 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] font-bold text-cyan-300 pointer-events-none">
                    m
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {renderReviewControl('بازبینی کانکتورها (Connectors Review):', activeUnit.connectorsReview, (val) =>
                updateActiveUnit((u) => ({ ...u, connectorsReview: val }))
              )}
              {renderReviewControl('بازبینی دکل (Tower Review):', activeUnit.towerReview, (val) =>
                updateActiveUnit((u) => ({ ...u, towerReview: val }))
              )}
              {renderReviewControl('بازبینی آنتن (Antenna Review):', activeUnit.antennaReview, (val) =>
                updateActiveUnit((u) => ({ ...u, antennaReview: val }))
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Power Supply (DC Converter + Charger & Battery) */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h5 className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
              <BatteryCharging className="w-4 h-4" />
              <span>۲) منبع تغذیه (DC Converter و سیستم شارژر و باتری پشتیبان)</span>
            </h5>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* 2a: DC Converter */}
            <div className="lg:col-span-4 p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 text-xs">
              <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5" dir="ltr">
                DC converter
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1" dir="ltr">
                  DC converter type (Vin / Vout):
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={activeUnit.dcConverterType}
                  onChange={(e) =>
                    updateActiveUnit((u) => ({ ...u, dcConverterType: e.target.value }))
                  }
                  placeholder="110/13"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-left focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1" dir="ltr">
                    Vin (V):
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      dir="ltr"
                      value={activeUnit.dcVinV}
                      onChange={(e) =>
                        updateActiveUnit((u) => ({ ...u, dcVinV: e.target.value }))
                      }
                      placeholder="113.78"
                      className="w-full pl-9 pr-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-left tabular-nums focus:outline-none focus:border-cyan-400"
                    />
                    <span className="absolute left-2 text-[10px] font-bold text-cyan-300">V</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1" dir="ltr">
                    Vout (V):
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      dir="ltr"
                      value={activeUnit.dcVoutV}
                      onChange={(e) =>
                        updateActiveUnit((u) => ({ ...u, dcVoutV: e.target.value }))
                      }
                      placeholder="13.64"
                      className="w-full pl-9 pr-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-left tabular-nums focus:outline-none focus:border-cyan-400"
                    />
                    <span className="absolute left-2 text-[10px] font-bold text-cyan-300">V</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2b: Power supply + Battery */}
            <div className="lg:col-span-8 p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 text-xs">
              <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5" dir="ltr">
                Power supply + Battery
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1" dir="ltr">
                    Charger Type:
                  </label>
                  <input
                    type="text"
                    value={activeUnit.chargerType}
                    onChange={(e) =>
                      updateActiveUnit((u) => ({ ...u, chargerType: e.target.value }))
                    }
                    placeholder="نوع شارژر"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1" dir="ltr">
                    Voltage (V):
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="decimal"
                      dir="ltr"
                      value={activeUnit.chargerVoltageV}
                      onChange={(e) =>
                        updateActiveUnit((u) => ({
                          ...u,
                          chargerVoltageV: normalizeNumericDecimal(e.target.value),
                        }))
                      }
                      placeholder="13.8"
                      className="w-full pl-9 pr-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-left tabular-nums focus:outline-none focus:border-cyan-400"
                    />
                    <span className="absolute left-2 text-[10px] font-bold text-cyan-300">V</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1" dir="ltr">
                    Battery Type:
                  </label>
                  <input
                    type="text"
                    value={activeUnit.batteryType}
                    onChange={(e) =>
                      updateActiveUnit((u) => ({ ...u, batteryType: e.target.value }))
                    }
                    placeholder="مثال: Sealed Lead Acid"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1" dir="ltr">
                    Battery Capacity (Ah):
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="decimal"
                      dir="ltr"
                      value={activeUnit.batteryAh}
                      onChange={(e) =>
                        updateActiveUnit((u) => ({
                          ...u,
                          batteryAh: normalizeNumericDecimal(e.target.value),
                        }))
                      }
                      placeholder="65"
                      className="w-full pl-10 pr-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-left tabular-nums focus:outline-none focus:border-cyan-400"
                    />
                    <span className="absolute left-2 text-[10px] font-bold text-cyan-300">Ah</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1" dir="ltr">
                    Battery V after discharging (V):
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="decimal"
                      dir="ltr"
                      value={activeUnit.batteryVoltageAfterDischargeV}
                      onChange={(e) =>
                        updateActiveUnit((u) => ({
                          ...u,
                          batteryVoltageAfterDischargeV: normalizeNumericDecimal(e.target.value),
                        }))
                      }
                      placeholder="12.1"
                      className="w-full pl-9 pr-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-left tabular-nums focus:outline-none focus:border-cyan-400"
                    />
                    <span className="absolute left-2 text-[10px] font-bold text-cyan-300">V</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1" dir="ltr">
                    Output power after discharging (W):
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="decimal"
                      dir="ltr"
                      value={activeUnit.outputPowerAfterDischargeW}
                      onChange={(e) =>
                        updateActiveUnit((u) => ({
                          ...u,
                          outputPowerAfterDischargeW: normalizeNumericDecimal(e.target.value),
                        }))
                      }
                      placeholder="18"
                      className="w-full pl-9 pr-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-left tabular-nums focus:outline-none focus:border-cyan-400"
                    />
                    <span className="absolute left-2 text-[10px] font-bold text-cyan-300">W</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: AGL Guide & Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-5 p-3.5 rounded-xl border border-sky-500/30 bg-sky-950/20 flex items-start gap-2.5 text-xs">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sky-300">راهنمای فنی اندازه‌گیری AGL:</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{AGL_GUIDE_TEXT}</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <label className="block text-[11px] text-slate-400 mb-1">
              توضیحات تکمیلی تست بی‌سیم:
            </label>
            <textarea
              rows={3}
              value={activeUnit.notes}
              onChange={(e) => updateActiveUnit((u) => ({ ...u, notes: e.target.value }))}
              placeholder="مشاهدات فنی کیفیت مکالمه، وضعیت ارت دکل، ناهنجاری یا اصلاحات لازم را اینجا بنویسید..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Photos & Measurement Device Attachments */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-sky-400" />
              <span>پیوست تصاویر تجهیزات، وات‌متر، دکل و باتری ({toPersianDigits(attachments.length)} تصویر)</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              تصاویر صفحه وات‌متر/SWR متر، پلاک دستگاه یا وضعیت دکل و منبع تغذیه را می‌توانید ضمیمه کنید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={uploadUnitTag}
              onChange={(e) => setUploadUnitTag(e.target.value)}
              className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
            >
              <option value="کلی پست">مربوط به: کلی پست</option>
              {units.map((u) => (
                <option key={u.id} value={u.unitTitle}>
                  دستگاه: {u.unitTitle}
                </option>
              ))}
            </select>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-3 py-2 rounded-xl border border-sky-500/45 bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>ثبت با دوربین</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-xl border border-cyan-500/45 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>آپلود از گالری</span>
            </button>

            <button
              type="button"
              onClick={handleAddSamplePhoto}
              className="px-2.5 py-2 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium"
            >
              + تصویر نمونه
            </button>
          </div>
        </div>

        {attachments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {attachments.map((att) => (
              <div
                key={att._id}
                className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col"
              >
                <div className="relative h-36 bg-slate-900">
                  <img
                    src={att.dataUrl}
                    alt={att.fileName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewPhoto(att)}
                      className="p-1.5 rounded-lg bg-black/75 text-cyan-300 hover:text-white"
                      title="بزرگ‌نمایی"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((prev) => prev.filter((a) => a._id !== att._id))
                      }
                      className="p-1.5 rounded-lg bg-black/75 text-rose-400 hover:text-rose-200"
                      title="حذف تصویر"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {att.routeTitle && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 border border-cyan-400/35 text-[10px] font-bold text-cyan-200">
                      {att.routeTitle}
                    </span>
                  )}
                </div>
                <div className="p-2 space-y-1.5">
                  <div className="text-[10px] text-slate-400 truncate">{att.fileName}</div>
                  <input
                    type="text"
                    value={att.caption || ''}
                    onChange={(e) =>
                      setAttachments((prev) =>
                        prev.map((a) =>
                          a._id === att._id ? { ...a, caption: e.target.value } : a
                        )
                      )
                    }
                    placeholder="شرح تصویر (مثال: پلاک دستگاه یا تست وات‌متر)"
                    className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            هنوز تصویری پیوست نشده است. از دکمه‌های بالا برای تصویربرداری مستقیم با دوربین یا بارگذاری از گالری استفاده کنید.
          </div>
        )}
      </div>

      {/* Submit Bar */}
      <div className="rounded-2xl glass-panel border border-cyan-500/35 p-4 bg-slate-900/95 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1 text-center sm:text-right">
          <div className="text-[11px] text-slate-400">
            پست: <strong className="text-white">{selectedStation ? selectedStation.persianName : 'انتخاب نشده'}</strong> · دوره:{' '}
            <strong className="text-cyan-300">{selectedMonth}</strong>
          </div>
          <div className="text-xs font-bold text-slate-200 tabular-nums">
            {toPersianDigits(units.length)} دستگاه بی‌سیم ·{' '}
            {activeUnit.brand ? `${activeUnit.brand} ${activeUnit.model}` : 'بدون مدل ثبت‌شده'} ·{' '}
            {toPersianDigits(attachments.length)} تصویر پیوست
          </div>
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSubmit}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-l from-cyan-400 to-indigo-400 hover:brightness-110 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
        >
          {isOnline ? <Save className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          <span>
            {isSaving
              ? 'در حال ذخیره...'
              : !isOnline
              ? 'ذخیره تست در صف آفلاین'
              : editingRecordId
              ? 'به‌روزرسانی و ذخیره تست بی‌سیم'
              : 'ثبت نهایی تست دوره‌ای بی‌سیم'}
          </span>
        </button>
      </div>

      {/* Saved History List */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white">
              سوابق تست‌های دوره‌ای بی‌سیم ثبت‌شده ({toPersianDigits(savedWirelessTests.length)})
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              بازخوانی نتایج دستگاه‌های رادیویی، مشاهده پیوست‌ها و تأیید سرپرست گروه یا ناظر کارفرما
            </p>
          </div>
        </div>

        {savedWirelessTests.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            هنوز هیچ تست دوره‌ای بی‌سیمی ذخیره نشده است. پس از تکمیل فرم بالا دکمه ثبت را بزنید.
          </div>
        ) : (
          <div className="space-y-3">
            {savedWirelessTests.map((rec) => {
              const badge = getPeriodicStatusBadge(rec.status);
              const firstUnit = rec.wirelessUnits?.[0];

              return (
                <div
                  key={rec._id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-extrabold text-white">{rec.stationName}</span>
                      <span className="px-2 py-0.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[10px] font-bold">
                        {rec.monthJalali}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span>تنظیم‌کننده: <strong className="text-slate-200">{rec.preparerName}</strong></span>
                      <span>·</span>
                      <span>تاریخ تست: <strong className="text-slate-200">{rec.pmDateJalali}</strong></span>
                      {firstUnit && (
                        <>
                          <span>·</span>
                          <span>
                            تجهیز: <strong className="text-cyan-300" dir="ltr">{firstUnit.brand} {firstUnit.model}</strong>
                            {firstUnit.primaryRadio.txPowerW ? ` (TX ${firstUnit.primaryRadio.txPowerW}W)` : ''}
                          </span>
                        </>
                      )}
                      <span>·</span>
                      <span>{toPersianDigits(rec.wirelessUnits?.length || 1)} دستگاه · {toPersianDigits(rec.attachments.length)} تصویر</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleLoadRecord(rec)}
                      className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 text-[11px] font-bold"
                    >
                      مشاهده / ویرایش در فرم
                    </button>

                    {canReviewAsSupervisor && rec.status === 'submitted' && (
                      <button
                        type="button"
                        onClick={() => reviewPeriodicTest(rec._id, 'supervisor_approved')}
                        className="px-3 py-1.5 rounded-lg border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 text-[11px] font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تایید سرپرست</span>
                      </button>
                    )}

                    {canReviewAsEmployer && rec.status !== 'expert_approved' && (
                      <>
                        <button
                          type="button"
                          onClick={() => reviewPeriodicTest(rec._id, 'expert_approved')}
                          className="px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 text-[11px] font-bold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تایید ناظر کارفرما</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => reviewPeriodicTest(rec._id, 'redo_requested')}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 text-[11px] font-bold"
                        >
                          نیاز به اصلاح
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Lightbox Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="max-w-3xl w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-xs">
              <div className="font-bold text-white">
                {previewPhoto.routeTitle ? `${previewPhoto.routeTitle} — ` : ''}
                {previewPhoto.caption || previewPhoto.fileName}
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={previewPhoto.dataUrl}
              alt={previewPhoto.fileName}
              className="w-full max-h-[75vh] object-contain rounded-xl bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
};
