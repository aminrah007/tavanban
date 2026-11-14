/**
 * Dashboard View
 * Deeply personalized workspace per organizational role per SYSTEM_DOCUMENTATION_diff_b8adb869.md
 */

import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  TrendingUp,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Layers,
  Activity,
  Radio,
  ShoppingCart,
  Users,
  CheckSquare,
  History,
  Tag,
  CloudOff,
  X,
  ClipboardEdit,
} from 'lucide-react';
import { useApp, getRolePersianName, getStatusPersianBadge } from '../../context/AppContext';
import { ChannelHealthStackedChart, NetworkReadinessSummaryCard } from '../charts/AnalyticalCharts';
import { toPersianDigits, formatPriceToman } from '../../utils/formatters';
import {
  ROLE_WORKSPACE_META,
  filterReportsForRole,
  filterTasksForRole,
  filterPurchasesForRole,
  filterStatementsForRole,
  filterGroupsForRole,
  filterUsersForRole,
  filterScoresForRole,
  canCreateDailyReport,
  canViewDailyReports,
} from '../../config/rolePermissions';
import { ViewRoute } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    users,
    reports,
    tasks,
    statements,
    purchases,
    scores,
    groups,
    stations,
    syncQueue,
    theme,
    setCurrentRoute,
    setSelectedReportId,
    companies,
    contracts,
    createDailyReport,
  } = useApp();

  // Expert daily report quick modal state
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [dailyDate, setDailyDate] = useState('۱۴۰۳/۰۸/۲۵');
  const [dailyGroupId, setDailyGroupId] = useState(
    () => filterGroupsForRole(groups, currentUser)[0]?._id || groups[0]?._id || 'grp-1'
  );
  const [dailyStationId, setDailyStationId] = useState(stations[0]?.id || '');
  const [dailyDesc, setDailyDesc] = useState('');

  const meta = ROLE_WORKSPACE_META[currentRole];

  // Role-scoped data collections
  const scopedGroups = filterGroupsForRole(groups, currentUser);
  const scopedReports = filterReportsForRole(reports, currentUser, groups);
  const scopedWorkReports = scopedReports.filter((r) => r.reportType !== 'daily_report');
  const scopedDailyReports = scopedReports.filter((r) => r.reportType === 'daily_report');
  const scopedTasks = filterTasksForRole(tasks, currentUser, groups);
  const scopedPurchases = filterPurchasesForRole(purchases, currentUser);
  const scopedStatements = filterStatementsForRole(statements, currentUser);
  const scopedUsers = filterUsersForRole(users, currentUser, groups);
  const scopedScores = filterScoresForRole(scores, currentUser, users, groups);

  // Common computed metrics within role scope
  const approvedWorkReports = scopedWorkReports.filter(
    (r) => r.status === 'approved' || r.status === 'settled'
  );
  const approvedAmountRial = approvedWorkReports.reduce((sum, r) => sum + r.totalAmount, 0);
  const openTasks = scopedTasks.filter((t) => t.status !== 'done' && t.status !== 'cancelled');
  const urgentTasksCount = openTasks.filter((t) => t.priority === 'urgent').length;
  const faultyStationsCount = stations.filter((s) => s.channels.some((c) => c.status === 'down')).length;

  // Extra work metrics (for RESIDENT_REP & CONTRACTOR_CEO)
  const scopedExtraWorks = scopedWorkReports.flatMap((r) =>
    r.extraWorks.map((ew) => ({ ...ew, reportId: r._id, userName: r.userName, stationName: r.stationName }))
  );
  const pendingExtraWorks = scopedExtraWorks.filter((ew) => ew.status === 'pending');
  const mappedExtraWorksAmount = scopedExtraWorks
    .filter((ew) => ew.status === 'mapped')
    .reduce((acc, ew) => acc + (ew.mappedAmount || 0), 0);

  // Purchase metrics
  const pendingPurchases = scopedPurchases.filter((p) => p.status === 'pending');
  const approvedPurchases = scopedPurchases.filter((p) => p.status === 'approved');

  // Role-specific statement action queue
  const pendingStatements = scopedStatements.filter((s) => {
    if (currentRole === 'EMPLOYER_CEO') {
      return s.status === 'employer_ceo_review' || s.status === 'pending';
    }
    if (currentRole === 'EMPLOYER_MANAGER') {
      return s.status === 'employer_manager_review';
    }
    if (currentRole === 'DEPUTY') {
      return s.status === 'deputy_review' || s.status === 'approved';
    }
    return s.status === 'employer_ceo_review' || s.status === 'employer_manager_review' || s.status === 'deputy_review' || s.status === 'pending';
  });

  // Role-specific report action queue
  const reportActionQueue = scopedWorkReports.filter((r) => {
    if (currentRole === 'DEPUTY') return r.status === 'approved';
    if (currentRole === 'EMPLOYER_CEO') return r.status === 'employer_ceo_review';
    if (currentRole === 'EMPLOYER_EXPERT') return r.status === 'expert_review';
    if (currentRole === 'GROUP_SUPERVISOR') return r.status === 'supervisor_review';
    if (currentRole === 'TECHNICIAN') return r.status === 'redo_requested' || r.status === 'supervisor_review';
    return true;
  });

  // Role-specific KPI Card definition
  interface KpiCard {
    label: string;
    value: string;
    subtext: string;
    subValue: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
    route: ViewRoute;
  }

  const getKpiCards = (): KpiCard[] => {
    switch (currentRole) {
      case 'DEPUTY':
        return [
          {
            label: 'شرکت‌ها و قراردادهای فعال',
            value: `${toPersianDigits(companies.length)} / ${toPersianDigits(contracts.length)}`,
            subtext: 'تعداد گروه‌های عملیاتی:',
            subValue: `${toPersianDigits(groups.length)} گروه`,
            icon: Building2,
            accent: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
            route: 'contracts',
          },
          {
            label: 'صورت‌وضعیت‌های در انتظار تایید',
            value: toPersianDigits(pendingStatements.length),
            subtext: 'مجموع صورت‌وضعیت‌ها:',
            subValue: `${toPersianDigits(scopedStatements.length)} فقره`,
            icon: TrendingUp,
            accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            route: 'statements',
          },
          {
            label: 'گزارش‌های تایید نهایی (آماده تسویه)',
            value: toPersianDigits(scopedWorkReports.filter((r) => r.status === 'approved').length),
            subtext: 'تسویه‌شده قطعی:',
            subValue: `${toPersianDigits(scopedWorkReports.filter((r) => r.status === 'settled').length)} گزارش`,
            icon: CheckCircle2,
            accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            route: 'reports',
          },
          {
            label: 'جمع کل ارزش تاییدشده شبکه',
            value: `${formatPriceToman(approvedAmountRial)}`,
            subtext: 'پست‌های دارای اختلال ارتباط:',
            subValue: `${toPersianDigits(faultyStationsCount)} ایستگاه`,
            icon: DollarSign,
            accent: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
            route: 'station-communications',
          },
        ];

      case 'EMPLOYER_MANAGER':
        return [
          {
            label: 'صورت‌وضعیت‌های منتظر تایید شما',
            value: toPersianDigits(pendingStatements.length),
            subtext: 'مرحله فعلی:',
            subValue: 'پس از تایید رییس کارفرما',
            icon: TrendingUp,
            accent: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
            route: 'statements',
          },
          {
            label: 'گزارش‌های کار تحت نظارت کل',
            value: toPersianDigits(scopedWorkReports.length),
            subtext: 'تایید نهایی‌شده:',
            subValue: `${toPersianDigits(approvedWorkReports.length)} گزارش`,
            icon: FileText,
            accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            route: 'reports',
          },
          {
            label: 'کارهای ارجاعی به رییس و کارشناسان',
            value: toPersianDigits(openTasks.length),
            subtext: 'اولویت فوری:',
            subValue: `${toPersianDigits(urgentTasksCount)} مأموریت`,
            icon: CheckSquare,
            accent: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
            route: 'tasks',
          },
          {
            label: 'گزارش‌های روزانه و پایش پست‌ها',
            value: toPersianDigits(scopedDailyReports.length),
            subtext: 'پست‌های دارای قطعی:',
            subValue: `${toPersianDigits(faultyStationsCount)} ایستگاه`,
            icon: Radio,
            accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            route: 'station-communications',
          },
        ];

      case 'EMPLOYER_CEO':
        return [
          {
            label: 'در انتظار تایید نهایی شما',
            value: toPersianDigits(reportActionQueue.length),
            subtext: 'مرحله فعلی:',
            subValue: 'تایید رییس کارفرما (گام ۳)',
            icon: Clock,
            accent: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
            route: 'reports',
          },
          {
            label: 'تاییدشده واحد نظارتی',
            value: toPersianDigits(approvedWorkReports.length),
            subtext: 'ارزش کل تاییدشده:',
            subValue: formatPriceToman(approvedAmountRial),
            icon: CheckCircle2,
            accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            route: 'reports',
          },
          {
            label: 'گزارش‌های دارای اختلاف / ردشده',
            value: toPersianDigits(
              scopedWorkReports.filter((r) => r.status === 'disputed' || r.status === 'rejected').length
            ),
            subtext: 'گزارش روزانه ناظران:',
            subValue: `${toPersianDigits(scopedDailyReports.length)} مورد`,
            icon: AlertTriangle,
            accent: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
            route: 'reports',
          },
          {
            label: 'گروه‌ها و کارهای محوله واحد',
            value: toPersianDigits(scopedGroups.length),
            subtext: 'مأموریت‌های باز واحد:',
            subValue: `${toPersianDigits(openTasks.length)} کار`,
            icon: Users,
            accent: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
            route: 'groups',
          },
        ];

      case 'EMPLOYER_EXPERT':
        return [
          {
            label: 'در انتظار بررسی فنی شما',
            value: toPersianDigits(reportActionQueue.length),
            subtext: 'مرحله فعلی:',
            subValue: 'انطباق فنی (گام ۲)',
            icon: Clock,
            accent: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
            route: 'reports',
          },
          {
            label: 'کارهای محوله گروه‌های مجاز',
            value: toPersianDigits(openTasks.length),
            subtext: 'اولویت فوری:',
            subValue: `${toPersianDigits(urgentTasksCount)} مأموریت`,
            icon: CheckSquare,
            accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            route: 'tasks',
          },
          {
            label: 'گزارش‌های روزانه ثبت‌شده شما',
            value: toPersianDigits(scopedDailyReports.length),
            subtext: 'ارسال خودکار به:',
            subValue: 'رییس کارفرما',
            icon: ClipboardEdit,
            accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            route: 'reports',
          },
          {
            label: 'ایستگاه‌های نیازمند بررسی ارتباطی',
            value: toPersianDigits(faultyStationsCount),
            subtext: 'کل پست‌های تحت پایش:',
            subValue: `${toPersianDigits(stations.length)} پست`,
            icon: Radio,
            accent: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
            route: 'station-communications',
          },
        ];

      case 'CONTRACTOR_CEO':
        return [
          {
            label: 'گزارش‌های کار شرکت (تایید نهایی)',
            value: toPersianDigits(approvedWorkReports.length),
            subtext: 'در گردش نظارت:',
            subValue: `${toPersianDigits(scopedWorkReports.length - approvedWorkReports.length)} مورد`,
            icon: FileText,
            accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            route: 'reports',
          },
          {
            label: 'مبلغ گزارش‌های آماده صورت‌وضعیت',
            value: formatPriceToman(
              scopedWorkReports
                .filter((r) => r.status === 'approved')
                .reduce((acc, r) => acc + r.totalAmount, 0)
            ),
            subtext: 'صورت‌وضعیت‌های صادره:',
            subValue: `${toPersianDigits(scopedStatements.length)} فقره`,
            icon: DollarSign,
            accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            route: 'statements',
          },
          {
            label: 'پرسنل و گروه‌های شرکت',
            value: `${toPersianDigits(scopedUsers.length)} نفر`,
            subtext: 'گروه‌های فعال شرکت:',
            subValue: `${toPersianDigits(scopedGroups.length)} گروه`,
            icon: Users,
            accent: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
            route: 'technicians',
          },
          {
            label: 'درخواست‌های خرید منتظر تایید',
            value: toPersianDigits(pendingPurchases.length),
            subtext: 'کل درخواست‌های شرکت:',
            subValue: `${toPersianDigits(scopedPurchases.length)} مورد`,
            icon: ShoppingCart,
            accent: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
            route: 'purchases',
          },
        ];

      case 'RESIDENT_REP':
        return [
          {
            label: 'کارهای اضافی منتظر معادل‌سازی',
            value: toPersianDigits(pendingExtraWorks.length),
            subtext: 'کل کارهای خارج از فهرست:',
            subValue: `${toPersianDigits(scopedExtraWorks.length)} مورد`,
            icon: Layers,
            accent: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
            route: 'extra-work',
          },
          {
            label: 'ارزش معادل‌سازی شده تاکنون',
            value: formatPriceToman(mappedExtraWorksAmount),
            subtext: 'ثبت مستقیم در:',
            subValue: 'گزارش کارهای مرتبط',
            icon: Tag,
            accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            route: 'extra-work',
          },
          {
            label: 'درخواست‌های خرید منتظر بررسی',
            value: toPersianDigits(pendingPurchases.length),
            subtext: 'کل خریدهای شرکت:',
            subValue: `${toPersianDigits(scopedPurchases.length)} مورد`,
            icon: ShoppingCart,
            accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            route: 'purchases',
          },
          {
            label: 'خریدهای تاییدشده (منتظر پرداخت)',
            value: toPersianDigits(approvedPurchases.length),
            subtext: 'پرداخت‌شده:',
            subValue: `${toPersianDigits(scopedPurchases.filter((p) => p.status === 'paid').length)} مورد`,
            icon: DollarSign,
            accent: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
            route: 'purchases',
          },
        ];

      case 'GROUP_SUPERVISOR':
        return [
          {
            label: 'در انتظار تایید سرپرست (گام ۱)',
            value: toPersianDigits(reportActionQueue.length),
            subtext: 'کل گزارش‌های گروه:',
            subValue: `${toPersianDigits(scopedWorkReports.length)} گزارش`,
            icon: Clock,
            accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            route: 'reports',
          },
          {
            label: 'مأموریت‌های باز گروه',
            value: toPersianDigits(openTasks.length),
            subtext: 'اولویت فوری:',
            subValue: `${toPersianDigits(urgentTasksCount)} کار`,
            icon: CheckSquare,
            accent: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
            route: 'tasks',
          },
          {
            label: 'اعضای تحت سرپرستی',
            value: `${toPersianDigits(scopedUsers.length)} نفر`,
            subtext: 'تعداد گروه‌های تحت نظارت:',
            subValue: `${toPersianDigits(scopedGroups.length)} گروه`,
            icon: Users,
            accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            route: 'groups',
          },
          {
            label: 'صف همگام‌سازی آفلاین',
            value: toPersianDigits(syncQueue.length),
            subtext: 'درخواست‌های خرید گروه:',
            subValue: `${toPersianDigits(scopedPurchases.length)} مورد`,
            icon: CloudOff,
            accent: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
            route: 'offline-queue',
          },
        ];

      case 'TECHNICIAN':
      default:
        return [
          {
            label: 'مأموریت‌های محوله فعال من',
            value: toPersianDigits(openTasks.length),
            subtext: 'دارای اولویت فوری:',
            subValue: `${toPersianDigits(urgentTasksCount)} مأموریت`,
            icon: CheckSquare,
            accent: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
            route: 'tasks',
          },
          {
            label: 'گزارش‌های در گردش / نیازمند اصلاح',
            value: toPersianDigits(
              scopedWorkReports.filter((r) => r.status !== 'approved' && r.status !== 'settled').length
            ),
            subtext: 'نیازمند اصلاح (Redo):',
            subValue: `${toPersianDigits(
              scopedWorkReports.filter((r) => r.status === 'redo_requested').length
            )} مورد`,
            icon: FileText,
            accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            route: 'reports',
          },
          {
            label: 'مجموع امتیاز فنی من',
            value: toPersianDigits(currentUser.score || 0),
            subtext: 'رویدادهای امتیاز کسب‌شده:',
            subValue: `${toPersianDigits(scopedScores.length)} مورد`,
            icon: Award,
            accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            route: 'technicians',
          },
          {
            label: 'صف آفلاین و خریدهای من',
            value: toPersianDigits(syncQueue.length),
            subtext: 'درخواست‌های خرید من:',
            subValue: `${toPersianDigits(scopedPurchases.length)} مورد`,
            icon: CloudOff,
            accent: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
            route: syncQueue.length > 0 ? 'offline-queue' : 'purchases',
          },
        ];
    }
  };

  const kpiCards = getKpiCards();

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
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Role-Tailored Welcome Banner */}
      <div className="rounded-2xl glass-panel border border-slate-800 p-6 bg-gradient-to-l from-slate-900/90 via-slate-900/60 to-slate-950/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs mb-1.5">
            <span className="font-bold text-amber-400">{meta.badge}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{meta.scopeLabel}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">
            {currentUser.fullName} — {meta.headline}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 max-w-3xl leading-relaxed">{meta.summary}</p>
        </div>

        {/* Strictly Authorized Role Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {currentRole === 'DEPUTY' && (
            <>
              <button
                onClick={() => setCurrentRoute('contracts')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>مدیریت شرکت‌ها و قراردادها</span>
              </button>
              <button
                onClick={() => setCurrentRoute('statements')}
                className="px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>تایید صورت‌وضعیت‌ها</span>
              </button>
            </>
          )}

          {currentRole === 'EMPLOYER_MANAGER' && (
            <>
              <button
                onClick={() => setCurrentRoute('statements')}
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>تایید صورت‌وضعیت‌ها ({toPersianDigits(pendingStatements.length)})</span>
              </button>
              <button
                onClick={() => setCurrentRoute('tasks')}
                className="px-4 py-2.5 rounded-xl border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                <span>ارجاع کار به واحد کارفرما</span>
              </button>
              <button
                onClick={() => setCurrentRoute('reports')}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>نظارت بر گزارش‌ها</span>
              </button>
            </>
          )}

          {currentRole === 'EMPLOYER_CEO' && (
            <>
              <button
                onClick={() => setCurrentRoute('reports')}
                className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>کارتابل تایید نهایی ({toPersianDigits(reportActionQueue.length)})</span>
              </button>
              <button
                onClick={() => setCurrentRoute('statements')}
                className="px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>صورت‌وضعیت‌ها ({toPersianDigits(pendingStatements.length)})</span>
              </button>
              <button
                onClick={() => setCurrentRoute('tasks')}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <span>ارجاع کار واحد</span>
              </button>
            </>
          )}

          {currentRole === 'EMPLOYER_EXPERT' && (
            <>
              <button
                onClick={() => setIsDailyModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <ClipboardEdit className="w-4 h-4" />
                <span>ثبت گزارش روزانه کارشناس</span>
              </button>
              <button
                onClick={() => setCurrentRoute('reports')}
                className="px-4 py-2.5 rounded-xl border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>بررسی گزارش‌ها ({toPersianDigits(reportActionQueue.length)})</span>
              </button>
            </>
          )}

          {currentRole === 'CONTRACTOR_CEO' && (
            <>
              <button
                onClick={() => setCurrentRoute('statements')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>صدور صورت‌وضعیت جدید</span>
              </button>
              <button
                onClick={() => setCurrentRoute('price-items')}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <Tag className="w-4 h-4 text-amber-400" />
                <span>مدیریت فهرست بها</span>
              </button>
            </>
          )}

          {currentRole === 'RESIDENT_REP' && (
            <>
              <button
                onClick={() => setCurrentRoute('extra-work')}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>معادل‌سازی کارهای اضافی ({toPersianDigits(pendingExtraWorks.length)})</span>
              </button>
              <button
                onClick={() => setCurrentRoute('purchases')}
                className="px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>مدیریت و پرداخت خریدها</span>
              </button>
            </>
          )}

          {(currentRole === 'TECHNICIAN' || currentRole === 'GROUP_SUPERVISOR') && (
            <>
              <button
                onClick={() => setCurrentRoute('report-new')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-[0_0_18px_rgba(245,158,11,0.32)]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>
                  {currentRole === 'GROUP_SUPERVISOR'
                    ? 'ثبت گزارش (خود یا عضو گروه)'
                    : 'ثبت گزارش کار جدید'}
                </span>
              </button>
              <button
                onClick={() => setCurrentRoute('tasks')}
                className="px-4 py-2.5 rounded-xl border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                <span>کارهای محوله ({toPersianDigits(openTasks.length)})</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Role-Specific KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              onClick={() => setCurrentRoute(kpi.route)}
              className="p-5 rounded-2xl glass-panel border border-slate-800/80 bg-slate-900/60 hover:border-slate-700 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-medium">{kpi.label}</span>
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center group-hover:scale-105 transition-transform ${kpi.accent}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tabular-nums truncate">
                {kpi.value}
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <span>{kpi.subtext}</span>
                <span className="text-amber-300 font-semibold truncate">{kpi.subValue}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid: Strictly Scoped per Role */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Panel (2 columns): Role-Tailored Action Queue */}
        <div className="lg:col-span-2 rounded-2xl glass-panel border border-slate-800/80 p-5 bg-slate-900/50">
          {currentRole === 'RESIDENT_REP' ? (
            <>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>کارهای اضافی منتظر معادل‌سازی با فهرست بها</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ثبت‌شده در گزارش‌های شرکت برای تطبیق و ارزش‌گذاری شما
                  </p>
                </div>
                <button
                  onClick={() => setCurrentRoute('extra-work')}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <span>ورود به کارتابل معادل‌سازی</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2.5">
                {pendingExtraWorks.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-500">
                    همه کارهای اضافی ثبت‌شده تعیین تکلیف شده‌اند.
                  </div>
                ) : (
                  pendingExtraWorks.slice(0, 5).map((ew) => (
                    <div
                      key={ew._id}
                      onClick={() => setCurrentRoute('extra-work')}
                      className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{ew.description}</div>
                        <div className="text-[11px] text-slate-400">
                          تکنسین: {ew.userName} · گزارش: {toPersianDigits(ew.reportId)}
                          {ew.stationName ? ` · ${ew.stationName}` : ''}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-purple-400 shrink-0">نیازمند معادل‌سازی</span>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : currentRole === 'TECHNICIAN' ? (
            <>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-sky-400" />
                    <span>مأموریت‌های محوله فعال و گزارش‌های نیازمند اصلاح من</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    محدود به وظایف و گزارش‌های شخصی شما ({currentUser.fullName})
                  </p>
                </div>
                <button
                  onClick={() => setCurrentRoute('tasks')}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>همه کارهای من</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2.5">
                {openTasks.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => setCurrentRoute('tasks')}
                    className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="text-xs font-bold text-white truncate">{t.title}</div>
                      <div className="text-[11px] text-slate-400">
                        ارجاع‌دهنده: {t.createdByName} · مهلت: {toPersianDigits(t.dueDateJalali)}
                        {t.stationName ? ` · ${t.stationName}` : ''}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-sky-400 shrink-0">
                      {t.status === 'in_progress' ? 'در حال اجرا' : 'آماده شروع'}
                    </span>
                  </div>
                ))}
                {scopedWorkReports
                  .filter((r) => r.status === 'redo_requested')
                  .map((rep) => (
                    <div
                      key={rep._id}
                      onClick={() => {
                        setSelectedReportId(rep._id);
                        setCurrentRoute('reports');
                      }}
                      className="p-3.5 rounded-xl border border-orange-500/30 bg-orange-950/20 hover:bg-orange-950/35 transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="text-xs font-bold text-orange-300">
                          نیازمند اصلاح و ارسال مجدد · {toPersianDigits(rep._id)}
                        </div>
                        <div className="text-[11px] text-slate-300 truncate">{rep.description}</div>
                      </div>
                      <span className="text-xs font-bold text-orange-400 shrink-0">اصلاح و ارسال</span>
                    </div>
                  ))}
                {openTasks.length === 0 &&
                  scopedWorkReports.filter((r) => r.status === 'redo_requested').length === 0 && (
                    <div className="py-10 text-center text-xs text-slate-500">
                      در حال حاضر مأموریت باز یا گزارش برگشتی برای شما ثبت نشده است.
                    </div>
                  )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>
                      {currentRole === 'CONTRACTOR_CEO'
                        ? 'گزارش‌های کار شرکت پیمانکار (مشاهده و پیگیری)'
                        : currentRole === 'EMPLOYER_MANAGER'
                        ? 'گزارش‌های کار پیمانکاران (مشاهده و نظارت کلان)'
                        : currentRole === 'DEPUTY'
                        ? 'گزارش‌های تایید نهایی‌شده آماده تسویه حسابداری'
                        : `کارتابل اقدام ${getRolePersianName(currentRole).split(' (')[0]}`}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {currentRole === 'CONTRACTOR_CEO'
                      ? 'مشاهده وضعیت گردش کار گزارش‌های شرکت (بدون دسترسی ویرایش یا تایید نظارتی)'
                      : currentRole === 'EMPLOYER_MANAGER'
                      ? 'نظارت بر عملیات پیمانکاران (گزارش کارهای پیمانکار پس از تایید رییس کارفرما مستقیم به معاونت ارجاع می‌شوند)'
                      : `نمایش انحصاری موارد قابل اقدام در محدوده دسترسی نقش جاری`}
                  </p>
                </div>

                <button
                  onClick={() => setCurrentRoute('reports')}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  <span>مشاهده کارتابل کامل</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {reportActionQueue.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    در حال حاضر هیچ گزارشی در صف اقدام مستقیم شما قرار ندارد.
                  </div>
                ) : (
                  reportActionQueue.slice(0, 5).map((rep) => {
                    const statusBadge = getStatusPersianBadge(rep.status);
                    return (
                      <div
                        key={rep._id}
                        onClick={() => {
                          setSelectedReportId(rep._id);
                          setCurrentRoute('reports');
                        }}
                        className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-amber-400">{toPersianDigits(rep._id)}</span>
                            <span className="text-xs font-bold text-slate-200 truncate">{rep.description}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                            <span>ثبت‌کننده: {rep.userName}</span>
                            <span>·</span>
                            <span>تاریخ: {toPersianDigits(rep.reportDateJalali)}</span>
                            <span>·</span>
                            <span>{rep.stationName || rep.groupName}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                          <div className="text-left sm:text-right">
                            <div className="text-xs font-bold text-slate-200 tabular-nums">
                              {formatPriceToman(rep.totalAmount)} تومان
                            </div>
                            <span className={`text-[11px] font-semibold ${statusBadge.color}`}>
                              {statusBadge.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Secondary Side Panel (1 column): Strictly Customized per Role */}
        <div className="space-y-4">
          {(currentRole === 'DEPUTY' || currentRole === 'EMPLOYER_MANAGER' || currentRole === 'EMPLOYER_CEO') && (
            <div className="rounded-2xl glass-panel border border-slate-800/80 p-5 bg-slate-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>
                    {currentRole === 'EMPLOYER_MANAGER'
                      ? 'صف تایید صورت‌وضعیت‌ها (مرحله ۲)'
                      : currentRole === 'EMPLOYER_CEO'
                      ? 'صف تایید صورت‌وضعیت‌ها (مرحله ۱)'
                      : 'صف تایید و پرداخت صورت‌وضعیت‌ها'}
                  </span>
                </h3>
                <button onClick={() => setCurrentRoute('statements')} className="text-[11px] text-amber-400">
                  همه موارد
                </button>
              </div>
              <div className="space-y-2 text-xs">
                {(pendingStatements.length > 0 ? pendingStatements : scopedStatements).slice(0, 3).map((st) => (
                  <div
                    key={st._id}
                    onClick={() => setCurrentRoute('statements')}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-slate-700 cursor-pointer"
                  >
                    <div className="flex justify-between font-bold text-white">
                      <span>{toPersianDigits(st.code)}</span>
                      <span className="text-emerald-400 tabular-nums">{formatPriceToman(st.amount)}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate">{st.contractorCompanyName}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canViewDailyReports(currentRole) && (
            <div className="rounded-2xl glass-panel border border-slate-800/80 p-5 bg-slate-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ClipboardEdit className="w-4 h-4 text-sky-400" />
                  <span>گزارش‌های روزانه ناظران</span>
                </h3>
                {canCreateDailyReport(currentRole) && (
                  <button
                    onClick={() => setIsDailyModalOpen(true)}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300"
                  >
                    + ثبت جدید
                  </button>
                )}
              </div>
              <div className="space-y-2 text-xs">
                {scopedDailyReports.length === 0 ? (
                  <div className="text-[11px] text-slate-500 py-4 text-center">
                    گزارش روزانه‌ای ثبت نشده است.
                  </div>
                ) : (
                  scopedDailyReports.slice(0, 3).map((dr) => (
                    <div key={dr._id} className="p-3 rounded-xl border border-slate-800 bg-slate-950/50">
                      <div className="flex justify-between text-[11px] text-sky-400 font-semibold">
                        <span>{dr.userName}</span>
                        <span>{toPersianDigits(dr.reportDateJalali)}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{dr.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {currentRole === 'CONTRACTOR_CEO' && (
            <div className="rounded-2xl glass-panel border border-slate-800/80 p-5 bg-slate-900/50 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span>تازه‌ترین خریدهای منتظر تایید</span>
              </h3>
              <div className="space-y-2 text-xs">
                {pendingPurchases.length === 0 ? (
                  <div className="text-[11px] text-slate-500 py-4 text-center">درخواست معوقی وجود ندارد.</div>
                ) : (
                  pendingPurchases.slice(0, 3).map((p) => (
                    <div
                      key={p._id}
                      onClick={() => setCurrentRoute('purchases')}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950/50 cursor-pointer hover:border-slate-700"
                    >
                      <div className="font-bold text-white truncate">{p.title}</div>
                      <div className="text-[11px] text-emerald-400 mt-1">{formatPriceToman(p.amount)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {currentRole === 'RESIDENT_REP' && (
            <div className="rounded-2xl glass-panel border border-slate-800/80 p-5 bg-slate-900/50 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span>درخواست‌های خرید منتظر اقدام</span>
              </h3>
              <div className="space-y-2 text-xs">
                {scopedPurchases
                  .filter((p) => p.status === 'pending' || p.status === 'approved')
                  .slice(0, 4)
                  .map((p) => (
                    <div
                      key={p._id}
                      onClick={() => setCurrentRoute('purchases')}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950/50 cursor-pointer hover:border-slate-700"
                    >
                      <div className="flex justify-between font-bold text-white">
                        <span className="truncate">{p.title}</span>
                        <span className="text-amber-400 shrink-0 text-[11px]">
                          {p.status === 'pending' ? 'منتظر تایید' : 'آماده پرداخت'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {p.requestedByName} · {formatPriceToman(p.amount)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {(currentRole === 'GROUP_SUPERVISOR' || currentRole === 'TECHNICIAN') && (
            <div className="rounded-2xl glass-panel border border-slate-800/80 p-5 bg-slate-900/50 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>مسیر تایید گزارش‌های میدانی</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="font-bold text-amber-400">۱. سرپرست گروه عملیاتی</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {currentRole === 'GROUP_SUPERVISOR'
                      ? 'گزارش اعضای گروه توسط شما تایید می‌شود؛ گزارش خودتان مستقیماً به کارشناس کارفرما می‌رود.'
                      : 'بررسی اولیه و انطباق میدانی با کار انجام‌شده'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="font-bold text-sky-400">۲. کارشناس و رییس کارفرما</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    تطبیق فنی و تایید نهایی همراه با اعطای خودکار امتیاز
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scope Summary Box */}
          <div className="rounded-2xl glass-panel border border-slate-800/80 p-5 bg-slate-900/50">
            <h3 className="text-sm font-bold text-white mb-2">خلاصه محدوده دسترسی شما</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/60">
                <span className="text-slate-400">گروه‌های در دسترس:</span>
                <span className="font-semibold">{toPersianDigits(scopedGroups.length)} گروه</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/60">
                <span className="text-slate-400">گزارش‌های کار محدوده:</span>
                <span className="font-semibold">{toPersianDigits(scopedWorkReports.length)} مورد</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 py-1">
                <span className="text-slate-400">کارهای محوله محدوده:</span>
                <span className="font-semibold text-amber-400">{toPersianDigits(scopedTasks.length)} کار</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Station Communications Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <ChannelHealthStackedChart
            stations={stations}
            isDark={theme === 'dark'}
            onSelectChannelFilter={() => setCurrentRoute('station-communications')}
          />
        </div>
        <div className="lg:col-span-5">
          <NetworkReadinessSummaryCard stations={stations} isDark={theme === 'dark'} />
        </div>
      </div>

      {/* Employer Expert Daily Report Quick Modal */}
      {isDailyModalOpen && canCreateDailyReport(currentRole) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">ثبت گزارش روزانه کارشناس کارفرما</h3>
              <button onClick={() => setIsDailyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              این گزارش بدون مبلغ مالی بوده و برای اطلاع رییس کارفرما از روند بازدیدهای روزانه ثبت می‌گردد.
            </p>
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
                  <label className="block font-semibold text-slate-300 mb-1">گروه تحت نظارت:</label>
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
                <label className="block font-semibold text-slate-300 mb-1">شرح مشاهدات نظارتی:</label>
                <textarea
                  rows={4}
                  required
                  value={dailyDesc}
                  onChange={(e) => setDailyDesc(e.target.value)}
                  placeholder="گزارش وضعیت ایمنی، پیشرفت کار اکیپ پیمانکار و موارد نیازمند پیگیری..."
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
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
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
