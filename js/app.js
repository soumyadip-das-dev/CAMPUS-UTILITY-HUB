/**
 * Campus Utility Hub 2.0 - Application Bootstrap & Navigation Router
 */

import { initializeStorage, clearAll, STORAGE_KEYS, setItem } from './core/storage.js';
import { showToast } from './core/utils.js';
import { INITIAL_QUESTIONS } from './data/questions.js';
import {
  DEMO_ASSESSMENTS,
  DEMO_ATTEMPTS,
  DEMO_ISSUES,
  DEMO_SCHEDULES,
  DEMO_ATTENDANCE,
  DEMO_SUBJECTS,
  DEMO_EXPENSES
} from './data/demo-data.js';

import {
  initAttendance,
  initCGPA,
  initNumberConverter,
  initPasswordAnalyzer,
  initQuiz,
  initExpenseSplitter,
  initThemeCustomizer,
  initTypingTester
} from './modules/existing-utilities.js';

import { initAssessments } from './modules/assessments.js';
import { initAnalytics } from './modules/analytics.js';
import { initOperations } from './modules/operations.js';

/**
 * Primary Application Initialization
 */
export function initApp() {
  console.info('[Campus Utility Hub 2.0] Initializing core modules...');

  // Initialize LocalStorage with default datasets
  initializeStorage({
    [STORAGE_KEYS.QUESTIONS]: INITIAL_QUESTIONS,
    [STORAGE_KEYS.ASSESSMENTS]: DEMO_ASSESSMENTS,
    [STORAGE_KEYS.ATTEMPTS]: DEMO_ATTEMPTS,
    [STORAGE_KEYS.ISSUES]: DEMO_ISSUES,
    [STORAGE_KEYS.SCHEDULES]: DEMO_SCHEDULES,
    [STORAGE_KEYS.ATTENDANCE]: DEMO_ATTENDANCE,
    [STORAGE_KEYS.SUBJECTS]: DEMO_SUBJECTS,
    [STORAGE_KEYS.EXPENSES]: DEMO_EXPENSES
  });

  // Setup UI Navigation & Listeners
  setupNavigation();
  setupResetDemoData();

  // Initialize Modules
  initThemeCustomizer();
  initAttendance();
  initCGPA();
  initNumberConverter();
  initPasswordAnalyzer();
  initQuiz();
  initExpenseSplitter();
  initTypingTester();

  initAssessments();
  initAnalytics();
  initOperations();

  console.info('[Campus Utility Hub 2.0] Ready.');
}

/**
 * Configure Sidebar Navigation & Tab Switching
 */
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const viewTitle = document.getElementById('currentViewTitle');
  const viewDesc = document.getElementById('currentViewDesc');

  const VIEW_DESCRIPTIONS = {
    'tab-utilities': {
      title: 'Academic Utilities & Calculators',
      desc: 'Smart tools for daily student productivity, attendance tracking, SGPA projection, and typing metrics.'
    },
    'tab-assessments': {
      title: 'Programming Assessment Hub',
      desc: 'Structured question bank management and timed multiple-choice assessments for core data structures.'
    },
    'tab-analytics': {
      title: 'Assessment Analytics & Weekly MIS',
      desc: 'Operational evaluation metrics, topic performance breakdowns, CSV export, and printable weekly reporting.'
    },
    'tab-operations': {
      title: 'Academic Operations & Support Tracker',
      desc: 'Issue resolution workflows, overdue tracking, assessment deadlines, and college review summaries.'
    }
  };

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.dataset.tab;
      if (!targetTabId) return;

      // Update Nav Buttons
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Switch Tab Contents
      tabContents.forEach(tab => {
        if (tab.id === targetTabId) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });

      // Update View Title
      if (VIEW_DESCRIPTIONS[targetTabId]) {
        if (viewTitle) viewTitle.textContent = VIEW_DESCRIPTIONS[targetTabId].title;
        if (viewDesc) viewDesc.textContent = VIEW_DESCRIPTIONS[targetTabId].desc;
      }
    });
  });
}

/**
 * Configure Reset Demo Data Flow with confirmation
 */
function setupResetDemoData() {
  const resetBtn = document.getElementById('resetDemoDataBtn');
  if (!resetBtn) return;

  resetBtn.addEventListener('click', () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all stored application data to the factory demonstration state? Any custom additions will be reverted.'
    );
    if (!confirmed) return;

    clearAll();
    setItem(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    setItem(STORAGE_KEYS.ASSESSMENTS, DEMO_ASSESSMENTS);
    setItem(STORAGE_KEYS.ATTEMPTS, DEMO_ATTEMPTS);
    setItem(STORAGE_KEYS.ISSUES, DEMO_ISSUES);
    setItem(STORAGE_KEYS.SCHEDULES, DEMO_SCHEDULES);
    setItem(STORAGE_KEYS.ATTENDANCE, DEMO_ATTENDANCE);
    setItem(STORAGE_KEYS.SUBJECTS, DEMO_SUBJECTS);
    setItem(STORAGE_KEYS.EXPENSES, DEMO_EXPENSES);

    showToast('Factory demo data restored. Reloading view...', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  });
}

// Auto-run bootstrap when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
