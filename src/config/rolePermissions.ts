/**
 * Role Permissions, Domain Scoping & Navigation Configuration
 * Strictly derived from SYSTEM_DOCUMENTATION_diff_b8adb869.md
 */

import {
  Role,
  User,
  ViewRoute,
  WorkReport,
  ReportStatus,
  Task,
  PurchaseRequest,
  Statement,
  WorkGroup,
  PriceItem,
  AuditLog,
  ScoreEvent,
  Notification,
} from '../types';

export const ROLE_ALLOWED_ROUTES: Record<Role, ViewRoute[]> = {
  DEPUTY: [
    'dashboard',
    'contracts',
    'reports',
    'periodic-tests',
    'statements',
    'station-communications',
    'technicians',
    'audit-logs',
    'architecture-security',
  ],
  EMPLOYER_MANAGER: [
    'dashboard',
    'statements',
    'reports',
    'periodic-tests',
    'tasks',
    'groups',
    'contracts',
    'station-communications',
    'audit-logs',
  ],
  EMPLOYER_CEO: [
    'dashboard',
    'reports',
    'periodic-tests',
    'statements',
    'groups',
    'tasks',
    'station-communications',
    'audit-logs',
  ],
  EMPLOYER_EXPERT: [
    'dashboard',
    'reports',
    'periodic-tests',
    'tasks',
    'station-communications',
    'audit-logs',
  ],
  CONTRACTOR_CEO: [
    'dashboard',
    'technicians',
    'groups',
    'price-items',
    'reports',
    'periodic-tests',
    'statements',
    'purchases',
    'tasks',
    'station-communications',
    'audit-logs',
  ],
  RESIDENT_REP: [
    'dashboard',
    'extra-work',
    'purchases',
    'price-items',
    'reports',
    'station-communications',
    'audit-logs',
  ],
  GROUP_SUPERVISOR: [
    'dashboard',
    'reports',
    'report-new',
    'periodic-tests',
    'tasks',
    'groups',
    'purchases',
    'price-items',
    'technicians',
    'station-communications',
    'offline-queue',
  ],
  TECHNICIAN: [
    'dashboard',
    'report-new',
    'periodic-tests',
    'reports',
    'tasks',
    'technicians',
    'purchases',
    'price-items',
    'station-communications',
    'offline-queue',
  ],
};

export function canAccessRoute(role: Role, route: ViewRoute): boolean {
  if (route === 'landing') return true;
  return ROLE_ALLOWED_ROUTES[role]?.includes(route) ?? false;
}

export const ROLE_NAV_LABELS: Record<Role, Partial<Record<ViewRoute, string>>> = {
  DEPUTY: {
    dashboard: 'میز کار و پایش کل سازمان',
    contracts: 'شرکت‌ها، قراردادها و واحدها',
    reports: 'مشاهده و تسویه گزارش‌ها',
    statements: 'تایید و پرداخت صورت‌وضعیت‌ها',
    'station-communications': 'پایش ارتباطات پست‌ها',
    technicians: 'کاربران کارفرمایی و امتیازات',
    'audit-logs': 'دفتر لاگ‌های ممیزی کل',
    'architecture-security': 'پنل ادمین و زیرساخت سامانه',
  },
  EMPLOYER_MANAGER: {
    dashboard: 'میز کار مدیر کارفرما',
    statements: 'تایید صورت‌وضعیت‌ها (مرحله ۲)',
    reports: 'نظارت بر گزارش‌ها (خواندنی)',
    tasks: 'ارجاع و پایش کارهای کارفرما',
    groups: 'نظارت بر گروه‌های واحد',
    contracts: 'مشاهده شرکت‌ها و قراردادها',
    'station-communications': 'پایش ارتباطات پست‌ها',
    'audit-logs': 'رویدادها و ممیزی سازمان',
  },
  EMPLOYER_CEO: {
    dashboard: 'میز کار واحد کارفرما',
    reports: 'تایید نهایی گزارش‌ها و گزارش روزانه',
    statements: 'تایید صورت‌وضعیت‌ها (مرحله ۱)',
    groups: 'گروه‌های تحت پوشش واحد',
    tasks: 'مدیریت کارهای محوله واحد',
    'station-communications': 'ارتباطات پست‌های واحد',
    'audit-logs': 'رویدادها و فعالیت‌های واحد',
  },
  EMPLOYER_EXPERT: {
    dashboard: 'میز کار ناظر فنی کارفرما',
    reports: 'بررسی گزارش‌ها و گزارش روزانه',
    tasks: 'کارهای محوله گروه‌های مجاز',
    'station-communications': 'ارتباطات پست‌های برق',
    'audit-logs': 'فعالیت‌های گروه‌های مجاز',
  },
  CONTRACTOR_CEO: {
    dashboard: 'میز کار مدیریت پیمانکار',
    technicians: 'مدیریت نیروهای شرکت',
    groups: 'مدیریت گروه‌های شرکت',
    'price-items': 'مدیریت فهرست آحاد بها',
    reports: 'گزارش‌های کار شرکت (خواندنی)',
    statements: 'صدور و پیگیری صورت‌وضعیت‌ها',
    purchases: 'بررسی درخواست‌های خرید',
    tasks: 'کارهای محوله شرکت',
    'station-communications': 'ارتباطات پست‌های برق',
    'audit-logs': 'فعالیت‌ها و رویدادهای شرکت',
  },
  RESIDENT_REP: {
    dashboard: 'میز کار نماینده مقیم',
    'extra-work': 'معادل‌سازی کارهای اضافی',
    purchases: 'مدیریت و پرداخت خریدها',
    'price-items': 'مرجع فهرست آحاد بها',
    reports: 'گزارش‌های مرتبط شرکت',
    'station-communications': 'ارتباطات پست‌های برق',
    'audit-logs': 'فعالیت‌های شرکت',
  },
  GROUP_SUPERVISOR: {
    dashboard: 'میز کار سرپرست گروه',
    reports: 'تایید گزارش‌های گروه (مرحله ۱)',
    'report-new': 'ثبت گزارش کار (خود یا نیرو)',
    tasks: 'کارهای گروه و ارجاع به اعضا',
    groups: 'گروه من و وضعیت اعضا',
    purchases: 'درخواست‌های خرید گروه',
    'price-items': 'آیتم‌های فهرست بهای گروه',
    technicians: 'امتیاز و عملکرد اعضای گروه',
    'station-communications': 'ارتباطات پست‌ها',
    'offline-queue': 'صف همگام‌سازی آفلاین',
  },
  TECHNICIAN: {
    dashboard: 'میز کار تکنسین میدانی',
    'report-new': 'ثبت گزارش کار جدید',
    reports: 'گزارش‌های کار من',
    tasks: 'کارهای محوله من',
    technicians: 'امتیازها و رزومه من',
    purchases: 'درخواست‌های خرید من',
    'price-items': 'فهرست آحاد بهای مجاز',
    'station-communications': 'ارتباطات پست‌ها',
    'offline-queue': 'همگام‌سازی آفلاین',
  },
};

export interface RoleWorkspaceMeta {
  badge: string;
  headline: string;
  scopeLabel: string;
  summary: string;
}

export const ROLE_WORKSPACE_META: Record<Role, RoleWorkspaceMeta> = {
  DEPUTY: {
    badge: 'حاکمیت کل سازمان · معاونت بهره‌برداری',
    headline: 'داشبورد راهبری کل شبکه، قراردادها و تسویه مالی',
    scopeLabel: 'دسترسی جامع سازمانی (All Units & Contractors)',
    summary:
      'مدیریت شرکت‌های پیمانکار، قراردادها، واحدهای نظارتی، تایید و پرداخت صورت‌وضعیت‌ها، تسویه قطعی گزارش‌ها و بازبینی لاگ ممیزی.',
  },
  EMPLOYER_MANAGER: {
    badge: 'حوزه کارفرما · مدیر کارفرما (نظارت و تایید صورت‌وضعیت)',
    headline: 'کارتابل نظارت کلان، ارجاع کار به واحد کارفرما و تایید مرحله دوم صورت‌وضعیت',
    scopeLabel: 'دامنه: نظارت خواندنی بر گزارش‌های کار پیمانکار + تایید صورت‌وضعیت پس از رییس کارفرما',
    summary:
      'رصد عملکرد پیمانکاران و گزارش‌های روزانه ناظران (بدون دخالت در تایید گزارش کار)، ارجاع کار به رییس و کارشناسان کارفرما و بررسی و تایید صورت‌وضعیت‌ها پیش از ارسال به معاونت.',
  },
  EMPLOYER_CEO: {
    badge: 'واحد کارفرما · تایید نهایی گزارش و مرحله ۱ صورت‌وضعیت',
    headline: 'کارتابل تایید نهایی گزارش‌ها و راهبری واحد',
    scopeLabel: 'دامنه: واحد نظارتی زیرمجموعه و گروه‌های مرتبط',
    summary:
      'تصمیم‌گیری نهایی درباره گزارش‌های تاییدشده کارشناسان (ارجاع مستقیم به معاونت)، تایید مرحله اول صورت‌وضعیت‌ها پیش از مدیر کارفرما، مدیریت کارهای محوله واحد و بررسی گزارش روزانه.',
  },
  EMPLOYER_EXPERT: {
    badge: 'ناظر مقیم کارفرما · تایید مرحله دوم',
    headline: 'کارتابل تطبیق فنی گزارش‌ها و ثبت گزارش روزانه',
    scopeLabel: 'دامنه: گروه‌های عملیاتی مجاز و مأموریت‌های محول‌شده',
    summary:
      'بررسی تخصصی گزارش‌های تاییدشده توسط سرپرست گروه، ارجاع یا ثبت کارهای محوله و ارسال گزارش روزانه نظارتی به رییس کارفرما.',
  },
  CONTRACTOR_CEO: {
    badge: 'مدیریت شرکت پیمانکار · صورت‌وضعیت و نرخ‌گذاری',
    headline: 'پنل جامع مدیریت نیروها، فهرست بها و صدور صورت‌وضعیت',
    scopeLabel: 'دامنه: شرکت پیمانکار متبوع، گروه‌ها و پرسنل شرکت',
    summary:
      'مدیریت ساختار گروه‌ها و پرسنل شرکت، به‌روزرسانی نرخ‌های فهرست بها، صدور صورت‌وضعیت و تایید درخواست‌های خرید.',
  },
  RESIDENT_REP: {
    badge: 'نماینده مقیم پیمانکار · معادل‌سازی و خرید',
    headline: 'کارتابل معادل‌سازی کارهای اضافی و تدارکات خرید',
    scopeLabel: 'دامنه: کارهای خارج از فهرست و درخواست‌های خرید شرکت',
    summary:
      'ارزش‌گذاری و تطبیق کارهای اضافی ثبت‌شده توسط تکنسین‌ها با ردیف‌های مصوب فهرست بها و بررسی، تایید و ثبت پرداخت خرید تجهیزات.',
  },
  GROUP_SUPERVISOR: {
    badge: 'سرپرست گروه عملیاتی · تایید مرحله اول',
    headline: 'کارتابل نظارت تیم، تایید گزارش‌های اکیپ و ثبت کار میدانی',
    scopeLabel: 'دامنه: گروه‌های تحت سرپرستی و اعضای تخصیص‌یافته',
    summary:
      'کنترل اولیه گزارش‌های اعضای گروه، سپردن مأموریت به تکنسین‌ها و ثبت گزارش کار شخصی یا به نام اعضای تیم (ارسال مستقیم به کارشناس کارفرما).',
  },
  TECHNICIAN: {
    badge: 'کارشناس فنی میدانی · ثبت عملیات و حالت آفلاین',
    headline: 'میز کار اجرایی پست‌ها، گزارش‌دهی و مأموریت‌های محوله',
    scopeLabel: 'دامنه: مأموریت‌های ارجاع‌شده و گزارش‌های شخصی در گروه‌های عضو',
    summary:
      'ثبت سریع گزارش کار در محل پست‌های انتقال با قابلیت صف آفلاین، اجرای کارهای محوله، ثبت درخواست خرید قطعات و پیگیری امتیازات فنی.',
  },
};

// Capability Checks per SYSTEM_DOCUMENTATION_diff_b8adb869.md
export const canCreateWorkReport = (role: Role) =>
  role === 'TECHNICIAN' || role === 'GROUP_SUPERVISOR';

export const canCreateDailyReport = (role: Role) => role === 'EMPLOYER_EXPERT';

export const canViewDailyReports = (role: Role) =>
  role === 'EMPLOYER_EXPERT' || role === 'EMPLOYER_CEO' || role === 'EMPLOYER_MANAGER' || role === 'DEPUTY';

export const canApproveReportAtStatus = (role: Role, status: ReportStatus): boolean => {
  if (status === 'supervisor_review') return role === 'GROUP_SUPERVISOR';
  if (status === 'expert_review') return role === 'EMPLOYER_EXPERT';
  if (status === 'employer_ceo_review') return role === 'EMPLOYER_CEO';
  return false;
};

export const canSettleReport = (role: Role, status: ReportStatus): boolean =>
  role === 'DEPUTY' && status === 'approved';

export const canResubmitReport = (
  role: Role,
  status: ReportStatus,
  reportUserId: string,
  currentUserId: string
): boolean => role === 'TECHNICIAN' && status === 'redo_requested' && reportUserId === currentUserId;

export const canCreateTask = (role: Role) =>
  ['EMPLOYER_MANAGER', 'EMPLOYER_CEO', 'EMPLOYER_EXPERT', 'GROUP_SUPERVISOR', 'CONTRACTOR_CEO'].includes(role);

export const canUpdateTaskStatus = (role: Role) =>
  ['TECHNICIAN', 'GROUP_SUPERVISOR', 'EMPLOYER_EXPERT', 'EMPLOYER_CEO', 'EMPLOYER_MANAGER', 'CONTRACTOR_CEO'].includes(
    role
  );

export const canMapExtraWork = (role: Role) => role === 'RESIDENT_REP';

export const canCreateStatement = (role: Role) => role === 'CONTRACTOR_CEO';

export const canReviewStatement = (role: Role) =>
  ['EMPLOYER_CEO', 'EMPLOYER_MANAGER', 'DEPUTY'].includes(role);

export const canApproveStatementAtStatus = (
  role: Role,
  status: Statement['status']
): boolean => {
  if (status === 'employer_ceo_review' || status === 'pending') return role === 'EMPLOYER_CEO';
  if (status === 'employer_manager_review') return role === 'EMPLOYER_MANAGER';
  if (status === 'deputy_review') return role === 'DEPUTY';
  return false;
};

export const canPayStatement = (role: Role, status: Statement['status']): boolean =>
  role === 'DEPUTY' && status === 'approved';

export const canCreatePurchase = (role: Role) =>
  ['TECHNICIAN', 'GROUP_SUPERVISOR', 'RESIDENT_REP'].includes(role);

export const canApprovePurchase = (role: Role) =>
  ['RESIDENT_REP', 'CONTRACTOR_CEO'].includes(role);

export const canPayPurchase = (role: Role) => role === 'RESIDENT_REP';

export const canManagePriceItems = (role: Role) => role === 'CONTRACTOR_CEO';

export const canManageCompanyGroups = (role: Role) => role === 'CONTRACTOR_CEO';

export const canAssignEmployerObserver = (role: Role) => role === 'EMPLOYER_CEO';

export const canManageContractsAndCompanies = (role: Role) => role === 'DEPUTY';

export const canManagePersonnel = (role: Role) =>
  role === 'CONTRACTOR_CEO' || role === 'DEPUTY';

export const canEditStationChannel = (role: Role) =>
  ['TECHNICIAN', 'GROUP_SUPERVISOR', 'EMPLOYER_EXPERT', 'DEPUTY'].includes(role);

// Domain Scoping Filter Functions (Row-Level Security)
export function filterGroupsForRole(groups: WorkGroup[], user: User): WorkGroup[] {
  switch (user.role) {
    case 'DEPUTY':
    case 'EMPLOYER_MANAGER':
      return groups;
    case 'EMPLOYER_CEO':
      return groups.filter((g) => !user.unitId || g.unitId === user.unitId);
    case 'EMPLOYER_EXPERT':
    case 'GROUP_SUPERVISOR':
    case 'TECHNICIAN':
      return groups.filter((g) => (user.groupIds ? user.groupIds.includes(g._id) : false));
    case 'CONTRACTOR_CEO':
    case 'RESIDENT_REP':
      return groups.filter((g) => !user.companyId || g.companyId === user.companyId);
    default:
      return [];
  }
}

export function filterReportsForRole(
  reports: WorkReport[],
  user: User,
  groups: WorkGroup[]
): WorkReport[] {
  const unitGroupIds = groups
    .filter((g) => !user.unitId || g.unitId === user.unitId)
    .map((g) => g._id);

  switch (user.role) {
    case 'DEPUTY':
    case 'EMPLOYER_MANAGER':
      return reports;
    case 'EMPLOYER_CEO':
      return reports.filter(
        (r) =>
          r.unitId === user.unitId ||
          (r.groupId && unitGroupIds.includes(r.groupId)) ||
          r.reportType === 'daily_report'
      );
    case 'EMPLOYER_EXPERT':
      return reports.filter((r) => {
        if (r.reportType === 'daily_report') return r.userId === user._id;
        return r.groupId ? user.groupIds?.includes(r.groupId) ?? false : false;
      });
    case 'CONTRACTOR_CEO':
    case 'RESIDENT_REP':
      return reports.filter(
        (r) => r.reportType === 'work_report' && (!user.companyId || r.companyId === user.companyId)
      );
    case 'GROUP_SUPERVISOR':
      return reports.filter(
        (r) =>
          r.reportType === 'work_report' &&
          (r.userId === user._id || (r.groupId ? user.groupIds?.includes(r.groupId) ?? false : false))
      );
    case 'TECHNICIAN':
      return reports.filter((r) => r.reportType === 'work_report' && r.userId === user._id);
    default:
      return [];
  }
}

export function filterTasksForRole(
  tasks: Task[],
  user: User,
  groups: WorkGroup[]
): Task[] {
  const scopedGroupIds = filterGroupsForRole(groups, user).map((g) => g._id);
  switch (user.role) {
    case 'DEPUTY':
    case 'EMPLOYER_MANAGER':
      return tasks;
    case 'EMPLOYER_CEO':
    case 'EMPLOYER_EXPERT':
    case 'CONTRACTOR_CEO':
    case 'GROUP_SUPERVISOR':
      return tasks.filter(
        (t) =>
          t.createdByUserId === user._id ||
          t.assignedUserIds.includes(user._id) ||
          t.assignedGroupIds.some((gid) => scopedGroupIds.includes(gid))
      );
    case 'TECHNICIAN':
      return tasks.filter(
        (t) =>
          t.assignedUserIds.includes(user._id) ||
          t.assignedGroupIds.some((gid) => user.groupIds?.includes(gid))
      );
    default:
      return [];
  }
}

export function filterPurchasesForRole(
  purchases: PurchaseRequest[],
  user: User
): PurchaseRequest[] {
  switch (user.role) {
    case 'DEPUTY':
      return purchases;
    case 'RESIDENT_REP':
    case 'CONTRACTOR_CEO':
      return purchases.filter((p) => !user.companyId || p.companyId === user.companyId);
    case 'GROUP_SUPERVISOR':
      return purchases.filter(
        (p) =>
          p.requestedByUserId === user._id ||
          (p.groupId ? user.groupIds?.includes(p.groupId) ?? false : false)
      );
    case 'TECHNICIAN':
      return purchases.filter((p) => p.requestedByUserId === user._id);
    default:
      return [];
  }
}

export function filterStatementsForRole(statements: Statement[], user: User): Statement[] {
  if (user.role === 'DEPUTY' || user.role === 'EMPLOYER_CEO' || user.role === 'EMPLOYER_MANAGER') {
    return statements;
  }
  if (user.role === 'CONTRACTOR_CEO') {
    return statements.filter((s) => !user.companyId || s.contractorCompanyId === user.companyId);
  }
  return [];
}

export function filterPriceItemsForRole(priceItems: PriceItem[], user: User): PriceItem[] {
  if (['DEPUTY', 'CONTRACTOR_CEO', 'RESIDENT_REP'].includes(user.role)) {
    return priceItems;
  }
  if (['TECHNICIAN', 'GROUP_SUPERVISOR'].includes(user.role)) {
    return priceItems.filter((pi) =>
      pi.groupIds.some((gid) => user.groupIds?.includes(gid))
    );
  }
  return priceItems;
}

export function filterUsersForRole(
  users: User[],
  currentUser: User,
  groups: WorkGroup[]
): User[] {
  switch (currentUser.role) {
    case 'DEPUTY':
      return users;
    case 'CONTRACTOR_CEO':
      return users.filter(
        (u) =>
          (!currentUser.companyId || u.companyId === currentUser.companyId) &&
          ['TECHNICIAN', 'GROUP_SUPERVISOR', 'RESIDENT_REP', 'CONTRACTOR_CEO'].includes(u.role)
      );
    case 'GROUP_SUPERVISOR': {
      const supervisedMemberIds = new Set(
        groups
          .filter((g) => currentUser.groupIds?.includes(g._id))
          .flatMap((g) => g.memberIds)
      );
      return users.filter((u) => supervisedMemberIds.has(u._id));
    }
    case 'TECHNICIAN':
      return users.filter((u) => u._id === currentUser._id);
    default:
      return [];
  }
}

export function filterScoresForRole(
  scores: ScoreEvent[],
  currentUser: User,
  users: User[],
  groups: WorkGroup[]
): ScoreEvent[] {
  if (currentUser.role === 'DEPUTY') return scores;
  if (currentUser.role === 'TECHNICIAN') {
    return scores.filter((s) => s.userId === currentUser._id);
  }
  const visibleUserIds = new Set(filterUsersForRole(users, currentUser, groups).map((u) => u._id));
  return scores.filter((s) => visibleUserIds.has(s.userId));
}

export function filterAuditLogsForRole(
  logs: AuditLog[],
  currentUser: User,
  users: User[]
): AuditLog[] {
  switch (currentUser.role) {
    case 'DEPUTY':
    case 'EMPLOYER_MANAGER':
      return logs;
    case 'EMPLOYER_CEO': {
      const unitUserIds = new Set(
        users
          .filter((u) => u.organizationId === 'org-1' && (!currentUser.unitId || u.unitId === currentUser.unitId))
          .map((u) => u._id)
      );
      return logs.filter(
        (l) => unitUserIds.has(l.actorUserId) || l.resourceType === 'WorkReport' || l.resourceType === 'Task' || l.resourceType === 'Statement'
      );
    }
    case 'EMPLOYER_EXPERT': {
      const relatedUserIds = new Set(
        users
          .filter(
            (u) =>
              u._id === currentUser._id ||
              (u.groupIds && u.groupIds.some((gid) => currentUser.groupIds?.includes(gid)))
          )
          .map((u) => u._id)
      );
      return logs.filter((l) => relatedUserIds.has(l.actorUserId));
    }
    case 'CONTRACTOR_CEO':
    case 'RESIDENT_REP': {
      const companyUserIds = new Set(
        users
          .filter((u) => !currentUser.companyId || u.companyId === currentUser.companyId)
          .map((u) => u._id)
      );
      return logs.filter((l) => companyUserIds.has(l.actorUserId));
    }
    default:
      return [];
  }
}

export function filterNotificationsForRole(
  notifications: Notification[],
  currentUser: User
): Notification[] {
  if (currentUser.role === 'DEPUTY') return notifications;
  return notifications.filter((n) => n.userId === currentUser._id);
}
