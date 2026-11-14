/**
 * TechniciansView
 * Role-Scoped Personnel, Employer Users, Real-Name Editor, and Cloud Persistence
 * - DEPUTY: View, create, toggle, and edit real names/mobiles across ALL 8 organizational roles
 * - CONTRACTOR_CEO: Manage & edit company personnel (TECHNICIAN, GROUP_SUPERVISOR, RESIDENT_REP, CONTRACTOR_CEO)
 * - GROUP_SUPERVISOR: View team members & scores
 * - TECHNICIAN: Personal score, resume & self profile edit
 */

import React, { useState } from 'react';
import {
  Award,
  Star,
  TrendingUp,
  UserPlus,
  Power,
  X,
  Pencil,
} from 'lucide-react';
import { useApp, getRolePersianName } from '../../context/AppContext';
import { Role, User } from '../../types';
import { toPersianDigits } from '../../utils/formatters';
import {
  filterUsersForRole,
  filterScoresForRole,
  canManagePersonnel,
} from '../../config/rolePermissions';

const ALL_ROLES: Role[] = [
  'DEPUTY',
  'EMPLOYER_MANAGER',
  'EMPLOYER_CEO',
  'EMPLOYER_EXPERT',
  'CONTRACTOR_CEO',
  'RESIDENT_REP',
  'GROUP_SUPERVISOR',
  'TECHNICIAN',
];

export const TechniciansView: React.FC = () => {
  const {
    users,
    scores,
    groups,
    currentRole,
    currentUser,
    createUser,
    updateUserProfile,
    toggleUserActive,
  } = useApp();

  const scopedUsers = filterUsersForRole(users, currentUser, groups);
  const scopedScores = filterScoresForRole(scores, currentUser, users, groups);
  const allowManage = canManagePersonnel(currentRole);

  // Add user modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [newRole, setNewRole] = useState<Role>(
    currentRole === 'DEPUTY' ? 'EMPLOYER_EXPERT' : 'TECHNICIAN'
  );

  // Edit user modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const allowedCreationRoles: Role[] =
    currentRole === 'DEPUTY'
      ? ALL_ROLES
      : ['TECHNICIAN', 'GROUP_SUPERVISOR', 'RESIDENT_REP'];

  const handleOpenEdit = (person: User) => {
    setEditingUser(person);
    setEditFullName(person.fullName);
    setEditMobile(person.mobile || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editFullName.trim()) return;
    setIsSavingEdit(true);
    const ok = await updateUserProfile(editingUser._id, {
      fullName: editFullName.trim(),
      mobile: editMobile.trim() || undefined,
    });
    setIsSavingEdit(false);
    if (ok) {
      setEditingUser(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobile.trim()) return;
    const ok = await createUser({
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      role: newRole,
      groupIds:
        ['TECHNICIAN', 'GROUP_SUPERVISOR'].includes(newRole) ? ['grp-1'] : [],
    });
    if (ok) {
      setIsAddOpen(false);
      setFullName('');
      setMobile('');
    }
  };

  const getHeaderMeta = () => {
    switch (currentRole) {
      case 'TECHNICIAN':
        return {
          title: 'امتیازها و پروفایل فنی من',
          desc: 'مشاهده سابقه امتیازهای تاییدشده، سوابق میدانی و امکان ویرایش نام پروفایل',
        };
      case 'GROUP_SUPERVISOR':
        return {
          title: 'اعضای تحت سرپرستی و امتیازات تیم',
          desc: 'مشاهده وضعیت حضور، امتیازات فنی و سابقه اعضای گروه تحت نظارت شما',
        };
      case 'CONTRACTOR_CEO':
        return {
          title: 'مدیریت و ویرایش نام نیروهای شرکت پیمانکار',
          desc: 'ویرایش نام واقعی و شماره تماس، افزودن یا غیرفعال‌سازی پرسنل شرکت متبوع',
        };
      case 'DEPUTY':
      default:
        return {
          title: 'مدیریت کاربران، ویرایش اسامی واقعی و امتیازات سازمان',
          desc: 'تغییر نام و شماره تماس واقعی هر ۸ جایگاه شغلی در سامانه',
        };
    }
  };

  const headerMeta = getHeaderMeta();

  return (
    <div className="space-y-6 text-right">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>{headerMeta.title}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{headerMeta.desc}</p>
        </div>

        {allowManage && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.3)]"
          >
            <UserPlus className="w-4 h-4" />
            <span>
              {currentRole === 'DEPUTY' ? 'تعریف کاربر جدید در سامانه' : 'افزودن نیروی جدید شرکت'}
            </span>
          </button>
        )}
      </div>

      {/* Users Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scopedUsers.map((person) => {
          const canEditThisUser =
            currentRole === 'DEPUTY' ||
            person._id === currentUser._id ||
            (currentRole === 'CONTRACTOR_CEO' &&
              ['CONTRACTOR_CEO', 'RESIDENT_REP', 'GROUP_SUPERVISOR', 'TECHNICIAN'].includes(person.role));

          const canToggleThisUser =
            allowManage &&
            person._id !== currentUser._id &&
            (currentRole === 'DEPUTY' ||
              ['TECHNICIAN', 'GROUP_SUPERVISOR', 'RESIDENT_REP'].includes(person.role));

          return (
            <div
              key={person._id}
              className={`p-5 rounded-2xl glass-panel border bg-slate-900/60 transition-all space-y-4 ${
                person.isActive ? 'border-slate-800 hover:border-slate-700' : 'border-rose-900/50 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-base shrink-0">
                    {person.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{person.fullName}</h3>
                    <div className="text-xs text-cyan-400 font-medium truncate">
                      {getRolePersianName(person.role).split(' (')[0]}
                    </div>
                  </div>
                </div>

                {person.score !== undefined && (
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block mb-0.5">مجموع امتیاز فنی:</span>
                    <div className="text-xl font-black text-amber-400 tabular-nums flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{toPersianDigits(person.score)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block mb-0.5">تعداد ورودها:</span>
                  <span className="text-white font-bold">{toPersianDigits(person.loginCount)} بار</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">وضعیت حساب:</span>
                  <span className={`font-bold ${person.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {person.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
                {person.mobile && (
                  <div className="col-span-2 pt-2 mt-1 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400">شماره همراه (OTP):</span>
                    <span className="text-amber-300 font-semibold tabular-nums" dir="ltr">
                      {toPersianDigits(person.mobile)}
                    </span>
                  </div>
                )}
              </div>

              {(canEditThisUser || canToggleThisUser) && (
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  {canEditThisUser && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(person)}
                      className="px-3.5 py-1.5 rounded-lg border border-cyan-500/35 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>ویرایش نام و موبایل</span>
                    </button>
                  )}
                  {canToggleThisUser && (
                    <button
                      type="button"
                      onClick={() => toggleUserActive(person._id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        person.isActive
                          ? 'border-rose-500/30 bg-rose-950/30 text-rose-300 hover:bg-rose-950/50'
                          : 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/50'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{person.isActive ? 'غیرفعال‌سازی حساب' : 'فعال‌سازی مجدد'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Score Events History */}
      <div className="rounded-2xl glass-panel border border-slate-800/80 p-5 bg-slate-900/50">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span>تاریخچه ثبت امتیازات (Score Events)</span>
        </h3>

        <div className="divide-y divide-slate-800/60 text-xs">
          {scopedScores.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              هنوز رویداد امتیازی در محدوده شما ثبت نشده است.
            </div>
          ) : (
            scopedScores.map((sc) => (
              <div key={sc._id} className="py-3 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-200">
                    {sc.userName} - <span className="text-slate-400 font-normal">{sc.reason}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    ثبت توسط: {sc.createdByRole === 'EMPLOYER_CEO' ? 'ریاست کارفرما' : sc.createdByRole}
                  </div>
                </div>

                <div className="font-bold text-emerald-400 text-sm shrink-0">
                  +{toPersianDigits(sc.score)} امتیاز
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Personnel Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">ویرایش مشخصات پرسنل</h3>
                <p className="text-[11px] text-cyan-400 mt-0.5">
                  {getRolePersianName(editingUser.role)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  نام و نام خانوادگی واقعی:
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={120}
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="مثلاً: مهندس ..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right focus:outline-none focus:border-cyan-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  شماره موبایل واقعی (جهت ورود OTP):
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={editMobile}
                  onChange={(e) => setEditMobile(e.target.value)}
                  placeholder="09121110001"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-center focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                تغییر نام بلافاصله در هدر، کارتابل‌ها، لیست گزارش‌ها، صورت‌وضعیت‌ها و دفترچه ورود OTP به‌روزرسانی می‌شود.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-xl bg-gradient-to-l from-cyan-400 to-indigo-400 hover:brightness-110 text-slate-950 font-black transition-all"
                >
                  {isSavingEdit ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Personnel Modal */}
      {isAddOpen && allowManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {currentRole === 'DEPUTY' ? 'تعریف کاربر جدید در سامانه' : 'ثبت نیروی جدید شرکت'}
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">نام و نام خانوادگی:</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right"
                  autoFocus
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">شماره موبایل (جهت OTP):</label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="09121110099"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-center"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">جایگاه شغلی مجاز:</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-right"
                >
                  {allowedCreationRoles.map((r) => (
                    <option key={r} value={r}>
                      {getRolePersianName(r)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  ثبت کاربر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
