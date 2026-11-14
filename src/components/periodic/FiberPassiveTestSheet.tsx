/**
 * FiberPassiveTestSheet.tsx
 * Exact digital implementation of the Passive Optical Fiber Monthly Periodic Test Sheet
 * («گزارش عملکرد بازدید دوره‌ای اکتیو و پسیو نوری»)
 * - Supports multiple optical fiber routes per substation (dynamic route tabs)
 * - Supports full physical inspection checklist + 6/12/24+ core OTDR/status table
 * - Supports real camera/gallery photo & OTDR image upload with client compression + route tagging
 * - Persists to AppContext + Firestore periodicTests + offline queue
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Camera,
  Upload,
  Save,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Eye,
  X,
  FileSpreadsheet,
  WifiOff,
  Layers,
  Wand2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StationCommunication } from '../../data/stationsChecklist';
import {
  FiberCoreRow,
  FiberCoreStatus,
  FiberPhysicalChecklist,
  FiberPhysicalState,
  FiberRouteTestSheet,
  PeriodicTestAttachment,
  PeriodicTestRecord,
  PeriodicTestStatus,
} from '../../types';
import {
  createDefaultFiberRoute,
  createFanooj230SampleRoutes,
  createFiberCoreRows,
} from '../../data/fiberPassiveSamples';
import { toPersianDigits } from '../../utils/formatters';

interface FiberPassiveTestSheetProps {
  selectedStation: StationCommunication | null;
  onSelectStationById: (stationId: string) => void;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}

const PHYSICAL_STATES: FiberPhysicalState[] = ['سالم', 'قابل قبول', 'معیوب'];

const PHYSICAL_CHECK_ITEMS: Array<{
  key: Exclude<keyof FiberPhysicalChecklist, 'fiberRoomStatus' | 'floorLayoutMatch' | 'remarks'>;
  label: string;
}> = [
  { key: 'opgwAndDuctHealth', label: 'سلامت کابل OPGW و کانالی' },
  { key: 'gantryJointBox', label: 'جوینت باکس گنتری' },
  { key: 'clampsAndLoops', label: 'دست پیچها' },
  { key: 'labels', label: 'لیبلها' },
  { key: 'pigtails', label: 'پیگتل ها' },
  { key: 'patchCords', label: 'پچکوردها' },
];

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

function normalizeKilometerInput(raw: string): string {
  const englishDigits = raw
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[،,/]/g, '.');
  const cleaned = englishDigits.replace(/[^0-9.]/g, '');
  const firstDotIdx = cleaned.indexOf('.');
  if (firstDotIdx === -1) return cleaned;
  return `${cleaned.slice(0, firstDotIdx + 1)}${cleaned.slice(firstDotIdx + 1).replace(/\./g, '')}`;
}

function normalizeStoredLineLengthToKm(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const match = trimmed.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).match(/(\d+(?:\.\d+)?)/);
  if (!match) return '';
  const num = parseFloat(match[1]);
  if (Number.isNaN(num)) return '';
  const isMetersOnly = /\bm\b|متر/i.test(trimmed) && !/km|کیلومتر/i.test(trimmed);
  if (isMetersOnly) {
    return String(Number((num / 1000).toFixed(3)));
  }
  return String(num);
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

export const FiberPassiveTestSheet: React.FC<FiberPassiveTestSheetProps> = ({
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

  // Form Metadata State
  const [editingRecordId, setEditingRecordId] = useState<string | undefined>(undefined);
  const [documentCode, setDocumentCode] = useState('');
  const [revisionNumber, setRevisionNumber] = useState('');
  const [contractTitle, setContractTitle] = useState(
    activeContract?.title || 'انجام عملیات نگهداری و تعمیرات دیسپاچینگ سیستان و بلوچستان'
  );
  const [contractNumber, setContractNumber] = useState(activeContract?.contractNumber || '1404/88');
  const [pmDateJalali, setPmDateJalali] = useState('۱۴۰۵/۰۷/۲۵');
  const [preparerName, setPreparerName] = useState(currentUser.fullName);
  const [approverName, setApproverName] = useState('');

  // Multi-route state
  const [routes, setRoutes] = useState<FiberRouteTestSheet[]>(() => [
    createDefaultFiberRoute('مسیر ۱', 24, selectedStation?.persianName || ''),
  ]);
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);

  // Batch Quick-Fill helpers for active route
  const [quickSection, setQuickSection] = useState('1');
  const [quickDestination, setQuickDestination] = useState('');

  // Photo Attachments
  const [attachments, setAttachments] = useState<PeriodicTestAttachment[]>([]);
  const [uploadRouteTag, setUploadRouteTag] = useState<string>('کلی پست');
  const [previewPhoto, setPreviewPhoto] = useState<PeriodicTestAttachment | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPreparerName(currentUser.fullName);
  }, [currentUser.fullName]);

  const activeRoute = routes[activeRouteIndex] || routes[0];

  const updateActiveRoute = (updater: (route: FiberRouteTestSheet) => FiberRouteTestSheet) => {
    setRoutes((prev) => prev.map((r, idx) => (idx === activeRouteIndex ? updater(r) : r)));
  };

  // Route handlers
  const handleAddRoute = (coreCount = 24) => {
    const newIndex = routes.length + 1;
    const nextRoute = createDefaultFiberRoute(
      `مسیر ${toPersianDigits(newIndex)}`,
      coreCount,
      selectedStation?.persianName || ''
    );
    setRoutes((prev) => [...prev, nextRoute]);
    setActiveRouteIndex(routes.length);
    showToast(`مسیر جدید (${toPersianDigits(coreCount)} تار) اضافه شد.`, 'info');
  };

  const handleDuplicateRoute = () => {
    if (!activeRoute) return;
    const copy: FiberRouteTestSheet = {
      ...activeRoute,
      id: `route-${Date.now()}`,
      routeTitle: `${activeRoute.routeTitle} (کپی)`,
      physical: { ...activeRoute.physical },
      cores: activeRoute.cores.map((c) => ({
        ...c,
        id: `core-${Date.now()}-${c.rowNumber}-${Math.random().toString(36).slice(2, 5)}`,
      })),
    };
    setRoutes((prev) => [...prev, copy]);
    setActiveRouteIndex(routes.length);
  };

  const handleRemoveRoute = (idxToRemove: number) => {
    if (routes.length <= 1) {
      showToast('هر پست باید حداقل یک مسیر فیبر نوری داشته باشد.', 'warning');
      return;
    }
    setRoutes((prev) => prev.filter((_, idx) => idx !== idxToRemove));
    setActiveRouteIndex((prev) => (prev >= idxToRemove ? Math.max(0, prev - 1) : prev));
  };

  // Core row handlers
  const handleUpdateCore = (coreId: string, patch: Partial<FiberCoreRow>) => {
    updateActiveRoute((route) => ({
      ...route,
      cores: route.cores.map((c) => (c.id === coreId ? { ...c, ...patch } : c)),
    }));
  };

  const handleCoreStatusChange = (core: FiberCoreRow, nextStatus: FiberCoreStatus) => {
    const patch: Partial<FiberCoreRow> = { coreStatus: nextStatus };
    if (nextStatus === 'زیربار' && !core.notes.trim()) {
      patch.notes = 'به علت زیر بار بودن تست نشد';
      patch.attenuationDb = '';
      patch.distanceKm = '';
    } else if (nextStatus === 'تاریک' && (!core.notes.trim() || core.notes.includes('زیر بار'))) {
      patch.notes = 'نتایج OTDR به پیوست';
    } else if (nextStatus === 'قطع' && (!core.notes.trim() || core.notes.includes('زیر بار'))) {
      patch.notes = 'نتایج OTDR به پیوست (محل قطعی ثبت شود)';
    }
    handleUpdateCore(core.id, patch);
  };

  const handleSetCorePresetCount = (targetCount: number) => {
    updateActiveRoute((route) => {
      if (route.cores.length === targetCount) return route;
      if (route.cores.length > targetCount) {
        return { ...route, cores: route.cores.slice(0, targetCount) };
      }
      const extraNeeded = targetCount - route.cores.length;
      const startNum = route.cores.length + 1;
      const extraRows: FiberCoreRow[] = Array.from({ length: extraNeeded }, (_, i) => {
        const num = startNum + i;
        return {
          id: `core-${Date.now()}-${num}`,
          rowNumber: num,
          sectionNumber: route.cores[0]?.sectionNumber || '1',
          pigtailNumber: String(num),
          destination: route.cores[0]?.destination || route.destinationStation || '',
          activeEquipment: '',
          coreStatus: '',
          attenuationDb: '',
          distanceKm: '',
          notes: '',
        };
      });
      return { ...route, cores: [...route.cores, ...extraRows] };
    });
  };

  const handleAddCoreRow = () => {
    updateActiveRoute((route) => {
      const nextNum = route.cores.length + 1;
      const lastRow = route.cores[route.cores.length - 1];
      return {
        ...route,
        cores: [
          ...route.cores,
          {
            id: `core-${Date.now()}-${nextNum}`,
            rowNumber: nextNum,
            sectionNumber: lastRow?.sectionNumber || '1',
            pigtailNumber: String(nextNum),
            destination: lastRow?.destination || '',
            activeEquipment: '',
            coreStatus: '',
            attenuationDb: '',
            distanceKm: '',
            notes: '',
          },
        ],
      };
    });
  };

  const handleDeleteCoreRow = (coreId: string) => {
    updateActiveRoute((route) => {
      if (route.cores.length <= 1) return route;
      const filtered = route.cores
        .filter((c) => c.id !== coreId)
        .map((c, idx) => ({ ...c, rowNumber: idx + 1 }));
      return { ...route, cores: filtered };
    });
  };

  const handleQuickFillSectionAndDest = () => {
    updateActiveRoute((route) => ({
      ...route,
      cores: route.cores.map((c) => ({
        ...c,
        sectionNumber: quickSection.trim() || c.sectionNumber,
        destination: quickDestination.trim() || c.destination,
      })),
    }));
    showToast('شماره سکشن و مقصد در تمام ردیف‌های این مسیر اعمال شد.', 'success');
  };

  // Load Sample Fanooj 230 Data
  const handleLoadFanoojSample = () => {
    const fanoojStation = stations.find(
      (s) => s.persianName.includes('فنوج') || s.name.toLowerCase().includes('fanooj')
    );
    if (fanoojStation) {
      onSelectStationById(fanoojStation.id);
    }
    setEditingRecordId(undefined);
    setContractNumber('1404/88');
    setPmDateJalali('۱۴۰۵/۰۷/۲۵');
    setRoutes(createFanooj230SampleRoutes());
    setActiveRouteIndex(0);
    showToast(
      'نمونه کامل تست دوره‌ای پست فنوج ۲۳۰ شامل ۴ مسیر (کتیج، نیکشهر-اسپکه-بمپور، فنوج ۶۳ و توزیع) بارگذاری شد.',
      'success'
    );
  };

  const handleResetEmptyForm = () => {
    setEditingRecordId(undefined);
    setApproverName('');
    setRoutes([createDefaultFiberRoute('مسیر ۱', 24, selectedStation?.persianName || '')]);
    setActiveRouteIndex(0);
    setAttachments([]);
    showToast('فرم خام تست دوره‌ای فیبر نوری بازنشانی شد.', 'info');
  };

  // Real image file upload handler
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
          storagePath: `/periodic-tests/fiber-passive/${file.name}`,
          dataUrl,
          uploadStatus: 'uploaded',
          routeId: activeRoute?.id,
          routeTitle: uploadRouteTag || activeRoute?.routeTitle || 'کلی پست',
          caption: '',
          createdAt: new Date().toISOString(),
        });
      } catch {
        showToast(`خطا در خواندن فایل ${file.name}`, 'error');
      }
    }

    if (nextAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...nextAttachments]);
      showToast(`${toPersianDigits(nextAttachments.length)} تصویر تست با موفقیت پیوست شد.`, 'success');
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
        url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600',
        caption: 'نمای ODF و پچ‌کوردهای مسیر',
      },
      {
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600',
        caption: 'رک تجهیزات انتقال و پچ‌پنل نوری',
      },
      {
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
        caption: 'تست OTDR تارهای تاریک در محل پست',
      },
    ];
    const picked = samplePhotos[attachments.length % samplePhotos.length];
    const newAtt: PeriodicTestAttachment = {
      _id: `pt-att-${Date.now()}`,
      kind: 'image',
      fileName: `fiber_test_${Date.now().toString().slice(-4)}.jpg`,
      mimeType: 'image/jpeg',
      size: 68000,
      storagePath: `/periodic-tests/fiber-passive/sample_${Date.now()}.jpg`,
      dataUrl: picked.url,
      uploadStatus: 'uploaded',
      routeId: activeRoute?.id,
      routeTitle: uploadRouteTag || activeRoute?.routeTitle || 'کلی پست',
      caption: picked.caption,
      createdAt: new Date().toISOString(),
    };
    setAttachments((prev) => [...prev, newAtt]);
    showToast('تصویر مستندات تست فیبر نوری افزوده شد.', 'info');
  };

  // Summary metrics for active route & whole station
  const routeStats = (route: FiberRouteTestSheet) => {
    const active = route.cores.filter((c) => c.coreStatus === 'زیربار').length;
    const dark = route.cores.filter((c) => c.coreStatus === 'تاریک').length;
    const cut = route.cores.filter((c) => c.coreStatus === 'قطع').length;
    return { total: route.cores.length, active, dark, cut };
  };

  const activeRouteStats = routeStats(activeRoute);

  // Submit handler
  const handleSubmit = async () => {
    if (!selectedStation) {
      showToast('لطفاً ابتدا «محل انجام تست دوره‌ای (پست برق)» را از بالا انتخاب کنید.', 'error');
      return;
    }
    if (routes.some((r) => !r.routeTitle.trim())) {
      showToast('عنوان تمام مسیرهای فیبر نوری باید مشخص شده باشد.', 'error');
      return;
    }

    setIsSaving(true);
    const result = await savePeriodicTest({
      _id: editingRecordId,
      domain: 'telecom',
      sectionId: 'fiber-passive',
      stationId: selectedStation.id,
      stationName: `${selectedStation.persianName} (${selectedStation.name})`,
      dispatchCode: selectedStation.dispatchCode || undefined,
      groupId: userGroup?._id,
      groupName: userGroup?.name,
      monthJalali: selectedMonth,
      pmDateJalali: pmDateJalali.trim() || selectedMonth,
      documentTitle: 'گزارش عملکرد بازدید دوره‌ای اکتیو و پسیو نوری',
      documentCode: documentCode.trim() || undefined,
      revisionNumber: revisionNumber.trim() || undefined,
      contractTitle: contractTitle.trim() || 'انجام عملیات نگهداری و تعمیرات دیسپاچینگ سیستان و بلوچستان',
      contractNumber: contractNumber.trim() || '1404/88',
      attachmentPagesCount: attachments.length,
      preparerUserId: currentUser._id,
      preparerName: preparerName.trim() || currentUser.fullName,
      approverName: approverName.trim() || undefined,
      status: 'submitted',
      routes,
      attachments,
    });
    setIsSaving(false);

    if (result.success && result.id) {
      setEditingRecordId(result.id);
    }
  };

  // Load saved record into editor
  const handleLoadRecord = (rec: PeriodicTestRecord) => {
    setEditingRecordId(rec._id);
    onSelectStationById(rec.stationId);
    onSelectMonth(rec.monthJalali);
    setDocumentCode(rec.documentCode || '');
    setRevisionNumber(rec.revisionNumber || '');
    setContractTitle(rec.contractTitle);
    setContractNumber(rec.contractNumber);
    setPmDateJalali(rec.pmDateJalali);
    setPreparerName(rec.preparerName);
    setApproverName(rec.approverName || '');
    setRoutes(
      rec.routes.length > 0
        ? rec.routes.map((r) => ({
            ...r,
            lineLengthText: normalizeStoredLineLengthToKm(r.lineLengthText || ''),
          }))
        : [createDefaultFiberRoute('مسیر ۱', 24)]
    );
    setActiveRouteIndex(0);
    setAttachments(rec.attachments || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`تست دوره‌ای «${rec.stationName}» در فرم بارگذاری شد.`, 'info');
  };

  const savedFiberTests = useMemo(
    () => periodicTests.filter((t) => t.domain === 'telecom' && t.sectionId === 'fiber-passive'),
    [periodicTests]
  );

  const canReviewAsSupervisor = currentRole === 'GROUP_SUPERVISOR';
  const canReviewAsEmployer = currentRole === 'EMPLOYER_EXPERT' || currentRole === 'EMPLOYER_CEO';

  return (
    <div className="space-y-6 text-right">
      {/* Top Action & Sample Helper Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-cyan-500/35 bg-gradient-to-l from-cyan-950/35 via-slate-900/90 to-slate-900/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-extrabold text-white">
              گزارش عملکرد بازدید دوره‌ای اکتیو و پسیو نوری
            </h3>
            {editingRecordId && (
              <span className="px-2 py-0.5 rounded-md border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                در حال ویرایش ({toPersianDigits(editingRecordId)})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            پشتیبانی از چند مسیر فیبر نوری برای هر پست، چک‌لیست وضعیت فیزیکی داخل ایستگاه، جدول تار به تار و پیوست تصاویر تست/OTDR
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadFanoojSample}
            className="px-3 py-2 rounded-xl border border-amber-500/45 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>بارگذاری نمونه پرشده فنوج ۲۳۰ (۴ مسیر)</span>
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

      {/* Document Quality Management Header Metadata */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 bg-slate-900/60 space-y-3">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
          <span className="font-bold text-cyan-300">مشخصات سند و قرارداد (سربرگ فرم شرکت طلیعه شرق)</span>
          <span className="text-[11px] text-slate-400">
            تعداد کل صفحات/تصاویر پیوست: <strong className="text-white">{toPersianDigits(attachments.length)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-slate-400 mb-1">عنوان قرارداد:</label>
            <input
              type="text"
              value={contractTitle}
              onChange={(e) => setContractTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">شماره قرارداد:</label>
            <input
              type="text"
              value={contractNumber}
              onChange={(e) => setContractNumber(e.target.value)}
              placeholder="مثال: 1404/88"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">تاریخ انجام PM:</label>
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
            <label className="block text-[11px] text-slate-400 mb-1">تاییدکننده:</label>
            <input
              type="text"
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              placeholder="پس از بررسی سرپرست/کارشناس تکمیل می‌شود"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">کد سند (اختیاری):</label>
            <input
              type="text"
              value={documentCode}
              onChange={(e) => setDocumentCode(e.target.value)}
              placeholder="کد مستندات کیفیت"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">شماره بازنگری:</label>
            <input
              type="text"
              value={revisionNumber}
              onChange={(e) => setRevisionNumber(e.target.value)}
              placeholder="مثال: ۰۱"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Multi-Route Tabs Switcher */}
      <div className="p-4 rounded-2xl glass-panel border border-indigo-500/35 bg-indigo-950/15 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>مسیرهای فیبر نوری این پست ({toPersianDigits(routes.length)} مسیر)</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              هر پست می‌تواند چند مسیر خروجی فیبر (مانند کتیج، نیکشهر، فنوج ۶۳، توزیع) داشته باشد؛ برای هر مسیر یک برگه جداگانه ثبت کنید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleAddRoute(24)}
              className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن مسیر ۲۴ تار</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddRoute(6)}
              className="px-3 py-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>مسیر ۶ تار</span>
            </button>
          </div>
        </div>

        {/* Route Tabs Strip */}
        <div className="flex flex-wrap gap-2">
          {routes.map((route, idx) => {
            const st = routeStats(route);
            const isTabActive = idx === activeRouteIndex;
            return (
              <div
                key={route.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                  isTabActive
                    ? 'border-cyan-400/70 bg-slate-950 text-white shadow-[0_0_14px_rgba(34,211,238,0.2)]'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveRouteIndex(idx)}
                  className="flex items-center gap-2 text-xs font-bold"
                >
                  <span className="text-cyan-400 tabular-nums">{toPersianDigits(idx + 1)}.</span>
                  <span>{route.routeTitle || 'مسیر بدون نام'}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 tabular-nums">
                    {toPersianDigits(st.total)} تار
                  </span>
                  {st.cut > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold tabular-nums">
                      {toPersianDigits(st.cut)} قطع
                    </span>
                  )}
                </button>
                {routes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRoute(idx)}
                    className="p-0.5 rounded text-slate-500 hover:text-rose-400"
                    title="حذف این مسیر"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Route Technical Details + Physical Checklist + Core Table */}
      <div className="space-y-5 p-4 sm:p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/70">
        {/* Route Header & Line Specifications */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <h4 className="text-sm font-extrabold text-white">
            مشخصات فنی مسیر: <span className="text-cyan-300">{activeRoute.routeTitle}</span>
          </h4>
          <button
            type="button"
            onClick={handleDuplicateRoute}
            className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold flex items-center gap-1 self-start"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>کپی از این مسیر</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">عنوان مسیر (نام شیت):</label>
            <input
              type="text"
              value={activeRoute.routeTitle}
              onChange={(e) =>
                updateActiveRoute((r) => ({ ...r, routeTitle: e.target.value }))
              }
              placeholder="مثال: کتیج یا نیکشهر - اسپکه"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">نام ایستگاه مبدأ / کد خط:</label>
            <input
              type="text"
              value={activeRoute.sourceStation}
              onChange={(e) =>
                updateActiveRoute((r) => ({ ...r, sourceStation: e.target.value }))
              }
              placeholder="مثال: فنوج 230"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">ایستگاه مقصد / کد خط:</label>
            <input
              type="text"
              value={activeRoute.destinationStation}
              onChange={(e) =>
                updateActiveRoute((r) => ({ ...r, destinationStation: e.target.value }))
              }
              placeholder="مثال: اسپکه / فنوج 63"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">طول خط (کیلومتر):</label>
            <div className="relative flex items-center">
              <input
                type="text"
                inputMode="decimal"
                dir="ltr"
                value={activeRoute.lineLengthText}
                onChange={(e) =>
                  updateActiveRoute((r) => ({
                    ...r,
                    lineLengthText: normalizeKilometerInput(e.target.value),
                  }))
                }
                placeholder="مثال: 54 یا 0.209"
                className="w-full pl-14 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-left tabular-nums focus:outline-none focus:border-cyan-400"
              />
              <span className="absolute left-2.5 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-bold text-cyan-300 pointer-events-none select-none">
                km
              </span>
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">نوع کابل Outdoor:</label>
            <input
              type="text"
              value={activeRoute.outdoorCableType}
              onChange={(e) =>
                updateActiveRoute((r) => ({ ...r, outdoorCableType: e.target.value }))
              }
              placeholder="مثال: OPGW 24 Core"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">نوع کابل Indoor:</label>
            <input
              type="text"
              value={activeRoute.indoorCableType}
              onChange={(e) =>
                updateActiveRoute((r) => ({ ...r, indoorCableType: e.target.value }))
              }
              placeholder="مثال: کانالی NZ OPUC 4*6"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">نوع OCDF:</label>
            <input
              type="text"
              value={activeRoute.ocdfType}
              onChange={(e) =>
                updateActiveRoute((r) => ({ ...r, ocdfType: e.target.value }))
              }
              placeholder="مثال: پچ پنل"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">نوع کانکتور ODF:</label>
            <input
              type="text"
              value={activeRoute.odfConnectorType}
              onChange={(e) =>
                updateActiveRoute((r) => ({ ...r, odfConnectorType: e.target.value }))
              }
              placeholder="مثال: SC / FC / LC"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Physical Passive Optical Checklist Inside Station */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h5 className="text-xs font-bold text-cyan-300">
              وضعیت فیزیکی پسیو نوری - داخل ایستگاه
            </h5>
            <span className="text-[11px] text-slate-400">سالم / قابل قبول / معیوب</span>
          </div>

          {/* Room & Floor Layout Header Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-200">وضعیت کلی اتاق فیبرنوری:</span>
              <div className="flex items-center gap-1.5">
                {PHYSICAL_STATES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() =>
                      updateActiveRoute((r) => ({
                        ...r,
                        physical: {
                          ...r.physical,
                          fiberRoomStatus: r.physical.fiberRoomStatus === st ? '' : st,
                        },
                      }))
                    }
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors ${
                      activeRoute.physical.fiberRoomStatus === st
                        ? st === 'سالم'
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                          : st === 'قابل قبول'
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                          : 'border-rose-400 bg-rose-500/20 text-rose-200'
                        : 'border-slate-700 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-200">انطباق نقشه تجهیزات با Floor Layout:</span>
              <div className="flex items-center gap-1.5">
                {PHYSICAL_STATES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() =>
                      updateActiveRoute((r) => ({
                        ...r,
                        physical: {
                          ...r.physical,
                          floorLayoutMatch: r.physical.floorLayoutMatch === st ? '' : st,
                        },
                      }))
                    }
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors ${
                      activeRoute.physical.floorLayoutMatch === st
                        ? st === 'سالم'
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                          : st === 'قابل قبول'
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                          : 'border-rose-400 bg-rose-500/20 text-rose-200'
                        : 'border-slate-700 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 6 Physical Passive Sub-items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            {PHYSICAL_CHECK_ITEMS.map((item) => {
              const currentVal = activeRoute.physical[item.key];
              return (
                <div
                  key={item.key}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2"
                >
                  <div className="font-semibold text-slate-200 text-xs">{item.label}</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PHYSICAL_STATES.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() =>
                          updateActiveRoute((r) => ({
                            ...r,
                            physical: {
                              ...r.physical,
                              [item.key]: currentVal === st ? '' : st,
                            },
                          }))
                        }
                        className={`py-1 rounded-lg border text-[11px] font-bold transition-colors ${
                          currentVal === st
                            ? st === 'سالم'
                              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                              : st === 'قابل قبول'
                              ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                              : 'border-rose-400 bg-rose-500/20 text-rose-200'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">توضیحات وضعیت فیزیکی داخل ایستگاه:</label>
            <textarea
              rows={2}
              value={activeRoute.physical.remarks}
              onChange={(e) =>
                updateActiveRoute((r) => ({
                  ...r,
                  physical: { ...r.physical, remarks: e.target.value },
                }))
              }
              placeholder="در صورت مشاهده نقص فیزیکی در پیگتل، پچ‌کورد، لیبل، دست‌پیچ یا جوینت باکس توضیح دهید..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Station Core Status Table («وضعیت تار در ایستگاه») */}
        <div className="space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h5 className="text-xs font-extrabold text-white">وضعیت تار در ایستگاه:</h5>
              <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-700 text-[11px] text-slate-300 tabular-nums">
                کل: {toPersianDigits(activeRouteStats.total)} تار
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/35 text-[11px] text-emerald-300 tabular-nums">
                زیربار: {toPersianDigits(activeRouteStats.active)}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/35 text-[11px] text-sky-300 tabular-nums">
                تاریک: {toPersianDigits(activeRouteStats.dark)}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md border text-[11px] tabular-nums ${
                  activeRouteStats.cut > 0
                    ? 'bg-rose-500/20 border-rose-500/45 text-rose-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                قطع: {toPersianDigits(activeRouteStats.cut)}
              </span>
            </div>

            {/* Core Count Presets & Add Row */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 ml-1">تعداد تار:</span>
              {[6, 12, 24].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleSetCorePresetCount(cnt)}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition-colors ${
                    activeRoute.cores.length === cnt
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                      : 'border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {toPersianDigits(cnt)} تار
                </button>
              ))}
              <button
                type="button"
                onClick={handleAddCoreRow}
                className="px-2.5 py-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>افزودن تار</span>
              </button>
            </div>
          </div>

          {/* Quick-Fill Batch Helper */}
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-bold shrink-0">
              <Wand2 className="w-3.5 h-3.5" />
              <span>پرکردن سریع کل ردیف‌های این مسیر:</span>
            </div>
            <input
              type="text"
              value={quickSection}
              onChange={(e) => setQuickSection(e.target.value)}
              placeholder="شماره سکشن (مثال: 1)"
              className="sm:w-32 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
            />
            <input
              type="text"
              value={quickDestination}
              onChange={(e) => setQuickDestination(e.target.value)}
              placeholder="مقصد پیش‌فرض (مثال: کتیج)"
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
            />
            <button
              type="button"
              onClick={handleQuickFillSectionAndDest}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-200 font-bold text-xs shrink-0"
            >
              اعمال روی کل ردیف‌ها
            </button>
          </div>

          {/* Scrollable Core Table matching exact Excel columns */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
            <table className="w-full min-w-[920px] text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/95 text-slate-300 border-b border-slate-800 text-[11px]">
                  <th className="py-2.5 px-2 w-12 text-center">ردیف</th>
                  <th className="py-2.5 px-2 w-20">شماره سکشن</th>
                  <th className="py-2.5 px-2 w-20">شماره Pigtail</th>
                  <th className="py-2.5 px-2 w-32">مقصد</th>
                  <th className="py-2.5 px-2 w-32">تجهیز اکتیو زیربار</th>
                  <th className="py-2.5 px-2 w-28">وضعیت تار</th>
                  <th className="py-2.5 px-2 w-28">افت مسیر (dB)</th>
                  <th className="py-2.5 px-2 w-28">طول مسیر (km)</th>
                  <th className="py-2.5 px-2 min-w-[180px]">توضیحات</th>
                  <th className="py-2.5 px-2 w-10 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {activeRoute.cores.map((core) => {
                  const isCut = core.coreStatus === 'قطع';
                  const isActiveLoad = core.coreStatus === 'زیربار';
                  return (
                    <tr
                      key={core.id}
                      className={`transition-colors ${
                        isCut
                          ? 'bg-rose-950/25'
                          : isActiveLoad
                          ? 'bg-emerald-950/15'
                          : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="py-1.5 px-2 text-center font-bold text-slate-400 tabular-nums">
                        {toPersianDigits(core.rowNumber)}
                      </td>
                      <td className="py-1.5 px-1.5">
                        <input
                          type="text"
                          value={core.sectionNumber}
                          onChange={(e) =>
                            handleUpdateCore(core.id, { sectionNumber: e.target.value })
                          }
                          className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-center text-xs focus:outline-none"
                        />
                      </td>
                      <td className="py-1.5 px-1.5">
                        <input
                          type="text"
                          value={core.pigtailNumber}
                          onChange={(e) =>
                            handleUpdateCore(core.id, { pigtailNumber: e.target.value })
                          }
                          className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-center text-xs focus:outline-none"
                        />
                      </td>
                      <td className="py-1.5 px-1.5">
                        <input
                          type="text"
                          value={core.destination}
                          onChange={(e) =>
                            handleUpdateCore(core.id, { destination: e.target.value })
                          }
                          placeholder="مقصد"
                          className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-xs focus:outline-none"
                        />
                      </td>
                      <td className="py-1.5 px-1.5">
                        <input
                          type="text"
                          value={core.activeEquipment}
                          onChange={(e) =>
                            handleUpdateCore(core.id, { activeEquipment: e.target.value })
                          }
                          placeholder="مثال: SW OT"
                          className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-xs focus:outline-none"
                        />
                      </td>
                      <td className="py-1.5 px-1.5">
                        <select
                          value={core.coreStatus}
                          onChange={(e) =>
                            handleCoreStatusChange(core, e.target.value as FiberCoreStatus)
                          }
                          className={`w-full px-2 py-1 rounded-lg border text-xs font-bold focus:outline-none ${
                            core.coreStatus === 'زیربار'
                              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                              : core.coreStatus === 'تاریک'
                              ? 'bg-sky-950/60 border-sky-500/50 text-sky-300'
                              : core.coreStatus === 'قطع'
                              ? 'bg-rose-950/80 border-rose-500/60 text-rose-300'
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                          }`}
                        >
                          <option value="">انتخاب...</option>
                          <option value="زیربار">زیربار</option>
                          <option value="تاریک">تاریک</option>
                          <option value="قطع">قطع</option>
                        </select>
                      </td>
                      <td className="py-1.5 px-1.5">
                        <input
                          type="text"
                          value={core.attenuationDb}
                          onChange={(e) =>
                            handleUpdateCore(core.id, { attenuationDb: e.target.value })
                          }
                          placeholder={isActiveLoad ? '—' : 'dB'}
                          dir="ltr"
                          className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-center text-xs focus:outline-none tabular-nums"
                        />
                      </td>
                      <td className="py-1.5 px-1.5">
                        <input
                          type="text"
                          value={core.distanceKm}
                          onChange={(e) =>
                            handleUpdateCore(core.id, { distanceKm: e.target.value })
                          }
                          placeholder={isActiveLoad ? '—' : 'km'}
                          dir="ltr"
                          className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-center text-xs focus:outline-none tabular-nums"
                        />
                      </td>
                      <td className="py-1.5 px-1.5">
                        <input
                          type="text"
                          value={core.notes}
                          onChange={(e) =>
                            handleUpdateCore(core.id, { notes: e.target.value })
                          }
                          placeholder="توضیحات / نتیجه OTDR..."
                          className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-xs focus:outline-none"
                        />
                      </td>
                      <td className="py-1.5 px-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteCoreRow(core.id)}
                          disabled={activeRoute.cores.length <= 1}
                          className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30"
                          title="حذف ردیف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Test Photos & OTDR Results Attachments Section */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-sky-400" />
              <span>پیوست تصاویر تست، ODF و نمودارهای OTDR ({toPersianDigits(attachments.length)} تصویر)</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              تصاویر گرفته‌شده با دوربین یا فایل اسکرین‌شات تست OTDR را می‌توانید بر اساس مسیر فیبر نوری ضمیمه کنید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={uploadRouteTag}
              onChange={(e) => setUploadRouteTag(e.target.value)}
              className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              title="برچسب مسیر تصویر"
            >
              <option value="کلی پست">مربوط به: کلی پست</option>
              {routes.map((r) => (
                <option key={r.id} value={r.routeTitle}>
                  مسیر: {r.routeTitle}
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
              <span>آپلود از گالری / فایل</span>
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
                <div className="relative group h-36 bg-slate-900">
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
                    placeholder="شرح تصویر (مثال: تست OTDR تار ۱۵)"
                    className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            هنوز تصویری پیوست نشده است. از دکمه‌های بالا برای تصویربرداری مستقیم از ODF / پچ‌پنل / دستگاه OTDR یا بارگذاری فایل استفاده کنید.
          </div>
        )}
      </div>

      {/* Sticky Footer Submit Bar */}
      <div className="rounded-2xl glass-panel border border-cyan-500/35 p-4 bg-slate-900/95 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1 text-center sm:text-right">
          <div className="text-[11px] text-slate-400">
            پست: <strong className="text-white">{selectedStation ? selectedStation.persianName : 'انتخاب نشده'}</strong> · دوره:{' '}
            <strong className="text-cyan-300">{selectedMonth}</strong>
          </div>
          <div className="text-xs font-bold text-slate-200 tabular-nums">
            {toPersianDigits(routes.length)} مسیر فیبر نوری ·{' '}
            {toPersianDigits(routes.reduce((s, r) => s + r.cores.length, 0))} ردیف تار ·{' '}
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
              ? 'به‌روزرسانی و ذخیره تست دوره‌ای'
              : 'ثبت نهایی تست دوره‌ای پسیو فیبر نوری'}
          </span>
        </button>
      </div>

      {/* Saved Periodic Tests History */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white">
              سوابق تست‌های دوره‌ای پسیو فیبر نوری ثبت‌شده ({toPersianDigits(savedFiberTests.length)})
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              امکان بازخوانی تمام مسیرها، مشاهده تصاویر پیوست و تایید توسط سرپرست گروه یا ناظر کارفرما
            </p>
          </div>
        </div>

        {savedFiberTests.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            هنوز هیچ تست دوره‌ای پسیو فیبر نوری ذخیره نشده است. پس از تکمیل فرم بالا دکمه ثبت را بزنید.
          </div>
        ) : (
          <div className="space-y-3">
            {savedFiberTests.map((rec) => {
              const badge = getPeriodicStatusBadge(rec.status);
              const totalCores = rec.routes.reduce((sum, r) => sum + r.cores.length, 0);
              const cutCores = rec.routes.reduce(
                (sum, r) => sum + r.cores.filter((c) => c.coreStatus === 'قطع').length,
                0
              );

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
                      {cutCores > 0 && (
                        <span className="px-2 py-0.5 rounded-md border border-rose-500/40 bg-rose-500/15 text-rose-300 text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {toPersianDigits(cutCores)} تار قطع گزارش‌شده
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span>تنظیم‌کننده: <strong className="text-slate-200">{rec.preparerName}</strong></span>
                      <span>·</span>
                      <span>تاریخ PM: <strong className="text-slate-200">{rec.pmDateJalali}</strong></span>
                      <span>·</span>
                      <span>مسیرها: <strong className="text-cyan-300">{toPersianDigits(rec.routes.length)}</strong> ({rec.routes.map((r) => r.routeTitle).join('، ')})</span>
                      <span>·</span>
                      <span>{toPersianDigits(totalCores)} تار · {toPersianDigits(rec.attachments.length)} تصویر</span>
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
