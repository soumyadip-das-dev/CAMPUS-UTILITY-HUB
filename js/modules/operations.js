/**
 * Campus Utility Hub 2.0 - Module C: Academic Operations & Support Tracker
 * 
 * Lightweight workflow management for college technical teams & campus leads:
 * - Issue ticketing (Create, View, Edit, Close/Resolve, Delete)
 * - Categories: Lab Infrastructure, Assessment Platform, Grading, Student Query, Administrative
 * - Statuses: Open, In Progress, Resolved
 * - Dynamic Overdue & High-Priority detection
 * - Real-time operational summary metrics
 * - Assessment schedules and academic deadline tracking
 * - College review meeting briefing summary
 */

import { getItem, setItem, STORAGE_KEYS } from '../core/storage.js';
import { formatDate, toISODate, isOverdue, generateId, showToast } from '../core/utils.js';
import {
  validateIssue,
  VALID_PRIORITIES,
  VALID_STATUSES,
  VALID_ISSUE_CATEGORIES
} from '../core/validation.js';
import { DEMO_ISSUES, DEMO_SCHEDULES } from '../data/demo-data.js';

let issues = [];
let schedules = [];

/**
 * Initialize Module C
 */
export function initOperations() {
  issues = getItem(STORAGE_KEYS.ISSUES, DEMO_ISSUES);
  schedules = getItem(STORAGE_KEYS.SCHEDULES, DEMO_SCHEDULES);

  renderOperationsLayout();
  updateOperationsViews();
}

/**
 * Render the main layout inside #operationsMount
 */
function renderOperationsLayout() {
  const mount = document.getElementById('operationsMount');
  if (!mount) return;

  mount.innerHTML = `
    <!-- Top Operations Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
      <div>
        <h3 style="font-size: 18px; font-weight: 700;">Academic Operations & Support Desk</h3>
        <p class="text-muted" style="font-size: 13px;">Manage operational issues, overdue tracking, assessment schedules, and faculty review summaries.</p>
      </div>

      <div style="display: flex; gap: 10px;">
        <button class="btn btn-secondary btn-sm" id="openNewScheduleModalBtn">
          📅 Add Schedule Item
        </button>
        <button class="btn btn-primary btn-sm" id="openNewIssueModalBtn">
          + New Support Ticket
        </button>
      </div>
    </div>

    <!-- Operational KPI Cards -->
    <div class="grid-4" id="operationsKpiGrid" style="margin-bottom: 24px;"></div>

    <!-- Main Operations Grid: Tickets Table & Schedules -->
    <div class="grid-1" style="margin-bottom: 24px;">

      <!-- Support Tickets Management -->
      <div class="card">
        <div class="card-header">
          <div>
            <h4 class="card-title">Technical Support & Issue Tracker</h4>
            <p class="card-subtitle">Operational queue for lab infrastructure, assessment bugs, and student queries</p>
          </div>
        </div>

        <div class="card-body">
          <!-- Filters -->
          <div class="form-row" style="margin-bottom: 16px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="filterIssueStatus">Filter Status</label>
              <select class="form-select" id="filterIssueStatus">
                <option value="All">All Statuses</option>
                ${VALID_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="filterIssuePriority">Filter Priority</label>
              <select class="form-select" id="filterIssuePriority">
                <option value="All">All Priorities</option>
                ${VALID_PRIORITIES.map(p => `<option value="${p}">${p}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0; flex: 1.5;">
              <label class="form-label" for="filterIssueSearch">Search Issues</label>
              <input type="text" class="form-control" id="filterIssueSearch" placeholder="Search by title, owner, or category..." />
            </div>
          </div>

          <!-- Issues Table -->
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Owner</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="issuesTableBody"></tbody>
            </table>
          </div>
        </div>
      </div>

    </div>

    <!-- Assessment Schedules & College Review Meeting Briefing -->
    <div class="grid-2" style="margin-bottom: 24px;">

      <!-- Assessment Schedules Calendar / Timeline -->
      <div class="card">
        <div class="card-header">
          <div>
            <h4 class="card-title">Assessment Deadlines & Schedules</h4>
            <p class="card-subtitle">Timelines for midterm exams, chapter contests, and lab sessions</p>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date & Time</th>
                  <th>Venue</th>
                  <th>Target Batch</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="schedulesTableBody"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- College Review Meeting Digest -->
      <div class="card" style="border-top: 4px solid var(--primary);">
        <div class="card-header">
          <div>
            <span class="brand-badge">Administrative Briefing</span>
            <h4 class="card-title">College Review Meeting Digest</h4>
            <p class="card-subtitle">Concise operational summary for department HODs and lead mentors</p>
          </div>
        </div>
        <div class="card-body" id="reviewMeetingDigestBody">
          <!-- Populated dynamically -->
        </div>
      </div>

    </div>

    <!-- Dynamic Modal for Issues & Schedules -->
    <div id="opsModalBackdrop" class="modal-backdrop" style="display: none;">
      <div class="modal-dialog" id="opsModalDialog"></div>
    </div>
  `;

  // Attach Header Button Listeners
  document.getElementById('openNewIssueModalBtn').onclick = () => openIssueModal();
  document.getElementById('openNewScheduleModalBtn').onclick = () => openScheduleModal();

  // Attach Filter Listeners
  document.getElementById('filterIssueStatus').onchange = updateOperationsViews;
  document.getElementById('filterIssuePriority').onchange = updateOperationsViews;
  document.getElementById('filterIssueSearch').oninput = updateOperationsViews;
}

/**
 * Update all operational views
 */
function updateOperationsViews() {
  renderOperationsKpis();
  renderIssuesTable();
  renderSchedulesTable();
  renderReviewDigest();
}

/**
 * Calculate Summary KPI Counts
 */
export function calculateOperationalStats(issueList) {
  const total = issueList.length;
  const openCount = issueList.filter(i => i.status === 'Open').length;
  const inProgressCount = issueList.filter(i => i.status === 'In Progress').length;
  const resolvedCount = issueList.filter(i => i.status === 'Resolved').length;
  const overdueCount = issueList.filter(i => isOverdue(i.dueDate, i.status)).length;
  const highPriorityCount = issueList.filter(i => (i.priority === 'High' || i.priority === 'Urgent') && i.status !== 'Resolved').length;

  return {
    total,
    openCount,
    inProgressCount,
    resolvedCount,
    overdueCount,
    highPriorityCount
  };
}

/**
 * Render Operational KPI Cards
 */
function renderOperationsKpis() {
  const container = document.getElementById('operationsKpiGrid');
  if (!container) return;

  const stats = calculateOperationalStats(issues);

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Active Support Queue</div>
      <div class="stat-value">${stats.openCount + stats.inProgressCount}</div>
      <div class="stat-meta">${stats.openCount} open, ${stats.inProgressCount} in progress</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Overdue Tasks</div>
      <div class="stat-value" style="color: ${stats.overdueCount > 0 ? 'var(--danger)' : 'var(--success)'};">
        ${stats.overdueCount}
      </div>
      <div class="stat-meta">${stats.overdueCount > 0 ? 'Exceeded deadline!' : 'All items on schedule'}</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Urgent / High Priority</div>
      <div class="stat-value" style="color: ${stats.highPriorityCount > 0 ? 'var(--warning)' : 'var(--text-main)'};">
        ${stats.highPriorityCount}
      </div>
      <div class="stat-meta">Pending rapid resolution</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Resolved Issues</div>
      <div class="stat-value" style="color: var(--success);">${stats.resolvedCount}</div>
      <div class="stat-meta">Successfully closed</div>
    </div>
  `;
}

/**
 * Render Issues Table with Overdue and High Priority Highlights
 */
function renderIssuesTable() {
  const tbody = document.getElementById('issuesTableBody');
  if (!tbody) return;

  const statusFilter = document.getElementById('filterIssueStatus')?.value || 'All';
  const priorityFilter = document.getElementById('filterIssuePriority')?.value || 'All';
  const search = (document.getElementById('filterIssueSearch')?.value || '').toLowerCase().trim();

  const filtered = issues.filter(issue => {
    const matchStatus = statusFilter === 'All' || issue.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || issue.priority === priorityFilter;
    const matchSearch = !search ||
      issue.title.toLowerCase().includes(search) ||
      issue.assignedOwner.toLowerCase().includes(search) ||
      issue.category.toLowerCase().includes(search);
    return matchStatus && matchPriority && matchSearch;
  });

  tbody.innerHTML = '';
  if (filtered.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="7" class="empty-state">No support tickets match the selected criteria.</td>';
    tbody.appendChild(tr);
    return;
  }

  filtered.forEach(issue => {
    const overdue = isOverdue(issue.dueDate, issue.status);
    const tr = document.createElement('tr');
    if (overdue) {
      tr.style.backgroundColor = 'var(--danger-bg)';
    }

    const tdTitle = document.createElement('td');
    tdTitle.innerHTML = `
      <div style="font-weight: 600;">${issue.title}</div>
      <div class="text-muted" style="font-size: 12px;">${issue.description || ''}</div>
    `;

    const tdCategory = document.createElement('td');
    tdCategory.textContent = issue.category;

    const tdPriority = document.createElement('td');
    const prioBadge = document.createElement('span');
    if (issue.priority === 'Urgent') prioBadge.className = 'badge badge-danger';
    else if (issue.priority === 'High') prioBadge.className = 'badge badge-warning';
    else if (issue.priority === 'Medium') prioBadge.className = 'badge badge-info';
    else prioBadge.className = 'badge badge-neutral';
    prioBadge.textContent = issue.priority;
    tdPriority.appendChild(prioBadge);

    const tdStatus = document.createElement('td');
    const statusBadge = document.createElement('span');
    if (issue.status === 'Resolved') statusBadge.className = 'badge badge-success';
    else if (issue.status === 'In Progress') statusBadge.className = 'badge badge-info';
    else statusBadge.className = 'badge badge-warning';
    statusBadge.textContent = issue.status;
    tdStatus.appendChild(statusBadge);

    const tdOwner = document.createElement('td');
    tdOwner.textContent = issue.assignedOwner;

    const tdDue = document.createElement('td');
    if (overdue) {
      tdDue.innerHTML = `<span style="color: var(--danger); font-weight: 700;">⚠ ${formatDate(issue.dueDate)} (OVERDUE)</span>`;
    } else {
      tdDue.textContent = formatDate(issue.dueDate);
    }

    const tdActions = document.createElement('td');
    tdActions.style.whiteSpace = 'nowrap';

    if (issue.status !== 'Resolved') {
      const resolveBtn = document.createElement('button');
      resolveBtn.className = 'btn btn-secondary btn-sm';
      resolveBtn.textContent = '✓ Resolve';
      resolveBtn.style.marginRight = '4px';
      resolveBtn.onclick = () => quickResolveIssue(issue.id);
      tdActions.appendChild(resolveBtn);
    }

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary btn-sm';
    editBtn.textContent = 'Edit';
    editBtn.style.marginRight = '4px';
    editBtn.onclick = () => openIssueModal(issue.id);
    tdActions.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger btn-sm';
    delBtn.textContent = '✕';
    delBtn.title = 'Delete ticket';
    delBtn.onclick = () => deleteIssue(issue.id);
    tdActions.appendChild(delBtn);

    tr.appendChild(tdTitle);
    tr.appendChild(tdCategory);
    tr.appendChild(tdPriority);
    tr.appendChild(tdStatus);
    tr.appendChild(tdOwner);
    tr.appendChild(tdDue);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });
}

function quickResolveIssue(id) {
  const issue = issues.find(i => i.id === id);
  if (!issue) return;
  issue.status = 'Resolved';
  setItem(STORAGE_KEYS.ISSUES, issues);
  updateOperationsViews();
  showToast(`Ticket "${issue.title}" marked as Resolved.`, 'success');
}

function deleteIssue(id) {
  if (!window.confirm('Delete this support ticket permanently?')) return;
  issues = issues.filter(i => i.id !== id);
  setItem(STORAGE_KEYS.ISSUES, issues);
  updateOperationsViews();
  showToast('Ticket deleted.', 'info');
}

/**
 * Open Modal to Add or Edit Support Ticket
 */
function openIssueModal(editId = null) {
  const modal = document.getElementById('opsModalBackdrop');
  const dialog = document.getElementById('opsModalDialog');
  if (!modal || !dialog) return;

  const existing = editId ? issues.find(i => i.id === editId) : null;
  const isEdit = Boolean(existing);

  dialog.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">${isEdit ? 'Edit Support Ticket' : 'Create Operational Support Ticket'}</h3>
      <button class="btn btn-secondary btn-sm" id="closeOpsModalBtn">✕</button>
    </div>
    <div class="modal-body">
      <form id="issueForm">
        <div class="form-group">
          <label class="form-label" for="isfTitle">Ticket Title *</label>
          <input type="text" class="form-control" id="isfTitle" required value="${existing?.title || ''}" placeholder="e.g. Lab 4 Router Packet Loss" />
        </div>

        <div class="form-group">
          <label class="form-label" for="isfDescription">Issue Description</label>
          <textarea class="form-control" id="isfDescription" rows="3" placeholder="Provide operational context or error symptoms...">${existing?.description || ''}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="isfCategory">Category *</label>
            <select class="form-select" id="isfCategory">
              ${VALID_ISSUE_CATEGORIES.map(c => `<option value="${c}" ${existing?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="isfPriority">Priority *</label>
            <select class="form-select" id="isfPriority">
              ${VALID_PRIORITIES.map(p => `<option value="${p}" ${existing?.priority === p ? 'selected' : p === 'Medium' ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="isfStatus">Status *</label>
            <select class="form-select" id="isfStatus">
              ${VALID_STATUSES.map(s => `<option value="${s}" ${existing?.status === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="isfOwner">Assigned Owner *</label>
            <input type="text" class="form-control" id="isfOwner" value="${existing?.assignedOwner || ''}" placeholder="e.g. Lead Engineer Das" />
          </div>
          <div class="form-group">
            <label class="form-label" for="isfDueDate">Due Date *</label>
            <input type="date" class="form-control" id="isfDueDate" value="${existing?.dueDate || toISODate(new Date(Date.now() + 3 * 86400000))}" />
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" id="cancelOpsModalBtn">Cancel</button>
      <button class="btn btn-primary" id="saveIssueBtn">${isEdit ? 'Save Changes' : 'Create Ticket'}</button>
    </div>
  `;

  modal.style.display = 'flex';
  const close = () => { modal.style.display = 'none'; };
  document.getElementById('closeOpsModalBtn').onclick = close;
  document.getElementById('cancelOpsModalBtn').onclick = close;

  document.getElementById('saveIssueBtn').onclick = () => {
    const title = document.getElementById('isfTitle').value.trim();
    const description = document.getElementById('isfDescription').value.trim();
    const category = document.getElementById('isfCategory').value;
    const priority = document.getElementById('isfPriority').value;
    const status = document.getElementById('isfStatus').value;
    const assignedOwner = document.getElementById('isfOwner').value.trim();
    const dueDate = document.getElementById('isfDueDate').value;

    const issueObj = {
      id: existing ? existing.id : generateId('iss'),
      title,
      description,
      category,
      priority,
      status,
      assignedOwner,
      createdDate: existing ? existing.createdDate : toISODate(),
      dueDate
    };

    const validation = validateIssue(issueObj);
    if (!validation.valid) {
      showToast(validation.errors[0], 'error');
      return;
    }

    if (isEdit) {
      const idx = issues.findIndex(i => i.id === existing.id);
      issues[idx] = issueObj;
      showToast('Support ticket updated.', 'success');
    } else {
      issues.unshift(issueObj);
      showToast('New ticket logged.', 'success');
    }

    setItem(STORAGE_KEYS.ISSUES, issues);
    close();
    updateOperationsViews();
  };
}

/* ==========================================================================
   SCHEDULES & REVIEW MEETING DIGEST
   ========================================================================== */

function renderSchedulesTable() {
  const tbody = document.getElementById('schedulesTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (schedules.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="5" class="empty-state">No scheduled events or deadlines found.</td>';
    tbody.appendChild(tr);
    return;
  }

  schedules.forEach(item => {
    const tr = document.createElement('tr');

    const tdTitle = document.createElement('td');
    tdTitle.innerHTML = `<strong>${item.title}</strong>`;

    const tdDate = document.createElement('td');
    tdDate.textContent = `${formatDate(item.date)} at ${item.time}`;

    const tdVenue = document.createElement('td');
    tdVenue.textContent = item.venue;

    const tdBatch = document.createElement('td');
    tdBatch.textContent = item.targetBatch;

    const tdAction = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-secondary btn-sm';
    delBtn.textContent = 'Remove';
    delBtn.onclick = () => {
      schedules = schedules.filter(s => s.id !== item.id);
      setItem(STORAGE_KEYS.SCHEDULES, schedules);
      renderSchedulesTable();
      renderReviewDigest();
      showToast('Schedule event removed.', 'info');
    };
    tdAction.appendChild(delBtn);

    tr.appendChild(tdTitle);
    tr.appendChild(tdDate);
    tr.appendChild(tdVenue);
    tr.appendChild(tdBatch);
    tr.appendChild(tdAction);

    tbody.appendChild(tr);
  });
}

function openScheduleModal() {
  const modal = document.getElementById('opsModalBackdrop');
  const dialog = document.getElementById('opsModalDialog');
  if (!modal || !dialog) return;

  dialog.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">Schedule Academic Event or Assessment</h3>
      <button class="btn btn-secondary btn-sm" id="closeSchModalBtn">✕</button>
    </div>
    <div class="modal-body">
      <form id="schForm">
        <div class="form-group">
          <label class="form-label" for="schTitle">Event / Assessment Title *</label>
          <input type="text" class="form-control" id="schTitle" required placeholder="e.g. Midterm Coding Assessment" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="schDate">Date *</label>
            <input type="date" class="form-control" id="schDate" value="${toISODate()}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="schTime">Time *</label>
            <input type="text" class="form-control" id="schTime" placeholder="e.g. 10:00 AM" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="schVenue">Venue / Lab *</label>
            <input type="text" class="form-control" id="schVenue" placeholder="e.g. Lab 3 & Online Mirror" />
          </div>
          <div class="form-group">
            <label class="form-label" for="schBatch">Target Cohort / Batch *</label>
            <input type="text" class="form-control" id="schBatch" placeholder="e.g. CS 3rd Semester" />
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" id="cancelSchModalBtn">Cancel</button>
      <button class="btn btn-primary" id="saveSchBtn">Schedule Event</button>
    </div>
  `;

  modal.style.display = 'flex';
  const close = () => { modal.style.display = 'none'; };
  document.getElementById('closeSchModalBtn').onclick = close;
  document.getElementById('cancelSchModalBtn').onclick = close;

  document.getElementById('saveSchBtn').onclick = () => {
    const title = document.getElementById('schTitle').value.trim();
    const date = document.getElementById('schDate').value;
    const time = document.getElementById('schTime').value.trim();
    const venue = document.getElementById('schVenue').value.trim();
    const targetBatch = document.getElementById('schBatch').value.trim();

    if (!title || !date || !time || !venue || !targetBatch) {
      showToast('All schedule fields are required.', 'error');
      return;
    }

    const newSchedule = {
      id: generateId('sch'),
      title,
      date,
      time,
      venue,
      targetBatch,
      status: 'Scheduled'
    };

    schedules.push(newSchedule);
    setItem(STORAGE_KEYS.SCHEDULES, schedules);
    close();
    renderSchedulesTable();
    renderReviewDigest();
    showToast('Event scheduled successfully.', 'success');
  };
}

/**
 * Render Executive Review Meeting Digest
 */
function renderReviewDigest() {
  const container = document.getElementById('reviewMeetingDigestBody');
  if (!container) return;

  const stats = calculateOperationalStats(issues);
  const overdueTickets = issues.filter(i => isOverdue(i.dueDate, i.status));
  const urgentTickets = issues.filter(i => (i.priority === 'High' || i.priority === 'Urgent') && i.status !== 'Resolved');

  container.innerHTML = `
    <div style="font-size: 13px; line-height: 1.6;">
      <p style="margin-bottom: 12px;">
        <strong>Operational Status:</strong> There are currently <strong>${stats.openCount + stats.inProgressCount} active issues</strong> across computing labs and assessment infrastructure.
      </p>

      ${overdueTickets.length > 0 ? `
        <div style="background: var(--danger-bg); border-left: 4px solid var(--danger); padding: 10px; border-radius: var(--radius-sm); margin-bottom: 12px;">
          <strong style="color: var(--danger);">Action Required (Overdue Items):</strong>
          <ul style="margin-left: 18px; margin-top: 4px;">
            ${overdueTickets.map(t => `<li><strong>${t.title}</strong> (Owner: ${t.assignedOwner}) due on ${formatDate(t.dueDate)}</li>`).join('')}
          </ul>
        </div>
      ` : `
        <div style="background: var(--success-bg); border-left: 4px solid var(--success); padding: 8px 12px; border-radius: var(--radius-sm); margin-bottom: 12px; color: var(--success);">
          ✓ No tickets are currently overdue.
        </div>
      `}

      <div style="margin-bottom: 12px;">
        <strong>Upcoming Key Deadlines (${schedules.length}):</strong>
        <ul style="margin-left: 18px; margin-top: 4px;">
          ${schedules.slice(0, 3).map(s => `<li>${s.title} — <strong>${formatDate(s.date)}</strong> (${s.venue})</li>`).join('')}
        </ul>
      </div>

      <p class="text-muted" style="font-size: 12px;">
        Digest prepared for weekly technical coordinator alignment and faculty review.
      </p>
    </div>
  `;
}
