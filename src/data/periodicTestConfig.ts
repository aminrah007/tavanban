/**
 * Periodic Testing Configuration & Group Specialty Resolver
 * پیکربندی ساختار تست دوره‌ای ماهانه برای سه گروه:
 * ۱. مخابرات (۷ بخش فنی + ۴ زیربخش SDH/PDH)
 * ۲. تله‌متری (تست دوره‌ای RTU)
 * ۳. اسکادا (تست دوره‌ای اسکادا)
 */

import { Role, User, WorkGroup, WorkGroupSpecialty } from '../types';

export type PeriodicDomainId = 'telecom' | 'telemetry' | 'scada';

export interface PeriodicSubSection {
  id: string;
  title: string;
  description: string;
  sheetStatus: 'pending_spec' | 'ready';
}

export interface PeriodicSection {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  sheetStatus: 'pending_spec' | 'ready';
  subSections?: PeriodicSubSection[];
}

export interface PeriodicDomainConfig {
  id: PeriodicDomainId;
  title: string;
  sidebarTitle: string;
  groupTitle: string;
  cycleLabel: string;
  description: string;
  sections: PeriodicSection[];
}

export const PERIODIC_DOMAINS: Record<PeriodicDomainId, PeriodicDomainConfig> = {
  telecom: {
    id: 'telecom',
    title: 'تست دوره‌ای مخابرات',
    sidebarTitle: 'تست دوره‌ای مخابرات',
    groupTitle: 'گروه مخابرات',
    cycleLabel: 'ماهانه',
    description:
      'ثبت نتایج تست دوره‌ای ماهانه تجهیزات مخابراتی پست‌های برق در ۷ بخش تخصصی و ۴ زیرمجموعه SDH/PDH',
    sections: [
      {
        id: 'wireless',
        order: 1,
        title: '۱- بی‌سیم',
        shortTitle: 'بی‌سیم',
        description: 'تست شیت نگهداری و اندازه‌گیری سیستم رادیویی VHF (فرستنده/تکرارکننده، آنتن، دکل و منبع تغذیه)',
        sheetStatus: 'ready',
      },
      {
        id: 'plc',
        order: 2,
        title: '۲- پی ال سی (PLC)',
        shortTitle: 'پی ال سی',
        description: 'تست دوره‌ای تجهیزات مخابرات روی خط قدرت (PLC)',
        sheetStatus: 'pending_spec',
      },
      {
        id: 'fiber-passive',
        order: 3,
        title: '۳- پسیو فیبر نوری',
        shortTitle: 'پسیو فیبر نوری',
        description: 'گزارش بازدید دوره‌ای اکتیو و پسیو نوری (چند مسیره + OTDR و تصاویر)',
        sheetStatus: 'ready',
      },
      {
        id: 'switch',
        order: 4,
        title: '۴- سوییچ',
        shortTitle: 'سوییچ',
        description: 'تست دوره‌ای سوییچ‌های شبکه صنعتی و مخابراتی',
        sheetStatus: 'pending_spec',
      },
      {
        id: 'voice-recorder',
        order: 5,
        title: '۵- ضبط مکالمات',
        shortTitle: 'ضبط مکالمات',
        description: 'تست دوره‌ای سیستم‌های ضبط مکالمات دیسپاچینگ و پست',
        sheetStatus: 'pending_spec',
      },
      {
        id: 'pbx',
        order: 6,
        title: '۶- مرکز تلفن',
        shortTitle: 'مرکز تلفن',
        description: 'تست دوره‌ای مراکز تلفن، سانترال و خطوط IP Phone',
        sheetStatus: 'pending_spec',
      },
      {
        id: 'sdh-pdh',
        order: 7,
        title: '۷- SDH / PDH',
        shortTitle: 'SDH / PDH',
        description: 'تست دوره‌ای تجهیزات انتقال نوری در ۴ سامانه مجزا',
        sheetStatus: 'pending_spec',
        subSections: [
          {
            id: 'sdh-fiberhome',
            title: 'فایبرهوم (FiberHome)',
            description: 'تست‌شیت دوره‌ای تجهیزات SDH/PDH برند فایبرهوم',
            sheetStatus: 'pending_spec',
          },
          {
            id: 'sdh-digital',
            title: 'دیجیتل',
            description: 'تست‌شیت دوره‌ای تجهیزات SDH/PDH دیجیتل',
            sheetStatus: 'pending_spec',
          },
          {
            id: 'sdh-loop',
            title: 'لوپ (Loop)',
            description: 'تست‌شیت دوره‌ای تجهیزات PDH/SDH برند لوپ',
            sheetStatus: 'pending_spec',
          },
          {
            id: 'sdh-fatech',
            title: 'فاتک (Fatech)',
            description: 'تست‌شیت دوره‌ای تجهیزات SDH/PDH برند فاتک',
            sheetStatus: 'pending_spec',
          },
        ],
      },
    ],
  },
  telemetry: {
    id: 'telemetry',
    title: 'تست دوره‌ای تله‌متری (RTU)',
    sidebarTitle: 'تست دوره‌ای تله‌متری',
    groupTitle: 'گروه تله‌متری',
    cycleLabel: 'ماهانه',
    description: 'ثبت نتایج تست دوره‌ای ماهانه واحدهای پایانه راه دور (RTU) در پست‌های برق',
    sections: [
      {
        id: 'rtu',
        order: 1,
        title: 'تست دوره‌ای RTU',
        shortTitle: 'تست RTU',
        description: 'چک‌لیست و نتایج ماهانه واحدهای تله‌متری و RTU پست',
        sheetStatus: 'pending_spec',
      },
    ],
  },
  scada: {
    id: 'scada',
    title: 'تست دوره‌ای اسکادا',
    sidebarTitle: 'تست دوره‌ای اسکادا',
    groupTitle: 'گروه اسکادا',
    cycleLabel: 'ماهانه',
    description: 'ثبت نتایج تست دوره‌ای ماهانه سیستم‌های اسکادا و پایش مرکز کنترل',
    sections: [
      {
        id: 'scada-main',
        order: 1,
        title: 'تست دوره‌ای اسکادا',
        shortTitle: 'تست اسکادا',
        description: 'چک‌لیست و نتایج ماهانه سیستم اسکادا (SCADA)',
        sheetStatus: 'pending_spec',
      },
    ],
  },
};

export const ALL_PERIODIC_DOMAIN_IDS: PeriodicDomainId[] = ['telecom', 'telemetry', 'scada'];

export function getSpecialtyPersianLabel(specialty?: WorkGroupSpecialty): string {
  switch (specialty) {
    case 'telecom':
      return 'مخابرات (۷ بخش تست دوره‌ای)';
    case 'telemetry':
      return 'تله‌متری (تست دوره‌ای RTU)';
    case 'scada':
      return 'اسکادا (تست دوره‌ای SCADA)';
    default:
      return 'عمومی / سایر';
  }
}

export function resolveGroupSpecialty(group: Pick<WorkGroup, 'name' | 'specialty'>): WorkGroupSpecialty {
  if (
    group.specialty === 'telecom' ||
    group.specialty === 'telemetry' ||
    group.specialty === 'scada' ||
    group.specialty === 'general'
  ) {
    return group.specialty;
  }

  const normalized = group.name.toLowerCase();
  if (normalized.includes('مخابرات')) return 'telecom';
  if (normalized.includes('تله') || normalized.includes('rtu')) return 'telemetry';
  if (normalized.includes('اسکادا') || normalized.includes('scada')) return 'scada';
  return 'general';
}

export function getUserPeriodicSpecialties(
  user: User,
  groups: WorkGroup[]
): PeriodicDomainId[] {
  const isFieldScoped = user.role === 'TECHNICIAN' || user.role === 'GROUP_SUPERVISOR';
  if (!isFieldScoped) {
    return ALL_PERIODIC_DOMAIN_IDS;
  }

  const userGroups = groups.filter(
    (g) =>
      g.isActive &&
      (user.groupIds?.includes(g._id) ||
        g.memberIds.includes(user._id) ||
        g.supervisorUserId === user._id)
  );

  const detected = new Set<PeriodicDomainId>();
  for (const grp of userGroups) {
    const sp = resolveGroupSpecialty(grp);
    if (sp === 'telecom' || sp === 'telemetry' || sp === 'scada') {
      detected.add(sp);
    }
  }

  return Array.from(detected);
}

export function getPeriodicNavLabelForUser(role: Role, specialties: PeriodicDomainId[]): string {
  if (role === 'TECHNICIAN' || role === 'GROUP_SUPERVISOR') {
    if (specialties.length === 1) {
      return PERIODIC_DOMAINS[specialties[0]].sidebarTitle;
    }
    if (specialties.length > 1) {
      return 'تست دوره‌ای بخش‌ها';
    }
    return 'تست دوره‌ای';
  }
  return 'تست‌های دوره‌ای سامانه';
}

export const JALALI_MONTH_OPTIONS = [
  'فروردین ۱۴۰۴',
  'اردیبهشت ۱۴۰۴',
  'خرداد ۱۴۰۴',
  'تیر ۱۴۰۴',
  'مرداد ۱۴۰۴',
  'شهریور ۱۴۰۴',
  'مهر ۱۴۰۴',
  'آبان ۱۴۰۴',
  'آذر ۱۴۰۴',
  'دی ۱۴۰۴',
  'بهمن ۱۴۰۴',
  'اسفند ۱۴۰۴',
];
