# Security Specification & Hardening Audit — TavanBan (توان‌بان)

## 1. Data Invariants
1. **Default-Deny Safety Net**: Every document path defaults to `allow read, write: if false;`.
2. **Verified Identity & Anti-Spoofing**: All reads and writes require `request.auth != null` and `request.auth.token.email_verified == true`. `ownerUid` must strictly equal `request.auth.uid` on document creation and remain immutable on update (unless overridden by `isAdmin()`).
3. **Bootstrapped & Collection Admin**: `isAdmin()` evaluates `request.auth.token.email == 'amintuber007@gmail.com' && request.auth.token.email_verified == true` or existence of `/admins/$(request.auth.uid)`. Non-admins cannot self-escalate to `admin` or set `assignedRole: 'DEPUTY'` in `/orgMembers/{uid}`.
4. **PII Isolation**: Raw mobile numbers and hashes live solely in `/personnel/{personnelId}/private/{docId}`, readable and writable only by `isAdmin()` or the record owner. Shared `/personnel/{personnelId}` cards expose only `fullName`, `role`, `encryptedMobile` (masked), and organizational metadata.
5. **Strict Schema & Size Guards**: Every `string` field enforces `.size()` limits, every ID path parameter enforces `isValidId(id)`, every `create` enforces `hasAll` + `hasOnly`, and every `update` enforces `affectedKeys().hasOnly(...)` per action tier.
6. **Temporal Integrity**: `createdAt` and `updatedAt` are validated against `request.time` (`serverTimestamp()`).
7. **Zero `get()` in `allow list`**: Collection list rules validate `resource.data.organizationId in ['org-1', 'org-2']` or `resource.data.ownerUid == request.auth.uid` without `get()`/`exists()` lookups.

## 2. Adversarial "Dirty Dozen" Payloads (All Must Return PERMISSION_DENIED)
1. Unauthenticated read/write to `/personnel/usr-deputy`.
2. Unverified email (`email_verified: false`) attempting `create` on `/workReports/rep-99`.
3. Spoofed `ownerUid` (`ownerUid: 'someone-else'`) on `create` in `/workReports`.
4. Shadow field injection (`{ isVerifiedAdmin: true }`) in `/personnel/usr-technician`.
5. Privilege escalation in `/orgMembers/{uid}` attempting `assignedRole: 'DEPUTY'` by non-admin.
6. Modifying immutable `createdAt` or `ownerUid` on `update` of `/tasks/tsk-1`.
7. Reading `/personnel/usr-deputy/private/contact` as a non-owner non-admin user.
8. Updating `/statements/stmt-1` after `status == 'paid'` by non-admin.
9. Injecting a 10KB junk document ID (`/tasks/<10000_chars>`) on `get`/`create`.
10. Injecting an oversized `fullName` (> 120 chars) in `/personnel/{id}`.
11. Attempting `delete` on `/auditLogs/{logId}` (audit trail is immutable).
12. Passing client-forged `createdAt` string instead of server timestamp `request.time`.
