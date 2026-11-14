/**
 * Shared Role-Scoped Navigation Hook
 * Single source of truth for Desktop Sidebar & Mobile Navigation (Bottom Dock + RTL Drawer)
 */

import React from 'react';
import {
  SquaresFour,
  FileText,
  PlusCircle,
  ClipboardText,
  CheckSquareOffset,
  Stack,
  SealCheck,
  ShoppingCartSimple,
  Tag,
  UsersThree,
  Buildings,
  Medal,
  CloudSlash,
  ClockCounterClockwise,
  ShieldCheck,
  Broadcast,
} from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';
import { ViewRoute } from '../../types';
import {
  canAccessRoute,
  ROLE_NAV_LABELS,
  filterReportsForRole,
  filterTasksForRole,
  filterPurchasesForRole,
  filterStatementsForRole,
} from '../../config/rolePermissions';
import {
  PERIODIC_DOMAINS,
  PeriodicDomainConfig,
  getUserPeriodicSpecialties,
  getPeriodicNavLabelForUser,
} from '../../data/periodicTestConfig';

export interface NavItemConfig {
  id: ViewRoute;
  label: string;
  mobileLabel: string;
  icon: React.ComponentType<{ className?: string; weight?: 'duotone' | 'bold' | 'regular' }>;
  accentClass: string;
  badge?: number;
  badgeColor?: string;
  periodicDomains?: PeriodicDomainConfig[];
}

const SHORT_MOBILE_LABELS: Record<ViewRoute, string> = {
  landing: 'صفحه اصلی',
  dashboard: 'میز کار',
  'report-new': 'ثبت کار',
  'periodic-tests': 'تست دوره‌ای',
  reports: 'گزارش‌ها',
  tasks: 'کارها',
  'extra-work': 'کار اضافی',
  statements: 'صورت‌وضعیت',
  purchases: 'خریدها',
  'price-items': 'فهرست بها',
  groups: 'گروه‌ها',
  contracts: 'قراردادها',
  technicians: 'پرسنل',
  'station-communications': 'پست‌ها',
  'offline-queue': 'صف آفلاین',
  'audit-logs': 'ممیزی',
  'architecture-security': 'پنل ادمین',
  settings: 'تنظیمات',
};

export function useRoleNavigation(): NavItemConfig[] {
  const {
    currentRole,
    currentUser,
    reports,
    tasks,
    purchases,
    statements,
    groups,
    syncQueue,
    stations,
  } = useApp();

  const scopedReports = filterReportsForRole(reports, currentUser, groups);
  const scopedTasks = filterTasksForRole(tasks, currentUser, groups);
  const scopedPurchases = filterPurchasesForRole(purchases, currentUser);
  const scopedStatements = filterStatementsForRole(statements, currentUser);

  const pendingReportsForUser = scopedReports.filter((r) => {
    if (r.reportType === 'daily_report') return false;
    if (currentRole === 'GROUP_SUPERVISOR') return r.status === 'supervisor_review';
    if (currentRole === 'EMPLOYER_EXPERT') return r.status === 'expert_review';
    if (currentRole === 'EMPLOYER_CEO') return r.status === 'employer_ceo_review';
    if (currentRole === 'DEPUTY') return r.status === 'approved';
    if (currentRole === 'TECHNICIAN') return r.status === 'redo_requested';
    return false;
  }).length;

  const pendingExtraWorkCount =
    currentRole === 'RESIDENT_REP'
      ? scopedReports.flatMap((r) => r.extraWorks).filter((ew) => ew.status === 'pending').length
      : 0;

  const pendingPurchasesCount =
    currentRole === 'RESIDENT_REP' || currentRole === 'CONTRACTOR_CEO'
      ? scopedPurchases.filter((p) => p.status === 'pending').length
      : 0;

  const pendingStatementsCount =
    currentRole === 'EMPLOYER_CEO'
      ? scopedStatements.filter((s) => s.status === 'employer_ceo_review' || s.status === 'pending').length
      : currentRole === 'EMPLOYER_MANAGER'
      ? scopedStatements.filter((s) => s.status === 'employer_manager_review').length
      : currentRole === 'DEPUTY'
      ? scopedStatements.filter((s) => s.status === 'deputy_review' || s.status === 'approved').length
      : 0;

  const openTasksCount = scopedTasks.filter((t) => t.status !== 'done' && t.status !== 'cancelled').length;
  const faultyStationsCount = stations.filter((s) => s.channels.some((c) => c.status === 'down')).length;

  const userPeriodicSpecialties = getUserPeriodicSpecialties(currentUser, groups);
  const periodicDomains = userPeriodicSpecialties.map((id) => PERIODIC_DOMAINS[id]);
  const periodicDynamicLabel = getPeriodicNavLabelForUser(currentRole, userPeriodicSpecialties);

  const customLabels = ROLE_NAV_LABELS[currentRole] || {};

  const navItems: Array<Omit<NavItemConfig, 'label' | 'mobileLabel'> & { defaultLabel: string }> = [
    {
      id: 'dashboard',
      defaultLabel: 'میز کار و آمار',
      icon: SquaresFour,
      accentClass: 'text-cyan-400',
    },
    {
      id: 'report-new',
      defaultLabel: 'ثبت گزارش کار',
      icon: PlusCircle,
      accentClass: 'text-amber-400',
    },
    {
      id: 'periodic-tests',
      defaultLabel: periodicDynamicLabel,
      icon: ClipboardText,
      accentClass: 'text-cyan-400',
      periodicDomains,
    },
    {
      id: 'reports',
      defaultLabel: 'گزارش‌های کار',
      icon: FileText,
      accentClass: 'text-sky-400',
      badge: pendingReportsForUser > 0 ? pendingReportsForUser : undefined,
      badgeColor:
        currentRole === 'TECHNICIAN'
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/35'
          : 'bg-amber-500/20 text-amber-300 border-amber-500/35',
    },
    {
      id: 'tasks',
      defaultLabel: 'کارهای محوله',
      icon: CheckSquareOffset,
      accentClass: 'text-indigo-400',
      badge: openTasksCount > 0 ? openTasksCount : undefined,
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/35',
    },
    {
      id: 'extra-work',
      defaultLabel: 'معادل‌سازی کار اضافی',
      icon: Stack,
      accentClass: 'text-purple-400',
      badge: pendingExtraWorkCount > 0 ? pendingExtraWorkCount : undefined,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/35',
    },
    {
      id: 'statements',
      defaultLabel: 'صورت‌وضعیت‌ها',
      icon: SealCheck,
      accentClass: 'text-emerald-400',
      badge: pendingStatementsCount > 0 ? pendingStatementsCount : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
    },
    {
      id: 'purchases',
      defaultLabel: 'درخواست‌های خرید',
      icon: ShoppingCartSimple,
      accentClass: 'text-teal-400',
      badge: pendingPurchasesCount > 0 ? pendingPurchasesCount : undefined,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/35',
    },
    {
      id: 'price-items',
      defaultLabel: 'فهرست آحاد بها',
      icon: Tag,
      accentClass: 'text-amber-400',
    },
    {
      id: 'groups',
      defaultLabel: 'گروه‌های کاری',
      icon: UsersThree,
      accentClass: 'text-sky-400',
    },
    {
      id: 'contracts',
      defaultLabel: 'شرکت‌ها و قراردادها',
      icon: Buildings,
      accentClass: 'text-indigo-400',
    },
    {
      id: 'technicians',
      defaultLabel: 'پرسنل و امتیازات',
      icon: Medal,
      accentClass: 'text-amber-400',
    },
    {
      id: 'station-communications',
      defaultLabel: 'ارتباطات پست‌ها',
      icon: Broadcast,
      accentClass: 'text-cyan-400',
      badge: faultyStationsCount > 0 ? faultyStationsCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/35',
    },
    {
      id: 'offline-queue',
      defaultLabel: 'صف آفلاین و Sync',
      icon: CloudSlash,
      accentClass: 'text-rose-400',
      badge: syncQueue.length > 0 ? syncQueue.length : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/35',
    },
    {
      id: 'audit-logs',
      defaultLabel: 'لاگ‌های ممیزی',
      icon: ClockCounterClockwise,
      accentClass: 'text-violet-400',
    },
    {
      id: 'architecture-security',
      defaultLabel: 'پنل ادمین و زیرساخت سامانه',
      icon: ShieldCheck,
      accentClass: 'text-emerald-400',
    },
  ];

  return navItems
    .filter((item) => canAccessRoute(currentRole, item.id))
    .map((item) => ({
      id: item.id,
      label: item.id === 'periodic-tests' ? item.defaultLabel : customLabels[item.id] || item.defaultLabel,
      mobileLabel: SHORT_MOBILE_LABELS[item.id] || item.defaultLabel,
      icon: item.icon,
      accentClass: item.accentClass,
      badge: item.badge,
      badgeColor: item.badgeColor,
      periodicDomains: item.periodicDomains,
    }));
}
