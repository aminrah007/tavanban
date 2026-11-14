/**
 * AppContext for TavanBan (توان‌بان)
 * State management, 3-step workflow engine, offline sync queue, and audit logging
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  User,
  WorkReport,
  PriceItem,
  Task,
  ExtraWorkItem,
  Statement,
  PurchaseRequest,
  WorkGroup,
  Contract,
  Company,
  AuditLog,
  Notification,
  ScoreEvent,
  SyncQueueItem,
  Setting,
  ViewRoute,
  ReportStatus,
  ApprovalEvent,
  ThemeMode,
  WorkGroupSpecialty,
  PeriodicTestRecord,
  PeriodicTestStatus,
} from '../types';
import { PeriodicDomainId } from '../data/periodicTestConfig';
import {
  INITIAL_USERS,
  INITIAL_REPORTS,
  INITIAL_PRICE_ITEMS,
  INITIAL_TASKS,
  INITIAL_STATEMENTS,
  INITIAL_PURCHASES,
  INITIAL_GROUPS,
  INITIAL_CONTRACTS,
  INITIAL_COMPANIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SCORES,
  INITIAL_SETTINGS,
} from '../data/mockDatabase';
import {
  INITIAL_STATIONS_CHECKLIST,
  StationCommunication,
  ChannelType,
  ChannelHealthStatus,
} from '../data/stationsChecklist';
import { canAccessRoute } from '../config/rolePermissions';
import { normalizeIranMobile } from '../utils/formatters';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  testFirestoreConnection,
  FirebaseUser,
} from '../lib/firebase';
import {
  ensureOrgMemberDoc,
  seedInitialFirestoreData,
  subscribeOrgCollections,
  persistCreateUser,
  persistUpdateUserProfile,
  persistToggleUserActive,
  persistUpsertReport,
  persistUpsertTask,
  persistUpsertStatement,
  persistUpsertPurchase,
  persistUpsertPriceItem,
  persistUpsertWorkGroup,
  persistCreateContract,
  persistCreateCompany,
  persistCreateScoreEvent,
  persistAuditLog,
  persistStationChannels,
  persistUpsertPeriodicTest,
  verifyCloudPersonnelSync,
  syncLocalPersonnelToCloud,
  CloudSyncVerificationResult,
} from '../services/firestoreSync';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

interface AppContextType {
  // Cloud Auth & Sync (Firebase)
  firebaseUser: FirebaseUser | null;
  isAuthReady: boolean;
  isCloudConnected: boolean;
  isCloudSyncing: boolean;
  cloudVerification: CloudSyncVerificationResult | null;
  verifyCloudSync: () => Promise<CloudSyncVerificationResult | null>;
  pushLocalPersonnelToCloud: () => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOutGoogle: () => Promise<void>;

  // Auth & Role
  currentUser: User;
  currentRole: Role;
  users: User[];
  setCurrentUserByRole: (role: Role) => void;
  switchUser: (userId: string) => void;
  verifyAndLoginOtp: (mobile: string, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Theme (dark-first with selectable toggle)
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Navigation & Routing
  currentRoute: ViewRoute;
  setCurrentRoute: (route: ViewRoute) => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
  preselectedStationId: string | null;
  setPreselectedStationId: (id: string | null) => void;
  preselectedTaskId: string | null;
  setPreselectedTaskId: (id: string | null) => void;
  focusedCommStationId: string | null;
  setFocusedCommStationId: (id: string | null) => void;
  periodicSelection: {
    domain: PeriodicDomainId;
    sectionId: string;
    subSectionId?: string;
  };
  setPeriodicSelection: (selection: {
    domain: PeriodicDomainId;
    sectionId: string;
    subSectionId?: string;
  }) => void;

  // Data Collections
  reports: WorkReport[];
  priceItems: PriceItem[];
  tasks: Task[];
  statements: Statement[];
  purchases: PurchaseRequest[];
  groups: WorkGroup[];
  contracts: Contract[];
  companies: Company[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  scores: ScoreEvent[];
  syncQueue: SyncQueueItem[];
  settings: Setting[];
  stations: StationCommunication[];
  periodicTests: PeriodicTestRecord[];
  savePeriodicTest: (
    record: Omit<PeriodicTestRecord, '_id' | 'createdAt' | 'updatedAt' | 'organizationId'> & { _id?: string }
  ) => Promise<{ success: boolean; id?: string; isOffline?: boolean }>;
  reviewPeriodicTest: (
    testId: string,
    status: PeriodicTestStatus,
    reviewNote?: string
  ) => Promise<boolean>;
  updateStationChannel: (
    stationId: string,
    channelType: ChannelType,
    updates: { status?: ChannelHealthStatus; number?: string; note?: string }
  ) => void;

  // Network & Offline Queue
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
  processSyncQueue: () => Promise<void>;

  // Workflow Handlers
  createReport: (
    reportData: Partial<WorkReport> & { onBehalfOfUserId?: string }
  ) => Promise<{ success: boolean; reportId?: string; isOffline?: boolean }>;
  resubmitReport: (reportId: string, updatedDescription: string) => Promise<boolean>;
  createDailyReport: (data: {
    reportDateJalali: string;
    groupId: string;
    description: string;
    stationId?: string;
    stationName?: string;
    dispatchCode?: string;
  }) => Promise<boolean>;
  advanceReportWorkflow: (
    reportId: string,
    action: 'approve' | 'reject' | 'redo' | 'dispute' | 'settle',
    reason?: string
  ) => Promise<{ success: boolean; error?: string }>;
  mapExtraWork: (
    extraWorkId: string,
    mappedPriceItemId: string,
    mappedQuantity: number,
    note?: string
  ) => Promise<boolean>;
  rejectExtraWork: (extraWorkId: string, note?: string) => Promise<boolean>;
  createPurchaseRequest: (data: Partial<PurchaseRequest>) => Promise<boolean>;
  updatePurchaseStatus: (
    purchaseId: string,
    status: 'approved' | 'rejected' | 'paid' | 'cancelled',
    rejectionReason?: string
  ) => Promise<boolean>;
  createStatement: (contractId: string, periodStart: string, periodEnd: string) => Promise<boolean>;
  updateStatementStatus: (
    statementId: string,
    status: 'approved' | 'rejected' | 'paid',
    rejectionReason?: string
  ) => Promise<boolean>;
  createTask: (data: Partial<Task>) => Promise<boolean>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<boolean>;
  createPriceItem: (data: Partial<PriceItem>) => Promise<boolean>;
  updatePriceItem: (id: string, data: Partial<PriceItem>) => Promise<boolean>;
  createGroup: (data: {
    name: string;
    description: string;
    specialty?: WorkGroupSpecialty;
    supervisorUserId: string;
    memberIds: string[];
  }) => Promise<boolean>;
  updateGroup: (
    groupId: string,
    data: {
      name: string;
      description: string;
      specialty?: WorkGroupSpecialty;
      supervisorUserId: string;
      memberIds: string[];
      isActive?: boolean;
    }
  ) => Promise<boolean>;
  toggleGroupMember: (groupId: string, userId: string) => Promise<boolean>;
  assignEmployerObserver: (groupId: string, observerUserId: string) => Promise<boolean>;
  createCompany: (data: { name: string; code: string; phone?: string; address?: string; description?: string }) => Promise<boolean>;
  createContract: (data: Partial<Contract>) => Promise<boolean>;
  createUser: (data: { fullName: string; mobile: string; role: Role; groupIds?: string[]; unitId?: string }) => Promise<boolean>;
  updateUserProfile: (userId: string, data: { fullName: string; mobile?: string }) => Promise<boolean>;
  toggleUserActive: (userId: string) => Promise<boolean>;
  markNotificationRead: (id: string) => void;

  // Auditing & Utilities
  addAuditLog: (action: string, resourceType: string, resourceId: string, details?: any) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type'], title?: string) => void;
  dismissToast: (id: string) => void;

  // Role Permissions Checker
  canUserAccess: (resource: string, action: 'C' | 'R' | 'U' | 'D') => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_DB_STORAGE_KEY = 'tavanban_local_db_v1';
const CLOUD_OPT_IN_KEY = 'tavanban_cloud_opt_in';

interface LocalDbSnapshot {
  users?: User[];
  currentUserId?: string;
  reports?: WorkReport[];
  priceItems?: PriceItem[];
  tasks?: Task[];
  statements?: Statement[];
  purchases?: PurchaseRequest[];
  groups?: WorkGroup[];
  contracts?: Contract[];
  companies?: Company[];
  auditLogs?: AuditLog[];
  notifications?: Notification[];
  scores?: ScoreEvent[];
  syncQueue?: SyncQueueItem[];
  stations?: StationCommunication[];
  periodicTests?: PeriodicTestRecord[];
}

function readLocalDbSnapshot(): LocalDbSnapshot {
  try {
    const raw = localStorage.getItem(LOCAL_DB_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LocalDbSnapshot;
  } catch {
    return {};
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialLocal = React.useMemo(() => readLocalDbSnapshot(), []);
  const initialUsersList = initialLocal.users?.length ? initialLocal.users : INITIAL_USERS;
  const initialActiveUser =
    initialUsersList.find((u) => u._id === initialLocal.currentUserId) || initialUsersList[0];

  // 0. Firebase Cloud Auth & Real-Time Firestore Sync State (strictly opt-in)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [cloudVerification, setCloudVerification] = useState<CloudSyncVerificationResult | null>(null);
  const [cloudOptIn, setCloudOptIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(CLOUD_OPT_IN_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // 1. Auth state (hydrated from localStorage if edited locally)
  const [users, setUsers] = useState<User[]>(initialUsersList);
  const [currentUser, setCurrentUser] = useState<User>(initialActiveUser);
  const [currentRole, setCurrentRole] = useState<Role>(initialActiveUser.role);

  // 1b. Theme state (defaults to dark mode matching OmniRoute dark theme)
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('tavanban_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('tavanban_theme', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const setTheme = (next: ThemeMode) => setThemeState(next);
  const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

  // 2. Routing state (default to landing page; accessible anytime via brand/logo click)
  const [currentRoute, setCurrentRouteState] = useState<ViewRoute>('landing');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [preselectedStationId, setPreselectedStationId] = useState<string | null>(null);
  const [preselectedTaskId, setPreselectedTaskId] = useState<string | null>(null);
  const [focusedCommStationId, setFocusedCommStationId] = useState<string | null>(null);
  const [periodicSelection, setPeriodicSelection] = useState<{
    domain: PeriodicDomainId;
    sectionId: string;
    subSectionId?: string;
  }>({
    domain: 'telecom',
    sectionId: 'wireless',
  });

  // 3. Database state (hydrated from localStorage when available)
  const [reports, setReports] = useState<WorkReport[]>(() =>
    initialLocal.reports?.length ? initialLocal.reports : INITIAL_REPORTS
  );
  const [priceItems, setPriceItems] = useState<PriceItem[]>(() =>
    initialLocal.priceItems?.length ? initialLocal.priceItems : INITIAL_PRICE_ITEMS
  );
  const [tasks, setTasks] = useState<Task[]>(() =>
    initialLocal.tasks?.length ? initialLocal.tasks : INITIAL_TASKS
  );
  const [statements, setStatements] = useState<Statement[]>(() =>
    initialLocal.statements?.length ? initialLocal.statements : INITIAL_STATEMENTS
  );
  const [purchases, setPurchases] = useState<PurchaseRequest[]>(() =>
    initialLocal.purchases?.length ? initialLocal.purchases : INITIAL_PURCHASES
  );
  const [groups, setGroups] = useState<WorkGroup[]>(() =>
    initialLocal.groups?.length ? initialLocal.groups : INITIAL_GROUPS
  );
  const [contracts, setContracts] = useState<Contract[]>(() =>
    initialLocal.contracts?.length ? initialLocal.contracts : INITIAL_CONTRACTS
  );
  const [companies, setCompanies] = useState<Company[]>(() =>
    initialLocal.companies?.length ? initialLocal.companies : INITIAL_COMPANIES
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    initialLocal.auditLogs?.length ? initialLocal.auditLogs : INITIAL_AUDIT_LOGS
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    initialLocal.notifications?.length ? initialLocal.notifications : INITIAL_NOTIFICATIONS
  );
  const [scores, setScores] = useState<ScoreEvent[]>(() =>
    initialLocal.scores?.length ? initialLocal.scores : INITIAL_SCORES
  );
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(() =>
    initialLocal.syncQueue ? initialLocal.syncQueue : []
  );
  const [settings] = useState<Setting[]>(INITIAL_SETTINGS);
  const [stations, setStations] = useState<StationCommunication[]>(() =>
    initialLocal.stations?.length ? initialLocal.stations : INITIAL_STATIONS_CHECKLIST
  );
  const [periodicTests, setPeriodicTests] = useState<PeriodicTestRecord[]>(() =>
    initialLocal.periodicTests?.length ? initialLocal.periodicTests : []
  );

  // Persist local edits to browser localStorage automatically so edits survive refresh even without cloud DB
  useEffect(() => {
    try {
      const snapshot: LocalDbSnapshot = {
        users,
        currentUserId: currentUser._id,
        reports,
        priceItems,
        tasks,
        statements,
        purchases,
        groups,
        contracts,
        companies,
        auditLogs,
        notifications,
        scores,
        syncQueue,
        stations,
        periodicTests,
      };
      localStorage.setItem(LOCAL_DB_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // ignore quota/storage errors
    }
  }, [
    users,
    currentUser._id,
    reports,
    priceItems,
    tasks,
    statements,
    purchases,
    groups,
    contracts,
    companies,
    auditLogs,
    notifications,
    scores,
    syncQueue,
    stations,
    periodicTests,
  ]);

  // 4. Online/Offline simulator
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 4b. Firebase Auth & Firestore Lifecycle (runs sync ONLY when user opts into cloud DB)
  useEffect(() => {
    testFirestoreConnection().catch(() => {});

    let unsubscribeCollections: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      setIsAuthReady(true);

      if (unsubscribeCollections) {
        unsubscribeCollections();
        unsubscribeCollections = undefined;
      }

      if (cloudOptIn && fbUser && fbUser.emailVerified) {
        setIsCloudSyncing(true);
        try {
          await ensureOrgMemberDoc(fbUser);
          await seedInitialFirestoreData(fbUser.uid, {
            users,
            reports,
            priceItems,
            tasks,
            statements,
            purchases,
            groups,
            contracts,
            companies,
            scores,
            auditLogs,
          });

          unsubscribeCollections = subscribeOrgCollections(fbUser, {
            onUsers: (cloudUsers) => {
              setUsers(cloudUsers);
              setCurrentUser((prev) => cloudUsers.find((u) => u._id === prev._id) || prev);
            },
            onReports: (cloudReports) => setReports(cloudReports),
            onTasks: (cloudTasks) => setTasks(cloudTasks),
            onStatements: (cloudStatements) => setStatements(cloudStatements),
            onPurchases: (cloudPurchases) => setPurchases(cloudPurchases),
            onPriceItems: (cloudPriceItems) => setPriceItems(cloudPriceItems),
            onGroups: (cloudGroups) => setGroups(cloudGroups),
            onContracts: (cloudContracts) => setContracts(cloudContracts),
            onCompanies: (cloudCompanies) => setCompanies(cloudCompanies),
            onScores: (cloudScores) => setScores(cloudScores),
            onAuditLogs: (cloudLogs) => setAuditLogs(cloudLogs),
            onStationConfigs: (overrides) => {
              setStations(
                INITIAL_STATIONS_CHECKLIST.map((st) =>
                  overrides[st.id] ? { ...st, channels: overrides[st.id] } : st
                )
              );
            },
            onPeriodicTests: (cloudTests) => setPeriodicTests(cloudTests),
          });
          setIsCloudConnected(true);
          verifyCloudPersonnelSync()
            .then((res) => setCloudVerification(res))
            .catch(() => {});
        } catch (err) {
          console.error('Firebase sync error:', err);
          setIsCloudConnected(false);
        } finally {
          setIsCloudSyncing(false);
        }
      } else {
        setIsCloudConnected(false);
        setIsCloudSyncing(false);
        setCloudVerification(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeCollections) unsubscribeCollections();
    };
  }, [cloudOptIn]);

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      setIsCloudSyncing(true);
      try {
        localStorage.setItem(CLOUD_OPT_IN_KEY, 'true');
      } catch {
        // ignore
      }
      setCloudOptIn(true);
      await signInWithPopup(auth, googleProvider);
      showToast('اتصال به سرور ابری و پایگاه داده سازمان با موفقیت برقرار شد.', 'success', 'Firestore متصل شد');
      return true;
    } catch (error: any) {
      const code = error?.code || '';
      try {
        localStorage.setItem(CLOUD_OPT_IN_KEY, 'false');
      } catch {
        // ignore
      }
      setCloudOptIn(false);
      if (code !== 'auth/popup-closed-by-user') {
        showToast('خطا در احراز هویت گوگل جهت اتصال به دیتابیس ابری.', 'error');
      }
      return false;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const signOutGoogle = async (): Promise<void> => {
    try {
      localStorage.setItem(CLOUD_OPT_IN_KEY, 'false');
    } catch {
      // ignore
    }
    setCloudOptIn(false);
    await signOut(auth);
    setIsCloudConnected(false);
    setCloudVerification(null);
    showToast('اتصال حساب گوگل قطع شد؛ تغییرات روی حافظه محلی دستگاه ذخیره می‌شوند.', 'info');
  };

  const verifyCloudSync = async (): Promise<CloudSyncVerificationResult | null> => {
    if (!isCloudConnected || !firebaseUser?.emailVerified) {
      showToast('ابتدا اتصال به دیتابیس ابری را برقرار کنید.', 'warning');
      return null;
    }
    try {
      setIsCloudSyncing(true);
      const res = await verifyCloudPersonnelSync();
      setCloudVerification(res);
      showToast(
        `استعلام مستقیم از سرور انجام شد: ${res.personnel.length} پروفایل پرسنل و ${res.reportsCount} گزارش در دیتابیس ابری ثبت شده است.`,
        'success',
        'بررسی دیتابیس تکمیل شد'
      );
      return res;
    } catch (err) {
      console.error(err);
      showToast('خطا در استعلام مستقیم از دیتابیس ابری.', 'error');
      return null;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const pushLocalPersonnelToCloud = async (): Promise<boolean> => {
    if (!isCloudConnected || !firebaseUser?.emailVerified) {
      showToast('برای ارسال اسامی به دیتابیس، ابتدا اتصال ابری را برقرار کنید.', 'warning');
      return false;
    }
    try {
      setIsCloudSyncing(true);
      const { updatedCount, createdCount } = await syncLocalPersonnelToCloud(users, firebaseUser.uid, {
        reports,
        tasks,
        statements,
        purchases,
        scores,
      });
      const res = await verifyCloudPersonnelSync();
      setCloudVerification(res);
      if (updatedCount === 0 && createdCount === 0) {
        showToast('تمام اسامی واقعی پرسنل هم‌اکنون با دیتابیس ابری کاملاً همگام است.', 'success');
      } else {
        showToast(
          `${updatedCount} کاربر به‌روزرسانی و ${createdCount} کاربر جدید به دیتابیس ابری منتقل شد.`,
          'success',
          'همگام‌سازی کامل شد'
        );
      }
      return true;
    } catch (err) {
      console.error(err);
      showToast('خطا در همگام‌سازی اسامی با دیتابیس ابری.', 'error');
      return false;
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Show Toast Helper
  const showToast = (message: string, type: ToastMessage['type'] = 'info', title?: string) => {
    const id = 't-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add Audit Log
  const addAuditLog = (action: string, resourceType: string, resourceId: string, details?: any) => {
    const newLog: AuditLog = {
      _id: 'log-' + Date.now(),
      actorUserId: currentUser._id,
      actorName: currentUser.fullName,
      actorRole: currentRole,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
      userAgent: navigator.userAgent,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistAuditLog(newLog, firebaseUser.uid).catch((e) => console.error(e));
    }
  };

  // URL Hash Sync for bookmarkable routes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      const [route, param] = hash.split('/');
      const validRoutes: ViewRoute[] = [
        'landing',
        'dashboard',
        'reports',
        'report-new',
        'periodic-tests',
        'tasks',
        'station-communications',
        'extra-work',
        'statements',
        'purchases',
        'price-items',
        'groups',
        'contracts',
        'technicians',
        'offline-queue',
        'audit-logs',
        'architecture-security',
        'settings',
      ];
      if (!hash) {
        setCurrentRouteState('landing');
        return;
      }
      if (route === 'admin') {
        setCurrentRouteState('architecture-security');
        return;
      }
      if (validRoutes.includes(route as ViewRoute)) {
        setCurrentRouteState(route as ViewRoute);
        if (route === 'reports' && param) {
          setSelectedReportId(param);
        }
      } else {
        setCurrentRouteState('dashboard');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) {
      handleHashChange();
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setCurrentRoute = (route: ViewRoute) => {
    if (!canAccessRoute(currentRole, route)) {
      showToast('نقش شغلی شما مجاز به مشاهده این بخش نیست.', 'warning');
      setCurrentRouteState('dashboard');
      window.location.hash = '#/dashboard';
      return;
    }
    setCurrentRouteState(route);
    window.location.hash = `#/${route}`;
  };

  // Keep active route valid whenever role changes
  useEffect(() => {
    if (!canAccessRoute(currentRole, currentRoute)) {
      setCurrentRouteState('dashboard');
      window.location.hash = '#/dashboard';
    }
  }, [currentRole, currentRoute]);

  // Switch User by Role
  const setCurrentUserByRole = (role: Role) => {
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      setCurrentRole(targetUser.role);
      addAuditLog('ROLE_SWITCH', 'User', targetUser._id, { targetRole: role });
      showToast(`نقش به "${getRolePersianName(role)}" تغییر یافت`, 'info');
    }
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u._id === userId);
    if (target) {
      setCurrentUser(target);
      setCurrentRole(target.role);
      addAuditLog('USER_SWITCH', 'User', target._id, { role: target.role });
      showToast(`کاربر جاری: ${target.fullName}`, 'info');
    }
  };

  // Melipayamak OTP Login simulation
  const verifyAndLoginOtp = async (mobile: string, code: string): Promise<{ success: boolean; error?: string }> => {
    const cleanMobile = normalizeIranMobile(mobile);
    const matchedUser = users.find((u) => normalizeIranMobile(u.mobile) === cleanMobile);

    if (!matchedUser) {
      return { success: false, error: 'شماره همراه در سامانه ثبت نشده است. دسترسی فقط برای پرسنل مجاز امکان‌پذیر است.' };
    }

    if (!matchedUser.isActive) {
      return { success: false, error: 'حساب کاربری شما توسط مدیر سیستم غیرفعال شده است.' };
    }

    if (code.length !== 5) {
      return { success: false, error: 'کد اعتبارسنجی پیامک باید ۵ رقمی باشد.' };
    }

    setCurrentUser(matchedUser);
    setCurrentRole(matchedUser.role);
    addAuditLog('OTP_LOGIN_VERIFIED', 'User', matchedUser._id, {
      mobileHash: matchedUser.hashedMobile,
      provider: 'MELIPAYAMAK_OTP',
      sessionCookie: 'iron_session_encrypted_httpOnly',
    });
    showToast(`خوش آمدید، ${matchedUser.fullName}`, 'success');
    setCurrentRouteState('dashboard');
    window.location.hash = '#/dashboard';
    return { success: true };
  };

  const logout = () => {
    addAuditLog('LOGOUT', 'User', currentUser._id);
    showToast('نشست کاربری شما بسته شد. لطفا مجدداً احراز هویت نمایید.', 'info');
  };

  // Role Access Checker Matrix (strictly aligned with SYSTEM_DOCUMENTATION_diff_b8adb869.md)
  const canUserAccess = (resource: string, action: 'C' | 'R' | 'U' | 'D'): boolean => {
    if (action === 'R') return true;
    if (action === 'D') return false; // Hard deletes prohibited; soft delete via U

    if (resource === 'WorkReport') {
      if (action === 'C') return currentRole === 'TECHNICIAN' || currentRole === 'GROUP_SUPERVISOR';
      if (action === 'U')
        return ['GROUP_SUPERVISOR', 'EMPLOYER_EXPERT', 'EMPLOYER_CEO', 'DEPUTY', 'TECHNICIAN'].includes(currentRole);
    }

    if (resource === 'DailyReport') {
      return currentRole === 'EMPLOYER_EXPERT' && action === 'C';
    }

    if (resource === 'ExtraWorkItem') {
      return action === 'U' && currentRole === 'RESIDENT_REP';
    }

    if (resource === 'Statement') {
      if (action === 'C') return currentRole === 'CONTRACTOR_CEO';
      if (action === 'U') return ['EMPLOYER_CEO', 'EMPLOYER_MANAGER', 'DEPUTY'].includes(currentRole);
    }

    if (resource === 'PriceItem') {
      return currentRole === 'CONTRACTOR_CEO';
    }

    if (resource === 'PurchaseRequest') {
      if (action === 'C') return ['TECHNICIAN', 'GROUP_SUPERVISOR', 'RESIDENT_REP'].includes(currentRole);
      if (action === 'U') return ['RESIDENT_REP', 'CONTRACTOR_CEO'].includes(currentRole);
    }

    if (resource === 'Task') {
      if (action === 'C') {
        return ['EMPLOYER_MANAGER', 'EMPLOYER_CEO', 'EMPLOYER_EXPERT', 'GROUP_SUPERVISOR', 'CONTRACTOR_CEO'].includes(currentRole);
      }
      if (action === 'U') {
        return ['EMPLOYER_MANAGER', 'EMPLOYER_CEO', 'EMPLOYER_EXPERT', 'GROUP_SUPERVISOR', 'CONTRACTOR_CEO', 'TECHNICIAN'].includes(currentRole);
      }
    }

    if (resource === 'Contract' || resource === 'Company' || resource === 'Setting') {
      return currentRole === 'DEPUTY';
    }

    if (resource === 'WorkGroup') {
      if (action === 'C') return currentRole === 'CONTRACTOR_CEO' || currentRole === 'DEPUTY';
      if (action === 'U') return ['CONTRACTOR_CEO', 'EMPLOYER_CEO', 'DEPUTY'].includes(currentRole);
    }

    if (resource === 'User') {
      return currentRole === 'DEPUTY' || currentRole === 'CONTRACTOR_CEO';
    }

    return false;
  };

  // 5. Work Report Creation (with Snapshot & Offline queue — strictly TECHNICIAN & GROUP_SUPERVISOR)
  const createReport = async (
    reportData: Partial<WorkReport> & { onBehalfOfUserId?: string }
  ): Promise<{ success: boolean; reportId?: string; isOffline?: boolean }> => {
    if (currentRole !== 'TECHNICIAN' && currentRole !== 'GROUP_SUPERVISOR') {
      showToast('فقط تکنسین و سرپرست گروه مجاز به ثبت گزارش کار هستند.', 'error');
      return { success: false };
    }

    const reportId = 'rep-' + Date.now().toString().slice(-6);
    const idempotencyKey = 'idemp-' + Math.random().toString(36).substring(2, 10);
    const jalaliToday = '۱۴۰۳/۰۸/' + (new Date().getDate() % 30 + 1);

    const authorUser =
      currentRole === 'GROUP_SUPERVISOR' && reportData.onBehalfOfUserId
        ? users.find((u) => u._id === reportData.onBehalfOfUserId) || currentUser
        : currentUser;

    // If GROUP_SUPERVISOR authors the report (for self or team member), goes directly to expert_review (no self-approval)
    const initialStatus: ReportStatus =
      currentRole === 'GROUP_SUPERVISOR' ? 'expert_review' : 'supervisor_review';

    const newReport: WorkReport = {
      _id: reportId,
      reportType: 'work_report',
      userId: authorUser._id,
      userName: authorUser.fullName,
      companyId: authorUser.companyId || 'comp-1',
      companyName: companies.find((c) => c._id === authorUser.companyId)?.name || 'مهندسی نیرو توان پارس',
      groupId: reportData.groupId || (authorUser.groupIds && authorUser.groupIds[0]) || 'grp-1',
      groupName: groups.find((g) => g._id === reportData.groupId)?.name || 'گروه تست و اورهال پست جلال‌آل‌احمد',
      contractId: 'cnt-1',
      contractTitle: 'قرارداد نگهداری و تعمیرات پست‌های انتقال زاهدان و شمال استان',
      unitId: 'unit-1',
      unitName: 'واحد نظارت بر پست‌های انتقال ۴۰۰ و ۲۳۰ کیلوولت',
      stationId: reportData.stationId,
      stationName: reportData.stationName,
      dispatchCode: reportData.dispatchCode,
      taskReferenceId: reportData.taskReferenceId,
      reportDateJalali: reportData.reportDateJalali || jalaliToday,
      status: initialStatus,
      description: reportData.description || 'ثبت گزارش کار عملیات میدانی',
      idempotencyKey,
      submittedAt: new Date().toISOString(),
      currentReviewerRole: initialStatus === 'expert_review' ? 'EMPLOYER_EXPERT' : 'GROUP_SUPERVISOR',
      totalAmount: reportData.totalAmount || 0,
      itemCount: (reportData.items || []).length,
      organizationId: 'org-1',
      items: reportData.items || [],
      extraWorks: reportData.extraWorks || [],
      attachments: reportData.attachments || [],
      events: [
        {
          _id: 'ev-' + Date.now(),
          reportId,
          actorUserId: currentUser._id,
          actorName: currentUser.fullName,
          actorRole: currentRole,
          action: 'submit',
          fromStatus: 'draft',
          toStatus: initialStatus,
          reason:
            authorUser._id !== currentUser._id
              ? `ثبت توسط سرپرست گروه به نام ${authorUser.fullName}`
              : undefined,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!isOnline) {
      const queueItem: SyncQueueItem = {
        _id: 'sync-' + Date.now(),
        userId: currentUser._id,
        endpoint: '/api/v1/reports',
        method: 'POST',
        payload: newReport,
        idempotencyKey,
        status: 'pending',
        attempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSyncQueue((prev) => [queueItem, ...prev]);
      showToast('عدم اتصال اینترنت: گزارش در صف آفلاین ذخیره شد و پس از اتصال همگام خواهد شد.', 'warning', 'آفلاین');
      return { success: true, reportId, isOffline: true };
    }

    setReports((prev) => [newReport, ...prev]);
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistUpsertReport(newReport, firebaseUser.uid, true).catch((e) => console.error(e));
    }
    addAuditLog('REPORT_CREATED', 'WorkReport', reportId, {
      status: initialStatus,
      totalAmount: newReport.totalAmount,
      itemCount: newReport.itemCount,
      idempotencyKey,
    });

    const reviewerRole = initialStatus === 'expert_review' ? 'EMPLOYER_EXPERT' : 'GROUP_SUPERVISOR';
    const targetReviewer = users.find((u) => u.role === reviewerRole);
    if (targetReviewer) {
      const notif: Notification = {
        _id: 'notif-' + Date.now(),
        userId: targetReviewer._id,
        title: 'گزارش کار جدید برای بررسی',
        message: `گزارش جدیدی توسط ${authorUser.fullName} ثبت گردید و منتظر بررسی شما است.`,
        type: 'info',
        priority: 'normal',
        isRead: false,
        entity: 'report',
        entityId: reportId,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    showToast('گزارش کار با موفقیت ثبت و ارسال شد.', 'success');
    return { success: true, reportId };
  };

  // 5b. Technician Resubmit for redo_requested
  const resubmitReport = async (reportId: string, updatedDescription: string): Promise<boolean> => {
    const target = reports.find((r) => r._id === reportId);
    if (!target || currentRole !== 'TECHNICIAN' || target.userId !== currentUser._id || target.status !== 'redo_requested') {
      showToast('امکان ارسال مجدد این گزارش برای نقش جاری وجود ندارد.', 'error');
      return false;
    }

    const ev: ApprovalEvent = {
      _id: 'ev-' + Date.now(),
      reportId,
      actorUserId: currentUser._id,
      actorName: currentUser.fullName,
      actorRole: currentRole,
      action: 'resubmit',
      fromStatus: 'redo_requested',
      toStatus: 'supervisor_review',
      reason: 'اصلاحات درخواستی انجام و مجدداً ارسال شد',
      createdAt: new Date().toISOString(),
    };

    const updatedRep: WorkReport = {
      ...target,
      description: updatedDescription.trim() || target.description,
      status: 'supervisor_review',
      currentReviewerRole: 'GROUP_SUPERVISOR',
      events: [...target.events, ev],
      updatedAt: new Date().toISOString(),
    };
    setReports((prev) => prev.map((r) => (r._id === reportId ? updatedRep : r)));
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistUpsertReport(updatedRep, firebaseUser.uid, false).catch((e) => console.error(e));
    }
    addAuditLog('REPORT_RESUBMITTED', 'WorkReport', reportId);
    showToast('گزارش پس از اصلاح به کارتابل سرپرست گروه ارسال شد.', 'success');
    return true;
  };

  // 5c. Employer Expert Daily Report (گزارش روزانه کارشناس)
  const createDailyReport = async (data: {
    reportDateJalali: string;
    groupId: string;
    description: string;
    stationId?: string;
    stationName?: string;
    dispatchCode?: string;
  }): Promise<boolean> => {
    if (currentRole !== 'EMPLOYER_EXPERT') {
      showToast('فقط کارشناس کارفرما مجاز به ثبت گزارش روزانه نظارتی است.', 'error');
      return false;
    }

    const reportId = 'daily-' + Date.now().toString().slice(-6);
    const targetGroup = groups.find((g) => g._id === data.groupId);
    const newDaily: WorkReport = {
      _id: reportId,
      reportType: 'daily_report',
      userId: currentUser._id,
      userName: currentUser.fullName,
      companyId: 'org-1',
      companyName: 'شرکت سهامی برق منطقه‌ای سیستان و بلوچستان',
      groupId: data.groupId,
      groupName: targetGroup?.name || 'گروه نظارتی واحد',
      contractId: targetGroup?.contractId || 'cnt-1',
      contractTitle: 'قرارداد نگهداری و تعمیرات پست‌های انتقال زاهدان و شمال استان',
      unitId: currentUser.unitId || 'unit-1',
      unitName: 'واحد نظارت بر پست‌های انتقال ۴۰۰ و ۲۳۰ کیلوولت',
      stationId: data.stationId,
      stationName: data.stationName,
      dispatchCode: data.dispatchCode,
      reportDateJalali: data.reportDateJalali,
      status: 'approved',
      description: data.description,
      idempotencyKey: 'idemp-daily-' + Date.now(),
      submittedAt: new Date().toISOString(),
      totalAmount: 0,
      itemCount: 0,
      organizationId: 'org-1',
      items: [],
      extraWorks: [],
      attachments: [],
      events: [
        {
          _id: 'ev-' + Date.now(),
          reportId,
          actorUserId: currentUser._id,
          actorName: currentUser.fullName,
          actorRole: currentRole,
          action: 'submit',
          fromStatus: 'draft',
          toStatus: 'approved',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReports((prev) => [newDaily, ...prev]);
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistUpsertReport(newDaily, firebaseUser.uid, true).catch((e) => console.error(e));
    }
    addAuditLog('DAILY_REPORT_CREATED', 'WorkReport', reportId, { groupId: data.groupId });
    showToast('گزارش روزانه نظارتی با موفقیت ثبت و برای رییس کارفرما ارسال شد.', 'success');
    return true;
  };

  // 6. Strict 3-Step Work Report Approval State Machine (per .md lines 828-858)
  const advanceReportWorkflow = async (
    reportId: string,
    action: 'approve' | 'reject' | 'redo' | 'dispute' | 'settle',
    reason?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const report = reports.find((r) => r._id === reportId);
    if (!report) return { success: false, error: 'گزارش یافت نشد' };

    let nextStatus: ReportStatus = report.status;
    let nextReviewerRole: string | undefined = undefined;

    if (action === 'approve') {
      if (report.status === 'supervisor_review') {
        if (currentRole !== 'GROUP_SUPERVISOR') {
          return { success: false, error: 'فقط سرپرست گروه مجاز به تایید مرحله اول است.' };
        }
        nextStatus = 'expert_review';
        nextReviewerRole = 'EMPLOYER_EXPERT';
      } else if (report.status === 'expert_review') {
        if (currentRole !== 'EMPLOYER_EXPERT') {
          return { success: false, error: 'فقط کارشناس کارفرما مجاز به تایید مرحله دوم است.' };
        }
        nextStatus = 'employer_ceo_review';
        nextReviewerRole = 'EMPLOYER_CEO';
      } else if (report.status === 'employer_ceo_review') {
        if (currentRole !== 'EMPLOYER_CEO') {
          return { success: false, error: 'فقط رییس کارفرما مجاز به تایید نهایی است.' };
        }
        nextStatus = 'approved';
        nextReviewerRole = 'DEPUTY';

        // Award score to the technician
        const scorePoints = 120;
        const newScoreEvent: ScoreEvent = {
          _id: 'sc-' + Date.now(),
          userId: report.userId,
          userName: report.userName,
          reportId: report._id,
          score: scorePoints,
          reason: 'تایید نهایی گزارش کار توسط رییس کارفرما',
          createdByRole: currentRole,
          createdAt: new Date().toISOString(),
        };
        setScores((prev) => [newScoreEvent, ...prev]);

        setUsers((prev) =>
          prev.map((u) => (u._id === report.userId ? { ...u, score: (u.score || 0) + scorePoints } : u))
        );

        if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
          persistCreateScoreEvent(newScoreEvent, firebaseUser.uid).catch((e) => console.error(e));
        }

        const scoreNotif: Notification = {
          _id: 'notif-score-' + Date.now(),
          userId: report.userId,
          title: `افزایش امتیاز حرفه‌ای (+${scorePoints})`,
          message: `گزارش شماره ${report._id} تایید نهایی گردید و ${scorePoints} امتیاز به سابقه شما افزوده شد.`,
          type: 'success',
          priority: 'normal',
          isRead: false,
          entity: 'report',
          entityId: report._id,
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [scoreNotif, ...prev]);
      } else {
        return { success: false, error: 'وضعیت فعلی گزارش امکان تایید مرحله‌ای ندارد.' };
      }
    } else if (action === 'settle') {
      if (currentRole !== 'DEPUTY' || report.status !== 'approved') {
        return { success: false, error: 'تنها معاونت بهره‌برداری بر روی گزارش تایید نهایی‌شده مجاز به ثبت تسویه است.' };
      }
      nextStatus = 'settled';
    } else if (action === 'reject') {
      const allowedReject =
        (report.status === 'supervisor_review' && currentRole === 'GROUP_SUPERVISOR') ||
        (report.status === 'expert_review' && currentRole === 'EMPLOYER_EXPERT') ||
        (report.status === 'employer_ceo_review' && currentRole === 'EMPLOYER_CEO');
      if (!allowedReject) return { success: false, error: 'عدم مجوز رد گزارش در این مرحله.' };
      if (!reason?.trim()) return { success: false, error: 'ذکر دلیل رد الزامی است.' };
      nextStatus = 'rejected';
    } else if (action === 'redo') {
      const allowedRedo =
        (report.status === 'supervisor_review' && currentRole === 'GROUP_SUPERVISOR') ||
        (report.status === 'expert_review' && currentRole === 'EMPLOYER_EXPERT');
      if (!allowedRedo) return { success: false, error: 'عدم مجوز درخواست انجام مجدد در این مرحله.' };
      if (!reason?.trim()) return { success: false, error: 'ذکر توضیحات و موارد نیازمند اصلاح الزامی است.' };
      nextStatus = 'redo_requested';
      nextReviewerRole = 'TECHNICIAN';
    } else if (action === 'dispute') {
      if (currentRole !== 'EMPLOYER_CEO' || report.status !== 'employer_ceo_review') {
        return { success: false, error: 'ایجاد اختلاف صرفاً در مرحله تایید رییس کارفرما مجاز است.' };
      }
      if (!reason?.trim()) return { success: false, error: 'ذکر مستندات اختلاف الزامی است.' };
      nextStatus = 'disputed';
    }

    const newEvent: ApprovalEvent = {
      _id: 'ev-' + Date.now(),
      reportId: report._id,
      actorUserId: currentUser._id,
      actorName: currentUser.fullName,
      actorRole: currentRole,
      action,
      fromStatus: report.status,
      toStatus: nextStatus,
      reason,
      createdAt: new Date().toISOString(),
    };

    const updatedReportObj: WorkReport = {
      ...report,
      status: nextStatus,
      currentReviewerRole: nextReviewerRole,
      events: [...report.events, newEvent],
      updatedAt: new Date().toISOString(),
    };

    setReports((prev) => prev.map((r) => (r._id === reportId ? updatedReportObj : r)));
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistUpsertReport(updatedReportObj, firebaseUser.uid, false).catch((e) => console.error(e));
    }

    addAuditLog(`WORKFLOW_${action.toUpperCase()}`, 'WorkReport', reportId, {
      fromStatus: report.status,
      toStatus: nextStatus,
      reason,
    });

    showToast(`عملیات ${getWorkflowActionPersian(action)} با موفقیت انجام شد`, 'success');
    return { success: true };
  };

  // 7. Extra Work Item Mapping (strictly RESIDENT_REP)
  const mapExtraWork = async (
    extraWorkId: string,
    mappedPriceItemId: string,
    mappedQuantity: number,
    note?: string
  ): Promise<boolean> => {
    if (currentRole !== 'RESIDENT_REP') {
      showToast('فقط نماینده مقیم مجاز به معادل‌سازی کار اضافی است.', 'error');
      return false;
    }
    const targetPriceItem = priceItems.find((p) => p._id === mappedPriceItemId);
    const amount = targetPriceItem ? targetPriceItem.unitPrice * mappedQuantity : 0;

    let updated = false;
    let updatedRepObj: WorkReport | null = null;
    const nextReports = reports.map((rep) => {
      const itemIdx = rep.extraWorks.findIndex((ew) => ew._id === extraWorkId);
      if (itemIdx === -1) return rep;
      updated = true;
      const newExtraWorks = [...rep.extraWorks];
      newExtraWorks[itemIdx] = {
        ...newExtraWorks[itemIdx],
        status: 'mapped',
        mappedPriceItemId,
        mappedQuantity,
        mappedAmount: amount,
        mappedByUserId: currentUser._id,
        mappedByName: currentUser.fullName,
        mappingNote: note,
        updatedAt: new Date().toISOString(),
      };
      updatedRepObj = {
        ...rep,
        extraWorks: newExtraWorks,
        totalAmount: rep.totalAmount + amount,
        updatedAt: new Date().toISOString(),
      };
      return updatedRepObj;
    });
    if (updated) {
      setReports(nextReports);
      if (updatedRepObj && isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
        persistUpsertReport(updatedRepObj, firebaseUser.uid, false).catch((e) => console.error(e));
      }
      addAuditLog('EXTRA_WORK_MAPPED', 'ExtraWorkItem', extraWorkId, {
        mappedPriceItemId,
        mappedQuantity,
        mappedAmount: amount,
      });
      showToast('کار اضافی با موفقیت به آیتم فهرست بها معادل‌سازی شد', 'success');
    }
    return updated;
  };

  const rejectExtraWork = async (extraWorkId: string, note?: string): Promise<boolean> => {
    if (currentRole !== 'RESIDENT_REP') {
      showToast('فقط نماینده مقیم مجاز به رد کار اضافی است.', 'error');
      return false;
    }
    let updatedRepObj: WorkReport | null = null;
    setReports((prev) =>
      prev.map((rep) => {
        if (!rep.extraWorks.some((ew) => ew._id === extraWorkId)) return rep;
        updatedRepObj = {
          ...rep,
          extraWorks: rep.extraWorks.map((ew) =>
            ew._id === extraWorkId
              ? { ...ew, status: 'rejected', mappingNote: note, updatedAt: new Date().toISOString() }
              : ew
          ),
          updatedAt: new Date().toISOString(),
        };
        return updatedRepObj;
      })
    );
    if (updatedRepObj && isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistUpsertReport(updatedRepObj, firebaseUser.uid, false).catch((e) => console.error(e));
    }
    addAuditLog('EXTRA_WORK_REJECTED', 'ExtraWorkItem', extraWorkId, { note });
    showToast('کار اضافی رد شد', 'info');
    return true;
  };

  // 8. Purchase Request Workflow
  const createPurchaseRequest = async (data: Partial<PurchaseRequest>): Promise<boolean> => {
    if (!['TECHNICIAN', 'GROUP_SUPERVISOR', 'RESIDENT_REP'].includes(currentRole)) {
      showToast('نقش جاری مجاز به ثبت درخواست خرید نیست.', 'error');
      return false;
    }
    const newPr: PurchaseRequest = {
      _id: 'pr-' + Date.now(),
      title: data.title || 'درخواست خرید تجهیزات و متریال',
      description: data.description,
      amount: data.amount || 0,
      quantity: data.quantity || 1,
      unit: data.unit || 'عدد',
      priority: data.priority || 'medium',
      requestedByUserId: currentUser._id,
      requestedByName: currentUser.fullName,
      status: 'pending',
      groupId: data.groupId || (currentUser.groupIds && currentUser.groupIds[0]),
      groupName: groups.find((g) => g._id === data.groupId)?.name || 'گروه تست و اورهال',
      contractId: 'cnt-1',
      companyId: currentUser.companyId || 'comp-1',
      organizationId: 'org-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPurchases((prev) => [newPr, ...prev]);
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistUpsertPurchase(newPr, firebaseUser.uid, true).catch((e) => console.error(e));
    }
    addAuditLog('PURCHASE_CREATED', 'PurchaseRequest', newPr._id, { amount: newPr.amount });
    showToast('درخواست خرید با موفقیت ایجاد شد و برای نماینده مقیم ارسال گردید.', 'success');
    return true;
  };

  const updatePurchaseStatus = async (
    purchaseId: string,
    status: 'approved' | 'rejected' | 'paid' | 'cancelled',
    rejectionReason?: string
  ): Promise<boolean> => {
    if (status === 'paid' && currentRole !== 'RESIDENT_REP') {
      showToast('ثبت پرداخت خرید فقط در اختیار نماینده مقیم است.', 'error');
      return false;
    }
    if ((status === 'approved' || status === 'rejected') && !['RESIDENT_REP', 'CONTRACTOR_CEO'].includes(currentRole)) {
      showToast('فقط نماینده مقیم یا رییس شرکت پیمانکار مجاز به تایید یا رد درخواست خرید هستند.', 'error');
      return false;
    }

    const targetPr = purchases.find((p) => p._id === purchaseId);
    if (targetPr) {
      const updatedPr: PurchaseRequest = {
        ...targetPr,
        status,
        approvedByUserId: status === 'approved' ? currentUser._id : targetPr.approvedByUserId,
        approvedByName: status === 'approved' ? currentUser.fullName : targetPr.approvedByName,
        rejectionReason,
        updatedAt: new Date().toISOString(),
      };
      setPurchases((prev) => prev.map((p) => (p._id === purchaseId ? updatedPr : p)));
      if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
        persistUpsertPurchase(updatedPr, firebaseUser.uid, false).catch((e) => console.error(e));
      }
    }
    addAuditLog(`PURCHASE_${status.toUpperCase()}`, 'PurchaseRequest', purchaseId, { rejectionReason });
    showToast(`وضعیت درخواست خرید به "${status === 'approved' ? 'تاییدشده' : status === 'rejected' ? 'ردشده' : status === 'paid' ? 'پرداخت‌شده' : status}" تغییر یافت`, 'info');
    return true;
  };

  // 9. Statement Workflow (صورت‌وضعیت)
  const createStatement = async (contractId: string, periodStart: string, periodEnd: string): Promise<boolean> => {
    if (currentRole !== 'CONTRACTOR_CEO') {
      showToast('فقط رییس شرکت پیمانکار مجاز به صدور صورت‌وضعیت است.', 'error');
      return false;
    }

    const eligibleReports = reports.filter(
      (r) => r.contractId === contractId && r.status === 'approved' && (!currentUser.companyId || r.companyId === currentUser.companyId)
    );

    if (eligibleReports.length === 0) {
      showToast('هیچ گزارش تایید نهایی‌شده‌ای برای صدور صورت‌وضعیت یافت نشد.', 'warning');
      return false;
    }

    const totalAmount = eligibleReports.reduce((acc, r) => acc + r.totalAmount, 0);
    const newStmt: Statement = {
      _id: 'stmt-' + Date.now(),
      title: `صورت‌وضعیت موقت دوره ${periodStart} لغایت ${periodEnd}`,
      code: `SV-${Date.now().toString().slice(-6)}`,
      description: `شامل ${eligibleReports.length} گزارش تایید نهایی شده پیمانکار`,
      amount: totalAmount,
      contractorUserId: currentUser._id,
      contractorName: currentUser.fullName,
      contractorCompanyId: currentUser.companyId || 'comp-1',
      contractorCompanyName: companies.find((c) => c._id === currentUser.companyId)?.name || 'مهندسی نیرو توان پارس',
      contractId,
      contractTitle: contracts.find((c) => c._id === contractId)?.title || 'قرارداد پست‌های انتقال',
      periodStartJalali: periodStart,
      periodEndJalali: periodEnd,
      status: 'employer_ceo_review',
      reportIds: eligibleReports.map((r) => r._id),
      reportsCount: eligibleReports.length,
      organizationId: 'org-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStatements((prev) => [newStmt, ...prev]);
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistUpsertStatement(newStmt, firebaseUser.uid, true).catch((e) => console.error(e));
    }
    addAuditLog('STATEMENT_CREATED', 'Statement', newStmt._id, {
      amount: totalAmount,
      reportsCount: eligibleReports.length,
      nextStage: 'employer_ceo_review',
    });

    const targetCeo = users.find((u) => u.role === 'EMPLOYER_CEO');
    if (targetCeo) {
      setNotifications((prev) => [
        {
          _id: 'notif-stmt-' + Date.now(),
          userId: targetCeo._id,
          title: 'صورت‌وضعیت جدید برای تایید مرحله ۱',
          message: `صورت‌وضعیت ${newStmt.code} توسط ${currentUser.fullName} صادر و منتظر تایید شما است.`,
          type: 'info',
          priority: 'high',
          isRead: false,
          entity: 'statement',
          entityId: newStmt._id,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    showToast(
      `صورت‌وضعیت به مبلغ ${Math.round(totalAmount / 10).toLocaleString('fa-IR').replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])} تومان ثبت و برای تایید رییس کارفرما ارسال شد`,
      'success'
    );
    return true;
  };

  const updateStatementStatus = async (
    statementId: string,
    status: 'approved' | 'rejected' | 'paid',
    rejectionReason?: string
  ): Promise<boolean> => {
    const stmt = statements.find((s) => s._id === statementId);
    if (!stmt) {
      showToast('صورت‌وضعیت یافت نشد.', 'error');
      return false;
    }

    let nextStatus: Statement['status'] = stmt.status;
    let successMsg = '';
    let notifyRole: Role | null = null;

    if (status === 'rejected') {
      const canRejectHere =
        (currentRole === 'EMPLOYER_CEO' && (stmt.status === 'employer_ceo_review' || stmt.status === 'pending')) ||
        (currentRole === 'EMPLOYER_MANAGER' && stmt.status === 'employer_manager_review') ||
        (currentRole === 'DEPUTY' && stmt.status === 'deputy_review');

      if (!canRejectHere) {
        showToast('نقش جاری در این مرحله مجاز به رد صورت‌وضعیت نیست.', 'error');
        return false;
      }
      nextStatus = 'rejected';
      successMsg = 'صورت‌وضعیت با ثبت دلیل رد شد.';
    } else if (status === 'approved') {
      if (currentRole === 'EMPLOYER_CEO' && (stmt.status === 'employer_ceo_review' || stmt.status === 'pending')) {
        nextStatus = 'employer_manager_review';
        notifyRole = 'EMPLOYER_MANAGER';
        successMsg = 'صورت‌وضعیت توسط رییس کارفرما تایید و به کارتابل مدیر کارفرما ارجاع شد.';
      } else if (currentRole === 'EMPLOYER_MANAGER' && stmt.status === 'employer_manager_review') {
        nextStatus = 'deputy_review';
        notifyRole = 'DEPUTY';
        successMsg = 'صورت‌وضعیت توسط مدیر کارفرما تایید و برای معاونت بهره‌برداری ارسال شد.';
      } else if (currentRole === 'DEPUTY' && stmt.status === 'deputy_review') {
        nextStatus = 'approved';
        successMsg = 'صورت‌وضعیت به تایید نهایی معاونت بهره‌برداری رسید و آماده پرداخت شد.';
      } else {
        showToast('نقش جاری در این مرحله مجاز به تایید صورت‌وضعیت نیست.', 'error');
        return false;
      }
    } else if (status === 'paid') {
      if (currentRole !== 'DEPUTY' || stmt.status !== 'approved') {
        showToast('ثبت حواله و پرداخت قطعی فقط پس از تایید نهایی و توسط معاونت بهره‌برداری مجاز است.', 'error');
        return false;
      }
      nextStatus = 'paid';
      successMsg = 'حواله پرداخت صورت‌وضعیت با موفقیت ثبت و تسویه شد.';
    }

    const updatedStmt: Statement = {
      ...stmt,
      status: nextStatus,
      approvedByUserId: currentUser._id,
      approvedByName: currentUser.fullName,
      approvedAt: new Date().toLocaleDateString('fa-IR'),
      rejectionReason: status === 'rejected' ? rejectionReason : stmt.rejectionReason,
      updatedAt: new Date().toISOString(),
    };
    setStatements((prev) => prev.map((s) => (s._id === statementId ? updatedStmt : s)));
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistUpsertStatement(updatedStmt, firebaseUser.uid, false).catch((e) => console.error(e));
    }

    if (notifyRole) {
      const targetUser = users.find((u) => u.role === notifyRole);
      if (targetUser) {
        setNotifications((prev) => [
          {
            _id: 'notif-stmt-' + Date.now(),
            userId: targetUser._id,
            title: 'صورت‌وضعیت جدید در کارتابل تایید',
            message: `صورت‌وضعیت ${stmt.code} توسط ${currentUser.fullName} تایید و به کارتابل شما ارجاع شد.`,
            type: 'info',
            priority: 'high',
            isRead: false,
            entity: 'statement',
            entityId: statementId,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    }

    addAuditLog(`STATEMENT_${nextStatus.toUpperCase()}`, 'Statement', statementId, {
      actorRole: currentRole,
      fromStatus: stmt.status,
      toStatus: nextStatus,
      rejectionReason,
    });
    showToast(successMsg, 'success');
    return true;
  };

  // 10. Tasks
  const createTask = async (data: Partial<Task>): Promise<boolean> => {
    if (!['EMPLOYER_MANAGER', 'EMPLOYER_CEO', 'EMPLOYER_EXPERT', 'GROUP_SUPERVISOR', 'CONTRACTOR_CEO'].includes(currentRole)) {
      showToast('نقش جاری مجاز به تعریف یا ارجاع کار نیست.', 'error');
      return false;
    }
    const newTask: Task = {
      _id: 'tsk-' + Date.now(),
      title: data.title || 'کار جدید',
      description: data.description,
      createdByUserId: currentUser._id,
      createdByName: currentUser.fullName,
      assignedUserIds: data.assignedUserIds || ['usr-technician'],
      assignedGroupIds: data.assignedGroupIds || ['grp-1'],
      stationId: data.stationId,
      stationName: data.stationName,
      dispatchCode: data.dispatchCode,
      priority: data.priority || 'medium',
      dueDateJalali: data.dueDateJalali || '۱۴۰۳/۰۹/۰۱',
      status: 'open',
      sourceRole: currentRole,
      organizationId: 'org-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistUpsertTask(newTask, firebaseUser.uid, true).catch((e) => console.error(e));
    }

    newTask.assignedUserIds.forEach((uid) => {
      setNotifications((prev) => [
        {
          _id: 'notif-tsk-' + Date.now() + '-' + uid,
          userId: uid,
          title: 'ارجاع مأموریت و کار جدید',
          message: `وظیفه «${newTask.title}» توسط ${currentUser.fullName} به شما ارجاع شد.`,
          type: 'info',
          priority: newTask.priority === 'urgent' ? 'high' : 'normal',
          isRead: false,
          entity: 'task',
          entityId: newTask._id,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    addAuditLog('TASK_CREATED', 'Task', newTask._id, {
      priority: newTask.priority,
      assignedUserIds: newTask.assignedUserIds,
    });
    showToast('وظیفه جدید با موفقیت ارجاع داده شد.', 'success');
    return true;
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']): Promise<boolean> => {
    const targetTask = tasks.find((t) => t._id === taskId);
    if (targetTask) {
      const updatedTask: Task = {
        ...targetTask,
        status,
        completedAt: status === 'done' ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updatedTask : t)));
      if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
        persistUpsertTask(updatedTask, firebaseUser.uid, false).catch((e) => console.error(e));
      }
    }
    addAuditLog('TASK_STATUS_UPDATED', 'Task', taskId, { status });
    showToast(`وضعیت کار به "${status === 'in_progress' ? 'در حال اجرا' : status === 'done' ? 'تکمیل شده' : status}" تغییر یافت.`, 'info');
    return true;
  };

  // 11. Price Item Management (strictly CONTRACTOR_CEO)
  const createPriceItem = async (data: Partial<PriceItem>): Promise<boolean> => {
    if (currentRole !== 'CONTRACTOR_CEO') {
      showToast('فقط رییس شرکت پیمانکار مجاز به افزودن آیتم فهرست بها است.', 'error');
      return false;
    }
    const newItem: PriceItem = {
      _id: 'pi-' + Date.now(),
      code: data.code || `FA-${Math.floor(Math.random() * 9000 + 1000)}`,
      title: data.title || '',
      unit: data.unit || 'عدد',
      unitPrice: data.unitPrice || 0,
      contractId: data.contractId || 'cnt-1',
      groupIds: data.groupIds || ['grp-1'],
      category: data.category || 'عمومی',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPriceItems((prev) => [newItem, ...prev]);
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistUpsertPriceItem(newItem, firebaseUser.uid, true).catch((e) => console.error(e));
    }
    addAuditLog('PRICE_ITEM_CREATED', 'PriceItem', newItem._id, { code: newItem.code, unitPrice: newItem.unitPrice });
    showToast('آیتم جدید فهرست بها اضافه شد.', 'success');
    return true;
  };

  const updatePriceItem = async (id: string, data: Partial<PriceItem>): Promise<boolean> => {
    if (currentRole !== 'CONTRACTOR_CEO') {
      showToast('فقط رییس شرکت پیمانکار مجاز به ویرایش فهرست بها است.', 'error');
      return false;
    }
    const existingItem = priceItems.find((p) => p._id === id);
    if (existingItem) {
      const updatedItem: PriceItem = { ...existingItem, ...data, updatedAt: new Date().toISOString() };
      setPriceItems((prev) => prev.map((p) => (p._id === id ? updatedItem : p)));
      if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
        persistUpsertPriceItem(updatedItem, firebaseUser.uid, false).catch((e) => console.error(e));
      }
    }
    addAuditLog('PRICE_ITEM_UPDATED', 'PriceItem', id, {
      newPrice: data.unitPrice,
      note: 'Snapshot Architecture: گزارش‌های ثبت‌شده قبلی از این تغییر قیمت مصون هستند.',
    });
    showToast('آیتم فهرست بها بروزرسانی گردید (قیمت گزارش‌های قبلی ثابت می‌ماند).', 'info');
    return true;
  };

  // 11b. Groups, Companies, Contracts & Users Management
  const createGroup = async (data: {
    name: string;
    description: string;
    specialty?: WorkGroupSpecialty;
    supervisorUserId: string;
    memberIds: string[];
  }): Promise<boolean> => {
    if (currentRole !== 'CONTRACTOR_CEO') {
      showToast('فقط رییس شرکت پیمانکار مجاز به ایجاد گروه عملیاتی است.', 'error');
      return false;
    }
    const nextMemberIds = Array.from(new Set(data.supervisorUserId ? [data.supervisorUserId, ...data.memberIds] : data.memberIds));
    const newGroup: WorkGroup = {
      _id: 'grp-' + (groups.length + 1),
      name: data.name,
      description: data.description,
      specialty: data.specialty || 'general',
      companyId: currentUser.companyId || 'comp-1',
      contractId: 'cnt-1',
      organizationId: currentUser.organizationId,
      supervisorUserId: data.supervisorUserId,
      observerUserIds: [],
      unitId: 'unit-1',
      memberIds: nextMemberIds,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setGroups((prev) => [...prev, newGroup]);
    setUsers((prev) =>
      prev.map((u) =>
        nextMemberIds.includes(u._id)
          ? { ...u, groupIds: Array.from(new Set([...(u.groupIds || []), newGroup._id])) }
          : u
      )
    );
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistUpsertWorkGroup(newGroup, firebaseUser.uid, true).catch((e) => console.error(e));
    }
    addAuditLog('GROUP_CREATED', 'WorkGroup', newGroup._id, { name: newGroup.name, specialty: newGroup.specialty });
    showToast('گروه عملیاتی جدید با موفقیت ایجاد شد.', 'success');
    return true;
  };

  const updateGroup = async (
    groupId: string,
    data: {
      name: string;
      description: string;
      specialty?: WorkGroupSpecialty;
      supervisorUserId: string;
      memberIds: string[];
      isActive?: boolean;
    }
  ): Promise<boolean> => {
    if (currentRole !== 'CONTRACTOR_CEO') {
      showToast('فقط رییس شرکت پیمانکار مجاز به ویرایش گروه‌های کاری است.', 'error');
      return false;
    }
    const targetGrp = groups.find((g) => g._id === groupId);
    if (!targetGrp) return false;

    const cleanName = data.name.trim();
    if (cleanName.length < 2 || cleanName.length > 160) {
      showToast('نام گروه باید بین ۲ تا ۱۶۰ کاراکتر باشد.', 'error');
      return false;
    }

    const nextMemberIds = Array.from(
      new Set(data.supervisorUserId ? [data.supervisorUserId, ...data.memberIds] : data.memberIds)
    );
    const updatedGrp: WorkGroup = {
      ...targetGrp,
      name: cleanName,
      description: data.description.trim(),
      specialty: data.specialty ?? targetGrp.specialty ?? 'general',
      supervisorUserId: data.supervisorUserId,
      memberIds: nextMemberIds,
      isActive: data.isActive !== undefined ? data.isActive : targetGrp.isActive,
      updatedAt: new Date().toISOString(),
    };

    setGroups((prev) => prev.map((g) => (g._id === groupId ? updatedGrp : g)));
    setUsers((prev) =>
      prev.map((u) => {
        const currentGroupIds = u.groupIds || [];
        const shouldBeMember = nextMemberIds.includes(u._id);
        const alreadyListed = currentGroupIds.includes(groupId);
        if (shouldBeMember && !alreadyListed) {
          return { ...u, groupIds: [...currentGroupIds, groupId] };
        }
        if (!shouldBeMember && alreadyListed) {
          return { ...u, groupIds: currentGroupIds.filter((gid) => gid !== groupId) };
        }
        return u;
      })
    );
    if (cleanName !== targetGrp.name) {
      setReports((prev) =>
        prev.map((r) => (r.groupId === groupId ? { ...r, groupName: cleanName } : r))
      );
      setPurchases((prev) =>
        prev.map((p) => (p.groupId === groupId ? { ...p, groupName: cleanName } : p))
      );
    }

    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistUpsertWorkGroup(updatedGrp, firebaseUser.uid, false).catch((e) => console.error(e));
    }
    addAuditLog('GROUP_UPDATED', 'WorkGroup', groupId, {
      previousName: targetGrp.name,
      newName: cleanName,
      supervisorUserId: data.supervisorUserId,
      membersCount: nextMemberIds.length,
      isActive: updatedGrp.isActive,
    });
    showToast(`اطلاعات گروه «${cleanName}» با موفقیت به‌روزرسانی شد.`, 'success');
    return true;
  };

  const toggleGroupMember = async (groupId: string, userId: string): Promise<boolean> => {
    if (currentRole !== 'CONTRACTOR_CEO') return false;
    const targetGrp = groups.find((g) => g._id === groupId);
    if (targetGrp) {
      const exists = targetGrp.memberIds.includes(userId);
      const updatedGrp: WorkGroup = {
        ...targetGrp,
        memberIds: exists ? targetGrp.memberIds.filter((m) => m !== userId) : [...targetGrp.memberIds, userId],
        updatedAt: new Date().toISOString(),
      };
      setGroups((prev) => prev.map((g) => (g._id === groupId ? updatedGrp : g)));
      setUsers((prev) =>
        prev.map((u) => {
          if (u._id !== userId) return u;
          const currentGroupIds = u.groupIds || [];
          return {
            ...u,
            groupIds: exists
              ? currentGroupIds.filter((gid) => gid !== groupId)
              : Array.from(new Set([...currentGroupIds, groupId])),
          };
        })
      );
      if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
        persistUpsertWorkGroup(updatedGrp, firebaseUser.uid, false).catch((e) => console.error(e));
      }
    }
    addAuditLog('GROUP_MEMBERSHIP_UPDATED', 'WorkGroup', groupId, { userId });
    showToast('ترکیب اعضای گروه به‌روزرسانی شد.', 'info');
    return true;
  };

  const assignEmployerObserver = async (groupId: string, observerUserId: string): Promise<boolean> => {
    if (currentRole !== 'EMPLOYER_CEO') {
      showToast('فقط رییس کارفرما مجاز به تخصیص ناظر به گروه‌های واحد است.', 'error');
      return false;
    }
    const targetGrp = groups.find((g) => g._id === groupId);
    if (targetGrp) {
      const currentObs = targetGrp.observerUserIds || [];
      const nextObs = currentObs.includes(observerUserId)
        ? currentObs.filter((id) => id !== observerUserId)
        : [...currentObs, observerUserId];
      const updatedGrp: WorkGroup = { ...targetGrp, observerUserIds: nextObs, updatedAt: new Date().toISOString() };
      setGroups((prev) => prev.map((g) => (g._id === groupId ? updatedGrp : g)));
      if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
        persistUpsertWorkGroup(updatedGrp, firebaseUser.uid, false).catch((e) => console.error(e));
      }
    }
    addAuditLog('EMPLOYER_OBSERVER_ASSIGNED', 'WorkGroup', groupId, { observerUserId });
    showToast('ناظر کارفرما به گروه تخصیص یافت (مالکیت پرسنل پیمانکار تغییر نکرد).', 'success');
    return true;
  };

  const createCompany = async (data: {
    name: string;
    code: string;
    phone?: string;
    address?: string;
    description?: string;
  }): Promise<boolean> => {
    if (currentRole !== 'DEPUTY') {
      showToast('فقط معاونت بهره‌برداری مجاز به ثبت شرکت پیمانکار است.', 'error');
      return false;
    }
    const newComp: Company = {
      _id: 'comp-' + (companies.length + 1),
      name: data.name,
      code: data.code,
      organizationId: 'org-2',
      phone: data.phone || '۰۵۴-۳۳۲۰۰۰۰۰',
      address: data.address || 'زاهدان',
      description: data.description,
      isActive: true,
      activeContractsCount: 0,
      totalPersonnelCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCompanies((prev) => [newComp, ...prev]);
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistCreateCompany(newComp, firebaseUser.uid).catch((e) => console.error(e));
    }
    addAuditLog('COMPANY_CREATED', 'Company', newComp._id, { name: newComp.name });
    showToast('شرکت پیمانکار جدید ثبت شد.', 'success');
    return true;
  };

  const createContract = async (data: Partial<Contract>): Promise<boolean> => {
    if (currentRole !== 'DEPUTY') {
      showToast('فقط معاونت بهره‌برداری مجاز به ثبت قرارداد است.', 'error');
      return false;
    }
    const newCnt: Contract = {
      _id: 'cnt-' + (contracts.length + 1),
      title: data.title || 'قرارداد جدید نگهداری پست‌های انتقال',
      contractNumber: data.contractNumber || `TR-1403/${Math.floor(1000 + Math.random() * 9000)}`,
      employerCompanyId: 'org-1',
      contractorCompanyId: data.contractorCompanyId || 'comp-1',
      startDateJalali: data.startDateJalali || '۱۴۰۳/۰۱/۰۱',
      endDateJalali: data.endDateJalali || '۱۴۰۴/۱۲/۲۹',
      description: data.description,
      totalAmount: data.totalAmount || 50000000000,
      type: data.type || 'فهرست بهایی',
      status: 'active',
      organizationId: 'org-1',
      unitId: data.unitId || 'unit-1',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setContracts((prev) => [newCnt, ...prev]);
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistCreateContract(newCnt, firebaseUser.uid).catch((e) => console.error(e));
    }
    addAuditLog('CONTRACT_CREATED', 'Contract', newCnt._id, { contractNumber: newCnt.contractNumber });
    showToast('قرارداد جدید با موفقیت ثبت شد.', 'success');
    return true;
  };

  const createUser = async (data: {
    fullName: string;
    mobile: string;
    role: Role;
    groupIds?: string[];
    unitId?: string;
  }): Promise<boolean> => {
    if (currentRole === 'CONTRACTOR_CEO') {
      if (!['TECHNICIAN', 'GROUP_SUPERVISOR', 'RESIDENT_REP'].includes(data.role)) {
        showToast('رییس پیمانکار فقط مجاز به تعریف تکنسین، سرپرست گروه یا نماینده مقیم است.', 'error');
        return false;
      }
    } else if (currentRole === 'DEPUTY') {
      // Deputy can create employer or contractor accounts
    } else {
      return false;
    }

    const cleanMobile = normalizeIranMobile(data.mobile);
    if (cleanMobile.length < 8 || cleanMobile.length > 20) {
      showToast('شماره موبایل معتبر نیست (باید شامل ۱۰ تا ۱۱ رقم باشد).', 'error');
      return false;
    }
    const isEmployerSide = ['DEPUTY', 'EMPLOYER_MANAGER', 'EMPLOYER_CEO', 'EMPLOYER_EXPERT'].includes(data.role);

    const newUsr: User = {
      _id: 'usr-' + Date.now().toString().slice(-6),
      fullName: data.fullName.trim(),
      mobile: cleanMobile,
      hashedMobile: 'sha256_' + cleanMobile,
      encryptedMobile: `AES256GCM:${cleanMobile.slice(1, 4)}***${cleanMobile.slice(-4)}`,
      role: data.role,
      organizationId: isEmployerSide ? 'org-1' : 'org-2',
      companyId: !isEmployerSide ? currentUser.companyId || 'comp-1' : undefined,
      unitId: data.unitId || 'unit-1',
      groupIds: data.groupIds || [],
      score: data.role === 'TECHNICIAN' ? 0 : undefined,
      isActive: true,
      loginCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUsr, ...prev]);
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistCreateUser(newUsr, firebaseUser.uid).catch((e) => console.error(e));
    }
    addAuditLog('USER_CREATED', 'User', newUsr._id, { role: newUsr.role, fullName: newUsr.fullName });
    showToast(`کاربر "${newUsr.fullName}" با موفقیت ثبت شد.`, 'success');
    return true;
  };

  const updateUserProfile = async (
    userId: string,
    data: { fullName: string; mobile?: string }
  ): Promise<boolean> => {
    const targetUser = users.find((u) => u._id === userId);
    if (!targetUser) return false;

    const canEdit =
      currentRole === 'DEPUTY' ||
      userId === currentUser._id ||
      (currentRole === 'CONTRACTOR_CEO' &&
        ['CONTRACTOR_CEO', 'RESIDENT_REP', 'GROUP_SUPERVISOR', 'TECHNICIAN'].includes(targetUser.role));

    if (!canEdit) {
      showToast('شما مجوز ویرایش مشخصات این جایگاه شغلی را ندارید.', 'error');
      return false;
    }

    const cleanName = data.fullName.trim();
    if (cleanName.length < 2) {
      showToast('نام و نام خانوادگی باید حداقل ۲ حرف باشد.', 'error');
      return false;
    }

    const cleanMobile = data.mobile ? normalizeIranMobile(data.mobile) : '';
    const hasValidMobile = cleanMobile.length >= 8 && cleanMobile.length <= 20;
    const updatedUserObj: User = {
      ...targetUser,
      fullName: cleanName,
      mobile: hasValidMobile ? cleanMobile : targetUser.mobile,
      hashedMobile: hasValidMobile ? 'sha256_' + cleanMobile : targetUser.hashedMobile,
      encryptedMobile: hasValidMobile
        ? `AES256GCM:${cleanMobile.slice(1, 4)}***${cleanMobile.slice(-4)}`
        : targetUser.encryptedMobile,
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update + global name propagation in local state
    setUsers((prev) => prev.map((u) => (u._id === userId ? updatedUserObj : u)));
    if (currentUser._id === userId) {
      setCurrentUser(updatedUserObj);
    }

    setReports((prev) =>
      prev.map((r) => ({
        ...r,
        userName: r.userId === userId ? cleanName : r.userName,
        events: r.events.map((ev) =>
          ev.actorUserId === userId ? { ...ev, actorName: cleanName } : ev
        ),
        extraWorks: r.extraWorks.map((ew) =>
          ew.mappedByUserId === userId ? { ...ew, mappedByName: cleanName } : ew
        ),
      }))
    );
    setTasks((prev) =>
      prev.map((t) => (t.createdByUserId === userId ? { ...t, createdByName: cleanName } : t))
    );
    setStatements((prev) =>
      prev.map((s) => ({
        ...s,
        contractorName: s.contractorUserId === userId ? cleanName : s.contractorName,
        approvedByName: s.approvedByUserId === userId ? cleanName : s.approvedByName,
      }))
    );
    setPurchases((prev) =>
      prev.map((p) => ({
        ...p,
        requestedByName: p.requestedByUserId === userId ? cleanName : p.requestedByName,
        approvedByName: p.approvedByUserId === userId ? cleanName : p.approvedByName,
      }))
    );
    setScores((prev) =>
      prev.map((sc) => (sc.userId === userId ? { ...sc, userName: cleanName } : sc))
    );
    setAuditLogs((prev) =>
      prev.map((lg) => (lg.actorUserId === userId ? { ...lg, actorName: cleanName } : lg))
    );

    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      try {
        await persistUpdateUserProfile(
          userId,
          { fullName: cleanName, mobile: cleanMobile },
          { reports, tasks, statements, purchases, scores }
        );
        addAuditLog('USER_PROFILE_UPDATED', 'User', userId, {
          previousName: targetUser.fullName,
          newName: cleanName,
          cloudPersisted: true,
        });
        showToast(
          `مشخصات «${cleanName}» با موفقیت ذخیره و در کل سامانه به‌روزرسانی شد.`,
          'success',
          'تغییرات ذخیره شد'
        );
      } catch (err) {
        console.error(err);
        showToast(`مشخصات «${cleanName}» ویرایش شد؛ برای ثبت همگانی از پنل ادمین همگام‌سازی کنید.`, 'warning');
      }
    } else {
      addAuditLog('USER_PROFILE_UPDATED', 'User', userId, {
        previousName: targetUser.fullName,
        newName: cleanName,
        cloudPersisted: false,
      });
      showToast(
        `مشخصات «${cleanName}» با موفقیت ویرایش و در سامانه ذخیره شد.`,
        'success',
        'تغییرات ذخیره شد'
      );
    }

    return true;
  };

  const toggleUserActive = async (userId: string): Promise<boolean> => {
    if (currentRole !== 'DEPUTY' && currentRole !== 'CONTRACTOR_CEO') return false;
    const target = users.find((u) => u._id === userId);
    if (!target) return false;
    const nextIsActive = !target.isActive;
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, isActive: nextIsActive, updatedAt: new Date().toISOString() } : u))
    );
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistToggleUserActive(userId, nextIsActive).catch((e) => console.error(e));
    }
    addAuditLog('USER_STATUS_TOGGLED', 'User', userId, { isActive: nextIsActive });
    showToast('وضعیت فعال‌بودن کاربر به‌روزرسانی شد.', 'info');
    return true;
  };

  // 12. Notification
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
    );
  };

  // 13. Offline Sync Queue Processor
  const processSyncQueue = async () => {
    if (!isOnline) {
      showToast('سیستم هنوز در حالت آفلاین است؛ امکان اتصال به سرور نیست.', 'error');
      return;
    }

    if (syncQueue.length === 0) {
      showToast('صف همگام‌سازی خالی است.', 'info');
      return;
    }

    showToast(`در حال همگام‌سازی ${syncQueue.length} مورد آفلاین...`, 'info');

    for (const item of syncQueue) {
      if (item.endpoint.includes('/periodic-tests')) {
        const syncedRecord: PeriodicTestRecord = {
          ...item.payload,
          updatedAt: new Date().toISOString(),
        };
        setPeriodicTests((prev) => {
          const exists = prev.some((p) => p._id === syncedRecord._id);
          return exists
            ? prev.map((p) => (p._id === syncedRecord._id ? syncedRecord : p))
            : [syncedRecord, ...prev];
        });
        if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
          persistUpsertPeriodicTest(syncedRecord, firebaseUser.uid, true).catch((e) => console.error(e));
        }
      } else if (item.endpoint.includes('/reports')) {
        setReports((prev) => [item.payload, ...prev]);
        if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
          persistUpsertReport(item.payload, firebaseUser.uid, true).catch((e) => console.error(e));
        }
      }
    }

    setSyncQueue([]);
    addAuditLog('SYNC_QUEUE_PROCESSED', 'SyncQueue', 'batch', { count: syncQueue.length });
    showToast('تمام گزارش‌ها و درخواست‌های صف آفلاین با موفقیت با سرور مرکزی همگام شدند.', 'success');
  };

  // 13b. Save & Review Periodic Test Sheet
  const savePeriodicTest = async (
    record: Omit<PeriodicTestRecord, '_id' | 'createdAt' | 'updatedAt' | 'organizationId'> & { _id?: string }
  ): Promise<{ success: boolean; id?: string; isOffline?: boolean }> => {
    const existing = record._id ? periodicTests.find((t) => t._id === record._id) : undefined;
    const isNew = !existing;
    const testId = existing?._id || 'pt-' + Date.now().toString().slice(-7);
    const nowIso = new Date().toISOString();

    const fullRecord: PeriodicTestRecord = {
      ...record,
      routes: record.routes || [],
      _id: testId,
      organizationId: currentUser.organizationId || 'org-2',
      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    if (!isOnline) {
      const queueItem: SyncQueueItem = {
        _id: 'sync-pt-' + Date.now(),
        userId: currentUser._id,
        endpoint: '/api/v1/periodic-tests',
        method: 'POST',
        payload: fullRecord,
        idempotencyKey: 'idemp-pt-' + Date.now(),
        status: 'pending',
        attempts: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setSyncQueue((prev) => [queueItem, ...prev]);
      showToast('عدم اتصال اینترنت: تست دوره‌ای در صف آفلاین ذخیره شد.', 'warning', 'ذخیره آفلاین');
      return { success: true, id: testId, isOffline: true };
    }

    setPeriodicTests((prev) =>
      isNew ? [fullRecord, ...prev] : prev.map((t) => (t._id === testId ? fullRecord : t))
    );

    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistUpsertPeriodicTest(fullRecord, firebaseUser.uid, isNew).catch((e) => console.error(e));
    }

    const detailLabel =
      fullRecord.sectionId === 'wireless'
        ? `${fullRecord.wirelessUnits?.length || 1} دستگاه بی‌سیم`
        : `${fullRecord.routes.length} مسیر`;

    addAuditLog(isNew ? 'PERIODIC_TEST_CREATED' : 'PERIODIC_TEST_UPDATED', 'PeriodicTestRecord', testId, {
      domain: fullRecord.domain,
      sectionId: fullRecord.sectionId,
      stationName: fullRecord.stationName,
      monthJalali: fullRecord.monthJalali,
      routesCount: fullRecord.routes.length,
      wirelessUnitsCount: fullRecord.wirelessUnits?.length || 0,
    });

    showToast(
      `تست دوره‌ای «${fullRecord.stationName}» (${detailLabel}) با موفقیت ثبت شد.`,
      'success',
      'تست دوره‌ای ذخیره شد'
    );
    return { success: true, id: testId };
  };

  const reviewPeriodicTest = async (
    testId: string,
    status: PeriodicTestStatus,
    reviewNote?: string
  ): Promise<boolean> => {
    const target = periodicTests.find((t) => t._id === testId);
    if (!target) return false;

    const updatedRecord: PeriodicTestRecord = {
      ...target,
      status,
      approverName:
        status === 'supervisor_approved' || status === 'expert_approved'
          ? currentUser.fullName
          : target.approverName,
      reviewNote: reviewNote !== undefined ? reviewNote : target.reviewNote,
      updatedAt: new Date().toISOString(),
    };

    setPeriodicTests((prev) => prev.map((t) => (t._id === testId ? updatedRecord : t)));
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistUpsertPeriodicTest(updatedRecord, firebaseUser.uid, false).catch((e) => console.error(e));
    }
    addAuditLog('PERIODIC_TEST_REVIEWED', 'PeriodicTestRecord', testId, { status, reviewNote });
    showToast('وضعیت تایید تست دوره‌ای به‌روزرسانی شد.', 'success');
    return true;
  };

  // 14. Update Station Communication Channel
  const updateStationChannel = (
    stationId: string,
    channelType: ChannelType,
    updates: { status?: ChannelHealthStatus; number?: string; note?: string }
  ) => {
    const targetSt = stations.find((st) => st.id === stationId);
    if (!targetSt) return;
    const updatedChannels = targetSt.channels.map((ch) =>
      ch.type === channelType
        ? {
            ...ch,
            status: updates.status ?? ch.status,
            number: updates.number !== undefined ? updates.number : ch.number,
            note: updates.note !== undefined ? updates.note : ch.note,
            rawStatus:
              updates.status === 'ok'
                ? '√'
                : updates.status === 'down'
                ? 'X'
                : updates.status === 'na'
                ? '*'
                : ch.rawStatus,
          }
        : ch
    );

    setStations((prev) =>
      prev.map((st) => (st.id === stationId ? { ...st, channels: updatedChannels } : st))
    );
    if (isCloudConnected && firebaseUser && firebaseUser.emailVerified) {
      persistStationChannels(stationId, updatedChannels, firebaseUser.uid).catch((e) => console.error(e));
    }
    addAuditLog('STATION_CHANNEL_UPDATED', 'StationCommunication', stationId, {
      channelType,
      ...updates,
    });
    showToast(`وضعیت ارتباط ${channelType} پست بروزرسانی و در دفتر ممیزی ثبت شد.`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        firebaseUser,
        isAuthReady,
        isCloudConnected,
        isCloudSyncing,
        cloudVerification,
        verifyCloudSync,
        pushLocalPersonnelToCloud,
        signInWithGoogle,
        signOutGoogle,
        currentUser,
        currentRole,
        users,
        setCurrentUserByRole,
        switchUser,
        verifyAndLoginOtp,
        logout,
        theme,
        setTheme,
        toggleTheme,
        currentRoute,
        setCurrentRoute,
        selectedReportId,
        setSelectedReportId,
        preselectedStationId,
        setPreselectedStationId,
        preselectedTaskId,
        setPreselectedTaskId,
        focusedCommStationId,
        setFocusedCommStationId,
        periodicSelection,
        setPeriodicSelection,
        reports,
        priceItems,
        tasks,
        statements,
        purchases,
        groups,
        contracts,
        companies,
        auditLogs,
        notifications,
        scores,
        syncQueue,
        settings,
        stations,
        periodicTests,
        savePeriodicTest,
        reviewPeriodicTest,
        updateStationChannel,
        isOnline,
        setIsOnline,
        processSyncQueue,
        createReport,
        resubmitReport,
        createDailyReport,
        advanceReportWorkflow,
        mapExtraWork,
        rejectExtraWork,
        createPurchaseRequest,
        updatePurchaseStatus,
        createStatement,
        updateStatementStatus,
        createTask,
        updateTaskStatus,
        createPriceItem,
        updatePriceItem,
        createGroup,
        updateGroup,
        toggleGroupMember,
        assignEmployerObserver,
        createCompany,
        createContract,
        createUser,
        updateUserProfile,
        toggleUserActive,
        markNotificationRead,
        addAuditLog,
        toasts,
        showToast,
        dismissToast,
        canUserAccess,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// Helpers for localized labels
export function getRolePersianName(role: Role): string {
  switch (role) {
    case 'DEPUTY':
      return 'معاونت بهره‌برداری (مدیر ارشد)';
    case 'EMPLOYER_MANAGER':
      return 'مدیر کارفرما (نظارت و تایید صورت‌وضعیت)';
    case 'EMPLOYER_CEO':
      return 'رییس کارفرما (تایید نهایی)';
    case 'EMPLOYER_EXPERT':
      return 'کارشناس کارفرما (ناظر مقیم)';
    case 'CONTRACTOR_CEO':
      return 'رییس شرکت پیمانکار';
    case 'RESIDENT_REP':
      return 'نماینده مقیم پیمانکار (معادل‌ساز)';
    case 'GROUP_SUPERVISOR':
      return 'سرپرست گروه عملیاتی';
    case 'TECHNICIAN':
      return 'کارشناس فنی (تکنسین)';
    default:
      return role;
  }
}

export function getStatusPersianBadge(status: ReportStatus): { label: string; color: string; bg: string } {
  switch (status) {
    case 'draft':
      return { label: 'پیش‌نویس', color: 'text-slate-400', bg: 'bg-slate-800/60 border-slate-700' };
    case 'submitted':
      return { label: 'ارسال شده', color: 'text-sky-400', bg: 'bg-sky-950/60 border-sky-800' };
    case 'supervisor_review':
      return { label: 'در انتظار تایید سرپرست', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800' };
    case 'expert_review':
      return { label: 'در انتظار کارشناس کارفرما', color: 'text-blue-400', bg: 'bg-blue-950/60 border-blue-800' };
    case 'employer_ceo_review':
      return { label: 'در انتظار تایید نهایی رییس', color: 'text-purple-400', bg: 'bg-purple-950/60 border-purple-800' };
    case 'approved':
      return { label: 'تایید نهایی شده', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800' };
    case 'rejected':
      return { label: 'رد شده', color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-800' };
    case 'redo_requested':
      return { label: 'نیازمند اصلاح و انجام مجدد', color: 'text-orange-400', bg: 'bg-orange-950/60 border-orange-800' };
    case 'disputed':
      return { label: 'دارای اختلاف', color: 'text-yellow-400', bg: 'bg-yellow-950/60 border-yellow-800' };
    case 'settled':
      return { label: 'تسویه مالی شده', color: 'text-teal-400', bg: 'bg-teal-950/60 border-teal-800' };
    default:
      return { label: status, color: 'text-slate-400', bg: 'bg-slate-800' };
  }
}

export function getWorkflowActionPersian(action: string): string {
  switch (action) {
    case 'approve':
      return 'تایید مرحله‌ای';
    case 'reject':
      return 'رد گزارش';
    case 'redo':
      return 'درخواست انجام مجدد';
    case 'dispute':
      return 'ثبت اختلاف فنی';
    case 'settle':
      return 'تسویه مالی قطعی';
    default:
      return action;
  }
}
