import type { Subject, Exam, Assignment, StudySession, Resource, Notification, StudentProfile } from '../types';
import { generateId } from '../utils/helpers';
import { addDays, format, subDays } from 'date-fns';

const today = new Date();
const todayStr = format(today, 'yyyy-MM-dd');

// ========================================
// SUBJECTS
// ========================================
export const sampleSubjects: Subject[] = [
  {
    id: 'sub-1',
    name: 'Data Structures & Algorithms',
    code: 'CS301',
    faculty: 'Dr. Arun Mehta',
    semester: 5,
    color: '#659DE1',
    topics: [
      { id: 't1', name: 'Arrays and Linked Lists', status: 'completed' },
      { id: 't2', name: 'Stacks and Queues', status: 'completed' },
      { id: 't3', name: 'Trees and BST', status: 'completed' },
      { id: 't4', name: 'Graphs and Traversals', status: 'in-progress' },
      { id: 't5', name: 'Sorting Algorithms', status: 'in-progress' },
      { id: 't6', name: 'Dynamic Programming', status: 'not-started' },
      { id: 't7', name: 'Greedy Algorithms', status: 'not-started' },
      { id: 't8', name: 'Hashing', status: 'not-started' },
    ],
    createdAt: subDays(today, 60).toISOString(),
  },
  {
    id: 'sub-2',
    name: 'Operating Systems',
    code: 'CS302',
    faculty: 'Prof. Sunita Verma',
    semester: 5,
    color: '#78B88A',
    topics: [
      { id: 't9', name: 'Process Management', status: 'completed' },
      { id: 't10', name: 'CPU Scheduling', status: 'completed' },
      { id: 't11', name: 'Memory Management', status: 'in-progress' },
      { id: 't12', name: 'Virtual Memory', status: 'not-started' },
      { id: 't13', name: 'File Systems', status: 'not-started' },
      { id: 't14', name: 'I/O Systems', status: 'not-started' },
    ],
    createdAt: subDays(today, 58).toISOString(),
  },
  {
    id: 'sub-3',
    name: 'Database Management Systems',
    code: 'CS303',
    faculty: 'Dr. Rajesh Kumar',
    semester: 5,
    color: '#E9A48C',
    topics: [
      { id: 't15', name: 'ER Model & Relational Model', status: 'completed' },
      { id: 't16', name: 'SQL Queries', status: 'completed' },
      { id: 't17', name: 'Normalization', status: 'completed' },
      { id: 't18', name: 'Transactions & Concurrency', status: 'completed' },
      { id: 't19', name: 'Indexing & Hashing', status: 'in-progress' },
      { id: 't20', name: 'Query Optimization', status: 'not-started' },
      { id: 't21', name: 'NoSQL Databases', status: 'not-started' },
    ],
    createdAt: subDays(today, 55).toISOString(),
  },
  {
    id: 'sub-4',
    name: 'Computer Networks',
    code: 'CS304',
    faculty: 'Prof. Deepak Sharma',
    semester: 5,
    color: '#C47A9A',
    topics: [
      { id: 't22', name: 'OSI & TCP/IP Model', status: 'completed' },
      { id: 't23', name: 'Data Link Layer', status: 'completed' },
      { id: 't24', name: 'Network Layer & Routing', status: 'in-progress' },
      { id: 't25', name: 'Transport Layer', status: 'not-started' },
      { id: 't26', name: 'Application Layer', status: 'not-started' },
      { id: 't27', name: 'Network Security', status: 'not-started' },
    ],
    createdAt: subDays(today, 52).toISOString(),
  },
  {
    id: 'sub-5',
    name: 'Software Engineering',
    code: 'CS305',
    faculty: 'Dr. Priya Nair',
    semester: 5,
    color: '#A09A60',
    topics: [
      { id: 't28', name: 'SDLC Models', status: 'completed' },
      { id: 't29', name: 'Requirements Engineering', status: 'completed' },
      { id: 't30', name: 'Software Design', status: 'completed' },
      { id: 't31', name: 'Testing & Quality Assurance', status: 'in-progress' },
      { id: 't32', name: 'Project Management', status: 'not-started' },
    ],
    createdAt: subDays(today, 50).toISOString(),
  },
];

// ========================================
// EXAMS
// ========================================
export const sampleExams: Exam[] = [
  {
    id: 'exam-1',
    subjectId: 'sub-1',
    title: 'Mid-Semester Examination',
    date: format(addDays(today, 5), 'yyyy-MM-dd'),
    time: '10:00',
    duration: 120,
    venue: 'Hall A, Block 3',
    priority: 'high',
    createdAt: subDays(today, 10).toISOString(),
  },
  {
    id: 'exam-2',
    subjectId: 'sub-2',
    title: 'Mid-Semester Examination',
    date: format(addDays(today, 9), 'yyyy-MM-dd'),
    time: '14:00',
    duration: 120,
    venue: 'Hall B, Block 3',
    priority: 'high',
    createdAt: subDays(today, 10).toISOString(),
  },
  {
    id: 'exam-3',
    subjectId: 'sub-3',
    title: 'Mid-Semester Examination',
    date: format(addDays(today, 14), 'yyyy-MM-dd'),
    time: '10:00',
    duration: 90,
    venue: 'Hall A, Block 2',
    priority: 'medium',
    createdAt: subDays(today, 8).toISOString(),
  },
  {
    id: 'exam-4',
    subjectId: 'sub-4',
    title: 'Quiz 2',
    date: format(addDays(today, 3), 'yyyy-MM-dd'),
    time: '09:00',
    duration: 30,
    venue: 'Room 204',
    priority: 'medium',
    createdAt: subDays(today, 5).toISOString(),
  },
  {
    id: 'exam-5',
    subjectId: 'sub-5',
    title: 'Class Test',
    date: format(addDays(today, 20), 'yyyy-MM-dd'),
    time: '11:00',
    duration: 60,
    venue: 'Room 301',
    priority: 'low',
    createdAt: subDays(today, 3).toISOString(),
  },
];

// ========================================
// ASSIGNMENTS
// ========================================
export const sampleAssignments: Assignment[] = [
  {
    id: 'asgn-1',
    subjectId: 'sub-1',
    title: 'Implement AVL Tree Operations',
    description: 'Write a program to implement insertion, deletion, and balancing operations in an AVL tree with proper rotation handling.',
    dueDate: format(addDays(today, 2), 'yyyy-MM-dd'),
    dueTime: '23:59',
    priority: 'high',
    status: 'in-progress',
    createdAt: subDays(today, 7).toISOString(),
  },
  {
    id: 'asgn-2',
    subjectId: 'sub-2',
    title: 'Process Scheduling Simulation',
    description: 'Simulate Round Robin and Priority scheduling algorithms. Compare performance metrics and prepare a report.',
    dueDate: format(addDays(today, 4), 'yyyy-MM-dd'),
    dueTime: '23:59',
    priority: 'medium',
    status: 'not-started',
    createdAt: subDays(today, 5).toISOString(),
  },
  {
    id: 'asgn-3',
    subjectId: 'sub-3',
    title: 'Database Normalization Exercise',
    description: 'Normalize the given relations to 3NF and BCNF. Show all functional dependencies and decomposition steps.',
    dueDate: format(subDays(today, 1), 'yyyy-MM-dd'),
    dueTime: '23:59',
    priority: 'high',
    status: 'completed',
    createdAt: subDays(today, 14).toISOString(),
  },
  {
    id: 'asgn-4',
    subjectId: 'sub-4',
    title: 'Network Protocol Analysis',
    description: 'Capture and analyse network packets using Wireshark. Document findings for TCP, UDP, and HTTP protocols.',
    dueDate: format(addDays(today, 7), 'yyyy-MM-dd'),
    dueTime: '23:59',
    priority: 'medium',
    status: 'not-started',
    createdAt: subDays(today, 3).toISOString(),
  },
  {
    id: 'asgn-5',
    subjectId: 'sub-5',
    title: 'SRS Document Preparation',
    description: 'Prepare a Software Requirements Specification document for the assigned mini project following IEEE standards.',
    dueDate: format(addDays(today, 10), 'yyyy-MM-dd'),
    dueTime: '23:59',
    priority: 'low',
    status: 'in-progress',
    createdAt: subDays(today, 10).toISOString(),
  },
  {
    id: 'asgn-6',
    subjectId: 'sub-1',
    title: 'Graph Algorithms Assignment',
    description: 'Implement BFS, DFS, Dijkstra, and Kruskal algorithms. Test with provided datasets.',
    dueDate: format(addDays(today, 12), 'yyyy-MM-dd'),
    dueTime: '23:59',
    priority: 'medium',
    status: 'not-started',
    createdAt: subDays(today, 2).toISOString(),
  },
];

// ========================================
// STUDY SESSIONS
// ========================================
export const sampleStudySessions: StudySession[] = [
  {
    id: 'ss-1',
    subjectId: 'sub-1',
    topic: 'Graphs and Traversals',
    date: todayStr,
    startTime: '09:00',
    duration: 90,
    completed: false,
    createdAt: subDays(today, 1).toISOString(),
  },
  {
    id: 'ss-2',
    subjectId: 'sub-2',
    topic: 'Memory Management',
    date: todayStr,
    startTime: '14:00',
    duration: 60,
    completed: false,
    createdAt: subDays(today, 1).toISOString(),
  },
  {
    id: 'ss-3',
    subjectId: 'sub-3',
    topic: 'Indexing & Hashing',
    date: todayStr,
    startTime: '16:30',
    duration: 45,
    completed: false,
    createdAt: subDays(today, 1).toISOString(),
  },
  {
    id: 'ss-4',
    subjectId: 'sub-1',
    topic: 'Trees and BST Revision',
    date: format(subDays(today, 1), 'yyyy-MM-dd'),
    startTime: '10:00',
    duration: 90,
    completed: true,
    createdAt: subDays(today, 2).toISOString(),
  },
  {
    id: 'ss-5',
    subjectId: 'sub-4',
    topic: 'OSI Model Revision',
    date: format(subDays(today, 1), 'yyyy-MM-dd'),
    startTime: '15:00',
    duration: 60,
    completed: true,
    createdAt: subDays(today, 2).toISOString(),
  },
  {
    id: 'ss-6',
    subjectId: 'sub-2',
    topic: 'CPU Scheduling Practice',
    date: format(subDays(today, 2), 'yyyy-MM-dd'),
    startTime: '09:00',
    duration: 120,
    completed: true,
    createdAt: subDays(today, 3).toISOString(),
  },
  {
    id: 'ss-7',
    subjectId: 'sub-3',
    topic: 'SQL Practice Problems',
    date: format(subDays(today, 2), 'yyyy-MM-dd'),
    startTime: '14:00',
    duration: 90,
    completed: true,
    createdAt: subDays(today, 3).toISOString(),
  },
  {
    id: 'ss-8',
    subjectId: 'sub-1',
    topic: 'Sorting Algorithms',
    date: format(addDays(today, 1), 'yyyy-MM-dd'),
    startTime: '09:00',
    duration: 90,
    completed: false,
    createdAt: today.toISOString(),
  },
  {
    id: 'ss-9',
    subjectId: 'sub-4',
    topic: 'Network Layer & Routing',
    date: format(addDays(today, 1), 'yyyy-MM-dd'),
    startTime: '14:00',
    duration: 60,
    completed: false,
    createdAt: today.toISOString(),
  },
];

// ========================================
// RESOURCES
// ========================================
export const sampleResources: Resource[] = [
  {
    id: 'res-1',
    subjectId: 'sub-1',
    title: 'DSA Complete Notes — Unit 1–4',
    description: 'Comprehensive handwritten notes covering arrays, linked lists, trees, and graphs.',
    category: 'lecture-notes',
    createdAt: subDays(today, 30).toISOString(),
  },
  {
    id: 'res-2',
    subjectId: 'sub-1',
    title: 'Previous Year DSA Mid-Sem Paper 2024',
    description: 'Mid-semester examination paper from 2024 batch with solutions.',
    category: 'pyqs',
    createdAt: subDays(today, 20).toISOString(),
  },
  {
    id: 'res-3',
    subjectId: 'sub-2',
    title: 'Galvin OS Textbook — Chapter Summaries',
    description: 'Chapter-wise summaries from the Silberschatz Galvin OS textbook.',
    category: 'lecture-notes',
    createdAt: subDays(today, 25).toISOString(),
  },
  {
    id: 'res-4',
    subjectId: 'sub-3',
    title: 'SQL Practice Questions Set',
    description: '50 SQL practice questions with solutions covering joins, subqueries, and aggregations.',
    category: 'assignments',
    url: 'https://example.com/sql-practice',
    createdAt: subDays(today, 18).toISOString(),
  },
  {
    id: 'res-5',
    subjectId: 'sub-4',
    title: 'Computer Networks — Kurose & Ross Notes',
    description: 'Reference notes from the Computer Networking textbook by Kurose & Ross.',
    category: 'reference-links',
    url: 'https://example.com/cn-notes',
    createdAt: subDays(today, 15).toISOString(),
  },
  {
    id: 'res-6',
    subjectId: 'sub-5',
    title: 'Software Engineering — Pressman PDF',
    description: 'Key chapters from the Pressman textbook in PDF format.',
    category: 'pdfs',
    createdAt: subDays(today, 22).toISOString(),
  },
];

// ========================================
// NOTIFICATIONS
// ========================================
export const sampleNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Exam in 5 days',
    message: 'DSA Mid-Semester Examination is in 5 days. Ensure all topics are covered.',
    type: 'warning',
    read: false,
    createdAt: today.toISOString(),
  },
  {
    id: 'notif-2',
    title: 'Assignment due soon',
    message: 'AVL Tree Operations assignment is due in 2 days.',
    type: 'urgent',
    read: false,
    createdAt: today.toISOString(),
  },
  {
    id: 'notif-3',
    title: 'Quiz tomorrow',
    message: 'Computer Networks Quiz 2 is scheduled for tomorrow at 9:00 AM.',
    type: 'info',
    read: false,
    createdAt: today.toISOString(),
  },
  {
    id: 'notif-4',
    title: 'Study session completed',
    message: 'You completed your Trees and BST revision session yesterday. Great work!',
    type: 'success',
    read: true,
    createdAt: subDays(today, 1).toISOString(),
  },
  {
    id: 'notif-5',
    title: 'Assignment submitted',
    message: 'Database Normalization Exercise has been marked as completed.',
    type: 'success',
    read: true,
    createdAt: subDays(today, 1).toISOString(),
  },
];

// ========================================
// STUDENT PROFILE
// ========================================
export const sampleProfile: StudentProfile = {
  name: 'Arpit',
  email: 'arpit.pujani@university.edu',
  university: 'National Institute of Technology',
  semester: 5,
  program: 'B.Tech Computer Science & Engineering',
};
