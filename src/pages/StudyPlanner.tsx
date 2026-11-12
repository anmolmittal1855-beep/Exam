import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Play, Pause, RotateCcw, Plus, CheckCircle2, Circle,
  Clock, Calendar, BookOpen, Flame, Trash2,
  ChevronLeft, ChevronRight, Award
} from 'lucide-react';
import {
  format, startOfWeek, endOfWeek, eachDayOfInterval,
  isToday, isSameDay, parseISO, addWeeks, subWeeks
} from 'date-fns';
import Modal from '../components/common/Modal';
import StudySessionForm from '../components/dashboard/StudySessionForm';
import type { StudySession, Subject } from '../types';

export default function StudyPlanner() {
  const { studySessions, subjects, getSubjectById, updateStudySession, deleteStudySession, addNotification } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [showAddModal, setShowAddModal] = useState(false);

  // Focus Timer state
  const [timerMode, setTimerMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timerSubjectId, setTimerSubjectId] = useState<string>(subjects[0]?.id || '');
  const [timerTopic, setTimerTopic] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [sessionsCompletedToday, setSessionsCompletedToday] = useState<number>(() => {
    const saved = localStorage.getItem('ep_focus_sessions_today');
    return saved ? parseInt(saved, 10) : 3;
  });

  const timerDurations = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  // Timer interval countdown
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      if (timerMode === 'focus') {
        const nextCount = sessionsCompletedToday + 1;
        setSessionsCompletedToday(nextCount);
        localStorage.setItem('ep_focus_sessions_today', nextCount.toString());
        addNotification({
          title: 'Focus Session Complete!',
          message: `Great job! You finished 25 minutes of focus${timerTopic ? ` on ${timerTopic}` : ''}. Time for a break!`,
          type: 'success',
          read: false,
        });
      } else {
        addNotification({
          title: 'Break Finished',
          message: 'Break time is over! Ready to focus again?',
          type: 'info',
          read: false,
        });
      }
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft, timerMode, sessionsCompletedToday, timerTopic, addNotification]);

  const switchTimerMode = (mode: 'focus' | 'shortBreak' | 'longBreak') => {
    setTimerMode(mode);
    setTimerRunning(false);
    setTimeLeft(timerDurations[mode]);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(timerDurations[timerMode]);
  };

  const formatTimerDisplay = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timerProgress = useMemo(() => {
    const total = timerDurations[timerMode];
    return ((total - timeLeft) / total) * 100;
  }, [timeLeft, timerMode]);

  // Week days calculation
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  // Filter sessions for selected day
  const dailySessions = useMemo(() => {
    return studySessions.filter((s: StudySession) => s.date === selectedDay);
  }, [studySessions, selectedDay]);

  // Planned vs completed study hours for the week
  const weekStats = useMemo(() => {
    const weekDayStrings = weekDays.map(d => format(d, 'yyyy-MM-dd'));
    const sessionsThisWeek = studySessions.filter((s: StudySession) => weekDayStrings.includes(s.date));
    const plannedMinutes = sessionsThisWeek.reduce((acc, s) => acc + (s.duration || 60), 0);
    const completedMinutes = sessionsThisWeek.filter(s => s.completed).reduce((acc, s) => acc + (s.duration || 60), 0);
    return {
      plannedHours: (plannedMinutes / 60).toFixed(1),
      completedHours: (completedMinutes / 60).toFixed(1),
      completionRate: plannedMinutes > 0 ? Math.round((completedMinutes / plannedMinutes) * 100) : 0,
      totalSessions: sessionsThisWeek.length,
      completedSessions: sessionsThisWeek.filter(s => s.completed).length,
    };
  }, [studySessions, weekDays]);

  const toggleSessionCompleted = (session: StudySession) => {
    updateStudySession(session.id, { completed: !session.completed });
  };

  const startSessionInTimer = (session: StudySession) => {
    setTimerSubjectId(session.subjectId);
    setTimerTopic(session.topic);
    switchTimerMode('focus');
    setTimerRunning(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
            Study Planner & Focus Timer
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
            Plan your revision sessions, build streaks, and stay focused with Pomodoro
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary btn-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Plan Study Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Focus Timer (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-blue-light)] dark:bg-[rgba(101,157,225,0.15)] flex items-center justify-center text-[var(--color-blue-primary)]">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                    Focus Timer
                  </h2>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">Deep work interval</p>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="flex rounded-lg border border-[var(--color-border)] p-0.5 bg-[var(--color-surface-elevated)]">
                <button
                  onClick={() => switchTimerMode('focus')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    timerMode === 'focus' ? 'bg-[var(--color-surface)] shadow-xs text-[var(--color-text-primary)] font-semibold border border-[var(--color-border)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  Focus
                </button>
                <button
                  onClick={() => switchTimerMode('shortBreak')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    timerMode === 'shortBreak' ? 'bg-[var(--color-surface)] shadow-xs text-[var(--color-text-primary)] font-semibold border border-[var(--color-border)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  Short
                </button>
                <button
                  onClick={() => switchTimerMode('longBreak')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    timerMode === 'longBreak' ? 'bg-[var(--color-surface)] shadow-xs text-[var(--color-text-primary)] font-semibold border border-[var(--color-border)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  Long
                </button>
              </div>
            </div>

            {/* Circular Progress Display */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="transparent"
                    stroke="var(--color-border)"
                    strokeWidth="6"
                    className="opacity-40"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="transparent"
                    stroke={timerMode === 'focus' ? 'var(--color-blue-primary)' : timerMode === 'shortBreak' ? 'var(--color-green-muted)' : '#C47A9A'}
                    strokeWidth="6"
                    strokeDasharray={276.46}
                    strokeDashoffset={276.46 - (276.46 * timerProgress) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>

                {/* Inner Time Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] font-mono">
                    {formatTimerDisplay(timeLeft)}
                  </span>
                  <span className="text-[11px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mt-1">
                    {timerMode === 'focus' ? 'Focus Session' : 'Rest Break'}
                  </span>
                </div>
              </div>

              {/* Subject Tag & Topic Input */}
              <div className="w-full mt-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[var(--color-text-secondary)] block mb-1">Target Subject</label>
                    <select
                      value={timerSubjectId}
                      onChange={e => setTimerSubjectId(e.target.value)}
                      className="!py-1 !text-[11px]"
                    >
                      {subjects.map((s: Subject) => (
                        <option key={s.id} value={s.id}>{s.code}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--color-text-secondary)] block mb-1">Active Topic</label>
                    <input
                      type="text"
                      placeholder="e.g. Graph Traversal"
                      value={timerTopic}
                      onChange={e => setTimerTopic(e.target.value)}
                      className="!py-1 !text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`btn ${timerRunning ? 'btn-secondary' : 'btn-primary'} px-6 py-2 flex items-center gap-2`}
                >
                  {timerRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Start Focus
                    </>
                  )}
                </button>
                <button
                  onClick={resetTimer}
                  className="btn btn-secondary p-2.5 rounded-lg text-[var(--color-text-secondary)]"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Daily Sessions Streak */}
            <div className="pt-3 border-t border-[var(--color-border)] dark:border-[var(--color-dark-border)] flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                <Award className="w-4 h-4 text-[#B09A32]" />
                <span>Today's Sessions:</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                <span>{sessionsCompletedToday}</span>
                <span className="text-[11px] font-normal text-[var(--color-text-secondary)]">intervals ({(sessionsCompletedToday * 25 / 60).toFixed(1)} hrs)</span>
              </div>
            </div>
          </div>

          {/* Weekly Target Progress Card */}
          <div className="card p-4 space-y-3">
            <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
              This Week's Goal
            </h3>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                {weekStats.completedHours} <span className="text-[13px] font-normal text-[var(--color-text-secondary)]">/ {weekStats.plannedHours} hrs</span>
              </div>
              <span className="badge badge-blue font-semibold">{weekStats.completionRate}% Done</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[var(--color-border)] dark:bg-[var(--color-dark-border)] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[var(--color-blue-primary)] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(weekStats.completionRate, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)] pt-1">
              <span>{weekStats.completedSessions} of {weekStats.totalSessions} sessions completed</span>
              <span>Streak: 4 days 🔥</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Schedule Planner (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card p-4 space-y-4">
            {/* Week Navigator */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)] pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
                  className="btn btn-ghost p-1.5"
                  title="Previous week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                  {format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}
                </span>
                <button
                  onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                  className="btn btn-ghost p-1.5"
                  title="Next week"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* View toggle */}
              <div className="flex rounded-lg border border-[var(--color-border)] dark:border-[var(--color-dark-border)] overflow-hidden">
                <button
                  onClick={() => setViewMode('daily')}
                  className={`px-3 py-1 text-[11px] font-medium transition-colors ${
                    viewMode === 'daily'
                      ? 'bg-[var(--color-blue-primary)] text-white'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)]'
                  }`}
                >
                  Day View
                </button>
                <button
                  onClick={() => setViewMode('weekly')}
                  className={`px-3 py-1 text-[11px] font-medium transition-colors ${
                    viewMode === 'weekly'
                      ? 'bg-[var(--color-blue-primary)] text-white'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)]'
                  }`}
                >
                  Week Matrix
                </button>
              </div>
            </div>

            {/* Days Horizontal Strip */}
            <div className="grid grid-cols-7 gap-1.5">
              {weekDays.map(day => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const isDaySelected = selectedDay === dayStr;
                const isDayToday = isToday(day);
                const daySessionCount = studySessions.filter((s: StudySession) => s.date === dayStr).length;

                return (
                  <button
                    key={dayStr}
                    onClick={() => setSelectedDay(dayStr)}
                    className={`p-2 rounded-lg text-center transition-all ${
                      isDaySelected
                        ? 'bg-[var(--color-blue-primary)] text-white shadow-xs'
                        : isDayToday
                        ? 'border border-[var(--color-blue-primary)] text-[var(--color-blue-primary)] bg-[var(--color-blue-light)]/20'
                        : 'hover:bg-[var(--color-bg-main)] dark:hover:bg-[var(--color-dark-surface-elevated)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    <div className="text-[10px] font-medium uppercase">{format(day, 'EEE')}</div>
                    <div className={`text-[14px] font-bold mt-0.5 ${isDaySelected ? 'text-white' : 'text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]'}`}>
                      {format(day, 'd')}
                    </div>
                    {daySessionCount > 0 && (
                      <div className="mt-1 flex justify-center">
                        <span className={`w-1.5 h-1.5 rounded-full ${isDaySelected ? 'bg-white' : 'bg-[var(--color-blue-primary)]'}`} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* VIEW MODE: Daily Sessions List */}
            {viewMode === 'daily' ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                    Sessions for {format(parseISO(selectedDay), 'EEEE, MMMM d')}
                  </h3>
                  <span className="text-[11px] text-[var(--color-text-secondary)]">
                    {dailySessions.length} session{dailySessions.length === 1 ? '' : 's'} scheduled
                  </span>
                </div>

                {dailySessions.length > 0 ? (
                  <div className="space-y-2">
                    {dailySessions.map((session: StudySession) => {
                      const subject = getSubjectById(session.subjectId);
                      return (
                        <div
                          key={session.id}
                          className={`p-3.5 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] hover:border-[var(--color-blue-primary)]/50 transition-all ${
                            session.completed ? 'opacity-70 bg-[var(--color-bg-main)]/30' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => toggleSessionCompleted(session)}
                                className="mt-0.5 text-[var(--color-text-secondary)] hover:text-[var(--color-green-muted)] transition-colors"
                              >
                                {session.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-[var(--color-green-muted)]" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                              </button>
                              <div>
                                <h4 className={`text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] ${session.completed ? 'line-through text-[var(--color-text-secondary)]' : ''}`}>
                                  {session.topic}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className="inline-block w-2 h-2 rounded-full"
                                    style={{ backgroundColor: subject?.color || '#659DE1' }}
                                  />
                                  <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">
                                    {subject?.code} · {subject?.name}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Time & Quick Action */}
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)]">
                                  <Clock className="w-3 h-3" />
                                  <span>{session.startTime}</span>
                                </div>
                                <span className="badge badge-neutral text-[10px] mt-0.5">
                                  {session.duration} mins
                                </span>
                              </div>

                              {!session.completed && (
                                <button
                                  onClick={() => startSessionInTimer(session)}
                                  className="btn btn-ghost p-1.5 text-[var(--color-blue-primary)] hover:bg-[var(--color-blue-light)]/20"
                                  title="Start in focus timer"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                </button>
                              )}

                              <button
                                onClick={() => deleteStudySession(session.id)}
                                className="btn btn-ghost p-1.5 text-[var(--color-text-secondary)] hover:text-red-500"
                                title="Delete session"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-[var(--color-text-secondary)]">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-[var(--color-blue-primary)]" />
                    <p className="text-[13px] font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                      No study sessions for this date
                    </p>
                    <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
                      Schedule a focused session to stay on track with your syllabus
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="btn btn-primary btn-sm mt-3"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Study Session
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* VIEW MODE: Weekly Grid Matrix */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {weekDays.map(day => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const dayEvents = studySessions.filter((s: StudySession) => s.date === dayStr);

                  return (
                    <div
                      key={dayStr}
                      onClick={() => {
                        setSelectedDay(dayStr);
                        setViewMode('daily');
                      }}
                      className="p-3 rounded-lg border border-[var(--color-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-bg-main)]/50 hover:bg-[var(--color-bg-main)] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                          {format(day, 'EEE, MMM d')}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-secondary)]">
                          {dayEvents.length} session{dayEvents.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map(ev => {
                          const subj = getSubjectById(ev.subjectId);
                          return (
                            <div
                              key={ev.id}
                              className="text-[11px] p-1 rounded bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-border)] dark:border-[var(--color-dark-border)] truncate flex items-center gap-1.5"
                            >
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: subj?.color || '#659DE1' }} />
                              <span className="truncate">{ev.topic}</span>
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <div className="text-[10px] text-[var(--color-text-secondary)] pl-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                        {dayEvents.length === 0 && (
                          <div className="text-[11px] text-[var(--color-text-secondary)] italic py-2 text-center">
                            Rest day
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Session Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Schedule Study Session"
      >
        <StudySessionForm onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  );
}
