import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar, ClipboardList, CheckCircle2, Target,
  Clock, ArrowRight, Play, Plus, BookOpen,
  GraduationCap, AlertTriangle, TrendingUp, Flame
} from 'lucide-react';
import { format, differenceInDays, differenceInHours, isPast, isToday, isTomorrow, parseISO, startOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import Modal from '../common/Modal';
import ExamForm from './ExamForm';
import AssignmentForm from './AssignmentForm';
import StudySessionForm from './StudySessionForm';
import SubjectForm from './SubjectForm';

export default function Overview() {
  const {
    subjects, exams, assignments, studySessions, profile,
    getSubjectById, getSubjectPreparation, getOverallPreparation,
    updateStudySession
  } = useApp();

  const [modalType, setModalType] = useState<'exam' | 'assignment' | 'session' | 'subject' | null>(null);

  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');

  // Greeting
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const semesterLabel = `Semester ${profile.semester}`;

  // Upcoming exams (sorted by date)
  const upcomingExams = useMemo(() =>
    exams
      .filter(e => !isPast(parseISO(e.date)) || isToday(parseISO(e.date)))
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()),
    [exams]
  );

  // Next exam
  const nextExam = upcomingExams[0];

  // Pending assignments
  const pendingAssignments = useMemo(() =>
    assignments.filter(a => a.status !== 'completed'),
    [assignments]
  );

  // Completed tasks (assignments + study sessions)
  const completedTasks = useMemo(() =>
    assignments.filter(a => a.status === 'completed').length +
    studySessions.filter(s => s.completed).length,
    [assignments, studySessions]
  );

  // Overall preparation
  const overallPrep = getOverallPreparation();

  // Today's sessions
  const todaySessions = useMemo(() =>
    studySessions.filter(s => s.date === todayStr),
    [studySessions, todayStr]
  );

  // Upcoming schedule (next 14 days, mixed events)
  const scheduleItems = useMemo(() => {
    const items: { id: string; type: string; title: string; subject: string; date: string; time: string; color: string; status?: string }[] = [];

    exams.forEach(e => {
      const subj = getSubjectById(e.subjectId);
      if (!isPast(parseISO(e.date)) || isToday(parseISO(e.date))) {
        items.push({
          id: e.id, type: 'Exam', title: e.title,
          subject: subj?.name || '', date: e.date, time: e.time,
          color: subj?.color || '#659DE1',
        });
      }
    });

    assignments.forEach(a => {
      const subj = getSubjectById(a.subjectId);
      if (a.status !== 'completed') {
        items.push({
          id: a.id, type: 'Assignment', title: a.title,
          subject: subj?.name || '', date: a.dueDate, time: a.dueTime,
          color: subj?.color || '#E9A48C',
          status: a.status,
        });
      }
    });

    studySessions.forEach(s => {
      const subj = getSubjectById(s.subjectId);
      if (!s.completed && !isPast(parseISO(s.date))) {
        items.push({
          id: s.id, type: 'Study', title: s.topic,
          subject: subj?.name || '', date: s.date, time: s.startTime,
          color: subj?.color || '#78B88A',
        });
      }
    });

    return items.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()).slice(0, 6);
  }, [exams, assignments, studySessions, getSubjectById]);

  // Subject preparation data for chart
  const prepChartData = useMemo(() =>
    subjects.map(s => ({
      name: s.code,
      fullName: s.name,
      value: getSubjectPreparation(s.id),
      color: s.color,
    })),
    [subjects, getSubjectPreparation]
  );

  // Weekly study hours (mock aggregation from sessions)
  const weeklyHours = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      day,
      hours: Math.round((2 + Math.random() * 4) * 10) / 10,
    }));
  }, []);

  // Date helpers
  function getDateLabel(dateStr: string): string {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    const diff = differenceInDays(d, startOfDay(now));
    if (diff <= 7) return `In ${diff} days`;
    return format(d, 'MMM dd');
  }

  // Motivational messages
  const motivationalMessages = [
    "You're making progress. Let's keep the momentum going.",
    "Consistency beats intensity. One topic at a time.",
    "Your future self will thank you for today's effort.",
    "Stay focused. Every hour of study counts.",
    "Small steps lead to big results. Keep going."
  ];
  const motivationalMessage = motivationalMessages[now.getDate() % motivationalMessages.length];

  return (
    <div className="space-y-5">
      {/* A. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
            {greeting}, {profile.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[13px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
              {format(now, 'EEEE, MMMM d, yyyy')}
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">•</span>
            <span className="badge badge-blue">{semesterLabel}</span>
          </div>
          <p className="text-[13px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mt-2 italic">
            "{motivationalMessage}"
          </p>
        </div>
      </div>

      {/* B. Academic Overview — 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={Calendar}
          label="Upcoming Exams"
          value={upcomingExams.length}
          sub={upcomingExams.length > 0 ? `Next in ${differenceInDays(parseISO(upcomingExams[0].date), startOfDay(now))} days` : 'None scheduled'}
          color="var(--color-blue-light)"
          iconColor="var(--color-blue-primary)"
        />
        <MetricCard
          icon={ClipboardList}
          label="Pending Assignments"
          value={pendingAssignments.length}
          sub={`${assignments.filter(a => isPast(parseISO(a.dueDate)) && a.status !== 'completed').length} overdue`}
          color="var(--color-pink-soft)"
          iconColor="#C47A9A"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Completed Tasks"
          value={completedTasks}
          sub="This semester"
          color="var(--color-green-soft)"
          iconColor="var(--color-green-muted)"
        />
        <MetricCard
          icon={Target}
          label="Overall Preparation"
          value={`${overallPrep}%`}
          sub={overallPrep >= 70 ? 'On track' : overallPrep >= 40 ? 'Needs attention' : 'Critical'}
          color="var(--color-yellow-soft)"
          iconColor="#A09A60"
        />
      </div>

      {/* C & D — Next Exam + Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Next Examination */}
        <div className="lg:col-span-2 card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">Next Examination</h2>
            <span className="badge badge-coral">
              <Flame className="w-3 h-3" />
              Priority
            </span>
          </div>

          {nextExam ? (() => {
            const subject = getSubjectById(nextExam.subjectId);
            const examDate = parseISO(nextExam.date);
            const daysLeft = differenceInDays(examDate, startOfDay(now));
            const hoursLeft = differenceInHours(examDate, now) % 24;
            const prep = subject ? getSubjectPreparation(subject.id) : 0;

            return (
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: subject?.color ? `${subject.color}18` : 'var(--color-blue-light)' }}
                  >
                    <GraduationCap className="w-5 h-5" style={{ color: subject?.color || 'var(--color-blue-primary)' }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                      {subject?.name || 'Unknown Subject'}
                    </h3>
                    <p className="text-[12px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
                      {subject?.code} • {nextExam.title}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 mb-3.5">
                  <div className="text-center p-2.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-xs">
                    <p className="text-[20px] font-bold text-[var(--color-text-primary)] font-mono leading-tight">{daysLeft}</p>
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-[var(--color-text-secondary)] mt-0.5">Days Left</p>
                  </div>
                  <div className="text-center p-2.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-xs">
                    <p className="text-[20px] font-bold text-[var(--color-text-primary)] font-mono leading-tight">{hoursLeft > 0 ? hoursLeft : 0}</p>
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-[var(--color-text-secondary)] mt-0.5">Hours</p>
                  </div>
                  <div className="text-center p-2.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-xs">
                    <p className="text-[20px] font-bold text-[var(--color-text-primary)] font-mono leading-tight">{prep}%</p>
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-[var(--color-text-secondary)] mt-0.5">Prepared</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] font-medium">Preparation Progress</span>
                    <span className="font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">{prep}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${prep}%`,
                        backgroundColor: prep >= 70 ? 'var(--color-green-muted)' : prep >= 40 ? 'var(--color-blue-primary)' : 'var(--color-coral-muted)',
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--color-border)] dark:border-[var(--color-dark-border)] text-[11px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                    {format(examDate, 'MMM dd, yyyy')}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                    {nextExam.time} • {nextExam.duration} min
                  </span>
                </div>
              </div>
            );
          })() : (
            <div className="text-center py-8 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] text-[13px]">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No upcoming exams
            </div>
          )}
        </div>

        {/* Upcoming Schedule */}
        <div className="lg:col-span-3 card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">Upcoming Schedule</h2>
            <button
              onClick={() => setModalType('exam')}
              className="text-[11px] text-[var(--color-blue-primary)] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Event
            </button>
          </div>

          {scheduleItems.length > 0 ? (
            <div className="space-y-1">
              {scheduleItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--color-bg-main)] dark:hover:bg-[var(--color-dark-surface-elevated)] transition-colors group"
                >
                  <div
                    className="w-1 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] truncate">
                        {item.title}
                      </span>
                      <span className={`badge ${item.type === 'Exam' ? 'badge-coral' : item.type === 'Assignment' ? 'badge-pink' : 'badge-green'}`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] truncate">
                      {item.subject}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[12px] font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                      {getDateLabel(item.date)}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] text-[13px]">
              Nothing scheduled yet
            </div>
          )}
        </div>
      </div>

      {/* E — Preparation Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Subject Preparation */}
        <div className="card p-4">
          <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] mb-3">Subject Preparation</h2>
          {prepChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={prepChartData} barSize={28} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: 'var(--shadow-dropdown)',
                  }}
                  formatter={(value: any, _name: any, props: any) => [`${value ?? 0}%`, props?.payload?.fullName || '']}
                  labelFormatter={() => ''}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {prepChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.75} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-[var(--color-text-secondary)] text-[13px]">
              Add subjects to see preparation analytics
            </div>
          )}
        </div>

        {/* Weekly Study Hours */}
        <div className="card p-4">
          <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] mb-3">Weekly Study Hours</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyHours} barSize={28} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: 'var(--shadow-dropdown)',
                }}
                formatter={(value: any) => [`${value ?? 0} hrs`, 'Study Time']}
              />
              <Bar dataKey="hours" fill="var(--color-blue-primary)" fillOpacity={0.65} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* F — Today's Focus + G — Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Today's Focus */}
        <div className="lg:col-span-3 card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">Today's Focus</h2>
            <span className="text-[11px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
              {todaySessions.filter(s => s.completed).length}/{todaySessions.length} completed
            </span>
          </div>

          {todaySessions.length > 0 ? (
            <div className="space-y-1.5">
              {todaySessions.map(session => {
                const subject = getSubjectById(session.subjectId);
                return (
                  <div
                    key={session.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${session.completed ? 'opacity-60' : 'hover:bg-[var(--color-bg-main)] dark:hover:bg-[var(--color-dark-surface-elevated)]'}`}
                  >
                    <button
                      onClick={() => updateStudySession(session.id, { completed: !session.completed })}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        session.completed
                          ? 'bg-[var(--color-green-muted)] border-[var(--color-green-muted)]'
                          : 'border-[var(--color-border)] dark:border-[var(--color-dark-border)] hover:border-[var(--color-green-muted)]'
                      }`}
                    >
                      {session.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                    <div
                      className="w-1 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: subject?.color || 'var(--color-blue-primary)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium ${session.completed ? 'line-through text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]'}`}>
                        {session.topic}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
                        {subject?.name} • {session.startTime} • {session.duration} min
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] text-[13px]">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No study sessions planned for today
              <button
                onClick={() => setModalType('session')}
                className="block mx-auto mt-2 text-[var(--color-blue-primary)] hover:underline text-[12px]"
              >
                Plan a session
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 card p-4">
          <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Add Exam', icon: Calendar, type: 'exam' as const, color: 'var(--color-blue-light)', iconColor: 'var(--color-blue-primary)' },
              { label: 'Add Assignment', icon: ClipboardList, type: 'assignment' as const, color: 'var(--color-pink-soft)', iconColor: '#C47A9A' },
              { label: 'Study Session', icon: BookOpen, type: 'session' as const, color: 'var(--color-green-soft)', iconColor: 'var(--color-green-muted)' },
              { label: 'Add Subject', icon: GraduationCap, type: 'subject' as const, color: 'var(--color-yellow-soft)', iconColor: '#A09A60' },
            ].map(action => (
              <button
                key={action.type}
                onClick={() => setModalType(action.type)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)] hover:border-[var(--color-blue-primary)] hover:shadow-sm transition-all group"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{ backgroundColor: action.color }}
                >
                  <action.icon className="w-4 h-4" style={{ color: action.iconColor }} />
                </div>
                <span className="text-[11px] font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Assignment completion stats */}
          <div className="mt-4 pt-3 border-t border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">Assignment Completion</span>
              <span className="text-[11px] font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                {assignments.filter(a => a.status === 'completed').length}/{assignments.length}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill bg-[var(--color-green-muted)]"
                style={{
                  width: `${assignments.length > 0 ? (assignments.filter(a => a.status === 'completed').length / assignments.length * 100) : 0}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={modalType === 'exam'} onClose={() => setModalType(null)} title="Add Examination">
        <ExamForm onClose={() => setModalType(null)} />
      </Modal>
      <Modal isOpen={modalType === 'assignment'} onClose={() => setModalType(null)} title="Add Assignment">
        <AssignmentForm onClose={() => setModalType(null)} />
      </Modal>
      <Modal isOpen={modalType === 'session'} onClose={() => setModalType(null)} title="Add Study Session">
        <StudySessionForm onClose={() => setModalType(null)} />
      </Modal>
      <Modal isOpen={modalType === 'subject'} onClose={() => setModalType(null)} title="Add Subject">
        <SubjectForm onClose={() => setModalType(null)} />
      </Modal>
    </div>
  );
}

// ========================================
// METRIC CARD
// ========================================
function MetricCard({ icon: Icon, label, value, sub, color, iconColor }: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub: string;
  color: string;
  iconColor: string;
}) {
  return (
    <div className="card p-4 hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shadow-xs"
          style={{ backgroundColor: color }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} strokeWidth={1.8} />
        </div>
      </div>
      <p className="text-[26px] font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] leading-tight tracking-tight">{value}</p>
      <p className="text-[11px] font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mt-1.5 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: iconColor }} />
        {sub}
      </p>
    </div>
  );
}
