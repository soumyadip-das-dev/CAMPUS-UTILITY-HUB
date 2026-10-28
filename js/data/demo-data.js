/**
 * Campus Utility Hub 2.0 - Demonstration Seed Data
 * Fictional datasets for assessments, attempts, support issues, schedules, and utility states.
 * Clearly labeled as fictional demonstration data for local testing and portfolio evaluation.
 */

import { INITIAL_QUESTIONS } from './questions.js';

export const DEMO_ASSESSMENTS = [
  {
    id: 'asmt-dsa-01',
    title: 'Data Structures & Algorithms Diagnostic',
    topic: 'Basic Data Structures',
    durationMinutes: 10,
    passingScore: 70,
    questionIds: ['q-arr-01', 'q-arr-02', 'q-str-01', 'q-ds-01', 'q-ds-02'],
    createdDate: '2026-10-15T09:00:00.000Z',
    description: 'Foundational 5-question timed diagnostic covering arrays, palindromes, and stack/linked list basics.'
  },
  {
    id: 'asmt-search-sort-02',
    title: 'Search & Sorting Optimization Sprint',
    topic: 'Sorting',
    durationMinutes: 8,
    passingScore: 75,
    questionIds: ['q-sort-01', 'q-sort-02', 'q-search-01', 'q-search-02'],
    createdDate: '2026-10-18T14:30:00.000Z',
    description: 'Timed assessment evaluating algorithm analysis, two pointers, quickselect, and binary search bounds.'
  },
  {
    id: 'asmt-strings-03',
    title: 'Strings & Windowing Challenge',
    topic: 'Strings',
    durationMinutes: 6,
    passingScore: 60,
    questionIds: ['q-str-01', 'q-str-02', 'q-arr-01'],
    createdDate: '2026-10-22T11:00:00.000Z',
    description: 'Sprint focusing on sliding window substring analysis, hash maps, and palindrome verification.'
  }
];

export const DEMO_ATTEMPTS = [
  {
    id: 'att-101',
    assessmentId: 'asmt-dsa-01',
    assessmentTitle: 'Data Structures & Algorithms Diagnostic',
    candidateName: 'Aarav Sharma (Demo)',
    score: 80,
    totalQuestions: 5,
    correctAnswers: 4,
    timeSpentSeconds: 380,
    completed: true,
    completedAt: '2026-10-20T10:15:00.000Z',
    answers: {
      'q-arr-01': 1,
      'q-arr-02': 0,
      'q-str-01': 0,
      'q-ds-01': 0,
      'q-ds-02': 1 // incorrect
    }
  },
  {
    id: 'att-102',
    assessmentId: 'asmt-dsa-01',
    assessmentTitle: 'Data Structures & Algorithms Diagnostic',
    candidateName: 'Ananya Iyer (Demo)',
    score: 100,
    totalQuestions: 5,
    correctAnswers: 5,
    timeSpentSeconds: 320,
    completed: true,
    completedAt: '2026-10-21T11:45:00.000Z',
    answers: {
      'q-arr-01': 1,
      'q-arr-02': 0,
      'q-str-01': 0,
      'q-ds-01': 0,
      'q-ds-02': 0
    }
  },
  {
    id: 'att-103',
    assessmentId: 'asmt-search-sort-02',
    assessmentTitle: 'Search & Sorting Optimization Sprint',
    candidateName: 'Rohan Verma (Demo)',
    score: 75,
    totalQuestions: 4,
    correctAnswers: 3,
    timeSpentSeconds: 410,
    completed: true,
    completedAt: '2026-10-22T16:20:00.000Z',
    answers: {
      'q-sort-01': 0,
      'q-sort-02': 0,
      'q-search-01': 0,
      'q-search-02': 1 // incorrect
    }
  },
  {
    id: 'att-104',
    assessmentId: 'asmt-search-sort-02',
    assessmentTitle: 'Search & Sorting Optimization Sprint',
    candidateName: 'Pooja Nair (Demo)',
    score: 50,
    totalQuestions: 4,
    correctAnswers: 2,
    timeSpentSeconds: 480,
    completed: true,
    completedAt: '2026-10-23T14:10:00.000Z',
    answers: {
      'q-sort-01': 0,
      'q-sort-02': 1,
      'q-search-01': 0,
      'q-search-02': 2
    }
  },
  {
    id: 'att-105',
    assessmentId: 'asmt-strings-03',
    assessmentTitle: 'Strings & Windowing Challenge',
    candidateName: 'Vikram Mehta (Demo)',
    score: 67,
    totalQuestions: 3,
    correctAnswers: 2,
    timeSpentSeconds: 290,
    completed: true,
    completedAt: '2026-10-24T09:30:00.000Z',
    answers: {
      'q-str-01': 0,
      'q-str-02': 0,
      'q-arr-01': 0 // incorrect
    }
  },
  {
    id: 'att-106',
    assessmentId: 'asmt-dsa-01',
    assessmentTitle: 'Data Structures & Algorithms Diagnostic',
    candidateName: 'Sneha Patel (Demo)',
    score: 0,
    totalQuestions: 5,
    correctAnswers: 0,
    timeSpentSeconds: 0,
    completed: false, // Incomplete / abandoned attempt
    completedAt: null,
    answers: {}
  }
];

export const DEMO_ISSUES = [
  {
    id: 'iss-201',
    title: 'Lab 4 Compiler Sandbox Network Timeout',
    description: 'Workstations 12-18 experiencing intermittent timeouts when accessing internal assessment mirror.',
    category: 'Lab Infrastructure',
    priority: 'High',
    status: 'In Progress',
    assignedOwner: 'Prof. Mukherjee',
    createdDate: '2026-10-20',
    dueDate: '2026-10-29'
  },
  {
    id: 'iss-202',
    title: 'Question Bank Typo in Sorting Constraints',
    description: 'Constraint specifies n <= 200, but sample test case uses n = 500 in Sorting question.',
    category: 'Assessment Platform',
    priority: 'Medium',
    status: 'Resolved',
    assignedOwner: 'Student Lead Roy',
    createdDate: '2026-10-18',
    dueDate: '2026-10-22'
  },
  {
    id: 'iss-203',
    title: 'Biometric Attendance Scanner Sync Failure',
    description: 'Morning CS-301 session attendance failed to sync to central portal automatically.',
    category: 'Administrative',
    priority: 'Urgent',
    status: 'Open',
    assignedOwner: 'Admin Support',
    createdDate: '2026-10-21',
    dueDate: '2026-10-25' // Deliberately past date to demonstrate Overdue detection
  },
  {
    id: 'iss-204',
    title: 'Grading Discrepancy Query on Quiz 2',
    description: '3 students requested clarification regarding negative marking on Section B questions.',
    category: 'Grading & Evaluation',
    priority: 'Medium',
    status: 'Open',
    assignedOwner: 'TA Das',
    createdDate: '2026-10-26',
    dueDate: '2026-10-31'
  }
];

export const DEMO_SCHEDULES = [
  {
    id: 'sch-301',
    title: 'Semester Midterm DSA Assessment',
    assessmentId: 'asmt-dsa-01',
    date: '2026-11-05',
    time: '10:00 AM',
    venue: 'Computing Lab 1 & 2',
    status: 'Scheduled',
    targetBatch: 'CS 3rd Semester'
  },
  {
    id: 'sch-302',
    title: 'CodeChef College Chapter Sprint 1',
    assessmentId: 'asmt-search-sort-02',
    date: '2026-11-12',
    time: '04:30 PM',
    venue: 'Online Assessment Lab',
    status: 'Scheduled',
    targetBatch: 'All Engineering Batches'
  },
  {
    id: 'sch-303',
    title: 'Academic Review Committee Monthly Meeting',
    assessmentId: '',
    date: '2026-11-02',
    time: '02:00 PM',
    venue: 'Dean Conference Room',
    status: 'Confirmed',
    targetBatch: 'Faculty & HODs'
  }
];

export const DEMO_ATTENDANCE = [
  { id: 'att-rec-1', name: 'Soumyadip Das', attendedSessions: 28, totalSessions: 30, attendancePct: 93.3 },
  { id: 'att-rec-2', name: 'Aarav Sharma', attendedSessions: 24, totalSessions: 30, attendancePct: 80.0 },
  { id: 'att-rec-3', name: 'Sneha Patel', attendedSessions: 20, totalSessions: 30, attendancePct: 66.7 },
  { id: 'att-rec-4', name: 'Rohan Verma', attendedSessions: 29, totalSessions: 30, attendancePct: 96.7 }
];

export const DEMO_SUBJECTS = [
  { id: 'sub-1', name: 'Data Structures & Algorithms', credits: 4, grade: 'O' },
  { id: 'sub-2', name: 'Database Management Systems', credits: 4, grade: 'A+' },
  { id: 'sub-3', name: 'Operating Systems', credits: 3, grade: 'A' },
  { id: 'sub-4', name: 'Computer Networks', credits: 3, grade: 'B+' },
  { id: 'sub-5', name: 'Web Technology Lab', credits: 2, grade: 'O' }
];

export const DEMO_EXPENSES = [
  { id: 'exp-1', person: 'Soumyadip', description: 'Lab Project Hardware Kit', amount: 1200 },
  { id: 'exp-2', person: 'Rohan', description: 'Textbook Xerox & Reference Prints', amount: 350 },
  { id: 'exp-3', person: 'Aarav', description: 'Group Coding Refreshments', amount: 450 }
];
