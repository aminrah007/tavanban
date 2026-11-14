/**
 * Core Types for TavanBan (توان‌بان) Management System
 * Defines 8 Roles, 22 Database Models, and Enterprise Architecture States
 */

export type Role =
  | 'DEPUTY'             // معاونت بهره‌برداری برق منطقه‌ای
  | 'EMPLOYER_MANAGER'   // مدیر کارفرما (نظارت و تایید صورت‌وضعیت پس از رییس کارفرما)
  | 'EMPLOYER_CEO'       // رییس کارفرما
  | 'EMPLOYER_EXPERT'    // کارشناس کارفرما (ناظر مقیم کارفرما)
  | 'CONTRACTOR_CEO'     // رییس شرکت پیمانکار
  | 'RESIDENT_REP'       // نماینده مقیم (معادل‌ساز و خرید)
  | 'GROUP_SUPERVISOR'   // سرپرست گروه
  | 'TECHNICIAN';        // کارشناس شرکت پیمانکار (تکنسین فنی)

export type ReportStatus =
  | 'draft'               // پیش‌نویس
  | 'submitted'           // ارسال‌شده
  | 'supervisor_review'   // در انتظار تایید سرپرست
  | 'expert_review'       // در انتظار تایید کارشناس کارفرما
  | 'employer_ceo_review' // در انتظار تایید نهایی رییس کارفرما
  | 'approved'            // تایید نهایی شده
  | 'rejected'            // رد شده
  | 'redo_requested'      // نیاز به اصلاح / انجام مجدد
  | 'disputed'            // دارای اختلاف
  | 'settled';            // تسویه مالی شده توسط معاونت

export interface User {
  _id: string;
  fullName: string;
  mobile: string;
  hashedMobile: string;
  encryptedMobile: string;
  role: Role;
  organizationId: string;
  companyId?: string;
  unitId?: string;
  groupIds?: string[];
  isActive: boolean;
  score?: number;
  lastLoginAt?: string;
  loginCount: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  _id: string;
  name: string;
  type: 'deputy' | 'employer' | 'contractor';
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  _id: string;
  name: string;
  code: string;
  organizationId: string;
  contractorCeoUserId?: string;
  phone?: string;
  address?: string;
  description?: string;
  isActive: boolean;
  activeContractsCount?: number;
  totalPersonnelCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  _id: string;
  title: string;
  contractNumber: string;
  employerCompanyId: string;
  contractorCompanyId: string;
  startDateJalali: string;
  endDateJalali: string;
  description?: string;
  totalAmount: number; // Rial
  type: 'حجمی' | 'فهرست بهایی' | 'تعمیر و نگهداری' | 'بهره‌برداری پست';
  status: 'active' | 'completed' | 'terminated';
  organizationId: string;
  unitId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkUnit {
  _id: string;
  name: string;
  organizationId: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type WorkGroupSpecialty = 'telecom' | 'telemetry' | 'scada' | 'general';

export interface WorkGroup {
  _id: string;
  name: string;
  description?: string;
  specialty?: WorkGroupSpecialty;
  companyId: string;
  contractId: string;
  organizationId: string;
  supervisorUserId?: string;
  observerUserIds?: string[];
  unitId?: string;
  memberIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMembership {
  _id: string;
  groupId: string;
  userId: string;
  membershipType: 'supervisor' | 'member' | 'employer_ceo' | 'employer_expert';
  joinedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceItem {
  _id: string;
  code: string;
  title: string;
  unit: string;
  unitPrice: number; // Rial
  contractId: string;
  groupIds: string[];
  isActive: boolean;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export type ThemeMode = 'dark' | 'light';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  createdByUserId: string;
  createdByName?: string;
  assignedUserIds: string[];
  assignedGroupIds: string[];
  contractId?: string;
  groupId?: string;
  stationId?: string;
  stationName?: string;
  dispatchCode?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDateJalali?: string;
  status: 'open' | 'in_progress' | 'done' | 'cancelled';
  completedAt?: string;
  sourceRole: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportItem {
  _id: string;
  reportId: string;
  priceItemId: string;
  titleSnapshot: string;
  unitSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'edited' | 'redo';
  createdAt: string;
  updatedAt: string;
}

export interface ExtraWorkItem {
  _id: string;
  reportId: string;
  description: string;
  status: 'pending' | 'mapped' | 'rejected';
  mappedPriceItemId?: string;
  mappedQuantity?: number;
  mappedAmount?: number;
  mappedByUserId?: string;
  mappedByName?: string;
  mappingNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  _id: string;
  reportId?: string;
  taskId?: string;
  purchaseId?: string;
  kind: 'image' | 'video' | 'file';
  fileName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  dataUrl?: string;
  uploadStatus: 'local' | 'uploading' | 'uploaded' | 'failed';
  createdAt: string;
}

export interface ApprovalEvent {
  _id: string;
  reportId: string;
  actorUserId: string;
  actorName: string;
  actorRole: Role;
  action: 'submit' | 'resubmit' | 'approve' | 'reject' | 'redo' | 'dispute' | 'settle';
  fromStatus: ReportStatus;
  toStatus: ReportStatus;
  reason?: string;
  createdAt: string;
}

export interface WorkReport {
  _id: string;
  reportType: 'work_report' | 'daily_report';
  userId: string;
  userName: string;
  companyId: string;
  companyName?: string;
  groupId?: string;
  groupName?: string;
  contractId: string;
  contractTitle?: string;
  unitId?: string;
  unitName?: string;
  stationId?: string;
  stationName?: string;
  dispatchCode?: string;
  reportDateJalali: string;
  status: ReportStatus;
  description?: string;
  taskReferenceId?: string;
  offlineClientId?: string;
  idempotencyKey: string;
  submittedAt?: string;
  currentReviewerRole?: string;
  totalAmount: number; // Rial
  itemCount: number;
  organizationId: string;
  items: ReportItem[];
  extraWorks: ExtraWorkItem[];
  attachments: Attachment[];
  events: ApprovalEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  actorUserId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'normal' | 'high';
  isRead: boolean;
  readAt?: string;
  entity?: 'report' | 'task' | 'statement' | 'purchase' | 'extra' | null;
  entityId?: string;
  createdAt: string;
}

export interface PurchaseRequest {
  _id: string;
  title: string;
  description?: string;
  amount: number; // Rial
  supplierCompanyId?: string;
  requestedByUserId: string;
  requestedByName: string;
  approvedByUserId?: string;
  approvedByName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  quantity: number;
  unit: string;
  groupId?: string;
  groupName?: string;
  contractId?: string;
  companyId: string;
  rejectionReason?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Statement {
  _id: string;
  title: string;
  code: string;
  description: string;
  amount: number; // Rial
  contractorUserId: string;
  contractorName: string;
  contractorCompanyId: string;
  contractorCompanyName: string;
  contractId: string;
  contractTitle: string;
  periodStartJalali: string;
  periodEndJalali: string;
  status:
    | 'employer_ceo_review'
    | 'employer_manager_review'
    | 'deputy_review'
    | 'approved'
    | 'rejected'
    | 'paid'
    | 'pending';
  approvedAt?: string;
  approvedByUserId?: string;
  approvedByName?: string;
  rejectionReason?: string;
  reportIds: string[];
  reportsCount: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScoreEvent {
  _id: string;
  userId: string;
  userName: string;
  reportId?: string;
  score: number;
  reason: string;
  createdByRole: string;
  createdAt: string;
}

export interface SyncQueueItem {
  _id: string;
  userId: string;
  endpoint: string;
  method: string;
  payload: any;
  idempotencyKey: string;
  status: 'pending' | 'sending' | 'synced' | 'failed';
  attempts: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OtpCodeRecord {
  mobile: string;
  mobileHash: string;
  otpHash: string;
  plainCodeForDemo: string;
  expiresAt: number; // timestamp
  attempts: number;
  consumed: boolean;
}

export interface Setting {
  _id: string;
  key: string;
  value: string;
  description?: string;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ViewRoute =
  | 'landing'
  | 'dashboard'
  | 'reports'
  | 'report-new'
  | 'periodic-tests'
  | 'tasks'
  | 'station-communications'
  | 'extra-work'
  | 'statements'
  | 'purchases'
  | 'price-items'
  | 'groups'
  | 'contracts'
  | 'technicians'
  | 'offline-queue'
  | 'audit-logs'
  | 'architecture-security'
  | 'settings';

export type FiberPhysicalState = 'سالم' | 'قابل قبول' | 'معیوب' | '';

export type FiberCoreStatus = 'زیربار' | 'تاریک' | 'قطع' | '';

export interface FiberCoreRow {
  id: string;
  rowNumber: number;
  sectionNumber: string;
  pigtailNumber: string;
  destination: string;
  activeEquipment: string;
  coreStatus: FiberCoreStatus;
  attenuationDb: string;
  distanceKm: string;
  notes: string;
}

export interface FiberPhysicalChecklist {
  fiberRoomStatus: FiberPhysicalState;
  floorLayoutMatch: FiberPhysicalState;
  opgwAndDuctHealth: FiberPhysicalState;
  gantryJointBox: FiberPhysicalState;
  clampsAndLoops: FiberPhysicalState;
  labels: FiberPhysicalState;
  pigtails: FiberPhysicalState;
  patchCords: FiberPhysicalState;
  remarks: string;
}

export interface FiberRouteTestSheet {
  id: string;
  routeTitle: string;
  sourceStation: string;
  destinationStation: string;
  lineLengthText: string;
  outdoorCableType: string;
  indoorCableType: string;
  ocdfType: string;
  odfConnectorType: string;
  pmDateJalali: string;
  physical: FiberPhysicalChecklist;
  cores: FiberCoreRow[];
}

export type PeriodicTestStatus =
  | 'submitted'
  | 'supervisor_approved'
  | 'expert_approved'
  | 'redo_requested';

export interface PeriodicTestAttachment extends Attachment {
  routeId?: string;
  routeTitle?: string;
  caption?: string;
}

export interface WirelessRadioColumns {
  txPowerW: string;
  reflectedPowerW: string;
  antennaType: string;
  antennaGainDb: string;
  aglMeters: string;
  channelNo: string;
}

export interface WirelessUnitTestSheet {
  id: string;
  unitTitle: string;
  caseNumber: string;
  sourceStation: string;
  destinationStations: string;
  radioSerialNumber: string;
  brand: string;
  model: string;
  // Section 1a: Radio & Antenna (1 = Main, 2 = Repeater)
  primaryRadio: WirelessRadioColumns;
  repeaterRadio: WirelessRadioColumns;
  // Section 1b: Tower, Feeder & Reviews
  towerType: string;
  towerHeightM: string;
  feederType: string;
  feederLengthM: string;
  connectorsReview: string;
  towerReview: string;
  antennaReview: string;
  // Section 2: Power Supply — DC Converter
  dcConverterType: string;
  dcVinV: string;
  dcVoutV: string;
  // Section 2: Power Supply + Battery
  chargerType: string;
  chargerVoltageV: string;
  batteryType: string;
  batteryAh: string;
  batteryVoltageAfterDischargeV: string;
  outputPowerAfterDischargeW: string;
  notes: string;
}

export interface PeriodicTestRecord {
  _id: string;
  domain: 'telecom' | 'telemetry' | 'scada';
  sectionId: string;
  subSectionId?: string;
  stationId: string;
  stationName: string;
  dispatchCode?: string;
  groupId?: string;
  groupName?: string;
  monthJalali: string;
  pmDateJalali: string;
  documentTitle: string;
  documentCode?: string;
  revisionNumber?: string;
  contractTitle: string;
  contractNumber: string;
  attachmentPagesCount: number;
  preparerUserId: string;
  preparerName: string;
  approverName?: string;
  reviewNote?: string;
  status: PeriodicTestStatus;
  routes: FiberRouteTestSheet[];
  wirelessUnits?: WirelessUnitTestSheet[];
  attachments: PeriodicTestAttachment[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

