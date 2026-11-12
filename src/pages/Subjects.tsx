import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus, GraduationCap, BookOpen, Calendar, ClipboardList,
  CheckCircle2, Circle, Clock, Trash2, Edit2, ChevronRight,
  FileText, ArrowLeft, Check, Sparkles
} from 'lucide-react';
import Modal from '../components/common/Modal';
import SubjectForm from '../components/dashboard/SubjectForm';
import type { Subject, Topic, TopicStatus, Exam, Assignment, Resource } from '../types';
import { generateId } from '../utils/helpers';

export default function Subjects() {
  const {
    subjects, exams, assignments, resources,
    getSubjectPreparation, updateSubject, deleteSubject
  } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  // Selected subject object
  const activeSubject = useMemo(() => {
    return subjects.find((s: Subject) => s.id === selectedSubjectId) || null;
  }, [subjects, selectedSubjectId]);

  // Related data for active subject
  const subjectExams = useMemo(() => {
    if (!activeSubject) return [];
    return exams.filter((e: Exam) => e.subjectId === activeSubject.id);
  }, [exams, activeSubject]);

  const subjectAssignments = useMemo(() => {
    if (!activeSubject) return [];
    return assignments.filter((a: Assignment) => a.subjectId === activeSubject.id);
  }, [assignments, activeSubject]);

  const subjectResources = useMemo(() => {
    if (!activeSubject) return [];
    return resources.filter((r: Resource) => r.subjectId === activeSubject.id);
  }, [resources, activeSubject]);

  // Handle topic status cycle: not-started -> in-progress -> completed -> not-started
  const handleToggleTopicStatus = (topicId: string, currentStatus: TopicStatus) => {
    if (!activeSubject) return;
    const nextStatus: TopicStatus =
      currentStatus === 'not-started'
        ? 'in-progress'
        : currentStatus === 'in-progress'
        ? 'completed'
        : 'not-started';

    const updatedTopics = activeSubject.topics.map((t: Topic) =>
      t.id === topicId ? { ...t, status: nextStatus } : t
    );

    updateSubject(activeSubject.id, { topics: updatedTopics });
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubject || !newTopicName.trim()) return;

    const newTopic: Topic = {
      id: generateId(),
      name: newTopicName.trim(),
      status: 'not-started',
    };

    updateSubject(activeSubject.id, {
      topics: [...activeSubject.topics, newTopic],
    });
    setNewTopicName('');
  };

  const handleDeleteTopic = (topicId: string) => {
    if (!activeSubject) return;
    updateSubject(activeSubject.id, {
      topics: activeSubject.topics.filter((t: Topic) => t.id !== topicId),
    });
  };

  return (
    <div className="space-y-4">
      {/* If a subject workspace is open */}
      {activeSubject ? (
        <div className="space-y-4">
          {/* Back button and breadcrumb */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedSubjectId(null)}
              className="btn btn-ghost btn-sm flex items-center gap-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all subjects</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${activeSubject.name}?`)) {
                    deleteSubject(activeSubject.id);
                    setSelectedSubjectId(null);
                  }
                }}
                className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Subject
              </button>
            </div>
          </div>

          {/* Subject Workspace Hero Banner */}
          <div className="card p-5 relative overflow-hidden border-l-4" style={{ borderLeftColor: activeSubject.color }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-neutral text-[11px] font-mono font-semibold">
                    {activeSubject.code}
                  </span>
                  <span className="text-[12px] text-[var(--color-text-secondary)]">
                    Semester {activeSubject.semester} · {activeSubject.faculty}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                  {activeSubject.name}
                </h1>
                <p className="text-[12px] text-[var(--color-text-secondary)] mt-1">
                  {activeSubject.topics.length} total topics / chapters
                </p>
              </div>

              {/* Subject Prep Meter */}
              <div className="sm:text-right bg-[var(--color-surface-elevated)] p-3 rounded-xl border border-[var(--color-border)] min-w-[160px] shadow-xs">
                <div className="text-[11px] text-[var(--color-text-secondary)] mb-0.5">Syllabus Prepared</div>
                <div className="text-2xl font-bold" style={{ color: activeSubject.color }}>
                  {getSubjectPreparation(activeSubject.id)}%
                </div>
                <div className="w-full bg-[var(--color-border)] dark:bg-[var(--color-dark-border)] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${getSubjectPreparation(activeSubject.id)}%`,
                      backgroundColor: activeSubject.color,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Tabs / Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Topic & Syllabus Checklist (7 cols) */}
            <div className="lg:col-span-7 card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                    Topic Checklist & Syllabus
                  </h2>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">
                    Click status to cycle: Not Started → In Progress → Completed
                  </p>
                </div>
                <span className="text-[11px] text-[var(--color-text-secondary)]">
                  {activeSubject.topics.filter((t: Topic) => t.status === 'completed').length} / {activeSubject.topics.length} done
                </span>
              </div>

              {/* Add Topic Input */}
              <form onSubmit={handleAddTopic} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new chapter or topic..."
                  value={newTopicName}
                  onChange={e => setNewTopicName(e.target.value)}
                  className="!py-1.5 !text-[12px] flex-1"
                />
                <button type="submit" className="btn btn-secondary btn-sm">
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </form>

              {/* Topics List */}
              <div className="space-y-1.5">
                {activeSubject.topics.map((topic: Topic) => {
                  const isDone = topic.status === 'completed';
                  const isInProg = topic.status === 'in-progress';

                  return (
                    <div
                      key={topic.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border border-[var(--color-border)] dark:border-[var(--color-dark-border)] hover:bg-[var(--color-bg-main)]/50 transition-colors ${
                        isDone ? 'bg-[var(--color-bg-main)]/30 opacity-75' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleTopicStatus(topic.id, topic.status)}
                          className="transition-transform active:scale-90"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-[var(--color-green-muted)]" />
                          ) : isInProg ? (
                            <Clock className="w-4 h-4 text-[var(--color-blue-primary)]" />
                          ) : (
                            <Circle className="w-4 h-4 text-[var(--color-text-secondary)]" />
                          )}
                        </button>
                        <span className={`text-[13px] ${isDone ? 'line-through text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] font-medium'}`}>
                          {topic.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleTopicStatus(topic.id, topic.status)}
                          className={`badge text-[10px] cursor-pointer ${
                            isDone
                              ? 'badge-green'
                              : isInProg
                              ? 'badge-blue'
                              : 'badge-neutral'
                          }`}
                        >
                          {topic.status.replace('-', ' ')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTopic(topic.id)}
                          className="p-1 rounded text-[var(--color-text-secondary)] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar info (5 cols): Exams, Assignments, Resources */}
            <div className="lg:col-span-5 space-y-4">
              {/* Upcoming Exams for this subject */}
              <div className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--color-coral-muted)]" />
                    <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                      Examinations
                    </h3>
                  </div>
                  <span className="text-[11px] text-[var(--color-text-secondary)]">
                    {subjectExams.length} scheduled
                  </span>
                </div>

                {subjectExams.length > 0 ? (
                  <div className="space-y-2">
                    {subjectExams.map((e: Exam) => (
                      <div key={e.id} className="p-2.5 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                            {e.title}
                          </span>
                          <span className="badge badge-coral text-[10px]">{e.priority}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-secondary)] mt-1">
                          <span>{e.date}</span>
                          <span>{e.time}</span>
                          {e.duration && <span>{e.duration} mins</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[12px] text-[var(--color-text-secondary)] py-2 text-center">
                    No exams scheduled for this subject
                  </div>
                )}
              </div>

              {/* Assignments for this subject */}
              <div className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[var(--color-blue-primary)]" />
                    <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                      Assignments
                    </h3>
                  </div>
                  <span className="text-[11px] text-[var(--color-text-secondary)]">
                    {subjectAssignments.length} total
                  </span>
                </div>

                {subjectAssignments.length > 0 ? (
                  <div className="space-y-2">
                    {subjectAssignments.map((a: Assignment) => (
                      <div key={a.id} className="p-2.5 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                            {a.title}
                          </span>
                          <span className={`badge ${a.status === 'completed' ? 'badge-green' : 'badge-yellow'} text-[10px]`}>
                            {a.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">
                          Due: {a.dueDate} at {a.dueTime}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[12px] text-[var(--color-text-secondary)] py-2 text-center">
                    No assignments found
                  </div>
                )}
              </div>

              {/* Resources for this subject */}
              <div className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--color-green-muted)]" />
                    <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                      Subject Materials
                    </h3>
                  </div>
                  <span className="text-[11px] text-[var(--color-text-secondary)]">
                    {subjectResources.length} files/links
                  </span>
                </div>

                {subjectResources.length > 0 ? (
                  <div className="space-y-2">
                    {subjectResources.map((r: Resource) => (
                      <div key={r.id} className="p-2.5 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-xs">
                        <span className="text-[12px] font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] block">
                          {r.title}
                        </span>
                        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)] mt-1">
                          <span className="capitalize">{r.category.replace('-', ' ')}</span>
                          {r.url && (
                            <a href={r.url} target="_blank" rel="noreferrer" className="text-[var(--color-blue-primary)] hover:underline">
                              Open link
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[12px] text-[var(--color-text-secondary)] py-2 text-center">
                    No resources added yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SUBJECTS LIBRARY OVERVIEW (Cards Grid) */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                Subject Library
              </h1>
              <p className="text-[13px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
                Manage course curriculums, topic completion, faculty, and subject performance
              </p>
            </div>
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="btn btn-primary btn-sm self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Subject
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject: Subject) => {
              const prep = getSubjectPreparation(subject.id);
              const relatedExams = exams.filter((e: Exam) => e.subjectId === subject.id);
              const relatedAssignments = assignments.filter((a: Assignment) => a.subjectId === subject.id);
              const completedTopicsCount = subject.topics.filter((t: Topic) => t.status === 'completed').length;

              return (
                <div
                  key={subject.id}
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className="card p-4 hover:shadow-card-hover transition-all cursor-pointer border-t-3 flex flex-col justify-between group"
                  style={{ borderTopColor: subject.color }}
                >
                  <div>
                    {/* Header: Code & Semester */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge badge-neutral text-[11px] font-mono font-medium">
                        {subject.code}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-secondary)]">
                        Sem {subject.semester}
                      </span>
                    </div>

                    {/* Subject Name */}
                    <h3 className="text-[15px] font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] group-hover:text-[var(--color-blue-primary)] transition-colors line-clamp-1">
                      {subject.name}
                    </h3>

                    {/* Faculty */}
                    <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
                      {subject.faculty}
                    </p>

                    {/* Preparation Progress */}
                    <div className="mt-4 pt-3 border-t border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
                      <div className="flex items-center justify-between text-[12px] mb-1.5">
                        <span className="text-[var(--color-text-secondary)] font-medium">Preparation</span>
                        <span className="font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">{prep}%</span>
                      </div>
                      <div className="w-full bg-[var(--color-border)] dark:bg-[var(--color-dark-border)] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${prep}%`, backgroundColor: subject.color }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer details: counts & arrow */}
                  <div className="mt-4 pt-3 border-t border-[var(--color-border)] dark:border-[var(--color-dark-border)] flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-3">
                      <span>{completedTopicsCount}/{subject.topics.length} topics</span>
                      <span>{relatedExams.length} exam{relatedExams.length === 1 ? '' : 's'}</span>
                      <span>{relatedAssignments.length} task{relatedAssignments.length === 1 ? '' : 's'}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal
        isOpen={showAddSubjectModal}
        onClose={() => setShowAddSubjectModal(false)}
        title="Add New Subject"
      >
        <SubjectForm onClose={() => setShowAddSubjectModal(false)} />
      </Modal>
    </div>
  );
}
