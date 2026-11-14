/**
 * GroupsView
 * Role-Scoped WorkGroup & Membership Management:
 * - CONTRACTOR_CEO: Create, edit (name, description, supervisor, members, active status) & manage company groups
 * - EMPLOYER_CEO: Assign employer observers to unit groups (without changing contractor ownership)
 * - GROUP_SUPERVISOR: View supervised groups & members (read-only)
 */

import React, { useState } from 'react';
import { Users, PlusCircle, ShieldCheck, UserCheck, X, Pencil } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkGroup, WorkGroupSpecialty } from '../../types';
import { toPersianDigits } from '../../utils/formatters';
import {
  getSpecialtyPersianLabel,
  resolveGroupSpecialty,
} from '../../data/periodicTestConfig';
import {
  filterGroupsForRole,
  canManageCompanyGroups,
  canAssignEmployerObserver,
} from '../../config/rolePermissions';

export const GroupsView: React.FC = () => {
  const {
    groups,
    users,
    currentRole,
    currentUser,
    companies,
    createGroup,
    updateGroup,
    toggleGroupMember,
    assignEmployerObserver,
  } = useApp();

  const scopedGroups = filterGroupsForRole(groups, currentUser);
  const canManageGroups = canManageCompanyGroups(currentRole);
  const canAssignObserver = canAssignEmployerObserver(currentRole);

  // Create group modal (CONTRACTOR_CEO)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupSpecialty, setGroupSpecialty] = useState<WorkGroupSpecialty>('telecom');
  const [supervisorId, setSupervisorId] = useState(
    () => users.find((u) => u.role === 'GROUP_SUPERVISOR')?._id || ''
  );

  // Edit group modal (CONTRACTOR_CEO)
  const [editingGroup, setEditingGroup] = useState<WorkGroup | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSpecialty, setEditSpecialty] = useState<WorkGroupSpecialty>('general');
  const [editSupervisorId, setEditSupervisorId] = useState('');
  const [editMemberIds, setEditMemberIds] = useState<string[]>([]);
  const [editIsActive, setEditIsActive] = useState(true);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Assign observer modal (EMPLOYER_CEO)
  const [observerGroupId, setObserverGroupId] = useState<string | null>(null);

  const companyPersonnel = users.filter(
    (u) =>
      (!currentUser.companyId || u.companyId === currentUser.companyId) &&
      ['TECHNICIAN', 'GROUP_SUPERVISOR'].includes(u.role)
  );
  const supervisors = users.filter(
    (u) =>
      u.role === 'GROUP_SUPERVISOR' &&
      (!currentUser.companyId || u.companyId === currentUser.companyId)
  );
  const employerExperts = users.filter((u) => u.role === 'EMPLOYER_EXPERT');

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    const ok = await createGroup({
      name: groupName.trim(),
      description: groupDesc.trim(),
      specialty: groupSpecialty,
      supervisorUserId: supervisorId,
      memberIds: supervisorId ? [supervisorId] : [],
    });
    if (ok) {
      setIsCreateOpen(false);
      setGroupName('');
      setGroupDesc('');
      setGroupSpecialty('telecom');
    }
  };

  const handleOpenEdit = (group: WorkGroup) => {
    setEditingGroup(group);
    setEditName(group.name);
    setEditDesc(group.description || '');
    setEditSpecialty(resolveGroupSpecialty(group));
    setEditSupervisorId(group.supervisorUserId || supervisors[0]?._id || '');
    setEditMemberIds(group.memberIds || []);
    setEditIsActive(group.isActive);
  };

  const toggleEditMember = (userId: string) => {
    setEditMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup || !editName.trim()) return;
    setIsSavingEdit(true);
    const ok = await updateGroup(editingGroup._id, {
      name: editName.trim(),
      description: editDesc.trim(),
      specialty: editSpecialty,
      supervisorUserId: editSupervisorId,
      memberIds: editMemberIds,
      isActive: editIsActive,
    });
    setIsSavingEdit(false);
    if (ok) {
      setEditingGroup(null);
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>
              {currentRole === 'GROUP_SUPERVISOR'
                ? 'گروه من و وضعیت اعضای اکیپ'
                : currentRole === 'EMPLOYER_CEO'
                ? 'گروه‌های تحت پوشش واحد و تخصیص ناظر کارفرما'
                : 'گروه‌های کاری و محدوده دسترسی اعضا'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {canManageGroups
              ? 'تعریف، ویرایش مشخصات و مدیریت ساختار گروه‌های عملیاتی، انتصاب سرپرست و ترکیب اعضای فنی'
              : canAssignObserver
              ? 'مشاهده گروه‌های واحد نظارتی و تخصیص ناظر مقیم کارفرما بدون تغییر مالکیت پرسنل پیمانکار'
              : 'مشاهده اعضای تیم تحت سرپرستی و اطلاعات شرکت مجری'}
          </p>
        </div>

        {canManageGroups && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.3)]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ایجاد گروه جدید</span>
          </button>
        )}
      </div>

      {/* Group Access Banner */}
      <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/30 text-xs text-slate-300 leading-relaxed">
        <strong className="text-sky-300 font-bold block mb-1">
          اصل تفکیک دسترسی گروه‌ها:
        </strong>
        هر تکنسین و سرپرست منحصراً به آیتم‌های فهرست بها، گزارش‌ها و مأموریت‌های گروه‌های عضو خود دسترسی دارد. ناظران کارفرما بدون تغییر مالکیت پرسنل پیمانکار، بر گروه‌های تعیین‌شده نظارت می‌نمایند.
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scopedGroups.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-500 glass-panel rounded-2xl border border-slate-800">
            هیچ گروهی در محدوده دسترسی شما ثبت نشده است.
          </div>
        ) : (
          scopedGroups.map((group) => {
            const supervisor = users.find((u) => u._id === group.supervisorUserId);
            const members = users.filter((u) => group.memberIds.includes(u._id));
            const observers = users.filter((u) => group.observerUserIds?.includes(u._id));
            const company = companies.find((c) => c._id === group.companyId);

            return (
              <div
                key={group._id}
                className={`p-5 rounded-2xl glass-panel border bg-slate-900/60 transition-all space-y-4 ${
                  group.isActive ? 'border-slate-800 hover:border-slate-700' : 'border-rose-900/50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-amber-400">{toPersianDigits(group._id)}</span>
                      <span className="text-slate-600">·</span>
                      <span className={`font-semibold ${group.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {group.isActive ? 'فعال در شبکه' : 'غیرفعال'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">{group.name}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {canManageGroups && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(group)}
                        className="px-2.5 py-1.5 rounded-lg border border-cyan-500/35 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>ویرایش گروه</span>
                      </button>
                    )}

                    {canAssignObserver && (
                      <button
                        type="button"
                        onClick={() => setObserverGroupId(group._id)}
                        className="px-2.5 py-1.5 rounded-lg border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>تخصیص ناظر کارفرما</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {group.description || 'بدون توضیحات.'}
                </p>

                <div className="space-y-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">بخش تخصصی تست دوره‌ای:</span>
                    <span className="px-2 py-0.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-semibold text-[11px]">
                      {getSpecialtyPersianLabel(resolveGroupSpecialty(group))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">شرکت مجری:</span>
                    <span className="font-semibold text-white">{company?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">سرپرست گروه:</span>
                    <span className="font-semibold text-amber-400">
                      {supervisor?.fullName || 'تعیین نشده'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">ناظران کارفرما:</span>
                    <span className="font-semibold text-sky-300">
                      {observers.length > 0
                        ? observers.map((o) => o.fullName).join('، ')
                        : 'بدون ناظر'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">تعداد اعضای فنی:</span>
                    <span className="font-bold text-white tabular-nums">{toPersianDigits(members.length)} نفر</span>
                  </div>
                </div>

                {/* Members Preview / Management */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-2">
                    {canManageGroups
                      ? 'اعضای گروه (جهت افزودن/حذف عضو کلیک کنید):'
                      : 'اعضای تخصیص‌یافته به گروه:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {canManageGroups
                      ? companyPersonnel.map((person) => {
                          const isMember = group.memberIds.includes(person._id);
                          return (
                            <button
                              key={person._id}
                              type="button"
                              onClick={() => toggleGroupMember(group._id, person._id)}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                                isMember
                                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                                  : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isMember ? 'bg-emerald-400' : 'bg-slate-600'
                                }`}
                              />
                              <span>{person.fullName}</span>
                            </button>
                          );
                        })
                      : members.map((m) => (
                          <span
                            key={m._id}
                            className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 text-xs text-slate-300 font-medium flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            {m.fullName}
                          </span>
                        ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Group Modal (CONTRACTOR_CEO ONLY) */}
      {isCreateOpen && canManageGroups && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">ایجاد گروه عملیاتی جدید</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">نام گروه:</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={160}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="مثال: اکیپ حفاظت و رله پست‌های غرب"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right"
                  autoFocus
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">تخصص گروه (بخش تست دوره‌ای):</label>
                <select
                  value={groupSpecialty}
                  onChange={(e) => setGroupSpecialty(e.target.value as WorkGroupSpecialty)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right"
                >
                  <option value="telecom">مخابرات (۷ بخش تست دوره‌ای)</option>
                  <option value="telemetry">تله‌متری (تست دوره‌ای RTU)</option>
                  <option value="scada">اسکادا (تست دوره‌ای SCADA)</option>
                  <option value="general">عمومی / سایر</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">سرپرست گروه:</label>
                <select
                  value={supervisorId}
                  onChange={(e) => setSupervisorId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right"
                >
                  {supervisors.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">توضیحات مأموریت گروه:</label>
                <textarea
                  rows={2}
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  ایجاد گروه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal (CONTRACTOR_CEO ONLY) */}
      {editingGroup && canManageGroups && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">ویرایش گروه کاری</h3>
                <p className="text-[11px] text-cyan-400 mt-0.5">
                  شناسه گروه: {toPersianDigits(editingGroup._id)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingGroup(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">نام گروه عملیاتی:</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={160}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right focus:outline-none focus:border-cyan-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">تخصص گروه (بخش تست دوره‌ای):</label>
                <select
                  value={editSpecialty}
                  onChange={(e) => setEditSpecialty(e.target.value as WorkGroupSpecialty)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right focus:outline-none focus:border-cyan-400"
                >
                  <option value="telecom">مخابرات (۷ بخش تست دوره‌ای)</option>
                  <option value="telemetry">تله‌متری (تست دوره‌ای RTU)</option>
                  <option value="scada">اسکادا (تست دوره‌ای SCADA)</option>
                  <option value="general">عمومی / سایر</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">سرپرست گروه:</label>
                  <select
                    value={editSupervisorId}
                    onChange={(e) => setEditSupervisorId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right focus:outline-none focus:border-cyan-400"
                  >
                    {supervisors.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">وضعیت فعالیت:</label>
                  <select
                    value={editIsActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditIsActive(e.target.value === 'active')}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right focus:outline-none focus:border-cyan-400"
                  >
                    <option value="active">فعال در شبکه</option>
                    <option value="inactive">غیرفعال</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">توضیحات و شرح مأموریت گروه:</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  اعضای تخصیص‌یافته به گروه ({toPersianDigits(Array.from(new Set(editSupervisorId ? [editSupervisorId, ...editMemberIds] : editMemberIds)).length)} نفر):
                </label>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  {companyPersonnel.map((person) => {
                    const isSupervisor = person._id === editSupervisorId;
                    const isChecked = isSupervisor || editMemberIds.includes(person._id);
                    return (
                      <button
                        key={person._id}
                        type="button"
                        disabled={isSupervisor}
                        onClick={() => toggleEditMember(person._id)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                          isChecked
                            ? 'border-emerald-500/40 bg-emerald-950/35 text-emerald-200'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                        } ${isSupervisor ? 'opacity-90 cursor-default' : ''}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isChecked ? 'bg-emerald-400' : 'bg-slate-600'
                          }`}
                        />
                        <span>{person.fullName}</span>
                        {isSupervisor && <span className="text-[10px] text-amber-400">(سرپرست)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-xl bg-gradient-to-l from-cyan-400 to-indigo-400 hover:brightness-110 text-slate-950 font-black transition-all"
                >
                  {isSavingEdit ? 'در حال ذخیره...' : 'ذخیره تغییرات گروه'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Employer Observer Modal (EMPLOYER_CEO ONLY) */}
      {observerGroupId && canAssignObserver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">تخصیص ناظر کارفرما به گروه</h3>
              <button onClick={() => setObserverGroupId(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              کارشناسان ناظر انتخاب‌شده مجاز به بررسی مرحله دوم گزارش‌ها و ثبت گزارش روزانه بر روی این گروه خواهند بود (مالکیت شرکت پیمانکار تغییر نمی‌کند).
            </p>
            <div className="space-y-2">
              {employerExperts.map((exp) => {
                const grp = groups.find((g) => g._id === observerGroupId);
                const isAssigned = grp?.observerUserIds?.includes(exp._id);
                return (
                  <button
                    key={exp._id}
                    type="button"
                    onClick={() => assignEmployerObserver(observerGroupId, exp._id)}
                    className={`w-full p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                      isAssigned
                        ? 'border-sky-500/40 bg-sky-950/30 text-sky-200'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold">{exp.fullName}</span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <UserCheck className="w-3.5 h-3.5" />
                      {isAssigned ? 'تخصیص‌یافته (کلیک برای لغو)' : 'انتخاب به عنوان ناظر'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
