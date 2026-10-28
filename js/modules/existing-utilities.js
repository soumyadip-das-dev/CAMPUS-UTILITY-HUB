/**
 * Campus Utility Hub 2.0 - Student Academic Utilities Module
 * Refactored, secure, fully persistent implementations of the 8 original student utilities:
 * 1. Attendance Tracker (Session-based, 75% threshold indicator, persistent)
 * 2. CGPA Calculator (Itemized course list, weighted points, zero-safe)
 * 3. Number Converter (Decimal to Bin, Oct, Hex & Binary to Dec, zero-safe)
 * 4. Password Strength Analyzer (Dynamic meter & 5-point criteria checklist)
 * 5. Interactive Concept Quiz (Safe option selection, Next button, final scoring)
 * 6. Expense Splitter (Itemized expenses, share calculation, balance review)
 * 7. Theme Customizer (CSS variables, dark mode, persistent)
 * 8. Typing Speed Tester (Real WPM, accuracy %, character feedback, timer)
 */

import { getItem, setItem, STORAGE_KEYS } from '../core/storage.js';
import { safePercentage, formatCurrency, generateId, showToast } from '../core/utils.js';
import { validateRequired, validateNumber, validateGrade } from '../core/validation.js';
import { DEMO_ATTENDANCE, DEMO_SUBJECTS, DEMO_EXPENSES } from '../data/demo-data.js';

/* Grade Point Scale */
export const GRADE_POINTS = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'F': 0
};

/* ==========================================================================
   1. SMART ATTENDANCE TRACKER
   ========================================================================== */

let attendanceList = [];

export function initAttendance() {
  attendanceList = getItem(STORAGE_KEYS.ATTENDANCE, DEMO_ATTENDANCE);
  renderAttendanceTable();

  const addBtn = document.getElementById('addAttendanceBtn');
  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = 'true';
    addBtn.addEventListener('click', handleAddAttendance);
  }
}

function handleAddAttendance() {
  const nameInput = document.getElementById('studentNameInput');
  const attendedInput = document.getElementById('attendedSessionsInput');
  const totalInput = document.getElementById('totalSessionsInput');

  const nameVal = nameInput ? nameInput.value.trim() : '';
  const attendedVal = attendedInput ? attendedInput.value : '';
  const totalVal = totalInput ? totalInput.value : '';

  const nameCheck = validateRequired(nameVal, 'Student Name');
  if (!nameCheck.valid) {
    showToast(nameCheck.error, 'error');
    return;
  }

  const totalCheck = validateNumber(totalVal, 'Total Sessions', { min: 1, integerOnly: true });
  if (!totalCheck.valid) {
    showToast(totalCheck.error, 'error');
    return;
  }

  const attendedCheck = validateNumber(attendedVal, 'Attended Sessions', { min: 0, max: totalCheck.parsedValue, integerOnly: true });
  if (!attendedCheck.valid) {
    showToast(attendedCheck.error, 'error');
    return;
  }

  const pct = safePercentage(attendedCheck.parsedValue, totalCheck.parsedValue, 1);

  const newRecord = {
    id: generateId('att'),
    name: nameVal,
    attendedSessions: attendedCheck.parsedValue,
    totalSessions: totalCheck.parsedValue,
    attendancePct: pct
  };

  attendanceList.push(newRecord);
  setItem(STORAGE_KEYS.ATTENDANCE, attendanceList);
  renderAttendanceTable();

  if (nameInput) nameInput.value = '';
  if (attendedInput) attendedInput.value = '';
  if (totalInput) totalInput.value = '';

  showToast(`Attendance recorded for ${nameVal}.`, 'success');
}

export function renderAttendanceTable() {
  const tbody = document.getElementById('attendanceTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (attendanceList.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="5" class="empty-state">No attendance records found. Add a student record above.</td>';
    tbody.appendChild(emptyRow);
    return;
  }

  attendanceList.forEach(student => {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.textContent = student.name;

    const tdSessions = document.createElement('td');
    tdSessions.textContent = `${student.attendedSessions} / ${student.totalSessions}`;

    const tdPct = document.createElement('td');
    tdPct.textContent = `${student.attendancePct}%`;

    const tdStatus = document.createElement('td');
    const badge = document.createElement('span');
    if (student.attendancePct >= 75) {
      badge.className = 'badge badge-success';
      badge.textContent = 'Eligible (>=75%)';
    } else {
      badge.className = 'badge badge-danger';
      badge.textContent = 'Shortage (<75%)';
    }
    tdStatus.appendChild(badge);

    const tdAction = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-secondary btn-sm';
    delBtn.textContent = 'Remove';
    delBtn.onclick = () => deleteAttendanceRecord(student.id);
    tdAction.appendChild(delBtn);

    tr.appendChild(tdName);
    tr.appendChild(tdSessions);
    tr.appendChild(tdPct);
    tr.appendChild(tdStatus);
    tr.appendChild(tdAction);

    tbody.appendChild(tr);
  });
}

function deleteAttendanceRecord(id) {
  attendanceList = attendanceList.filter(item => item.id !== id);
  setItem(STORAGE_KEYS.ATTENDANCE, attendanceList);
  renderAttendanceTable();
  showToast('Record removed.', 'info');
}

/* ==========================================================================
   2. CGPA & SGPA CALCULATOR
   ========================================================================== */

let subjectList = [];

export function initCGPA() {
  subjectList = getItem(STORAGE_KEYS.SUBJECTS, DEMO_SUBJECTS);
  renderSubjectTable();
  calculateSGPA();

  const addBtn = document.getElementById('addSubjectBtn');
  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = 'true';
    addBtn.addEventListener('click', handleAddSubject);
  }
}

function handleAddSubject() {
  const nameInput = document.getElementById('subjectNameInput');
  const creditsInput = document.getElementById('subjectCreditsInput');
  const gradeInput = document.getElementById('subjectGradeInput');

  const name = nameInput ? nameInput.value.trim() : '';
  const credits = creditsInput ? creditsInput.value : '';
  const grade = gradeInput ? gradeInput.value.trim().toUpperCase() : 'O';

  const nameCheck = validateRequired(name, 'Subject Name');
  if (!nameCheck.valid) {
    showToast(nameCheck.error, 'error');
    return;
  }

  const creditsCheck = validateNumber(credits, 'Credits', { min: 1, max: 12, integerOnly: true });
  if (!creditsCheck.valid) {
    showToast(creditsCheck.error, 'error');
    return;
  }

  const gradeCheck = validateGrade(grade);
  if (!gradeCheck.valid) {
    showToast(gradeCheck.error, 'error');
    return;
  }

  subjectList.push({
    id: generateId('sub'),
    name,
    credits: creditsCheck.parsedValue,
    grade
  });

  setItem(STORAGE_KEYS.SUBJECTS, subjectList);
  renderSubjectTable();
  calculateSGPA();

  if (nameInput) nameInput.value = '';
  if (creditsInput) creditsInput.value = '';
  showToast(`Added ${name}.`, 'success');
}

export function renderSubjectTable() {
  const tbody = document.getElementById('subjectTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (subjectList.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4" class="empty-state">No subjects registered yet. Add courses above to compute SGPA.</td>';
    tbody.appendChild(tr);
    return;
  }

  subjectList.forEach(sub => {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.textContent = sub.name;

    const tdCredits = document.createElement('td');
    tdCredits.textContent = String(sub.credits);

    const tdGrade = document.createElement('td');
    tdGrade.textContent = `${sub.grade} (${GRADE_POINTS[sub.grade] ?? 0} pts)`;

    const tdAction = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-secondary btn-sm';
    delBtn.textContent = 'Remove';
    delBtn.onclick = () => deleteSubject(sub.id);
    tdAction.appendChild(delBtn);

    tr.appendChild(tdName);
    tr.appendChild(tdCredits);
    tr.appendChild(tdGrade);
    tr.appendChild(tdAction);

    tbody.appendChild(tr);
  });
}

function deleteSubject(id) {
  subjectList = subjectList.filter(s => s.id !== id);
  setItem(STORAGE_KEYS.SUBJECTS, subjectList);
  renderSubjectTable();
  calculateSGPA();
}

export function calculateSGPA() {
  const resultDiv = document.getElementById('cgpaResultDisplay');
  if (!resultDiv) return;

  if (subjectList.length === 0) {
    resultDiv.innerHTML = '<span class="text-muted">Enter subjects to calculate SGPA.</span>';
    return;
  }

  let totalCredits = 0;
  let weightedSum = 0;

  subjectList.forEach(sub => {
    const pts = GRADE_POINTS[sub.grade] ?? 0;
    totalCredits += sub.credits;
    weightedSum += sub.credits * pts;
  });

  if (totalCredits === 0) {
    resultDiv.textContent = 'SGPA: 0.00 (0 total credits)';
    return;
  }

  const sgpa = (weightedSum / totalCredits).toFixed(2);
  resultDiv.innerHTML = `<strong>SGPA: ${sgpa}</strong> <span class="stat-meta">(${totalCredits} total credits, ${weightedSum} grade points)</span>`;
}

/* ==========================================================================
   3. NUMBER CONVERTER (DECIMAL / BINARY / OCTAL / HEXADECIMAL)
   ========================================================================== */

export function initNumberConverter() {
  const convertBtn = document.getElementById('convertNumberBtn');
  if (convertBtn && !convertBtn.dataset.bound) {
    convertBtn.dataset.bound = 'true';
    convertBtn.addEventListener('click', handleConvertNumber);
  }
}

function handleConvertNumber() {
  const input = document.getElementById('numberConverterInput');
  const modeSelect = document.getElementById('numberConverterMode');
  const resultBox = document.getElementById('numberConverterResult');
  if (!input || !resultBox) return;

  const rawVal = input.value.trim();
  const mode = modeSelect ? modeSelect.value : 'decToBin';

  if (rawVal === '') {
    resultBox.innerHTML = '<span class="badge badge-warning">Please enter a valid number.</span>';
    return;
  }

  if (mode === 'decToBin') {
    const num = Number(rawVal);
    if (!Number.isInteger(num) || num < 0) {
      resultBox.innerHTML = '<span class="badge badge-danger">Please enter a non-negative whole integer.</span>';
      return;
    }
    const bin = num === 0 ? '0' : num.toString(2);
    const oct = num.toString(8);
    const hex = num.toString(16).toUpperCase();

    resultBox.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
        <div><strong>Binary (Base 2):</strong> <code>${bin}</code></div>
        <div><strong>Octal (Base 8):</strong> <code>${oct}</code></div>
        <div><strong>Hexadecimal (Base 16):</strong> <code>0x${hex}</code></div>
      </div>
    `;
  } else {
    // Binary to Decimal
    if (!/^[01]+$/.test(rawVal)) {
      resultBox.innerHTML = '<span class="badge badge-danger">Invalid binary! Only digits 0 and 1 are permitted.</span>';
      return;
    }
    const dec = parseInt(rawVal, 2);
    resultBox.innerHTML = `
      <div style="margin-top:8px;">
        <strong>Decimal Value:</strong> <code>${dec}</code>
      </div>
    `;
  }
}

/* ==========================================================================
   4. PASSWORD STRENGTH ANALYZER
   ========================================================================== */

export function initPasswordAnalyzer() {
  const input = document.getElementById('passwordAnalyzerInput');
  if (input && !input.dataset.bound) {
    input.dataset.bound = 'true';
    input.addEventListener('input', handleAnalyzePassword);
  }
}

function handleAnalyzePassword() {
  const input = document.getElementById('passwordAnalyzerInput');
  const meter = document.getElementById('passwordMeter');
  const label = document.getElementById('passwordStrengthLabel');
  if (!input || !meter || !label) return;

  const pwd = input.value;
  if (!pwd) {
    meter.style.width = '0%';
    meter.style.backgroundColor = 'transparent';
    label.textContent = 'Enter password to inspect';
    updateChecklist({});
    return;
  }

  const checks = {
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
    hasLength: pwd.length >= 8
  };

  const score = Object.values(checks).filter(Boolean).length;
  updateChecklist(checks);

  if (score <= 2) {
    meter.style.width = '30%';
    meter.style.backgroundColor = 'var(--danger)';
    label.textContent = 'Weak Password';
    label.style.color = 'var(--danger)';
  } else if (score <= 4) {
    meter.style.width = '70%';
    meter.style.backgroundColor = 'var(--warning)';
    label.textContent = 'Moderate Password';
    label.style.color = 'var(--warning)';
  } else {
    meter.style.width = '100%';
    meter.style.backgroundColor = 'var(--success)';
    label.textContent = 'Strong Password';
    label.style.color = 'var(--success)';
  }
}

function updateChecklist(checks) {
  const setStatus = (id, passed) => {
    const el = document.getElementById(id);
    if (el) {
      el.className = passed ? 'criteria-met' : 'criteria-unmet';
      el.textContent = `${passed ? '✓' : '✗'} ${el.dataset.label}`;
    }
  };

  setStatus('pwd-chk-len', checks.hasLength);
  setStatus('pwd-chk-upper', checks.hasUpper);
  setStatus('pwd-chk-lower', checks.hasLower);
  setStatus('pwd-chk-num', checks.hasNumber);
  setStatus('pwd-chk-special', checks.hasSpecial);
}

/* ==========================================================================
   5. INTERACTIVE CONCEPT QUIZ
   ========================================================================== */

const CONCEPT_QUESTIONS = [
  {
    q: 'What is the time complexity of looking up a key in a standard Hash Table (average case)?',
    opts: ['O(N)', 'O(1)', 'O(log N)', 'O(N^2)'],
    ans: 1,
    exp: 'Hash tables offer O(1) average constant time lookups using direct key hashing.'
  },
  {
    q: 'Which data structure follows the Last-In First-Out (LIFO) order?',
    opts: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
    ans: 1,
    exp: 'A Stack strictly enforces LIFO order; the most recently pushed element is popped first.'
  },
  {
    q: 'Which algorithm design technique does Kadane’s algorithm use?',
    opts: ['Greedy / Dynamic Programming', 'Brute Force Enumeration', 'Backtracking', 'Randomized Monte Carlo'],
    ans: 0,
    exp: 'Kadane’s algorithm uses dynamic programming / greedy choice to track maximum subarray ending at each index.'
  }
];

let quizIdx = 0;
let quizScore = 0;
let quizSelectedAnswer = null;

export function initQuiz() {
  const nextBtn = document.getElementById('quizNextBtn');
  const retakeBtn = document.getElementById('quizRetakeBtn');

  if (nextBtn && !nextBtn.dataset.bound) {
    nextBtn.dataset.bound = 'true';
    nextBtn.addEventListener('click', handleQuizNext);
  }

  if (retakeBtn && !retakeBtn.dataset.bound) {
    retakeBtn.dataset.bound = 'true';
    retakeBtn.addEventListener('click', resetQuiz);
  }

  renderQuizQuestion();
}

function renderQuizQuestion() {
  const qEl = document.getElementById('conceptQuizQuestion');
  const optsContainer = document.getElementById('conceptQuizOptions');
  const feedbackEl = document.getElementById('conceptQuizFeedback');
  const progressEl = document.getElementById('conceptQuizProgress');
  const nextBtn = document.getElementById('quizNextBtn');
  const retakeBtn = document.getElementById('quizRetakeBtn');

  if (!qEl || !optsContainer) return;

  if (quizIdx >= CONCEPT_QUESTIONS.length) {
    // Completed
    qEl.textContent = 'Quiz Completed!';
    optsContainer.innerHTML = '';
    if (feedbackEl) {
      feedbackEl.innerHTML = `
        <div class="stat-card" style="margin-top:10px;">
          <div class="stat-label">Final Result</div>
          <div class="stat-value">${quizScore} / ${CONCEPT_QUESTIONS.length}</div>
          <div class="stat-meta">Score: ${safePercentage(quizScore, CONCEPT_QUESTIONS.length)}%</div>
        </div>
      `;
    }
    if (progressEl) progressEl.textContent = 'Finished';
    if (nextBtn) nextBtn.style.display = 'none';
    if (retakeBtn) retakeBtn.style.display = 'inline-flex';
    return;
  }

  const current = CONCEPT_QUESTIONS[quizIdx];
  quizSelectedAnswer = null;
  qEl.textContent = `${quizIdx + 1}. ${current.q}`;
  if (progressEl) progressEl.textContent = `Question ${quizIdx + 1} of ${CONCEPT_QUESTIONS.length}`;
  if (feedbackEl) feedbackEl.innerHTML = '';
  if (nextBtn) {
    nextBtn.style.display = 'inline-flex';
    nextBtn.disabled = true;
  }
  if (retakeBtn) retakeBtn.style.display = 'none';

  optsContainer.innerHTML = '';
  current.opts.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'mcq-option';
    btn.textContent = opt;
    btn.onclick = () => selectQuizOption(idx);
    optsContainer.appendChild(btn);
  });
}

function selectQuizOption(idx) {
  if (quizSelectedAnswer !== null) return; // Prevent multiple answers per question
  quizSelectedAnswer = idx;

  const current = CONCEPT_QUESTIONS[quizIdx];
  const optsContainer = document.getElementById('conceptQuizOptions');
  const feedbackEl = document.getElementById('conceptQuizFeedback');
  const nextBtn = document.getElementById('quizNextBtn');

  const buttons = optsContainer.querySelectorAll('.mcq-option');
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === current.ans) {
      b.classList.add('correct-review');
    } else if (i === idx) {
      b.classList.add('incorrect-review');
    }
  });

  if (idx === current.ans) {
    quizScore++;
    if (feedbackEl) {
      feedbackEl.innerHTML = `<span class="badge badge-success">Correct!</span> <span style="font-size:12px; margin-left:6px;">${current.exp}</span>`;
    }
  } else {
    if (feedbackEl) {
      feedbackEl.innerHTML = `<span class="badge badge-danger">Incorrect.</span> <span style="font-size:12px; margin-left:6px;">${current.exp}</span>`;
    }
  }

  if (nextBtn) nextBtn.disabled = false;
}

function handleQuizNext() {
  quizIdx++;
  renderQuizQuestion();
}

function resetQuiz() {
  quizIdx = 0;
  quizScore = 0;
  quizSelectedAnswer = null;
  renderQuizQuestion();
}

/* ==========================================================================
   6. EXPENSE SPLITTER
   ========================================================================== */

let expenseList = [];

export function initExpenseSplitter() {
  expenseList = getItem(STORAGE_KEYS.EXPENSES, DEMO_EXPENSES);
  renderExpenseTable();
  calculateExpenses();

  const addBtn = document.getElementById('addExpenseBtn');
  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = 'true';
    addBtn.addEventListener('click', handleAddExpense);
  }
}

function handleAddExpense() {
  const personInput = document.getElementById('expensePersonInput');
  const descInput = document.getElementById('expenseDescInput');
  const amountInput = document.getElementById('expenseAmountInput');

  const person = personInput ? personInput.value.trim() : '';
  const desc = descInput ? descInput.value.trim() : '';
  const amount = amountInput ? amountInput.value : '';

  const personCheck = validateRequired(person, 'Person Name');
  if (!personCheck.valid) {
    showToast(personCheck.error, 'error');
    return;
  }

  const amountCheck = validateNumber(amount, 'Expense Amount', { min: 1 });
  if (!amountCheck.valid) {
    showToast(amountCheck.error, 'error');
    return;
  }

  expenseList.push({
    id: generateId('exp'),
    person,
    description: desc || 'General Academic Expense',
    amount: amountCheck.parsedValue
  });

  setItem(STORAGE_KEYS.EXPENSES, expenseList);
  renderExpenseTable();
  calculateExpenses();

  if (personInput) personInput.value = '';
  if (descInput) descInput.value = '';
  if (amountInput) amountInput.value = '';

  showToast(`Recorded expense for ${person}.`, 'success');
}

export function renderExpenseTable() {
  const tbody = document.getElementById('expenseTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (expenseList.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4" class="empty-state">No expenses logged. Add shared costs above.</td>';
    tbody.appendChild(tr);
    return;
  }

  expenseList.forEach(item => {
    const tr = document.createElement('tr');

    const tdPerson = document.createElement('td');
    tdPerson.textContent = item.person;

    const tdDesc = document.createElement('td');
    tdDesc.textContent = item.description;

    const tdAmount = document.createElement('td');
    tdAmount.textContent = formatCurrency(item.amount);

    const tdAction = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-secondary btn-sm';
    delBtn.textContent = 'Remove';
    delBtn.onclick = () => deleteExpense(item.id);
    tdAction.appendChild(delBtn);

    tr.appendChild(tdPerson);
    tr.appendChild(tdDesc);
    tr.appendChild(tdAmount);
    tr.appendChild(tdAction);

    tbody.appendChild(tr);
  });
}

function deleteExpense(id) {
  expenseList = expenseList.filter(e => e.id !== id);
  setItem(STORAGE_KEYS.EXPENSES, expenseList);
  renderExpenseTable();
  calculateExpenses();
}

function calculateExpenses() {
  const resultDiv = document.getElementById('expenseSummaryDisplay');
  if (!resultDiv) return;

  if (expenseList.length === 0) {
    resultDiv.innerHTML = '<span class="text-muted">No expenses to calculate.</span>';
    return;
  }

  const total = expenseList.reduce((acc, curr) => acc + curr.amount, 0);
  const people = [...new Set(expenseList.map(e => e.person))];
  const share = people.length > 0 ? (total / people.length) : 0;

  resultDiv.innerHTML = `
    <div><strong>Total Expenditure:</strong> ${formatCurrency(total)}</div>
    <div><strong>Participants (${people.length}):</strong> ${people.join(', ')}</div>
    <div><strong>Equal Share Per Person:</strong> ${formatCurrency(share)}</div>
  `;
}

/* ==========================================================================
   7. THEME CUSTOMIZER & DARK MODE
   ========================================================================== */

const DEFAULT_THEME = {
  isDark: false,
  fontSize: 15,
  borderRadius: 8,
  spacing: 20
};

export function initThemeCustomizer() {
  const saved = getItem(STORAGE_KEYS.THEME, DEFAULT_THEME);
  applyTheme(saved);

  const darkBtn = document.getElementById('sidebarDarkToggle');
  if (darkBtn && !darkBtn.dataset.bound) {
    darkBtn.dataset.bound = 'true';
    darkBtn.addEventListener('click', toggleDarkMode);
  }

  const fontSlider = document.getElementById('themeFontSizeSlider');
  if (fontSlider && !fontSlider.dataset.bound) {
    fontSlider.dataset.bound = 'true';
    fontSlider.value = saved.fontSize || 15;
    fontSlider.addEventListener('input', (e) => {
      updateThemeProperty('fontSize', Number(e.target.value));
    });
  }

  const radiusSlider = document.getElementById('themeRadiusSlider');
  if (radiusSlider && !radiusSlider.dataset.bound) {
    radiusSlider.dataset.bound = 'true';
    radiusSlider.value = saved.borderRadius || 8;
    radiusSlider.addEventListener('input', (e) => {
      updateThemeProperty('borderRadius', Number(e.target.value));
    });
  }

  const resetBtn = document.getElementById('resetThemeBtn');
  if (resetBtn && !resetBtn.dataset.bound) {
    resetBtn.dataset.bound = 'true';
    resetBtn.addEventListener('click', () => {
      applyTheme(DEFAULT_THEME);
      setItem(STORAGE_KEYS.THEME, DEFAULT_THEME);
      if (fontSlider) fontSlider.value = DEFAULT_THEME.fontSize;
      if (radiusSlider) radiusSlider.value = DEFAULT_THEME.borderRadius;
      showToast('Theme reset to defaults.', 'info');
    });
  }
}

function applyTheme(theme) {
  if (theme.isDark) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  document.documentElement.style.setProperty('--font-size', `${theme.fontSize}px`);
  document.documentElement.style.setProperty('--radius', `${theme.borderRadius}px`);
}

function toggleDarkMode() {
  const current = getItem(STORAGE_KEYS.THEME, DEFAULT_THEME);
  current.isDark = !current.isDark;
  applyTheme(current);
  setItem(STORAGE_KEYS.THEME, current);
}

function updateThemeProperty(key, value) {
  const current = getItem(STORAGE_KEYS.THEME, DEFAULT_THEME);
  current[key] = value;
  applyTheme(current);
  setItem(STORAGE_KEYS.THEME, current);
}

/* ==========================================================================
   8. TYPING SPEED & ACCURACY TESTER
   ========================================================================== */

const TYPING_PARAGRAPHS = [
  "Algorithms are unambiguous specifications for performing calculations and data processing.",
  "Data structures provide organized formats for accessing and modifying computational elements efficiently.",
  "Software engineering demands rigorous validation, error boundary resilience, and automated testing."
];

let typingStartTime = null;
let typingActive = false;
let currentTargetText = '';

export function initTypingTester() {
  const input = document.getElementById('typingInputArea');
  const resetBtn = document.getElementById('typingResetBtn');

  if (input && !input.dataset.bound) {
    input.dataset.bound = 'true';
    input.addEventListener('input', handleTypingInput);
  }

  if (resetBtn && !resetBtn.dataset.bound) {
    resetBtn.dataset.bound = 'true';
    resetBtn.addEventListener('click', resetTypingTest);
  }

  resetTypingTest();
}

function resetTypingTest() {
  const display = document.getElementById('typingTargetDisplay');
  const input = document.getElementById('typingInputArea');
  const result = document.getElementById('typingStatsDisplay');

  currentTargetText = TYPING_PARAGRAPHS[Math.floor(Math.random() * TYPING_PARAGRAPHS.length)];
  typingStartTime = null;
  typingActive = false;

  if (input) {
    input.value = '';
    input.disabled = false;
  }

  if (display) {
    display.textContent = currentTargetText;
  }

  if (result) {
    result.innerHTML = '<span class="text-muted">Start typing in the box below to begin speed measurement...</span>';
  }
}

function handleTypingInput() {
  const input = document.getElementById('typingInputArea');
  const result = document.getElementById('typingStatsDisplay');
  if (!input || !result) return;

  const typed = input.value;

  if (!typingActive && typed.length > 0) {
    typingActive = true;
    typingStartTime = Date.now();
  }

  const elapsedSeconds = Math.max(1, (Date.now() - (typingStartTime || Date.now())) / 1000);
  const minutes = elapsedSeconds / 60;

  let correctCount = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === currentTargetText[i]) {
      correctCount++;
    }
  }

  const words = correctCount / 5;
  const wpm = Math.round(words / minutes);
  const accuracy = typed.length > 0 ? safePercentage(correctCount, typed.length) : 100;

  result.innerHTML = `
    <div style="display:flex; gap:16px; align-items:center; margin-top:8px;">
      <div><strong>Speed:</strong> <span class="badge badge-info">${wpm} WPM</span></div>
      <div><strong>Accuracy:</strong> <span class="badge badge-success">${accuracy}%</span></div>
      <div><strong>Progress:</strong> ${typed.length} / ${currentTargetText.length} chars</div>
    </div>
  `;

  if (typed.length >= currentTargetText.length) {
    input.disabled = true;
    showToast(`Test complete! Speed: ${wpm} WPM with ${accuracy}% accuracy.`, 'success');
  }
}
