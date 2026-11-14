/**
 * TasksView
 * Role-Scoped Task Assignment, Prioritization, Jalali Due Dates, and Reporting Shortcuts
 */

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  PlusCircle,
  CheckCircle2,
  Calendar,
  User,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { StationCommunication } from '../../data/stationsChecklist';
import { StationSelector } from '../common/StationSelector';
import { toPersianDigits } from '../../utils/formatters';
import {
  filterTasksForRole,
  filterGroupsForRole,
  canCreateTask,
  canUpdateTaskStatus,
  canCreateWorkReport,
} from '../../config/rolePermissions';

export const TasksView: React.FC = () => {
  const {
    tasks,
    currentRole,
    currentUser,
    createTask,
    updateTaskStatus,
    setCurrentRoute,
    setPreselectedStationId,
    setPreselectedTaskId,
    preselectedStationId,
    groups,
    users,
    stations,
  } = useApp();

  const scopedTasks = filterTasksForRole(tasks, currentUser, groups);
  const scopedGroups = filterGroupsForRole(groups, currentUser);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New task form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDateJalali, setDueDateJalali] = useState('۱۴۰۳/۰۹/۰۵');
  const [assignedGroupId, setAssignedGroupId] = useState(
    scopedGroups.length > 0 ? scopedGroups[0]._id : groups[0]?._id || 'grp-1'
  );
  const [assignedUserId, setAssignedUserId] = useState('usr-technician');
  const [selectedStation, setSelectedStation] = useState<StationCommunication | null>(null);

  // If navigated from StationCommunicationsView with preselectedStationId for creating task
  useEffect(() => {
    if (preselectedStationId && canCreateTask(currentRole)) {
      const matched = stations.find((s) => s.id === preselectedStationId);
      if (matched) {
        setSelectedStation(matched);
        setTitle(`بررسی و رفع اختلال ارتباطی در ${matched.persianName}`);
        setIsCreateModalOpen(true);
      }
      setPreselectedStationId(null);
    }
  }, [preselectedStationId, stations, currentRole, setPreselectedStationId]);

  const filteredTasks = scopedTasks.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTask({
      title,
      description,
      priority,
      dueDateJalali,
      assignedGroupIds: [assignedGroupId],
      assignedUserIds: [assignedUserId],
      groupId: assignedGroupId,
      stationId: selectedStation?.id,
      stationName: selectedStation ? `${selectedStation.persianName} (${selectedStation.name})` : undefined,
      dispatchCode: selectedStation?.dispatchCode || undefined,
    });

    setIsCreateModalOpen(false);
    setTitle('');
    setDescription('');
    setSelectedStation(null);
  };

  const handleReportFromTask = (task: Task) => {
    if (task.stationId) {
      setPreselectedStationId(task.stationId);
    }
    setPreselectedTaskId(task._id);
    setCurrentRoute('report-new');
  };

  const getPriorityBadge = (p: Task['priority']) => {
    switch (p) {
      case 'urgent':
        return { label: 'فوری و اضطراری', color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-800' };
      case 'high':
        return { label: 'اولویت بالا', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800' };
      case 'medium':
        return { label: 'اولویت متوسط', color: 'text-sky-400', bg: 'bg-sky-950/60 border-sky-800' };
      default:
        return { label: 'عادی', color: 'text-slate-400', bg: 'bg-slate-800' };
    }
  };

  const activeAssignees = users.filter((u) => {
    if (currentRole === 'EMPLOYER_MANAGER') {
      return u.role === 'EMPLOYER_CEO' || u.role === 'EMPLOYER_EXPERT';
    }
    if (currentRole === 'EMPLOYER_CEO') {
      return u.role === 'EMPLOYER_EXPERT' || u.role === 'GROUP_SUPERVISOR' || u.role === 'TECHNICIAN';
    }
    return u.role === 'TECHNICIAN' || u.role === 'GROUP_SUPERVISOR';
  });

  useEffect(() => {
    if (activeAssignees.length > 0 && !activeAssignees.some((u) => u._id === assignedUserId)) {
      setAssignedUserId(activeAssignees[0]._id);
    }
  }, [currentRole, activeAssignees, assignedUserId]);

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <span>کارهای محوله و مأموریت‌های عملیاتی</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            محدوده دسترسی: مأموریت‌های ارجاع‌شده یا تعریف‌شده در حیطه گروه‌های مجاز شما
          </p>
        </div>

        {canCreateTask(currentRole) && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.3)]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>سپردن کار جدید</span>
          </button>
        )}
      </div>

      {/* Status Segmented Filter */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs w-fit overflow-x-auto">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
            filterStatus === 'all'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          همه کارها ({toPersianDigits(scopedTasks.length)})
        </button>
        <button
          onClick={() => setFilterStatus('in_progress')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
            filterStatus === 'in_progress'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          در حال انجام ({toPersianDigits(scopedTasks.filter((t) => t.status === 'in_progress').length)})
        </button>
        <button
          onClick={() => setFilterStatus('open')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
            filterStatus === 'open'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          شروع نشده ({toPersianDigits(scopedTasks.filter((t) => t.status === 'open').length)})
        </button>
        <button
          onClick={() => setFilterStatus('done')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
            filterStatus === 'done'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          انجام شد ({toPersianDigits(scopedTasks.filter((t) => t.status === 'done').length)})
        </button>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-500 glass-panel rounded-2xl border border-slate-800">
            موردی در این دسته یافت نشد.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const pBadge = getPriorityBadge(task.priority);
            return (
              <div
                key={task._id}
                className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-400">{toPersianDigits(task._id)}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-medium border ${pBadge.bg} ${pBadge.color}`}
                    >
                      {pBadge.label}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{task.title}</h3>
                  {task.stationName && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-300">
                      <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>محل انجام کار: {task.stationName}</span>
                      {task.dispatchCode && (
                        <span className="text-amber-300">· کد {toPersianDigits(task.dispatchCode)}</span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {task.description || 'بدون توضیحات تکمیلی.'}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      ارجاع دهنده: {task.createdByName}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-300">
                      <Calendar className="w-3.5 h-3.5" />
                      مهلت: {toPersianDigits(task.dueDateJalali)}
                    </span>
                  </div>
                  {task.assignedUserIds.length > 0 && (
                    <div className="text-[11px] text-sky-300">
                      مسئول انجام:{' '}
                      {task.assignedUserIds
                        .map((uid) => users.find((u) => u._id === uid)?.fullName || uid)
                        .join('، ')}
                    </div>
                  )}

                  {/* Role-Aware Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                    <span className="text-[11px] text-slate-400">
                      وضعیت:{' '}
                      <strong className="text-slate-200">
                        {task.status === 'open'
                          ? 'شروع نشده'
                          : task.status === 'in_progress'
                          ? 'در حال اجرا'
                          : task.status === 'done'
                          ? 'تکمیل شده'
                          : 'لغو شده'}
                      </strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {canUpdateTaskStatus(currentRole) && task.status === 'open' && (
                        <button
                          onClick={() => updateTaskStatus(task._id, 'in_progress')}
                          className="px-2.5 py-1 rounded-lg border border-sky-500/40 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 text-xs transition-colors"
                        >
                          شروع کار
                        </button>
                      )}

                      {canUpdateTaskStatus(currentRole) && task.status === 'in_progress' && (
                        <button
                          onClick={() => updateTaskStatus(task._id, 'done')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ثبت پایان کار</span>
                        </button>
                      )}

                      {canCreateWorkReport(currentRole) && (
                        <button
                          onClick={() => handleReportFromTask(task)}
                          className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                          title="ثبت گزارش کار مرتبط با این مأموریت"
                        >
                          ثبت گزارش
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Task Modal */}
      {isCreateModalOpen && canCreateTask(currentRole) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl glass-panel border border-slate-700 bg-slate-900 p-6 text-right max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-1">سپردن کار و مأموریت جدید</h3>
            <p className="text-xs text-slate-400 mb-4">
              {currentRole === 'EMPLOYER_MANAGER'
                ? 'تعریف و ارجاع مستقیم کار به رییس کارفرما و کارشناسان کارفرما'
                : 'تعریف فعالیت جهت ارجاع به گروه‌های مجاز یا تکنسین‌های فنی'}
            </p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  عنوان کار:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: آچارکشی کلمپ‌های بی فیدر ترانس..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  شرح جزییات و استانداردهای مد نظر:
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیحات و دستورالعمل‌های خاص..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    اولویت کار:
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Task['priority'])}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-amber-400"
                  >
                    <option value="low">عادی</option>
                    <option value="medium">متوسط</option>
                    <option value="high">بالا</option>
                    <option value="urgent">فوری و اضطراری</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    مهلت انجام (شمسی):
                  </label>
                  <input
                    type="text"
                    value={dueDateJalali}
                    onChange={(e) => setDueDateJalali(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-center focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <StationSelector
                  stations={stations}
                  value={selectedStation?.id}
                  onChange={(st) => setSelectedStation(st)}
                  label="محل انجام کار (پست برق / مرکز):"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    گروه محول‌شده:
                  </label>
                  <select
                    value={assignedGroupId}
                    onChange={(e) => setAssignedGroupId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-amber-400"
                  >
                    {(scopedGroups.length > 0 ? scopedGroups : groups).map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    تخصیص به نیرو:
                  </label>
                  <select
                    value={assignedUserId}
                    onChange={(e) => setAssignedUserId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white text-right focus:outline-none focus:border-amber-400"
                  >
                    {activeAssignees.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  ثبت و ارجاع مأموریت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
