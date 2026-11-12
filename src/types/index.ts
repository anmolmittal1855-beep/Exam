// ========================================
// EXAMPULSE TYPE DEFINITIONS
// ========================================

export type Priority = 'low' | 'medium' | 'high';
export type AssignmentStatus = 'not-started' | 'in-progress' | 'completed';
export type TopicStatus = 'not-started' | 'in-progress' | 'completed';
export type EventType = 'exam' | 'quiz' | 'assignment' | 'study-session';
export type ResourceCategory = 'lecture-notes' | 'pdfs' | 'pyqs' | 'reference-links' | 'assignments' | 'other';

export interface Subject {
  id: string;
  name: string;
  code: string;
  faculty: string;
  semester: number;
  color: string;
  topics: Topic[];
  createdAt: string;
}

export interface Topic {
  id: string;
  name: string;
  status: TopicStatus;
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  date: string; // ISO date string
  time: string; // HH:mm
  duration: number; // minutes
  venue?: string;
  notes?: string;
  priority: Priority;
  createdAt: string;
}

export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: Priority;
  status: AssignmentStatus;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  topic: string;
  date: string;
  startTime: string;
  duration: number; // minutes
  completed: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  type: EventType;
  title: string;
  subjectId: string;
  date: string;
  time: string;
  description?: string;
  priority?: Priority;
}

export interface Resource {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  category: ResourceCategory;
  url?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  read: boolean;
  createdAt: string;
}

export interface GradeEntry {
  id: string;
  subjectName: string;
  credits: number;
  grade: string;
}

export interface StudentProfile {
  name: string;
  email: string;
  university: string;
  semester: number;
  program: string;
  avatar?: string;
}
