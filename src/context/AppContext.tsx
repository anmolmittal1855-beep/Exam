import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  Subject, Exam, Assignment, StudySession, Resource,
  Notification, StudentProfile, CalendarEvent
} from '../types';
import {
  sampleSubjects, sampleExams, sampleAssignments,
  sampleStudySessions, sampleResources, sampleNotifications,
  sampleProfile
} from '../data/sampleData';
import { generateId } from '../utils/helpers';

// ========================================
// STORAGE KEYS
// ========================================
const STORAGE_KEYS = {
  subjects: 'ep_subjects',
  exams: 'ep_exams',
  assignments: 'ep_assignments',
  sessions: 'ep_sessions',
  resources: 'ep_resources',
  notifications: 'ep_notifications',
  profile: 'ep_profile',
  theme: 'ep_theme',
  initialized: 'ep_initialized',
} as const;

// ========================================
// CONTEXT TYPE
// ========================================
interface AppContextType {
  // Data
  subjects: Subject[];
  exams: Exam[];
  assignments: Assignment[];
  studySessions: StudySession[];
  resources: Resource[];
  notifications: Notification[];
  profile: StudentProfile;
  theme: 'dark';

  // Subject CRUD
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Exam CRUD
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => void;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  // Assignment CRUD
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  // Study Session CRUD
  addStudySession: (session: Omit<StudySession, 'id' | 'createdAt'>) => void;
  updateStudySession: (id: string, updates: Partial<StudySession>) => void;
  deleteStudySession: (id: string) => void;

  // Resource CRUD
  addResource: (resource: Omit<Resource, 'id' | 'createdAt'>) => void;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  deleteResource: (id: string) => void;

  // Notifications
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Profile
  updateProfile: (updates: Partial<StudentProfile>) => void;

  // Theme
  toggleTheme: () => void;

  // Data management
  resetData: () => void;

  // Helpers
  getSubjectById: (id: string) => Subject | undefined;
  getSubjectPreparation: (subjectId: string) => number;
  getOverallPreparation: () => number;
}

const AppContext = createContext<AppContextType | null>(null);

// ========================================
// STORAGE HELPERS
// ========================================
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn(`Failed to load ${key} from storage`, e);
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save ${key} to storage`, e);
  }
}

// ========================================
// PROVIDER
// ========================================
export function AppProvider({ children }: { children: ReactNode }) {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.initialized);

  const [subjects, setSubjects] = useState<Subject[]>(() =>
    loadFromStorage(STORAGE_KEYS.subjects, isInitialized ? [] : sampleSubjects)
  );
  const [exams, setExams] = useState<Exam[]>(() =>
    loadFromStorage(STORAGE_KEYS.exams, isInitialized ? [] : sampleExams)
  );
  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    loadFromStorage(STORAGE_KEYS.assignments, isInitialized ? [] : sampleAssignments)
  );
  const [studySessions, setStudySessions] = useState<StudySession[]>(() =>
    loadFromStorage(STORAGE_KEYS.sessions, isInitialized ? [] : sampleStudySessions)
  );
  const [resources, setResources] = useState<Resource[]>(() =>
    loadFromStorage(STORAGE_KEYS.resources, isInitialized ? [] : sampleResources)
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    loadFromStorage(STORAGE_KEYS.notifications, isInitialized ? [] : sampleNotifications)
  );
  const [profile, setProfile] = useState<StudentProfile>(() =>
    loadFromStorage(STORAGE_KEYS.profile, sampleProfile)
  );
  const [theme] = useState<'dark'>('dark');

  // Mark as initialized on first load
  useEffect(() => {
    if (!isInitialized) {
      localStorage.setItem(STORAGE_KEYS.initialized, 'true');
    }
  }, []);

  // Persist on change
  useEffect(() => { saveToStorage(STORAGE_KEYS.subjects, subjects); }, [subjects]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.exams, exams); }, [exams]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.assignments, assignments); }, [assignments]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.sessions, studySessions); }, [studySessions]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.resources, resources); }, [resources]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.notifications, notifications); }, [notifications]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.profile, profile); }, [profile]);

  // Enforce dark mode on document element
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // ---- Subject CRUD ----
  const addSubject = useCallback((subject: Omit<Subject, 'id' | 'createdAt'>) => {
    setSubjects(prev => [...prev, { ...subject, id: generateId(), createdAt: new Date().toISOString() }]);
  }, []);

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  }, []);

  // ---- Exam CRUD ----
  const addExam = useCallback((exam: Omit<Exam, 'id' | 'createdAt'>) => {
    setExams(prev => [...prev, { ...exam, id: generateId(), createdAt: new Date().toISOString() }]);
  }, []);

  const updateExam = useCallback((id: string, updates: Partial<Exam>) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const deleteExam = useCallback((id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
  }, []);

  // ---- Assignment CRUD ----
  const addAssignment = useCallback((assignment: Omit<Assignment, 'id' | 'createdAt'>) => {
    setAssignments(prev => [...prev, { ...assignment, id: generateId(), createdAt: new Date().toISOString() }]);
  }, []);

  const updateAssignment = useCallback((id: string, updates: Partial<Assignment>) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteAssignment = useCallback((id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  }, []);

  // ---- Study Session CRUD ----
  const addStudySession = useCallback((session: Omit<StudySession, 'id' | 'createdAt'>) => {
    setStudySessions(prev => [...prev, { ...session, id: generateId(), createdAt: new Date().toISOString() }]);
  }, []);

  const updateStudySession = useCallback((id: string, updates: Partial<StudySession>) => {
    setStudySessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteStudySession = useCallback((id: string) => {
    setStudySessions(prev => prev.filter(s => s.id !== id));
  }, []);

  // ---- Resource CRUD ----
  const addResource = useCallback((resource: Omit<Resource, 'id' | 'createdAt'>) => {
    setResources(prev => [...prev, { ...resource, id: generateId(), createdAt: new Date().toISOString() }]);
  }, []);

  const updateResource = useCallback((id: string, updates: Partial<Resource>) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteResource = useCallback((id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  }, []);

  // ---- Notifications ----
  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'createdAt'>) => {
    setNotifications(prev => [{ ...notif, id: generateId(), createdAt: new Date().toISOString() }, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // ---- Profile ----
  const updateProfile = useCallback((updates: Partial<StudentProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  // ---- Theme (Permanent Dark Mode) ----
  const toggleTheme = useCallback(() => {
    // Permanent dark mode
  }, []);

  // ---- Reset Data ----
  const resetData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    setSubjects(sampleSubjects);
    setExams(sampleExams);
    setAssignments(sampleAssignments);
    setStudySessions(sampleStudySessions);
    setResources(sampleResources);
    setNotifications(sampleNotifications);
    setProfile(sampleProfile);
  }, []);

  // ---- Helpers ----
  const getSubjectById = useCallback((id: string) => {
    return subjects.find(s => s.id === id);
  }, [subjects]);

  const getSubjectPreparation = useCallback((subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject || subject.topics.length === 0) return 0;
    const completed = subject.topics.filter(t => t.status === 'completed').length;
    const inProgress = subject.topics.filter(t => t.status === 'in-progress').length;
    return Math.round(((completed + inProgress * 0.5) / subject.topics.length) * 100);
  }, [subjects]);

  const getOverallPreparation = useCallback(() => {
    if (subjects.length === 0) return 0;
    const total = subjects.reduce((acc, s) => acc + getSubjectPreparation(s.id), 0);
    return Math.round(total / subjects.length);
  }, [subjects, getSubjectPreparation]);

  const value: AppContextType = {
    subjects, exams, assignments, studySessions, resources, notifications, profile, theme,
    addSubject, updateSubject, deleteSubject,
    addExam, updateExam, deleteExam,
    addAssignment, updateAssignment, deleteAssignment,
    addStudySession, updateStudySession, deleteStudySession,
    addResource, updateResource, deleteResource,
    addNotification, markNotificationRead, markAllNotificationsRead, clearNotifications,
    updateProfile, toggleTheme, resetData,
    getSubjectById, getSubjectPreparation, getOverallPreparation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
