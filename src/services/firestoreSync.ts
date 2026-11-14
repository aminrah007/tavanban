/**
 * Firestore Real-Time Synchronization & Persistence Service
 * - Seeds initial Sistan & Baluchestan dataset idempotently when Firestore is empty
 * - Attaches live onSnapshot listeners across all organizational collections
 * - Persists personnel profile edits (names, mobile numbers, role status) & propagates changes globally
 * - Wraps all Firestore operations with structured handleFirestoreError
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  getDocsFromServer,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  limit,
  writeBatch,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import {
  db,
  FirebaseUser,
  OperationType,
  handleFirestoreError,
} from '../lib/firebase';
import {
  User,
  WorkReport,
  PriceItem,
  Task,
  Statement,
  PurchaseRequest,
  WorkGroup,
  Contract,
  Company,
  AuditLog,
  ScoreEvent,
  PeriodicTestRecord,
} from '../types';
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
  INITIAL_SCORES,
} from '../data/mockDatabase';
import { StationCommunication, ChannelHealthStatus, ChannelType } from '../data/stationsChecklist';
import { normalizeIranMobile } from '../utils/formatters';

const BOOTSTRAP_ADMIN_EMAIL = 'amintuber007@gmail.com';
const ORG_IDS = ['org-1', 'org-2'];

// ── Serialization Helpers ─────────────────────────────────────────────────────
function stripUndefined<T extends Record<string, any>>(obj: T): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) continue;
    if (Array.isArray(val)) {
      out[key] = val.map((item) =>
        item && typeof item === 'object' && !Array.isArray(item) ? stripUndefined(item) : item
      );
    } else if (val && typeof val === 'object' && typeof (val as any).toDate !== 'function') {
      out[key] = stripUndefined(val);
    } else {
      out[key] = val;
    }
  }
  return out;
}

function pickAllowed(obj: Record<string, any>, allowedKeys: string[]): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of allowedKeys) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return stripUndefined(result);
}

function normalizeDocData<T>(raw: Record<string, any>): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v && typeof v === 'object' && typeof (v as any).toDate === 'function') {
      out[k] = (v as any).toDate().toISOString();
    } else if (Array.isArray(v)) {
      out[k] = v.map((item) =>
        item && typeof item === 'object' ? normalizeDocData(item) : item
      );
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

// ── Allowlists mirroring firestore.rules ──────────────────────────────────────
const PERSONNEL_KEYS = [
  '_id', 'fullName', 'encryptedMobile', 'role', 'organizationId',
  'companyId', 'unitId', 'groupIds', 'isActive', 'score', 'loginCount', 'lastLoginAt',
];

const REPORT_KEYS = [
  '_id', 'reportType', 'userId', 'userName', 'companyId', 'companyName',
  'groupId', 'groupName', 'contractId', 'contractTitle', 'unitId', 'unitName',
  'stationId', 'stationName', 'dispatchCode', 'reportDateJalali', 'status',
  'description', 'taskReferenceId', 'offlineClientId', 'idempotencyKey',
  'submittedAt', 'currentReviewerRole', 'totalAmount', 'itemCount',
  'organizationId', 'items', 'extraWorks', 'attachments', 'events',
];

const TASK_KEYS = [
  '_id', 'title', 'description', 'createdByUserId', 'createdByName',
  'assignedUserIds', 'assignedGroupIds', 'contractId', 'groupId',
  'stationId', 'stationName', 'dispatchCode', 'priority', 'dueDateJalali',
  'status', 'completedAt', 'sourceRole', 'organizationId',
];

const STATEMENT_KEYS = [
  '_id', 'title', 'code', 'description', 'amount', 'contractorUserId',
  'contractorName', 'contractorCompanyId', 'contractorCompanyName',
  'contractId', 'contractTitle', 'periodStartJalali', 'periodEndJalali',
  'status', 'approvedAt', 'approvedByUserId', 'approvedByName',
  'rejectionReason', 'reportIds', 'reportsCount', 'organizationId',
];

const PURCHASE_KEYS = [
  '_id', 'title', 'description', 'amount', 'supplierCompanyId',
  'requestedByUserId', 'requestedByName', 'approvedByUserId', 'approvedByName',
  'status', 'priority', 'quantity', 'unit', 'groupId', 'groupName',
  'contractId', 'companyId', 'rejectionReason', 'organizationId',
];

const PRICE_ITEM_KEYS = [
  '_id', 'code', 'title', 'unit', 'unitPrice', 'contractId',
  'groupIds', 'isActive', 'category', 'organizationId',
];

const WORK_GROUP_KEYS = [
  '_id', 'name', 'description', 'specialty', 'companyId', 'contractId',
  'organizationId', 'supervisorUserId', 'observerUserIds', 'unitId',
  'memberIds', 'isActive',
];

const CONTRACT_KEYS = [
  '_id', 'title', 'contractNumber', 'employerCompanyId', 'contractorCompanyId',
  'startDateJalali', 'endDateJalali', 'description', 'totalAmount', 'type',
  'status', 'organizationId', 'unitId', 'isActive',
];

const COMPANY_KEYS = [
  '_id', 'name', 'code', 'organizationId', 'contractorCeoUserId',
  'phone', 'address', 'description', 'isActive',
  'activeContractsCount', 'totalPersonnelCount',
];

const SCORE_KEYS = [
  '_id', 'userId', 'userName', 'reportId', 'score', 'reason', 'createdByRole', 'organizationId',
];

const AUDIT_LOG_KEYS = [
  '_id', 'actorUserId', 'actorName', 'actorRole', 'action',
  'resourceType', 'resourceId', 'details', 'ipAddress', 'userAgent', 'organizationId',
];

const PERIODIC_TEST_KEYS = [
  '_id', 'domain', 'sectionId', 'subSectionId', 'stationId', 'stationName',
  'dispatchCode', 'groupId', 'groupName', 'monthJalali', 'pmDateJalali',
  'documentTitle', 'documentCode', 'revisionNumber', 'contractTitle',
  'contractNumber', 'attachmentPagesCount', 'preparerUserId', 'preparerName',
  'approverName', 'reviewNote', 'status', 'routes', 'wirelessUnits', 'attachments', 'organizationId',
];

// ── Membership & Seeding ──────────────────────────────────────────────────────
export async function ensureOrgMemberDoc(firebaseUser: FirebaseUser): Promise<void> {
  const path = `orgMembers/${firebaseUser.uid}`;
  try {
    const memberRef = doc(db, 'orgMembers', firebaseUser.uid);
    const snap = await getDoc(memberRef);
    const isAdminEmail =
      firebaseUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL && firebaseUser.emailVerified;

    if (!snap.exists()) {
      await setDoc(memberRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email || 'user@sbrec.ir',
        displayName: (firebaseUser.displayName || 'کاربر سامانه').slice(0, 120),
        assignedRole: isAdminEmail ? 'DEPUTY' : 'TECHNICIAN',
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    if (isAdminEmail) {
      const adminRef = doc(db, 'admins', firebaseUser.uid);
      const adminSnap = await getDoc(adminRef);
      if (!adminSnap.exists()) {
        await setDoc(adminRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email || BOOTSTRAP_ADMIN_EMAIL,
          createdAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export interface LocalSeedSnapshot {
  users?: User[];
  reports?: WorkReport[];
  priceItems?: PriceItem[];
  tasks?: Task[];
  statements?: Statement[];
  purchases?: PurchaseRequest[];
  groups?: WorkGroup[];
  contracts?: Contract[];
  companies?: Company[];
  scores?: ScoreEvent[];
  auditLogs?: AuditLog[];
}

export async function seedInitialFirestoreData(
  ownerUid: string,
  localSnapshot?: LocalSeedSnapshot
): Promise<boolean> {
  try {
    const existingPersonnel = await getDocs(
      query(collection(db, 'personnel'), where('organizationId', 'in', ORG_IDS), limit(1))
    );
    if (!existingPersonnel.empty) {
      return false; // Already seeded
    }

    const seedUsers = localSnapshot?.users?.length ? localSnapshot.users : INITIAL_USERS;
    const seedCompanies = localSnapshot?.companies?.length ? localSnapshot.companies : INITIAL_COMPANIES;
    const seedContracts = localSnapshot?.contracts?.length ? localSnapshot.contracts : INITIAL_CONTRACTS;
    const seedGroups = localSnapshot?.groups?.length ? localSnapshot.groups : INITIAL_GROUPS;
    const seedPriceItems = localSnapshot?.priceItems?.length ? localSnapshot.priceItems : INITIAL_PRICE_ITEMS;
    const seedReports = localSnapshot?.reports?.length ? localSnapshot.reports : INITIAL_REPORTS;
    const seedTasks = localSnapshot?.tasks?.length ? localSnapshot.tasks : INITIAL_TASKS;
    const seedStatements = localSnapshot?.statements?.length ? localSnapshot.statements : INITIAL_STATEMENTS;
    const seedPurchases = localSnapshot?.purchases?.length ? localSnapshot.purchases : INITIAL_PURCHASES;
    const seedScores = localSnapshot?.scores?.length ? localSnapshot.scores : INITIAL_SCORES;
    const seedAuditLogs = localSnapshot?.auditLogs?.length ? localSnapshot.auditLogs : INITIAL_AUDIT_LOGS;

    // Batch 1: Core entities (excluding subcollection private contacts which depend on personnel doc existence)
    const batch1 = writeBatch(db);

    for (const u of seedUsers) {
      const payload = {
        ...pickAllowed(u as any, PERSONNEL_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      batch1.set(doc(db, 'personnel', u._id), payload);
    }

    for (const comp of seedCompanies) {
      batch1.set(doc(db, 'companies', comp._id), {
        ...pickAllowed(comp as any, COMPANY_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const cnt of seedContracts) {
      batch1.set(doc(db, 'contracts', cnt._id), {
        ...pickAllowed(cnt as any, CONTRACT_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const grp of seedGroups) {
      batch1.set(doc(db, 'workGroups', grp._id), {
        ...pickAllowed(grp as any, WORK_GROUP_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const pi of seedPriceItems) {
      batch1.set(doc(db, 'priceItems', pi._id), {
        ...pickAllowed({ ...pi, organizationId: 'org-2' } as any, PRICE_ITEM_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const rep of seedReports) {
      batch1.set(doc(db, 'workReports', rep._id), {
        ...pickAllowed(
          {
            ...rep,
            companyId: rep.companyId || 'comp-1',
            contractId: rep.contractId || 'cnt-1',
          } as any,
          REPORT_KEYS
        ),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const tsk of seedTasks) {
      batch1.set(doc(db, 'tasks', tsk._id), {
        ...pickAllowed(tsk as any, TASK_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const stmt of seedStatements) {
      batch1.set(doc(db, 'statements', stmt._id), {
        ...pickAllowed(stmt as any, STATEMENT_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const pr of seedPurchases) {
      batch1.set(doc(db, 'purchases', pr._id), {
        ...pickAllowed(pr as any, PURCHASE_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const sc of seedScores) {
      batch1.set(doc(db, 'scoreEvents', sc._id), {
        ...pickAllowed({ ...sc, organizationId: 'org-2' } as any, SCORE_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
      });
    }

    for (const log of seedAuditLogs) {
      batch1.set(doc(db, 'auditLogs', log._id), {
        ...pickAllowed({ ...log, organizationId: 'org-1' } as any, AUDIT_LOG_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
      });
    }

    await batch1.commit();

    // Batch 2: Isolated PII private contact subdocuments (after parent personnel docs exist)
    const batch2 = writeBatch(db);
    for (const u of seedUsers) {
      batch2.set(doc(db, 'personnel', u._id, 'private', 'contact'), {
        _id: u._id,
        mobile: u.mobile,
        hashedMobile: u.hashedMobile,
        ownerUid,
        updatedAt: serverTimestamp(),
      });
    }
    await batch2.commit();

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seedInitialFirestoreData');
  }
}

// ── Real-Time Listeners ───────────────────────────────────────────────────────
export interface FirestoreSubscriptionCallbacks {
  onUsers: (users: User[]) => void;
  onReports: (reports: WorkReport[]) => void;
  onTasks: (tasks: Task[]) => void;
  onStatements: (statements: Statement[]) => void;
  onPurchases: (purchases: PurchaseRequest[]) => void;
  onPriceItems: (priceItems: PriceItem[]) => void;
  onGroups: (groups: WorkGroup[]) => void;
  onContracts: (contracts: Contract[]) => void;
  onCompanies: (companies: Company[]) => void;
  onScores: (scores: ScoreEvent[]) => void;
  onAuditLogs: (logs: AuditLog[]) => void;
  onStationConfigs: (overrides: Record<string, StationCommunication['channels']>) => void;
  onPeriodicTests?: (tests: PeriodicTestRecord[]) => void;
}

export function subscribeOrgCollections(
  firebaseUser: FirebaseUser,
  callbacks: FirestoreSubscriptionCallbacks
): () => void {
  const unsubscribers: Unsubscribe[] = [];
  const isBootstrapAdmin =
    firebaseUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL && firebaseUser.emailVerified;

  // 1. Personnel + private contact merge
  const personnelQuery = query(
    collection(db, 'personnel'),
    where('organizationId', 'in', ORG_IDS)
  );
  unsubscribers.push(
    onSnapshot(
      personnelQuery,
      async (snap) => {
        if (snap.empty) return;
        const baseUsers = snap.docs.map((d) => normalizeDocData<User>(d.data()));

        // Merge private contact details where permitted (admin or owner)
        const hydrated = await Promise.all(
          baseUsers.map(async (u) => {
            const fallbackSeed = INITIAL_USERS.find((s) => s._id === u._id);
            let mobile = u.mobile || fallbackSeed?.mobile || '';
            let hashedMobile = u.hashedMobile || fallbackSeed?.hashedMobile || '';

            if (isBootstrapAdmin || (u as any).ownerUid === firebaseUser.uid) {
              try {
                const contactSnap = await getDoc(doc(db, 'personnel', u._id, 'private', 'contact'));
                if (contactSnap.exists()) {
                  const contactData = contactSnap.data();
                  mobile = contactData.mobile || mobile;
                  hashedMobile = contactData.hashedMobile || hashedMobile;
                }
              } catch {
                // Non-owner read safely ignored
              }
            }
            return {
              ...u,
              mobile,
              hashedMobile,
            } as User;
          })
        );
        callbacks.onUsers(hydrated);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'personnel')
    )
  );

  // Helper for standard org-scoped collection subscriptions
  const subscribeCollection = <T>(
    colName: string,
    handler: (items: T[]) => void,
    sortDesc = true
  ) => {
    const q = query(collection(db, colName), where('organizationId', 'in', ORG_IDS));
    unsubscribers.push(
      onSnapshot(
        q,
        (snap) => {
          if (snap.empty) return;
          const items = snap.docs.map((d) => normalizeDocData<T>(d.data()));
          if (sortDesc) {
            items.sort((a: any, b: any) =>
              String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
            );
          }
          handler(items);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, colName)
      )
    );
  };

  subscribeCollection<WorkReport>('workReports', callbacks.onReports);
  subscribeCollection<Task>('tasks', callbacks.onTasks);
  subscribeCollection<Statement>('statements', callbacks.onStatements);
  subscribeCollection<PurchaseRequest>('purchases', callbacks.onPurchases);
  subscribeCollection<PriceItem>('priceItems', callbacks.onPriceItems, false);
  subscribeCollection<WorkGroup>('workGroups', callbacks.onGroups, false);
  subscribeCollection<Contract>('contracts', callbacks.onContracts, false);
  subscribeCollection<Company>('companies', callbacks.onCompanies, false);
  subscribeCollection<ScoreEvent>('scoreEvents', callbacks.onScores);
  subscribeCollection<AuditLog>('auditLogs', callbacks.onAuditLogs);
  if (callbacks.onPeriodicTests) {
    subscribeCollection<PeriodicTestRecord>('periodicTests', callbacks.onPeriodicTests);
  }

  // Station channel overrides
  const stationsQuery = query(
    collection(db, 'stationConfigs'),
    where('organizationId', 'in', ORG_IDS)
  );
  unsubscribers.push(
    onSnapshot(
      stationsQuery,
      (snap) => {
        const map: Record<string, StationCommunication['channels']> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data?.id && Array.isArray(data?.channels)) {
            map[data.id] = data.channels;
          }
        });
        callbacks.onStationConfigs(map);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'stationConfigs')
    )
  );

  return () => {
    unsubscribers.forEach((u) => u());
  };
}

// ── Individual Write Operations ───────────────────────────────────────────────
export async function persistCreateUser(
  user: User,
  ownerUid: string
): Promise<void> {
  const path = `personnel/${user._id}`;
  try {
    await setDoc(doc(db, 'personnel', user._id), {
      ...pickAllowed(user as any, PERSONNEL_KEYS),
      ownerUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await setDoc(doc(db, 'personnel', user._id, 'private', 'contact'), {
      _id: user._id,
      mobile: user.mobile,
      hashedMobile: user.hashedMobile,
      ownerUid,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function persistUpdateUserProfile(
  userId: string,
  updates: { fullName: string; mobile?: string; role?: User['role']; isActive?: boolean },
  relatedCollections: {
    reports: WorkReport[];
    tasks: Task[];
    statements: Statement[];
    purchases: PurchaseRequest[];
    scores: ScoreEvent[];
  }
): Promise<void> {
  const path = `personnel/${userId}`;
  try {
    const cleanFullName = updates.fullName.trim().slice(0, 120);
    const cleanMobile = updates.mobile ? normalizeIranMobile(updates.mobile) : '';
    const hasValidMobile = cleanMobile.length >= 8 && cleanMobile.length <= 20;

    const personnelUpdates: Record<string, any> = {
      fullName: cleanFullName,
      updatedAt: serverTimestamp(),
    };
    if (updates.role !== undefined) personnelUpdates.role = updates.role;
    if (updates.isActive !== undefined) personnelUpdates.isActive = updates.isActive;
    if (hasValidMobile) {
      personnelUpdates.encryptedMobile = `AES256GCM:${cleanMobile.slice(1, 4)}***${cleanMobile.slice(-4)}`;
    }

    await updateDoc(doc(db, 'personnel', userId), personnelUpdates);

    if (hasValidMobile) {
      try {
        await updateDoc(doc(db, 'personnel', userId, 'private', 'contact'), {
          mobile: cleanMobile,
          hashedMobile: 'sha256_' + cleanMobile,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // Private contact update only allowed for owner/admin
      }
    }

    // Propagate updated fullName cleanly across active organizational documents referencing userId
    const pendingUpdates: Array<() => Promise<unknown>> = [];

    for (const r of relatedCollections.reports) {
      if (r.userId === userId && r.userName !== cleanFullName && r.status !== 'settled') {
        pendingUpdates.push(() =>
          updateDoc(doc(db, 'workReports', r._id), {
            userName: cleanFullName,
            updatedAt: serverTimestamp(),
          })
        );
      }
    }
    for (const t of relatedCollections.tasks) {
      if (t.createdByUserId === userId && t.createdByName !== cleanFullName) {
        pendingUpdates.push(() =>
          updateDoc(doc(db, 'tasks', t._id), {
            createdByName: cleanFullName,
            updatedAt: serverTimestamp(),
          })
        );
      }
    }
    for (const s of relatedCollections.statements) {
      const stmtPatch: Record<string, any> = {};
      if (s.contractorUserId === userId && s.contractorName !== cleanFullName) {
        stmtPatch.contractorName = cleanFullName;
      }
      if (s.approvedByUserId === userId && s.approvedByName !== cleanFullName) {
        stmtPatch.approvedByName = cleanFullName;
      }
      if (Object.keys(stmtPatch).length > 0 && s.status !== 'paid') {
        pendingUpdates.push(() =>
          updateDoc(doc(db, 'statements', s._id), {
            ...stmtPatch,
            updatedAt: serverTimestamp(),
          })
        );
      }
    }
    for (const p of relatedCollections.purchases) {
      const prPatch: Record<string, any> = {};
      if (p.requestedByUserId === userId && p.requestedByName !== cleanFullName) {
        prPatch.requestedByName = cleanFullName;
      }
      if (p.approvedByUserId === userId && p.approvedByName !== cleanFullName) {
        prPatch.approvedByName = cleanFullName;
      }
      if (Object.keys(prPatch).length > 0 && p.status !== 'paid') {
        pendingUpdates.push(() =>
          updateDoc(doc(db, 'purchases', p._id), {
            ...prPatch,
            updatedAt: serverTimestamp(),
          })
        );
      }
    }
    for (const sc of relatedCollections.scores) {
      if (sc.userId === userId && sc.userName !== cleanFullName) {
        pendingUpdates.push(() =>
          updateDoc(doc(db, 'scoreEvents', sc._id), {
            userName: cleanFullName,
          })
        );
      }
    }

    if (pendingUpdates.length > 0) {
      await Promise.allSettled(pendingUpdates.map((fn) => fn()));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export interface CloudSyncVerificationResult {
  personnel: Array<{
    _id: string;
    fullName: string;
    role: User['role'];
    encryptedMobile: string;
    isActive: boolean;
  }>;
  reportsCount: number;
  checkedAtIso: string;
}

export async function verifyCloudPersonnelSync(): Promise<CloudSyncVerificationResult> {
  try {
    const [personnelSnap, reportsSnap] = await Promise.all([
      getDocsFromServer(query(collection(db, 'personnel'), where('organizationId', 'in', ORG_IDS))),
      getDocsFromServer(query(collection(db, 'workReports'), where('organizationId', 'in', ORG_IDS))),
    ]);

    const personnel = personnelSnap.docs.map((d) => {
      const data = normalizeDocData<User>(d.data());
      return {
        _id: data._id,
        fullName: data.fullName,
        role: data.role,
        encryptedMobile: data.encryptedMobile,
        isActive: data.isActive,
      };
    });

    return {
      personnel,
      reportsCount: reportsSnap.size,
      checkedAtIso: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'personnel');
  }
}

export async function syncLocalPersonnelToCloud(
  localUsers: User[],
  ownerUid: string,
  relatedCollections: {
    reports: WorkReport[];
    tasks: Task[];
    statements: Statement[];
    purchases: PurchaseRequest[];
    scores: ScoreEvent[];
  }
): Promise<{ updatedCount: number; createdCount: number }> {
  try {
    const serverSnap = await getDocsFromServer(
      query(collection(db, 'personnel'), where('organizationId', 'in', ORG_IDS))
    );
    const serverMap = new Map<string, User>();
    serverSnap.docs.forEach((d) => {
      const data = normalizeDocData<User>(d.data());
      serverMap.set(data._id, data);
    });

    let updatedCount = 0;
    let createdCount = 0;

    for (const u of localUsers) {
      const remote = serverMap.get(u._id);
      if (!remote) {
        await persistCreateUser(u, ownerUid);
        createdCount++;
      } else if (
        remote.fullName !== u.fullName ||
        remote.isActive !== u.isActive ||
        (u.encryptedMobile && remote.encryptedMobile !== u.encryptedMobile)
      ) {
        await persistUpdateUserProfile(
          u._id,
          { fullName: u.fullName, mobile: u.mobile, isActive: u.isActive },
          relatedCollections
        );
        updatedCount++;
      }
    }

    return { updatedCount, createdCount };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'personnel');
  }
}

export async function persistToggleUserActive(userId: string, nextIsActive: boolean): Promise<void> {
  const path = `personnel/${userId}`;
  try {
    await updateDoc(doc(db, 'personnel', userId), {
      isActive: nextIsActive,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function persistUpsertReport(report: WorkReport, ownerUid: string, isNew: boolean): Promise<void> {
  const path = `workReports/${report._id}`;
  try {
    const safeReport = {
      ...report,
      companyId: report.companyId || 'comp-1',
      contractId: report.contractId || 'cnt-1',
    };
    if (isNew) {
      await setDoc(doc(db, 'workReports', report._id), {
        ...pickAllowed(safeReport as any, REPORT_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'workReports', report._id), {
        ...pickAllowed(
          {
            userName: safeReport.userName,
            status: safeReport.status,
            description: safeReport.description,
            currentReviewerRole: safeReport.currentReviewerRole,
            totalAmount: safeReport.totalAmount,
            itemCount: safeReport.itemCount,
            items: safeReport.items,
            extraWorks: safeReport.extraWorks,
            events: safeReport.events,
          },
          [
            'userName', 'status', 'description', 'currentReviewerRole',
            'totalAmount', 'itemCount', 'items', 'extraWorks', 'events',
          ]
        ),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function persistUpsertTask(task: Task, ownerUid: string, isNew: boolean): Promise<void> {
  const path = `tasks/${task._id}`;
  try {
    if (isNew) {
      await setDoc(doc(db, 'tasks', task._id), {
        ...pickAllowed(task as any, TASK_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'tasks', task._id), {
        ...pickAllowed(task as any, [
          'createdByName', 'status', 'completedAt', 'assignedUserIds', 'assignedGroupIds',
        ]),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function persistUpsertStatement(
  statement: Statement,
  ownerUid: string,
  isNew: boolean
): Promise<void> {
  const path = `statements/${statement._id}`;
  try {
    if (isNew) {
      await setDoc(doc(db, 'statements', statement._id), {
        ...pickAllowed(statement as any, STATEMENT_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'statements', statement._id), {
        ...pickAllowed(statement as any, [
          'contractorName', 'status', 'approvedAt', 'approvedByUserId', 'approvedByName', 'rejectionReason',
        ]),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function persistUpsertPurchase(
  purchase: PurchaseRequest,
  ownerUid: string,
  isNew: boolean
): Promise<void> {
  const path = `purchases/${purchase._id}`;
  try {
    if (isNew) {
      await setDoc(doc(db, 'purchases', purchase._id), {
        ...pickAllowed(purchase as any, PURCHASE_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'purchases', purchase._id), {
        ...pickAllowed(purchase as any, [
          'requestedByName', 'status', 'approvedByUserId', 'approvedByName', 'rejectionReason',
        ]),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function persistUpsertPriceItem(
  item: PriceItem,
  ownerUid: string,
  isNew: boolean
): Promise<void> {
  const path = `priceItems/${item._id}`;
  try {
    if (isNew) {
      await setDoc(doc(db, 'priceItems', item._id), {
        ...pickAllowed({ ...item, organizationId: 'org-2' } as any, PRICE_ITEM_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'priceItems', item._id), {
        ...pickAllowed(item as any, ['title', 'unit', 'unitPrice', 'groupIds', 'isActive', 'category']),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function persistUpsertWorkGroup(
  group: WorkGroup,
  ownerUid: string,
  isNew: boolean
): Promise<void> {
  const path = `workGroups/${group._id}`;
  try {
    if (isNew) {
      await setDoc(doc(db, 'workGroups', group._id), {
        ...pickAllowed(group as any, WORK_GROUP_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'workGroups', group._id), {
        ...pickAllowed(group as any, [
          'name', 'description', 'specialty', 'supervisorUserId', 'observerUserIds', 'memberIds', 'isActive',
        ]),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function persistCreateContract(contract: Contract, ownerUid: string): Promise<void> {
  const path = `contracts/${contract._id}`;
  try {
    await setDoc(doc(db, 'contracts', contract._id), {
      ...pickAllowed(contract as any, CONTRACT_KEYS),
      ownerUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function persistCreateCompany(company: Company, ownerUid: string): Promise<void> {
  const path = `companies/${company._id}`;
  try {
    await setDoc(doc(db, 'companies', company._id), {
      ...pickAllowed(company as any, COMPANY_KEYS),
      ownerUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function persistCreateScoreEvent(score: ScoreEvent, ownerUid: string): Promise<void> {
  const path = `scoreEvents/${score._id}`;
  try {
    await setDoc(doc(db, 'scoreEvents', score._id), {
      ...pickAllowed({ ...score, organizationId: 'org-2' } as any, SCORE_KEYS),
      ownerUid,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function persistAuditLog(log: AuditLog, ownerUid: string): Promise<void> {
  const path = `auditLogs/${log._id}`;
  try {
    await setDoc(doc(db, 'auditLogs', log._id), {
      ...pickAllowed({ ...log, organizationId: 'org-1' } as any, AUDIT_LOG_KEYS),
      ownerUid,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function persistStationChannels(
  stationId: string,
  channels: Array<{
    type: ChannelType;
    status: ChannelHealthStatus;
    rawStatus: string;
    number?: string;
    note?: string;
  }>,
  ownerUid: string
): Promise<void> {
  const path = `stationConfigs/${stationId}`;
  try {
    const ref = doc(db, 'stationConfigs', stationId);
    const snap = await getDoc(ref);
    const cleanChannels = stripUndefined({ channels }).channels;
    if (!snap.exists()) {
      await setDoc(ref, {
        id: stationId,
        channels: cleanChannels,
        organizationId: 'org-1',
        ownerUid,
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        channels: cleanChannels,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function persistUpsertPeriodicTest(
  record: PeriodicTestRecord,
  ownerUid: string,
  isNew: boolean
): Promise<void> {
  const path = `periodicTests/${record._id}`;
  try {
    if (isNew) {
      await setDoc(doc(db, 'periodicTests', record._id), {
        ...pickAllowed(record as any, PERIODIC_TEST_KEYS),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'periodicTests', record._id), {
        ...pickAllowed(record as any, [
          'status', 'approverName', 'reviewNote', 'routes', 'wirelessUnits', 'attachments',
          'attachmentPagesCount', 'monthJalali', 'pmDateJalali',
        ]),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

