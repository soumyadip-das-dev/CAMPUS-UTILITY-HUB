/**
 * Campus Utility Hub 2.0 - Module A: Programming Assessment Management
 * 
 * Features:
 * 1. Question Bank Management (CRUD, filter by Topic & Difficulty, view details modal)
 * 2. Timed Assessment Runner (countdown timer, unanswered question tracker, answer navigation)
 * 3. Consistent scoring, timeout handling, duplicate submission prevention
 * 4. Detailed review mode with explanations & reference solutions
 * 5. Full LocalStorage persistence for questions, assessments, and attempts
 */

import { getItem, setItem, STORAGE_KEYS } from '../core/storage.js';
import { safePercentage, generateId, showToast, formatDate } from '../core/utils.js';
import { validateQuestion, VALID_TOPICS, VALID_DIFFICULTIES } from '../core/validation.js';
import { INITIAL_QUESTIONS } from '../data/questions.js';
import { DEMO_ASSESSMENTS, DEMO_ATTEMPTS } from '../data/demo-data.js';

let questions = [];
let assessments = [];
let attempts = [];

// Active assessment state
let activeTest = null;
let activeTimerInterval = null;
let currentQuestionIndex = 0;
let userAnswers = {}; // { questionId: optionIndex }
let testStartTime = null;

/**
 * Initialize Module A
 */
export function initAssessments() {
  questions = getItem(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  assessments = getItem(STORAGE_KEYS.ASSESSMENTS, DEMO_ASSESSMENTS);
  attempts = getItem(STORAGE_KEYS.ATTEMPTS, DEMO_ATTEMPTS);

  renderAssessmentsLayout();
  setupSubTabs();
  renderQuestionBank();
  renderAssessmentCatalog();
  renderAttemptHistory();
}

/**
 * Render the main container shell for Module A
 */
function renderAssessmentsLayout() {
  const mount = document.getElementById('assessmentsMount');
  if (!mount) return;

  mount.innerHTML = `
    <!-- Module Sub-Navigation -->
    <div style="display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; flex-wrap: wrap;">
      <button class="btn btn-primary btn-sm sub-nav-btn active" data-subtab="asmt-sub-catalog" id="subtabBtnCatalog">
        Assessment Catalog
      </button>
      <button class="btn btn-secondary btn-sm sub-nav-btn" data-subtab="asmt-sub-bank" id="subtabBtnBank">
        Question Bank (${questions.length})
      </button>
      <button class="btn btn-secondary btn-sm sub-nav-btn" data-subtab="asmt-sub-history" id="subtabBtnHistory">
        Attempt History (${attempts.length})
      </button>
    </div>

    <!-- Active Assessment Runner Screen (Hidden by default) -->
    <div id="assessmentRunnerScreen" style="display: none; margin-bottom: 30px;"></div>

    <!-- Sub-tab 1: Assessment Catalog -->
    <div id="asmt-sub-catalog" class="asmt-subview active">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="font-size: 17px; font-weight: 700;">Timed Programming Assessments</h3>
          <p class="text-muted" style="font-size: 13px;">Curated multi-choice problem-solving diagnostics with strict timers and detailed post-test reviews.</p>
        </div>
      </div>
      <div class="grid-3" id="assessmentCatalogList"></div>
    </div>

    <!-- Sub-tab 2: Question Bank -->
    <div id="asmt-sub-bank" class="asmt-subview" style="display: none;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="font-size: 17px; font-weight: 700;">Question Bank Repository</h3>
          <p class="text-muted" style="font-size: 13px;">Manage structured questions covering Arrays, Strings, Sorting, Searching, and Data Structures.</p>
        </div>
        <button class="btn btn-primary" id="openAddQuestionBtn">
          + Add New Question
        </button>
      </div>

      <!-- Filters -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-body" style="padding: 14px 18px;">
          <div class="form-row">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="filterTopic">Filter by Topic</label>
              <select class="form-select" id="filterTopic">
                <option value="All">All Topics</option>
                ${VALID_TOPICS.map(t => `<option value="${t}">${t}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="filterDifficulty">Filter by Difficulty</label>
              <select class="form-select" id="filterDifficulty">
                <option value="All">All Difficulties</option>
                ${VALID_DIFFICULTIES.map(d => `<option value="${d}">${d}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0; flex: 1.5;">
              <label class="form-label" for="searchQuestionText">Search Keywords</label>
              <input type="text" class="form-control" id="searchQuestionText" placeholder="Search by title or concept..." />
            </div>
          </div>
        </div>
      </div>

      <!-- Question List Table -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Title</th>
              <th>Topic</th>
              <th>Difficulty</th>
              <th>Options Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="questionBankTableBody"></tbody>
        </table>
      </div>
    </div>

    <!-- Sub-tab 3: Attempt History -->
    <div id="asmt-sub-history" class="asmt-subview" style="display: none;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
        <div>
          <h3 style="font-size: 17px; font-weight: 700;">Assessment Attempt History</h3>
          <p class="text-muted" style="font-size: 13px;">Audit log of candidate scores, completion status, and time spent.</p>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Assessment</th>
              <th>Score</th>
              <th>Correct</th>
              <th>Status</th>
              <th>Completed Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="attemptHistoryTableBody"></tbody>
        </table>
      </div>
    </div>

    <!-- Dynamic Modal Container for Question Form & Detail Views -->
    <div id="asmtModalBackdrop" class="modal-backdrop" style="display: none;">
      <div class="modal-dialog" id="asmtModalDialog"></div>
    </div>
  `;

  // Attach Add Question Listener
  const addBtn = document.getElementById('openAddQuestionBtn');
  if (addBtn) addBtn.onclick = () => openQuestionModal();

  // Attach Filter Listeners
  const topicFilter = document.getElementById('filterTopic');
  const diffFilter = document.getElementById('filterDifficulty');
  const searchInput = document.getElementById('searchQuestionText');
  if (topicFilter) topicFilter.onchange = renderQuestionBank;
  if (diffFilter) diffFilter.onchange = renderQuestionBank;
  if (searchInput) searchInput.oninput = renderQuestionBank;
}

/**
 * Configure internal tab switching for Module A
 */
function setupSubTabs() {
  const subNavBtns = document.querySelectorAll('.sub-nav-btn');
  const subViews = document.querySelectorAll('.asmt-subview');

  subNavBtns.forEach(btn => {
    btn.onclick = () => {
      subNavBtns.forEach(b => {
        b.classList.remove('active', 'btn-primary');
        b.classList.add('btn-secondary');
      });
      btn.classList.add('active', 'btn-primary');
      btn.classList.remove('btn-secondary');

      const target = btn.dataset.subtab;
      subViews.forEach(v => {
        v.style.display = v.id === target ? 'block' : 'none';
      });
    };
  });
}

/* ==========================================================================
   QUESTION BANK CRUD & DETAILS
   ========================================================================== */

export function renderQuestionBank() {
  const tbody = document.getElementById('questionBankTableBody');
  if (!tbody) return;

  const topicFilter = document.getElementById('filterTopic')?.value || 'All';
  const diffFilter = document.getElementById('filterDifficulty')?.value || 'All';
  const search = (document.getElementById('searchQuestionText')?.value || '').toLowerCase().trim();

  const filtered = questions.filter(q => {
    const matchTopic = topicFilter === 'All' || q.topic === topicFilter;
    const matchDiff = diffFilter === 'All' || q.difficulty === diffFilter;
    const matchSearch = !search || q.title.toLowerCase().includes(search) || q.statement.toLowerCase().includes(search);
    return matchTopic && matchDiff && matchSearch;
  });

  tbody.innerHTML = '';
  if (filtered.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="5" class="empty-state">No questions found matching the selected filter criteria.</td>';
    tbody.appendChild(tr);
    return;
  }

  filtered.forEach(q => {
    const tr = document.createElement('tr');

    const tdTitle = document.createElement('td');
    tdTitle.style.fontWeight = '600';
    tdTitle.textContent = q.title;

    const tdTopic = document.createElement('td');
    const topicBadge = document.createElement('span');
    topicBadge.className = 'badge badge-info';
    topicBadge.textContent = q.topic;
    tdTopic.appendChild(topicBadge);

    const tdDiff = document.createElement('td');
    const diffBadge = document.createElement('span');
    diffBadge.className = q.difficulty === 'Easy' ? 'badge badge-success' : q.difficulty === 'Medium' ? 'badge badge-warning' : 'badge badge-danger';
    diffBadge.textContent = q.difficulty;
    tdDiff.appendChild(diffBadge);

    const tdOptions = document.createElement('td');
    tdOptions.textContent = `${q.options ? q.options.length : 0} choices`;

    const tdActions = document.createElement('td');
    tdActions.style.whiteSpace = 'nowrap';

    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-secondary btn-sm';
    viewBtn.textContent = 'View';
    viewBtn.style.marginRight = '6px';
    viewBtn.onclick = () => viewQuestionDetails(q.id);

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary btn-sm';
    editBtn.textContent = 'Edit';
    editBtn.style.marginRight = '6px';
    editBtn.onclick = () => openQuestionModal(q.id);

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger btn-sm';
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => deleteQuestion(q.id);

    tdActions.appendChild(viewBtn);
    tdActions.appendChild(editBtn);
    tdActions.appendChild(delBtn);

    tr.appendChild(tdTitle);
    tr.appendChild(tdTopic);
    tr.appendChild(tdDiff);
    tr.appendChild(tdOptions);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });
}

/**
 * Open Modal to Add or Edit a Question
 */
function openQuestionModal(editId = null) {
  const modal = document.getElementById('asmtModalBackdrop');
  const dialog = document.getElementById('asmtModalDialog');
  if (!modal || !dialog) return;

  const existing = editId ? questions.find(q => q.id === editId) : null;
  const isEdit = Boolean(existing);

  dialog.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">${isEdit ? 'Edit Programming Question' : 'Create New Programming Question'}</h3>
      <button class="btn btn-secondary btn-sm" id="closeAsmtModalBtn">✕</button>
    </div>
    <div class="modal-body">
      <form id="questionForm">
        <div class="form-row">
          <div class="form-group" style="flex: 2;">
            <label class="form-label" for="qfTitle">Question Title *</label>
            <input type="text" class="form-control" id="qfTitle" required value="${existing ? existing.title : ''}" placeholder="e.g. Valid Anagram Check" />
          </div>
          <div class="form-group">
            <label class="form-label" for="qfTopic">Topic *</label>
            <select class="form-select" id="qfTopic">
              ${VALID_TOPICS.map(t => `<option value="${t}" ${existing && existing.topic === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="qfDifficulty">Difficulty *</label>
            <select class="form-select" id="qfDifficulty">
              ${VALID_DIFFICULTIES.map(d => `<option value="${d}" ${existing && existing.difficulty === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="qfStatement">Problem Statement *</label>
          <textarea class="form-control" id="qfStatement" rows="3" required placeholder="Describe the programming problem in detail...">${existing ? existing.statement : ''}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="qfSampleInput">Sample Input</label>
            <input type="text" class="form-control" id="qfSampleInput" value="${existing?.sampleInput || ''}" placeholder="e.g. s = 'anagram', t = 'nagaram'" />
          </div>
          <div class="form-group">
            <label class="form-label" for="qfSampleOutput">Sample Output</label>
            <input type="text" class="form-control" id="qfSampleOutput" value="${existing?.sampleOutput || ''}" placeholder="e.g. true" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="qfConstraints">Constraints</label>
          <textarea class="form-control" id="qfConstraints" rows="2" placeholder="e.g. 1 <= s.length <= 10^5">${existing?.constraints || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Multiple-Choice Options & Correct Answer *</label>
          <p class="form-hint">Provide 4 options and select which one is the correct algorithmic solution.</p>
          ${[0, 1, 2, 3].map(i => `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <input type="radio" name="qfCorrectChoice" value="${i}" ${existing && existing.correctIndex === i ? 'checked' : i === 0 ? 'checked' : ''} style="width: auto; margin: 0;" />
              <input type="text" class="form-control qf-option-input" data-index="${i}" placeholder="Option ${i + 1}" value="${existing?.options?.[i] || ''}" required />
            </div>
          `).join('')}
        </div>

        <div class="form-group">
          <label class="form-label" for="qfExplanation">Answer Explanation</label>
          <textarea class="form-control" id="qfExplanation" rows="2" placeholder="Explain why the selected option is correct...">${existing?.mcqExplanation || existing?.explanation || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="qfReferenceSolution">Reference Solution Code (Optional)</label>
          <textarea class="form-control" id="qfReferenceSolution" rows="4" style="font-family: var(--font-mono); font-size: 12px;" placeholder="// Reference Python or JS implementation...">${existing?.referenceSolution || ''}</textarea>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" id="cancelAsmtModalBtn">Cancel</button>
      <button class="btn btn-primary" id="saveQuestionBtn">${isEdit ? 'Save Changes' : 'Create Question'}</button>
    </div>
  `;

  modal.style.display = 'flex';

  const close = () => { modal.style.display = 'none'; };
  document.getElementById('closeAsmtModalBtn').onclick = close;
  document.getElementById('cancelAsmtModalBtn').onclick = close;

  document.getElementById('saveQuestionBtn').onclick = () => {
    const title = document.getElementById('qfTitle').value.trim();
    const topic = document.getElementById('qfTopic').value;
    const difficulty = document.getElementById('qfDifficulty').value;
    const statement = document.getElementById('qfStatement').value.trim();
    const sampleInput = document.getElementById('qfSampleInput').value.trim();
    const sampleOutput = document.getElementById('qfSampleOutput').value.trim();
    const constraints = document.getElementById('qfConstraints').value.trim();
    const explanation = document.getElementById('qfExplanation').value.trim();
    const referenceSolution = document.getElementById('qfReferenceSolution').value.trim();

    const optionInputs = Array.from(dialog.querySelectorAll('.qf-option-input'));
    const options = optionInputs.map(input => input.value.trim());
    const correctIndex = Number(dialog.querySelector('input[name="qfCorrectChoice"]:checked')?.value || 0);

    const questionObj = {
      id: existing ? existing.id : generateId('q'),
      title,
      topic,
      difficulty,
      statement,
      sampleInput,
      sampleOutput,
      constraints,
      options,
      correctIndex,
      explanation,
      mcqExplanation: explanation,
      referenceSolution
    };

    const validation = validateQuestion(questionObj);
    if (!validation.valid) {
      showToast(validation.errors[0], 'error');
      return;
    }

    if (isEdit) {
      const idx = questions.findIndex(q => q.id === existing.id);
      questions[idx] = questionObj;
      showToast('Question updated.', 'success');
    } else {
      questions.unshift(questionObj);
      showToast('Question added to Question Bank.', 'success');
    }

    setItem(STORAGE_KEYS.QUESTIONS, questions);
    close();
    renderQuestionBank();
    updateBankCountBadge();
  };
}

/**
 * View Detailed Question Information in Modal
 */
function viewQuestionDetails(id) {
  const q = questions.find(item => item.id === id);
  if (!q) return;

  const modal = document.getElementById('asmtModalBackdrop');
  const dialog = document.getElementById('asmtModalDialog');
  if (!modal || !dialog) return;

  dialog.innerHTML = `
    <div class="modal-header">
      <div>
        <h3 class="modal-title">${q.title}</h3>
        <div style="display: flex; gap: 8px; margin-top: 4px;">
          <span class="badge badge-info">${q.topic}</span>
          <span class="badge ${q.difficulty === 'Easy' ? 'badge-success' : q.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}">${q.difficulty}</span>
        </div>
      </div>
      <button class="btn btn-secondary btn-sm" id="closeDetailModalBtn">✕</button>
    </div>
    <div class="modal-body">
      <div style="margin-bottom: 14px;">
        <strong style="display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">PROBLEM STATEMENT</strong>
        <p style="font-size: 14px; line-height: 1.5;">${q.statement}</p>
      </div>

      ${q.constraints ? `
        <div style="margin-bottom: 14px;">
          <strong style="display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">CONSTRAINTS</strong>
          <pre class="code-block" style="padding: 8px 12px;">${q.constraints}</pre>
        </div>
      ` : ''}

      ${q.sampleInput ? `
        <div style="margin-bottom: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <strong style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">SAMPLE INPUT</strong>
            <pre class="code-block" style="padding: 8px 12px;">${q.sampleInput}</pre>
          </div>
          <div>
            <strong style="display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">SAMPLE OUTPUT</strong>
            <pre class="code-block" style="padding: 8px 12px;">${q.sampleOutput}</pre>
          </div>
        </div>
      ` : ''}

      <div style="margin-bottom: 14px;">
        <strong style="display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">MULTIPLE CHOICE OPTIONS</strong>
        ${(q.options || []).map((opt, i) => `
          <div class="mcq-option ${i === q.correctIndex ? 'correct-review' : ''}" style="cursor: default; padding: 8px 12px; font-size: 13px;">
            <strong>${i === q.correctIndex ? '✓ Correct Choice: ' : `Choice ${i + 1}: `}</strong>${opt}
          </div>
        `).join('')}
      </div>

      ${(q.mcqExplanation || q.explanation) ? `
        <div style="margin-bottom: 14px;">
          <strong style="display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">EXPLANATION</strong>
          <p style="font-size: 13px; color: var(--text-secondary);">${q.mcqExplanation || q.explanation}</p>
        </div>
      ` : ''}

      ${q.referenceSolution ? `
        <div style="margin-bottom: 14px;">
          <strong style="display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">REFERENCE IMPLEMENTATION</strong>
          <pre class="code-block">${q.referenceSolution}</pre>
        </div>
      ` : ''}
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" id="doneDetailModalBtn">Close</button>
    </div>
  `;

  modal.style.display = 'flex';
  const close = () => { modal.style.display = 'none'; };
  document.getElementById('closeDetailModalBtn').onclick = close;
  document.getElementById('doneDetailModalBtn').onclick = close;
}

function deleteQuestion(id) {
  const confirmed = window.confirm('Are you sure you want to delete this question from the bank?');
  if (!confirmed) return;

  questions = questions.filter(q => q.id !== id);
  setItem(STORAGE_KEYS.QUESTIONS, questions);
  renderQuestionBank();
  updateBankCountBadge();
  showToast('Question removed from bank.', 'info');
}

function updateBankCountBadge() {
  const btn = document.getElementById('subtabBtnBank');
  if (btn) btn.textContent = `Question Bank (${questions.length})`;
}

/* ==========================================================================
   ASSESSMENT CATALOG & START FLOW
   ========================================================================== */

export function renderAssessmentCatalog() {
  const container = document.getElementById('assessmentCatalogList');
  if (!container) return;

  container.innerHTML = '';
  assessments.forEach(asmt => {
    const card = document.createElement('div');
    card.className = 'card';

    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';
    cardHeader.innerHTML = `
      <div>
        <h4 class="card-title">${asmt.title}</h4>
        <span class="badge badge-info" style="margin-top: 4px;">${asmt.topic}</span>
      </div>
    `;

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardBody.innerHTML = `
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">${asmt.description}</p>
      <div style="display: flex; gap: 14px; font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">
        <div><strong>Questions:</strong> ${asmt.questionIds.length}</div>
        <div><strong>Duration:</strong> ${asmt.durationMinutes} mins</div>
        <div><strong>Pass Score:</strong> ${asmt.passingScore}%</div>
      </div>
    `;

    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer';
    const startBtn = document.createElement('button');
    startBtn.className = 'btn btn-primary btn-sm';
    startBtn.textContent = 'Start Timed Assessment';
    startBtn.onclick = () => promptAndStartAssessment(asmt);
    cardFooter.appendChild(startBtn);

    card.appendChild(cardHeader);
    card.appendChild(cardBody);
    card.appendChild(cardFooter);

    container.appendChild(card);
  });
}

function promptAndStartAssessment(asmt) {
  const candidateName = window.prompt('Enter your name to begin this timed assessment:', 'Student Candidate');
  if (!candidateName || !candidateName.trim()) {
    showToast('Assessment launch canceled: Candidate name is required.', 'warning');
    return;
  }

  // Find question objects
  const asmtQuestions = asmt.questionIds.map(id => questions.find(q => q.id === id)).filter(Boolean);
  if (asmtQuestions.length === 0) {
    showToast('Error: This assessment has no valid questions linked in the question bank.', 'error');
    return;
  }

  // Setup active test state
  activeTest = {
    assessment: asmt,
    candidateName: candidateName.trim(),
    questions: asmtQuestions,
    durationSeconds: asmt.durationMinutes * 60,
    remainingSeconds: asmt.durationMinutes * 60,
    isSubmitted: false
  };

  currentQuestionIndex = 0;
  userAnswers = {};
  testStartTime = Date.now();

  // Switch view to Runner
  document.getElementById('asmt-sub-catalog').style.display = 'none';
  document.getElementById('asmt-sub-bank').style.display = 'none';
  document.getElementById('asmt-sub-history').style.display = 'none';

  const runner = document.getElementById('assessmentRunnerScreen');
  runner.style.display = 'block';

  startTimer();
  renderActiveQuestion();
}

/* ==========================================================================
   TIMED ASSESSMENT RUNNER & NAVIGATION
   ========================================================================== */

function startTimer() {
  clearInterval(activeTimerInterval);
  activeTimerInterval = setInterval(() => {
    if (!activeTest || activeTest.isSubmitted) {
      clearInterval(activeTimerInterval);
      return;
    }

    activeTest.remainingSeconds--;

    const timerPill = document.getElementById('assessmentTimerDisplay');
    if (timerPill) {
      const mins = Math.floor(activeTest.remainingSeconds / 60);
      const secs = activeTest.remainingSeconds % 60;
      timerPill.textContent = `⏱ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      if (activeTest.remainingSeconds <= 60) {
        timerPill.classList.add('urgent');
      } else {
        timerPill.classList.remove('urgent');
      }
    }

    if (activeTest.remainingSeconds <= 0) {
      clearInterval(activeTimerInterval);
      showToast('Time has expired! Submitting assessment automatically...', 'warning');
      submitAssessment(true); // Forced timeout submission
    }
  }, 1000);
}

function renderActiveQuestion() {
  const runner = document.getElementById('assessmentRunnerScreen');
  if (!runner || !activeTest) return;

  const q = activeTest.questions[currentQuestionIndex];
  const total = activeTest.questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = total - answeredCount;

  const mins = Math.floor(activeTest.remainingSeconds / 60);
  const secs = activeTest.remainingSeconds % 60;

  runner.innerHTML = `
    <div class="card" style="border: 2px solid var(--primary);">
      <!-- Runner Header -->
      <div class="card-header" style="background: var(--bg-subtle);">
        <div>
          <span class="brand-badge">${activeTest.assessment.title}</span>
          <h3 style="font-size: 16px; font-weight: 700; margin-top: 2px;">Candidate: ${activeTest.candidateName}</h3>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="badge ${unansweredCount === 0 ? 'badge-success' : 'badge-warning'}">
            ${unansweredCount} Unanswered
          </span>
          <div class="timer-pill ${activeTest.remainingSeconds <= 60 ? 'urgent' : ''}" id="assessmentTimerDisplay">
            ⏱ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}
          </div>
        </div>
      </div>

      <!-- Question Content -->
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 13px; font-weight: 700; color: var(--primary);">
            QUESTION ${currentQuestionIndex + 1} OF ${total}
          </span>
          <div style="display: flex; gap: 6px;">
            <span class="badge badge-info">${q.topic}</span>
            <span class="badge ${q.difficulty === 'Easy' ? 'badge-success' : q.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}">${q.difficulty}</span>
          </div>
        </div>

        <h4 style="font-size: 16px; margin-bottom: 12px; font-weight: 600;">${q.title}</h4>
        <p style="font-size: 14px; margin-bottom: 16px; line-height: 1.5;">${q.statement}</p>

        ${q.constraints ? `
          <div style="margin-bottom: 14px;">
            <strong style="font-size: 12px; color: var(--text-muted);">Constraints:</strong>
            <pre class="code-block" style="padding: 8px 12px; margin-top: 4px;">${q.constraints}</pre>
          </div>
        ` : ''}

        ${q.sampleInput ? `
          <div style="margin-bottom: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <strong style="font-size: 12px; color: var(--text-muted);">Sample Input:</strong>
              <pre class="code-block" style="padding: 6px 10px; margin-top: 4px;">${q.sampleInput}</pre>
            </div>
            <div>
              <strong style="font-size: 12px; color: var(--text-muted);">Sample Output:</strong>
              <pre class="code-block" style="padding: 6px 10px; margin-top: 4px;">${q.sampleOutput}</pre>
            </div>
          </div>
        ` : ''}

        <!-- MCQ Choices -->
        <div style="margin-top: 14px;">
          <strong style="display: block; font-size: 13px; margin-bottom: 8px;">Select the best answer:</strong>
          ${(q.options || []).map((opt, idx) => `
            <button class="mcq-option ${userAnswers[q.id] === idx ? 'selected' : ''}" data-choice="${idx}">
              <strong>${String.fromCharCode(65 + idx)}.</strong> ${opt}
            </button>
          `).join('')}
        </div>

        <!-- Question Palette Navigator -->
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color);">
          <span style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 8px;">
            QUESTION PALETTE:
          </span>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${activeTest.questions.map((ques, idx) => `
              <button class="btn btn-sm ${currentQuestionIndex === idx ? 'btn-primary' : userAnswers[ques.id] !== undefined ? 'btn-secondary' : 'btn-outline'}" 
                      data-navidx="${idx}" style="min-width: 36px;">
                ${idx + 1}${userAnswers[ques.id] !== undefined ? ' ✓' : ''}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Runner Footer Actions -->
      <div class="card-footer">
        <button class="btn btn-secondary" id="asmtPrevBtn" ${currentQuestionIndex === 0 ? 'disabled' : ''}>
          ← Previous
        </button>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" id="asmtNextBtn" ${currentQuestionIndex === total - 1 ? 'disabled' : ''}>
            Next →
          </button>
          <button class="btn btn-danger" id="asmtSubmitBtn">
            Submit Assessment
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach option selection click
  runner.querySelectorAll('.mcq-option').forEach(btn => {
    btn.onclick = () => {
      const choiceIdx = Number(btn.dataset.choice);
      userAnswers[q.id] = choiceIdx;
      renderActiveQuestion();
    };
  });

  // Attach Palette clicks
  runner.querySelectorAll('[data-navidx]').forEach(btn => {
    btn.onclick = () => {
      currentQuestionIndex = Number(btn.dataset.navidx);
      renderActiveQuestion();
    };
  });

  // Attach Prev & Next
  const prevBtn = document.getElementById('asmtPrevBtn');
  const nextBtn = document.getElementById('asmtNextBtn');
  const submitBtn = document.getElementById('asmtSubmitBtn');

  if (prevBtn) {
    prevBtn.onclick = () => {
      if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderActiveQuestion();
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      if (currentQuestionIndex < total - 1) {
        currentQuestionIndex++;
        renderActiveQuestion();
      }
    };
  }

  if (submitBtn) {
    submitBtn.onclick = () => {
      const unans = activeTest.questions.length - Object.keys(userAnswers).length;
      let msg = 'Are you sure you want to finish and submit this assessment?';
      if (unans > 0) {
        msg = `You still have ${unans} unanswered question(s). Are you sure you want to submit now?`;
      }
      if (window.confirm(msg)) {
        submitAssessment(false);
      }
    };
  }
}

/**
 * Handle Assessment Submission & Result Calculation
 */
function submitAssessment(isTimeout = false) {
  if (!activeTest || activeTest.isSubmitted) return;
  activeTest.isSubmitted = true;
  clearInterval(activeTimerInterval);

  const timeSpentSeconds = Math.round((Date.now() - testStartTime) / 1000);
  let correctCount = 0;

  activeTest.questions.forEach(q => {
    if (userAnswers[q.id] === q.correctIndex) {
      correctCount++;
    }
  });

  const total = activeTest.questions.length;
  const scorePct = safePercentage(correctCount, total, 1);
  const isPassed = scorePct >= activeTest.assessment.passingScore;

  // Record attempt
  const attemptRecord = {
    id: generateId('att'),
    assessmentId: activeTest.assessment.id,
    assessmentTitle: activeTest.assessment.title,
    candidateName: activeTest.candidateName,
    score: scorePct,
    totalQuestions: total,
    correctAnswers: correctCount,
    timeSpentSeconds,
    completed: true,
    completedAt: new Date().toISOString(),
    answers: { ...userAnswers }
  };

  attempts.unshift(attemptRecord);
  setItem(STORAGE_KEYS.ATTEMPTS, attempts);

  // Render Post-Test Review Screen
  renderResultReviewScreen(attemptRecord, isPassed, isTimeout);
  renderAttemptHistory();
  updateHistoryCountBadge();
}

/**
 * Render Post-Submission Results & Detailed Question Explanations
 */
function renderResultReviewScreen(attempt, isPassed, isTimeout) {
  const runner = document.getElementById('assessmentRunnerScreen');
  if (!runner || !activeTest) return;

  const mins = Math.floor(attempt.timeSpentSeconds / 60);
  const secs = attempt.timeSpentSeconds % 60;

  runner.innerHTML = `
    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header" style="background: ${isPassed ? 'var(--success-bg)' : 'var(--danger-bg)'};">
        <div>
          <span class="badge ${isPassed ? 'badge-success' : 'badge-danger'}">
            ${isPassed ? 'PASSED' : 'NOT PASSED'}
          </span>
          <h3 style="font-size: 18px; font-weight: 700; margin-top: 6px;">
            Assessment Results: ${attempt.assessmentTitle}
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary);">
            Candidate: <strong>${attempt.candidateName}</strong> | ${isTimeout ? 'Submission triggered by timeout.' : 'Submitted on time.'}
          </p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 32px; font-weight: 800; color: ${isPassed ? 'var(--success)' : 'var(--danger)'};">
            ${attempt.score}%
          </div>
          <span class="stat-meta">${attempt.correctAnswers} / ${attempt.totalQuestions} Correct</span>
        </div>
      </div>

      <div class="card-body">
        <div class="grid-3" style="margin-bottom: 20px;">
          <div class="stat-card">
            <div class="stat-label">Time Spent</div>
            <div class="stat-value" style="font-size: 20px;">${mins}m ${secs}s</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Passing Benchmark</div>
            <div class="stat-value" style="font-size: 20px;">${activeTest.assessment.passingScore}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Accuracy Rate</div>
            <div class="stat-value" style="font-size: 20px;">${attempt.score}%</div>
          </div>
        </div>

        <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 14px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Comprehensive Solution Review & Explanations
        </h4>

        ${activeTest.questions.map((q, idx) => {
          const userChoice = attempt.answers[q.id];
          const isCorrect = userChoice === q.correctIndex;
          const isAnswered = userChoice !== undefined;

          return `
            <div class="card" style="margin-bottom: 16px; border-left: 4px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'};">
              <div class="card-body" style="padding: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-weight: 700; font-size: 14px;">Question ${idx + 1}: ${q.title}</span>
                  <span class="badge ${isCorrect ? 'badge-success' : 'badge-danger'}">
                    ${isCorrect ? 'Correct (+1)' : isAnswered ? 'Incorrect (0)' : 'Unanswered (0)'}
                  </span>
                </div>
                <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 10px;">${q.statement}</p>

                <div style="margin-bottom: 10px;">
                  ${(q.options || []).map((opt, optIdx) => {
                    let optClass = 'mcq-option';
                    if (optIdx === q.correctIndex) optClass += ' correct-review';
                    else if (optIdx === userChoice) optClass += ' incorrect-review';
                    return `
                      <div class="${optClass}" style="cursor: default; padding: 8px 12px; margin-bottom: 6px; font-size: 13px;">
                        <strong>${String.fromCharCode(65 + optIdx)}.</strong> ${opt}
                        ${optIdx === q.correctIndex ? ' (Correct Answer)' : optIdx === userChoice ? ' (Your Answer)' : ''}
                      </div>
                    `;
                  }).join('')}
                </div>

                ${(q.mcqExplanation || q.explanation) ? `
                  <div style="background: var(--bg-subtle); padding: 10px; border-radius: var(--radius-sm); font-size: 13px; margin-top: 8px;">
                    <strong>Explanation:</strong> ${q.mcqExplanation || q.explanation}
                  </div>
                ` : ''}

                ${q.referenceSolution ? `
                  <div style="margin-top: 10px;">
                    <strong style="font-size: 12px; color: var(--text-muted);">Reference Code:</strong>
                    <pre class="code-block" style="padding: 8px 12px; margin-top: 4px;">${q.referenceSolution}</pre>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="card-footer">
        <button class="btn btn-secondary" id="exitReviewBtn">
          ← Return to Assessment Catalog
        </button>
        <button class="btn btn-primary" id="retakeAsmtBtn">
          Retake This Assessment
        </button>
      </div>
    </div>
  `;

  document.getElementById('exitReviewBtn').onclick = () => {
    runner.style.display = 'none';
    document.getElementById('asmt-sub-catalog').style.display = 'block';
    activeTest = null;
  };

  document.getElementById('retakeAsmtBtn').onclick = () => {
    promptAndStartAssessment(activeTest.assessment);
  };
}

/* ==========================================================================
   ATTEMPT HISTORY TAB
   ========================================================================== */

export function renderAttemptHistory() {
  const tbody = document.getElementById('attemptHistoryTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (attempts.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="7" class="empty-state">No assessment attempts recorded yet. Take an assessment from the catalog above.</td>';
    tbody.appendChild(tr);
    return;
  }

  attempts.forEach(att => {
    const tr = document.createElement('tr');

    const tdCand = document.createElement('td');
    tdCand.style.fontWeight = '600';
    tdCand.textContent = att.candidateName;

    const tdTitle = document.createElement('td');
    tdTitle.textContent = att.assessmentTitle;

    const tdScore = document.createElement('td');
    tdScore.style.fontWeight = '700';
    tdScore.textContent = `${att.score}%`;

    const tdCorrect = document.createElement('td');
    tdCorrect.textContent = `${att.correctAnswers} / ${att.totalQuestions}`;

    const tdStatus = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = att.completed ? (att.score >= 70 ? 'badge badge-success' : 'badge badge-warning') : 'badge badge-danger';
    badge.textContent = att.completed ? (att.score >= 70 ? 'Passed' : 'Needs Review') : 'Incomplete';
    tdStatus.appendChild(badge);

    const tdDate = document.createElement('td');
    tdDate.textContent = formatDate(att.completedAt);

    const tdAction = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-secondary btn-sm';
    delBtn.textContent = 'Remove';
    delBtn.onclick = () => {
      attempts = attempts.filter(a => a.id !== att.id);
      setItem(STORAGE_KEYS.ATTEMPTS, attempts);
      renderAttemptHistory();
      updateHistoryCountBadge();
      showToast('Attempt removed from audit log.', 'info');
    };
    tdAction.appendChild(delBtn);

    tr.appendChild(tdCand);
    tr.appendChild(tdTitle);
    tr.appendChild(tdScore);
    tr.appendChild(tdCorrect);
    tr.appendChild(tdStatus);
    tr.appendChild(tdDate);
    tr.appendChild(tdAction);

    tbody.appendChild(tr);
  });
}

function updateHistoryCountBadge() {
  const btn = document.getElementById('subtabBtnHistory');
  if (btn) btn.textContent = `Attempt History (${attempts.length})`;
}
