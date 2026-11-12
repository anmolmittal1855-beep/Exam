import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft, ChevronRight, Plus, Clock, Trash2
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth,
  isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, parseISO,
  isToday
} from 'date-fns';
import Modal from '../components/common/Modal';
import ExamForm from '../components/dashboard/ExamForm';
import type { Exam, Assignment, StudySession, Subject } from '../types';

export default function ExamCalendar() {
  const { exams, assignments, studySessions, subjects, getSubjectById, deleteExam } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showAddExam, setShowAddExam] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Build all events
  const allEvents = useMemo(() => {
    const events: { id: string; type: string; title: string; date: string; time: string; subjectId: string; color: string; priority?: string }[] = [];

    exams.forEach((e: Exam) => {
      const subj = getSubjectById(e.subjectId);
      events.push({ id: e.id, type: 'exam', title: e.title, date: e.date, time: e.time, subjectId: e.subjectId, color: subj?.color || '#659DE1', priority: e.priority });
    });

    assignments.filter((a: Assignment) => a.status !== 'completed').forEach((a: Assignment) => {
      const subj = getSubjectById(a.subjectId);
      events.push({ id: a.id, type: 'assignment', title: a.title, date: a.dueDate, time: a.dueTime, subjectId: a.subjectId, color: subj?.color || '#E9A48C' });
    });

    studySessions.filter((s: StudySession) => !s.completed).forEach((s: StudySession) => {
      const subj = getSubjectById(s.subjectId);
      events.push({ id: s.id, type: 'study', title: s.topic, date: s.date, time: s.startTime, subjectId: s.subjectId, color: subj?.color || '#78B88A' });
    });

    if (filterSubject !== 'all') {
      return events.filter(e => e.subjectId === filterSubject);
    }
    return events;
  }, [exams, assignments, studySessions, filterSubject, getSubjectById]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const getEventsForDate = (date: Date) =>
    allEvents.filter(e => isSameDay(parseISO(e.date), date));

  const selectedDateEvents = selectedDate ? allEvents.filter(e => e.date === selectedDate) : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">Exam Calendar</h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">Track all your academic events in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
            className="!w-auto !py-1.5 text-[12px]"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s: Subject) => <option key={s.id} value={s.id}>{s.code}</option>)}
          </select>
          <div className="flex rounded-lg border border-[var(--color-border)] dark:border-[var(--color-dark-border)] overflow-hidden">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${viewMode === 'month' ? 'bg-[var(--color-blue-primary)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)] dark:hover:bg-[var(--color-dark-surface-elevated)]'}`}
            >Month</button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${viewMode === 'week' ? 'bg-[var(--color-blue-primary)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)] dark:hover:bg-[var(--color-dark-surface-elevated)]'}`}
            >Week</button>
          </div>
          <button onClick={() => setShowAddExam(true)} className="btn btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" />
            Add Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 card p-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="btn btn-ghost btn-icon">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="btn btn-ghost btn-icon">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-center text-[11px] font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] py-1.5">{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map(day => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate === format(day, 'yyyy-MM-dd');
              const isTodayDate = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(format(day, 'yyyy-MM-dd'))}
                  className={`
                    relative p-1.5 min-h-[76px] rounded-lg text-left transition-all
                    ${!isCurrentMonth ? 'opacity-30' : ''}
                    ${isSelected
                      ? 'bg-[rgba(99,154,226,0.18)] ring-1.5 ring-[var(--color-blue-primary)] shadow-xs'
                      : 'hover:bg-[var(--color-surface-hover)]'
                    }
                  `}
                >
                  <div className="mb-1">
                    {isTodayDate ? (
                      <span className="w-5 h-5 rounded-full bg-[#4C85D8] text-white flex items-center justify-center font-bold text-[11px]">
                        {format(day, 'd')}
                      </span>
                    ) : (
                      <span className="text-[12px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] pl-0.5">
                        {format(day, 'd')}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(ev => (
                      <div
                        key={ev.id}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-medium truncate border"
                        style={{
                          backgroundColor: `${ev.color}15`,
                          borderColor: `${ev.color}35`,
                          color: ev.color,
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                        <span className="truncate">{ev.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] font-medium text-[var(--color-text-secondary)] pl-1">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Event Details Panel */}
        <div className="card p-4">
          <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] mb-3">
            {selectedDate ? format(parseISO(selectedDate), 'EEEE, MMMM d') : 'Select a date'}
          </h3>

          {selectedDate ? (
            selectedDateEvents.length > 0 ? (
              <div className="space-y-2">
                {selectedDateEvents.map(ev => {
                  const subject = getSubjectById(ev.subjectId);
                  return (
                    <div key={ev.id} className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-xs">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ev.color }} />
                          <span className={`badge ${ev.type === 'exam' ? 'badge-coral' : ev.type === 'assignment' ? 'badge-pink' : 'badge-green'}`}>
                            {ev.type}
                          </span>
                        </div>
                        {ev.type === 'exam' && (
                          <button
                            onClick={() => deleteExam(ev.id)}
                            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--color-text-secondary)] hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-[13px] font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">{ev.title}</p>
                      <p className="text-[11px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mt-0.5">{subject?.name} ({subject?.code})</p>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
                        <Clock className="w-3 h-3" />
                        <span>{ev.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] text-[13px]">
                <p>No events on this date</p>
                <button
                  onClick={() => setShowAddExam(true)}
                  className="mt-2 text-[var(--color-blue-primary)] hover:underline text-[12px]"
                >
                  Add an event
                </button>
              </div>
            )
          ) : (
            <p className="text-[13px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
              Click a date on the calendar to view events
            </p>
          )}

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
            <p className="text-[11px] font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-2">Event Types</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Exam', color: '#E9A48C' },
                { label: 'Assignment', color: '#C47A9A' },
                { label: 'Study', color: '#78B88A' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showAddExam} onClose={() => setShowAddExam(false)} title="Add Examination">
        <ExamForm onClose={() => setShowAddExam(false)} />
      </Modal>
    </div>
  );
}
