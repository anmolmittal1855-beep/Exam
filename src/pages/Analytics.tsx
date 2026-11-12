import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  PieChart, Pie, LineChart, Line, CartesianGrid
} from 'recharts';
import {
  TrendingUp, Award, Calculator, BookOpen,
  CheckCircle2, Clock, AlertCircle, Plus, Trash2, GraduationCap
} from 'lucide-react';
import type { Subject, Topic, Assignment, StudySession, GradeEntry } from '../types';
import { generateId } from '../utils/helpers';

const gradePointsMap: Record<string, number> = {
  'A+': 10,
  'A': 9,
  'B+': 8,
  'B': 7,
  'C+': 6,
  'C': 5,
  'D': 4,
  'F': 0,
};

export default function Analytics() {
  const {
    subjects, assignments, studySessions, exams,
    getSubjectPreparation, getOverallPreparation
  } = useApp();

  // CGPA Calculator Course Rows
  const [courses, setCourses] = useState<GradeEntry[]>([
    { id: '1', subjectName: 'Data Structures & Algorithms', credits: 4, grade: 'A+' },
    { id: '2', subjectName: 'Operating Systems', credits: 4, grade: 'A' },
    { id: '3', subjectName: 'Database Management Systems', credits: 3, grade: 'A' },
    { id: '4', subjectName: 'Computer Networks', credits: 3, grade: 'B+' },
    { id: '5', subjectName: 'Software Engineering', credits: 3, grade: 'A' },
  ]);

  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState<number>(3);
  const [newCourseGrade, setNewCourseGrade] = useState<string>('A');

  // GPA calculation
  const { calculatedGpa, totalCredits } = useMemo(() => {
    let weightedPoints = 0;
    let creditsSum = 0;
    courses.forEach(c => {
      const pts = gradePointsMap[c.grade] ?? 0;
      weightedPoints += pts * c.credits;
      creditsSum += c.credits;
    });
    const gpa = creditsSum > 0 ? (weightedPoints / creditsSum).toFixed(2) : '0.00';
    return { calculatedGpa: gpa, totalCredits: creditsSum };
  }, [courses]);

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    setCourses([
      ...courses,
      {
        id: generateId(),
        subjectName: newCourseName.trim(),
        credits: newCourseCredits,
        grade: newCourseGrade,
      },
    ]);
    setNewCourseName('');
  };

  const handleRemoveCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  // Preparation Data
  const prepData = useMemo(() => {
    return subjects.map((s: Subject) => ({
      name: s.code,
      fullName: s.name,
      value: getSubjectPreparation(s.id),
      color: s.color || '#659DE1',
      totalTopics: s.topics.length,
      doneTopics: s.topics.filter((t: Topic) => t.status === 'completed').length,
    }));
  }, [subjects, getSubjectPreparation]);

  // Assignment Stats
  const assignmentStats = useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter((a: Assignment) => a.status === 'completed').length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 100;
    return [
      { name: 'Completed', value: completed, color: '#78B88A' },
      { name: 'Pending', value: pending, color: '#659DE1' },
    ];
  }, [assignments]);

  // Weekly Study Trends Data
  const weeklyTrends = useMemo(() => {
    return [
      { day: 'Mon', planned: 3.5, actual: 3.0 },
      { day: 'Tue', planned: 4.0, actual: 4.5 },
      { day: 'Wed', planned: 2.5, actual: 2.0 },
      { day: 'Thu', planned: 3.0, actual: 3.5 },
      { day: 'Fri', planned: 4.0, actual: 3.8 },
      { day: 'Sat', planned: 5.0, actual: 5.5 },
      { day: 'Sun', planned: 3.0, actual: 2.5 },
    ];
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
          Academic Analytics & Performance
        </h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
          Inspect your syllabus readiness, study consistency, assignment rates, and compute your GPA
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-3.5">
          <div className="text-[11px] text-[var(--color-text-secondary)] font-medium">Overall Preparation</div>
          <div className="text-2xl font-bold text-[var(--color-blue-primary)] mt-1">
            {getOverallPreparation()}%
          </div>
          <div className="w-full bg-[var(--color-border)] dark:bg-[var(--color-dark-border)] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[var(--color-blue-primary)] h-full rounded-full"
              style={{ width: `${getOverallPreparation()}%` }}
            />
          </div>
        </div>

        <div className="card p-3.5">
          <div className="text-[11px] text-[var(--color-text-secondary)] font-medium">Assignment Completion</div>
          <div className="text-2xl font-bold text-[var(--color-green-muted)] mt-1">
            {assignments.length > 0
              ? Math.round((assignments.filter((a: Assignment) => a.status === 'completed').length / assignments.length) * 100)
              : 100}%
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-1.5">
            {assignments.filter((a: Assignment) => a.status === 'completed').length} of {assignments.length} assignments done
          </div>
        </div>

        <div className="card p-3.5">
          <div className="text-[11px] text-[var(--color-text-secondary)] font-medium">Estimated Semester GPA</div>
          <div className="text-2xl font-bold text-[#B09A32] mt-1">
            {calculatedGpa} / 10.0
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-1.5">
            Based on {totalCredits} course credits
          </div>
        </div>

        <div className="card p-3.5">
          <div className="text-[11px] text-[var(--color-text-secondary)] font-medium">Weekly Study Hours</div>
          <div className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] mt-1">
            24.8 hrs
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-1.5">
            Avg 3.5 hrs / day · 4 day streak
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subject Preparation Bar Chart */}
        <div className="card p-4">
          <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] mb-1">
            Subject Syllabus Completion (%)
          </h2>
          <p className="text-[11px] text-[var(--color-text-secondary)] mb-4">
            Percentage of chapters completed per course
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={prepData} barSize={26} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(val: any, _name: any, item: any) => [`${val ?? 0}% completed (${item.payload.doneTopics}/${item.payload.totalTopics} topics)`, item.payload.fullName]}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {prepData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Study Hours Trend (Planned vs Actual) */}
        <div className="card p-4">
          <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] mb-1">
            Weekly Study Time: Planned vs Actual
          </h2>
          <p className="text-[11px] text-[var(--color-text-secondary)] mb-4">
            Comparison between scheduled revision and actual logged study hours
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyTrends} barSize={16} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEEEA" opacity={0.7} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: 'var(--shadow-dropdown)',
                }}
                formatter={(val: any, name: any) => [`${val} hrs`, name === 'planned' ? 'Planned Time' : 'Actual Time']}
              />
              <Bar dataKey="planned" fill="#DCE9F9" radius={[4, 4, 0, 0]} name="planned" />
              <Bar dataKey="actual" fill="#4C85D8" radius={[4, 4, 0, 0]} name="actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CGPA / SGPA Interactive Calculator */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-blue-light)] dark:bg-[rgba(101,157,225,0.15)] flex items-center justify-center text-[var(--color-blue-primary)] shadow-xs">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                Semester GPA & CGPA Calculator
              </h2>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                Standard 10-point credit weighted university grading model
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-[var(--color-text-secondary)] block">Calculated SGPA</span>
              <span className="text-xl font-extrabold text-[var(--color-blue-primary)]">{calculatedGpa}</span>
            </div>
          </div>
        </div>

        {/* Add Course Form */}
        <form onSubmit={handleAddCourse} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-[var(--color-surface-elevated)] p-3 rounded-xl border border-[var(--color-border)] shadow-xs">
          <div className="sm:col-span-6">
            <input
              type="text"
              placeholder="Course / Subject title..."
              value={newCourseName}
              onChange={e => setNewCourseName(e.target.value)}
              className="!py-1.5 !text-[12px] w-full"
            />
          </div>
          <div className="sm:col-span-2">
            <select
              value={newCourseCredits}
              onChange={e => setNewCourseCredits(Number(e.target.value))}
              className="!py-1.5 !text-[12px] w-full"
            >
              {[1, 2, 3, 4, 5, 6].map(cr => (
                <option key={cr} value={cr}>{cr} Credits</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <select
              value={newCourseGrade}
              onChange={e => setNewCourseGrade(e.target.value)}
              className="!py-1.5 !text-[12px] w-full"
            >
              {Object.keys(gradePointsMap).map(gr => (
                <option key={gr} value={gr}>{gr} ({gradePointsMap[gr]} pts)</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn btn-primary btn-sm w-full h-full flex items-center justify-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              Add Course
            </button>
          </div>
        </form>

        {/* Courses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-secondary)] text-[11px] font-medium">
                <th className="py-2 px-3">Course Title</th>
                <th className="py-2 px-3">Credits</th>
                <th className="py-2 px-3">Grade Point</th>
                <th className="py-2 px-3">Weighted Value</th>
                <th className="py-2 px-3 text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] dark:divide-[var(--color-dark-border)]">
              {courses.map(course => {
                const pts = gradePointsMap[course.grade] ?? 0;
                return (
                  <tr key={course.id} className="hover:bg-[var(--color-bg-main)]/50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                      {course.subjectName}
                    </td>
                    <td className="py-2.5 px-3">{course.credits} cr</td>
                    <td className="py-2.5 px-3">
                      <span className="badge badge-neutral text-[11px] font-semibold">{course.grade} ({pts})</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
                      {course.credits * pts} pts
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleRemoveCourse(course.id)}
                        className="p-1 rounded text-[var(--color-text-secondary)] hover:text-red-500 transition-colors"
                        title="Remove course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
