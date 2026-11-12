import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus, Search, CheckCircle2, Circle, Clock,
  Edit2, Trash2, Calendar, AlertCircle, FileText
} from 'lucide-react';
import { format, isPast, isToday, isTomorrow, parseISO } from 'date-fns';
import Modal from '../components/common/Modal';
import AssignmentForm from '../components/dashboard/AssignmentForm';
import type { Assignment, Priority, Subject } from '../types';

export default function Assignments() {
  const { assignments, subjects, getSubjectById, updateAssignment, deleteAssignment } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter((a: Assignment) => a.status === 'completed').length;
    const overdue = assignments.filter((a: Assignment) => a.status !== 'completed' && isPast(parseISO(`${a.dueDate}T${a.dueTime || '23:59'}`))).length;
    const inProgress = assignments.filter((a: Assignment) => a.status === 'in-progress').length;
    return { total, completed, overdue, inProgress };
  }, [assignments]);

  // Filtered and sorted assignments
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((a: Assignment) => {
        // Tab filtering
        const isCompleted = a.status === 'completed';
        const isPastDue = isPast(parseISO(`${a.dueDate}T${a.dueTime || '23:59'}`)) && !isCompleted;

        if (activeTab === 'completed' && !isCompleted) return false;
        if (activeTab === 'overdue' && !isPastDue) return false;
        if (activeTab === 'upcoming' && (isCompleted || isPastDue)) return false;

        // Subject filter
        if (selectedSubject !== 'all' && a.subjectId !== selectedSubject) return false;

        // Priority filter
        if (selectedPriority !== 'all' && a.priority !== selectedPriority) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const subj = getSubjectById(a.subjectId);
          const matchTitle = a.title.toLowerCase().includes(q);
          const matchDesc = a.description?.toLowerCase().includes(q);
          const matchSubj = subj?.name.toLowerCase().includes(q) || subj?.code.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchSubj) return false;
        }

        return true;
      })
      .sort((a: Assignment, b: Assignment) => {
        if (sortBy === 'dueDate') {
          return parseISO(`${a.dueDate}T${a.dueTime || '23:59'}`).getTime() - parseISO(`${b.dueDate}T${b.dueTime || '23:59'}`).getTime();
        }
        if (sortBy === 'priority') {
          const priorityWeight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        return a.title.localeCompare(b.title);
      });
  }, [assignments, activeTab, selectedSubject, selectedPriority, searchQuery, sortBy, getSubjectById]);

  const toggleStatus = (assignment: Assignment) => {
    const nextStatus = assignment.status === 'completed' ? 'in-progress' : 'completed';
    updateAssignment(assignment.id, { status: nextStatus });
  };

  const getDueBadge = (dueDate: string, dueTime: string, status: string) => {
    if (status === 'completed') {
      return (
        <span className="badge badge-green flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      );
    }

    const dueDateTime = parseISO(`${dueDate}T${dueTime || '23:59'}`);
    if (isPast(dueDateTime)) {
      return (
        <span className="badge badge-coral flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Overdue
        </span>
      );
    }
    if (isToday(dueDateTime)) {
      return (
        <span className="badge badge-yellow flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Due Today
        </span>
      );
    }
    if (isTomorrow(dueDateTime)) {
      return (
        <span className="badge badge-blue flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Due Tomorrow
        </span>
      );
    }

    return (
      <span className="badge badge-neutral flex items-center gap-1 text-[var(--color-text-secondary)]">
        <Calendar className="w-3 h-3" />
        {format(dueDateTime, 'MMM d, yyyy')}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
            Assignments
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
            Track submissions, priorities, and deadlines across your courses
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAssignment(null);
            setShowModal(true);
          }}
          className="btn btn-primary btn-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          New Assignment
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-blue-light)] dark:bg-[rgba(101,157,225,0.15)] flex items-center justify-center text-[var(--color-blue-primary)] flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] leading-tight">{stats.total}</div>
            <div className="text-[11px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">Total</div>
          </div>
        </div>

        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-yellow-soft)] dark:bg-[rgba(244,242,222,0.15)] flex items-center justify-center text-[#B09A32] flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] leading-tight">{stats.inProgress}</div>
            <div className="text-[11px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">In Progress</div>
          </div>
        </div>

        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-coral-muted)]/15 flex items-center justify-center text-[var(--color-coral-muted)] flex-shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] leading-tight">{stats.overdue}</div>
            <div className="text-[11px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">Overdue</div>
          </div>
        </div>

        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-green-soft)] dark:bg-[rgba(228,238,220,0.15)] flex items-center justify-center text-[var(--color-green-muted)] flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] leading-tight">{stats.completed}</div>
            <div className="text-[11px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">Completed</div>
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="card p-3 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b md:border-b-0 border-[var(--color-border)] dark:border-[var(--color-dark-border)] pb-2 md:pb-0 overflow-x-auto">
            {(['all', 'upcoming', 'overdue', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-[var(--color-blue-primary)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)] dark:hover:bg-[var(--color-dark-surface-elevated)]'
                }`}
              >
                {tab}
                {tab === 'overdue' && stats.overdue > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-700 font-semibold">
                    {stats.overdue}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="!py-1.5 !pl-8 !text-[12px] w-full"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="!w-auto !py-1.5 !text-[12px]"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s: Subject) => (
                <option key={s.id} value={s.id}>{s.code}</option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="!w-auto !py-1.5 !text-[12px]"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="!w-auto !py-1.5 !text-[12px]"
            >
              <option value="dueDate">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="title">Sort: Title</option>
            </select>
          </div>
        </div>

        {/* Assignments Table/List */}
        {filteredAssignments.length > 0 ? (
          <div className="overflow-x-auto -mx-3 -mb-3">
            <table className="w-full text-[13px] text-left border-collapse">
              <thead>
                <tr className="border-t border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-4 w-10">Done</th>
                  <th className="py-2.5 px-4">Title & Subject</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] dark:divide-[var(--color-dark-border)]">
                {filteredAssignments.map((assignment: Assignment) => {
                  const subject = getSubjectById(assignment.subjectId);
                  const isCompleted = assignment.status === 'completed';

                  return (
                    <tr
                      key={assignment.id}
                      className={`hover:bg-[#F9FAF8] dark:hover:bg-[var(--color-dark-surface-elevated)]/60 transition-colors ${
                        isCompleted ? 'opacity-70' : ''
                      }`}
                    >
                      {/* Completion Checkbox */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleStatus(assignment)}
                          className="text-[var(--color-text-secondary)] hover:text-[var(--color-blue-primary)] transition-colors"
                          title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-[var(--color-green-muted)]" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Title & Subject */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                          <span className={isCompleted ? 'line-through text-[var(--color-text-secondary)]' : ''}>
                            {assignment.title}
                          </span>
                        </div>
                        {assignment.description && (
                          <div className="text-[11px] text-[var(--color-text-secondary)] truncate max-w-xs mt-0.5">
                            {assignment.description}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: subject?.color || '#659DE1' }}
                          />
                          <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
                            {subject?.code} · {subject?.name}
                          </span>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-4">
                        {getDueBadge(assignment.dueDate, assignment.dueTime, assignment.status)}
                        <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">
                          {assignment.dueTime || '23:59'}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4">
                        <span
                          className={`badge ${
                            assignment.priority === 'high'
                              ? 'badge-coral'
                              : assignment.priority === 'medium'
                              ? 'badge-yellow'
                              : 'badge-blue'
                          }`}
                        >
                          {assignment.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`badge ${
                            assignment.status === 'completed'
                              ? 'badge-green'
                              : assignment.status === 'in-progress'
                              ? 'badge-blue'
                              : 'badge-neutral'
                          }`}
                        >
                          {assignment.status.replace('-', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingAssignment(assignment);
                              setShowModal(true);
                            }}
                            className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-blue-primary)] hover:bg-[var(--color-bg-main)] dark:hover:bg-[var(--color-dark-surface-elevated)] transition-colors"
                            title="Edit assignment"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteAssignment(assignment.id)}
                            className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete assignment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-[var(--color-text-secondary)]">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-[var(--color-blue-primary)]" />
            <p className="text-[13px] font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
              No assignments found
            </p>
            <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
              {searchQuery || selectedSubject !== 'all' || selectedPriority !== 'all'
                ? 'Try adjusting your search or filters'
                : 'All caught up! Add a new assignment to stay ahead.'}
            </p>
            <button
              onClick={() => {
                setEditingAssignment(null);
                setShowModal(true);
              }}
              className="btn btn-primary btn-sm mt-3"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Assignment
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAssignment(null);
        }}
        title={editingAssignment ? 'Edit Assignment' : 'Add Assignment'}
      >
        <AssignmentForm
          initialData={editingAssignment || undefined}
          onClose={() => {
            setShowModal(false);
            setEditingAssignment(null);
          }}
        />
      </Modal>
    </div>
  );
}
