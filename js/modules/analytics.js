/**
 * Campus Utility Hub 2.0 - Module B: Assessment Analytics & Weekly MIS Dashboard
 * 
 * Computes derived metrics directly from stored LocalStorage application data:
 * - Total assessments & total attempts
 * - Completed vs. pending/incomplete attempts
 * - Average score & completion rate (completed / total * 100)
 * - Topic-wise performance distribution
 * - Date and assessment filtering
 * - RFC 4180 CSV export of results
 * - Printable Weekly MIS Report with executive summary metrics
 */

import { getItem, STORAGE_KEYS } from '../core/storage.js';
import { safePercentage, formatDate, toISODate, downloadCSV, escapeCSV, showToast } from '../core/utils.js';
import { VALID_TOPICS } from '../core/validation.js';

let assessments = [];
let attempts = [];

/**
 * Initialize Module B
 */
export function initAnalytics() {
  assessments = getItem(STORAGE_KEYS.ASSESSMENTS, []);
  attempts = getItem(STORAGE_KEYS.ATTEMPTS, []);

  renderAnalyticsDashboard();
}

/**
 * Render the full analytics view inside #analyticsMount
 */
export function renderAnalyticsDashboard() {
  const mount = document.getElementById('analyticsMount');
  if (!mount) return;

  // Re-read latest data
  assessments = getItem(STORAGE_KEYS.ASSESSMENTS, []);
  attempts = getItem(STORAGE_KEYS.ATTEMPTS, []);

  mount.innerHTML = `
    <!-- Top Action Bar -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
      <div>
        <h3 style="font-size: 18px; font-weight: 700;">Academic Assessment Analytics</h3>
        <p class="text-muted" style="font-size: 13px;">Derived metrics, topic proficiencies, and weekly institutional MIS reporting.</p>
      </div>

      <div style="display: flex; gap: 10px;">
        <button class="btn btn-secondary btn-sm" id="exportCsvBtn">
          📥 Export CSV Results
        </button>
        <button class="btn btn-primary btn-sm" id="printMisReportBtn">
          🖨 Printable Weekly MIS
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="card" style="margin-bottom: 24px;">
      <div class="card-body" style="padding: 14px 18px;">
        <div class="form-row">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="analyticsFilterAssessment">Filter by Assessment</label>
            <select class="form-select" id="analyticsFilterAssessment">
              <option value="All">All Assessments (${assessments.length})</option>
              ${assessments.map(a => `<option value="${a.id}">${a.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="analyticsStartDate">From Date</label>
            <input type="date" class="form-control" id="analyticsStartDate" />
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="analyticsEndDate">To Date</label>
            <input type="date" class="form-control" id="analyticsEndDate" />
          </div>
          <div class="form-group" style="margin-bottom: 0; align-self: flex-end;">
            <button class="btn btn-secondary" id="resetAnalyticsFiltersBtn" style="width: 100%;">
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Executive KPI Grid -->
    <div class="grid-4" id="analyticsKpiGrid" style="margin-bottom: 24px;"></div>

    <!-- Detailed Analytics Breakdown: Topic Performance & Recent Activity -->
    <div class="grid-2" style="margin-bottom: 24px;">
      
      <!-- Topic-wise Performance -->
      <div class="card">
        <div class="card-header">
          <div>
            <h4 class="card-title">Topic-Wise Performance</h4>
            <p class="card-subtitle">Aggregated accuracy and attempt volume per technical topic</p>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Attempts</th>
                  <th>Avg Score</th>
                  <th>Proficiency</th>
                </tr>
              </thead>
              <tbody id="topicPerformanceTableBody"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Recent Attempt Audit Log -->
      <div class="card">
        <div class="card-header">
          <div>
            <h4 class="card-title">Recent Assessment Submissions</h4>
            <p class="card-subtitle">Live attempt log with duration and score verification</p>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Assessment</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody id="recentActivityTableBody"></tbody>
            </table>
          </div>
        </div>
      </div>

    </div>

    <!-- Printable Weekly MIS Container (Visible on screen and optimized for @media print) -->
    <div id="weeklyMisReportSection" class="card" style="margin-top: 24px; border-top: 4px solid var(--primary);">
      <div class="card-header">
        <div>
          <span class="brand-badge">Official Academic Audit</span>
          <h3 class="card-title">Weekly Management Information System (MIS) Report</h3>
          <p class="card-subtitle" id="misReportPeriodText">Reporting Period: Weekly Academic Cycle</p>
        </div>
        <span class="badge badge-neutral">Campus Utility Hub 2.0</span>
      </div>
      <div class="card-body" id="misReportContent">
        <!-- Rendered dynamically -->
      </div>
      <div class="card-footer no-print">
        <span class="fictional-notice">Notice: Metrics compiled from stored demonstration sessions for academic evaluation.</span>
        <button class="btn btn-primary btn-sm" id="printMisDirectBtn">Print This MIS Report</button>
      </div>
    </div>
  `;

  // Attach Filter Listeners
  document.getElementById('analyticsFilterAssessment').onchange = updateAnalyticsViews;
  document.getElementById('analyticsStartDate').onchange = updateAnalyticsViews;
  document.getElementById('analyticsEndDate').onchange = updateAnalyticsViews;
  document.getElementById('resetAnalyticsFiltersBtn').onclick = () => {
    document.getElementById('analyticsFilterAssessment').value = 'All';
    document.getElementById('analyticsStartDate').value = '';
    document.getElementById('analyticsEndDate').value = '';
    updateAnalyticsViews();
  };

  // Attach Export & Print Listeners
  document.getElementById('exportCsvBtn').onclick = handleExportCsv;
  document.getElementById('printMisReportBtn').onclick = handlePrintMis;
  document.getElementById('printMisDirectBtn').onclick = handlePrintMis;

  updateAnalyticsViews();
}

/**
 * Filter attempts based on current UI filter controls
 */
function getFilteredAttempts() {
  const asmtId = document.getElementById('analyticsFilterAssessment')?.value || 'All';
  const startDateStr = document.getElementById('analyticsStartDate')?.value;
  const endDateStr = document.getElementById('analyticsEndDate')?.value;

  return attempts.filter(att => {
    // Assessment filter
    if (asmtId !== 'All' && att.assessmentId !== asmtId) return false;

    // Date range filter
    if (startDateStr && att.completedAt) {
      const attDate = new Date(att.completedAt).toISOString().split('T')[0];
      if (attDate < startDateStr) return false;
    }
    if (endDateStr && att.completedAt) {
      const attDate = new Date(att.completedAt).toISOString().split('T')[0];
      if (attDate > endDateStr) return false;
    }

    return true;
  });
}

/**
 * Calculate pure metrics from an array of attempts
 * @param {Array} attemptList 
 * @param {Array} asmtList 
 */
export function calculateMetrics(attemptList, asmtList) {
  const totalAssessments = asmtList.length;
  const totalAttempts = attemptList.length;
  const completedAttempts = attemptList.filter(a => a.completed).length;
  const pendingAttempts = totalAttempts - completedAttempts;

  // Completion Rate = (completed / total attempts) * 100
  const completionRate = safePercentage(completedAttempts, totalAttempts, 1);

  // Average Score = sum of scores of completed attempts / completed attempts
  let sumScore = 0;
  let passedCount = 0;
  attemptList.forEach(a => {
    if (a.completed) {
      sumScore += (Number(a.score) || 0);
      if (a.score >= 70) passedCount++;
    }
  });

  const averageScore = completedAttempts > 0 ? Number((sumScore / completedAttempts).toFixed(1)) : 0;
  const passRate = safePercentage(passedCount, completedAttempts, 1);

  return {
    totalAssessments,
    totalAttempts,
    completedAttempts,
    pendingAttempts,
    completionRate,
    averageScore,
    passedCount,
    passRate
  };
}

/**
 * Update all visual analytics widgets based on filtered attempts
 */
function updateAnalyticsViews() {
  const filtered = getFilteredAttempts();
  const metrics = calculateMetrics(filtered, assessments);

  renderKpiCards(metrics);
  renderTopicTable(filtered);
  renderRecentActivityTable(filtered);
  renderWeeklyMisContent(metrics, filtered);
}

/**
 * Render Executive KPI Stat Cards
 */
function renderKpiCards(metrics) {
  const container = document.getElementById('analyticsKpiGrid');
  if (!container) return;

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total Attempts</div>
      <div class="stat-value">${metrics.totalAttempts}</div>
      <div class="stat-meta">${metrics.completedAttempts} completed, ${metrics.pendingAttempts} pending</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Completion Rate</div>
      <div class="stat-value" style="color: ${metrics.completionRate >= 75 ? 'var(--success)' : 'var(--warning)'};">
        ${metrics.completionRate}%
      </div>
      <div class="stat-meta">Completed / Total attempts</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Average Score</div>
      <div class="stat-value" style="color: ${metrics.averageScore >= 70 ? 'var(--success)' : 'var(--warning)'};">
        ${metrics.averageScore}%
      </div>
      <div class="stat-meta">Across completed submissions</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Passing Rate (>=70%)</div>
      <div class="stat-value" style="color: ${metrics.passRate >= 70 ? 'var(--success)' : 'var(--warning)'};">
        ${metrics.passRate}%
      </div>
      <div class="stat-meta">${metrics.passedCount} candidates passed benchmark</div>
    </div>
  `;
}

/**
 * Render Topic-Wise Performance Breakdown Table
 */
function renderTopicTable(filteredAttempts) {
  const tbody = document.getElementById('topicPerformanceTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  VALID_TOPICS.forEach(topic => {
    // Find assessments belonging to this topic
    const topicAsmtIds = assessments.filter(a => a.topic === topic).map(a => a.id);
    const topicAttempts = filteredAttempts.filter(a => topicAsmtIds.includes(a.assessmentId) && a.completed);

    const attemptsCount = topicAttempts.length;
    let avg = 0;
    if (attemptsCount > 0) {
      const sum = topicAttempts.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
      avg = Number((sum / attemptsCount).toFixed(1));
    }

    const tr = document.createElement('tr');

    const tdTopic = document.createElement('td');
    tdTopic.style.fontWeight = '600';
    tdTopic.textContent = topic;

    const tdCount = document.createElement('td');
    tdCount.textContent = String(attemptsCount);

    const tdAvg = document.createElement('td');
    tdAvg.textContent = attemptsCount > 0 ? `${avg}%` : 'N/A';

    const tdProficiency = document.createElement('td');
    const badge = document.createElement('span');
    if (attemptsCount === 0) {
      badge.className = 'badge badge-neutral';
      badge.textContent = 'No Data';
    } else if (avg >= 75) {
      badge.className = 'badge badge-success';
      badge.textContent = 'Proficient';
    } else if (avg >= 60) {
      badge.className = 'badge badge-warning';
      badge.textContent = 'Moderate';
    } else {
      badge.className = 'badge badge-danger';
      badge.textContent = 'Needs Review';
    }
    tdProficiency.appendChild(badge);

    tr.appendChild(tdTopic);
    tr.appendChild(tdCount);
    tr.appendChild(tdAvg);
    tr.appendChild(tdProficiency);

    tbody.appendChild(tr);
  });
}

/**
 * Render Recent Activity Table
 */
function renderRecentActivityTable(filteredAttempts) {
  const tbody = document.getElementById('recentActivityTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (filteredAttempts.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="5" class="empty-state">No attempts found for the selected filter.</td>';
    tbody.appendChild(tr);
    return;
  }

  filteredAttempts.slice(0, 6).forEach(att => {
    const tr = document.createElement('tr');

    const tdCand = document.createElement('td');
    tdCand.style.fontWeight = '600';
    tdCand.textContent = att.candidateName;

    const tdTitle = document.createElement('td');
    tdTitle.textContent = att.assessmentTitle;

    const tdScore = document.createElement('td');
    tdScore.textContent = `${att.score}%`;

    const tdStatus = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = att.completed ? 'badge badge-success' : 'badge badge-danger';
    badge.textContent = att.completed ? 'Completed' : 'Abandoned';
    tdStatus.appendChild(badge);

    const tdDate = document.createElement('td');
    tdDate.textContent = formatDate(att.completedAt);

    tr.appendChild(tdCand);
    tr.appendChild(tdTitle);
    tr.appendChild(tdScore);
    tr.appendChild(tdStatus);
    tr.appendChild(tdDate);

    tbody.appendChild(tr);
  });
}

/**
 * Render Content for the Printable Weekly MIS Section
 */
function renderWeeklyMisContent(metrics, filteredAttempts) {
  const content = document.getElementById('misReportContent');
  const periodText = document.getElementById('misReportPeriodText');
  if (!content) return;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (periodText) {
    periodText.textContent = `Cycle: ${formatDate(weekAgo)} to ${formatDate(now)}`;
  }

  content.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 6px;">1. Executive Summary & Quality Indicators</h4>
      <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
        During the current evaluation cycle, <strong>${metrics.totalAttempts} total candidate attempts</strong> were registered across 
        <strong>${metrics.totalAssessments} active assessment modules</strong>. An overall completion rate of 
        <strong>${metrics.completionRate}%</strong> was achieved with an average score of <strong>${metrics.averageScore}%</strong>. 
        A total of <strong>${metrics.passedCount} candidates</strong> exceeded the university technical threshold (>=70%).
      </p>
    </div>

    <div style="margin-bottom: 20px;">
      <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 6px;">2. Core Assessment Metrics</h4>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Evaluation Indicator</th>
              <th>Calculated Value</th>
              <th>Benchmark Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Registered Attempts</td>
              <td><strong>${metrics.totalAttempts}</strong></td>
              <td><span class="badge badge-info">Operational Volume</span></td>
            </tr>
            <tr>
              <td>Attempt Completion Rate</td>
              <td><strong>${metrics.completionRate}%</strong></td>
              <td><span class="badge ${metrics.completionRate >= 75 ? 'badge-success' : 'badge-warning'}">${metrics.completionRate >= 75 ? 'Optimal (>=75%)' : 'Requires Monitoring'}</span></td>
            </tr>
            <tr>
              <td>Cohort Average Score</td>
              <td><strong>${metrics.averageScore}%</strong></td>
              <td><span class="badge ${metrics.averageScore >= 70 ? 'badge-success' : 'badge-warning'}">${metrics.averageScore >= 70 ? 'Proficient (>=70%)' : 'Needs Reinforcement'}</span></td>
            </tr>
            <tr>
              <td>Qualified Candidate Ratio</td>
              <td><strong>${metrics.passRate}%</strong> (${metrics.passedCount} candidates)</td>
              <td><span class="badge ${metrics.passRate >= 70 ? 'badge-success' : 'badge-warning'}">Benchmark Standard</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div style="margin-top: 30px; display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 20px; font-size: 13px;">
      <div>
        <strong>Prepared By:</strong><br />
        Campus Utility Hub Operations Team
      </div>
      <div>
        <strong>Reviewed & Approved:</strong><br />
        Technical Lead / CodeChef Chapter Coordinator
      </div>
      <div>
        <strong>Verification Date:</strong><br />
        ${formatDate(now)}
      </div>
    </div>
  `;
}

/**
 * RFC 4180 Compliant CSV Export
 */
function handleExportCsv() {
  const filtered = getFilteredAttempts();
  if (filtered.length === 0) {
    showToast('No assessment records available to export.', 'warning');
    return;
  }

  const headers = [
    'Attempt ID',
    'Candidate Name',
    'Assessment Title',
    'Score (%)',
    'Correct Answers',
    'Total Questions',
    'Time Spent (seconds)',
    'Completion Status',
    'Timestamp ISO'
  ];

  const rows = filtered.map(a => [
    escapeCSV(a.id),
    escapeCSV(a.candidateName),
    escapeCSV(a.assessmentTitle),
    escapeCSV(a.score),
    escapeCSV(a.correctAnswers),
    escapeCSV(a.totalQuestions),
    escapeCSV(a.timeSpentSeconds),
    escapeCSV(a.completed ? 'Completed' : 'Incomplete'),
    escapeCSV(a.completedAt || '')
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const filename = `assessment_mis_report_${toISODate()}.csv`;

  downloadCSV(filename, csvContent);
  showToast(`Exported ${filtered.length} attempts to ${filename}.`, 'success');
}

/**
 * Handle Printable Report Trigger
 */
function handlePrintMis() {
  window.print();
}
