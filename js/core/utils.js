/**
 * Campus Utility Hub 2.0 - Core Utilities
 * Pure helper functions for formatting, math safety, CSV operations, and UI feedback.
 */

/**
 * Format a date string or timestamp to human-readable format (e.g. "28 Oct 2026")
 * @param {string|number|Date} dateInput 
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return 'N/A';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format date to YYYY-MM-DD for HTML input[type="date"]
 * @param {string|number|Date} [dateInput=new Date()]
 * @returns {string}
 */
export function toISODate(dateInput = new Date()) {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * Safe percentage calculation with zero-division safeguard.
 * @param {number} numerator 
 * @param {number} denominator 
 * @param {number} [decimals=1]
 * @returns {number}
 */
export function safePercentage(numerator, denominator, decimals = 1) {
  const num = Number(numerator) || 0;
  const den = Number(denominator) || 0;
  if (den <= 0) return 0;
  const val = (num / den) * 100;
  return Number(val.toFixed(decimals));
}

/**
 * Currency formatter for student expenses
 * @param {number} amount 
 * @returns {string}
 */
export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return `₹${num.toFixed(2)}`;
}

/**
 * Generate a collision-resistant unique ID
 * @param {string} [prefix='id'] 
 * @returns {string}
 */
export function generateId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString(36)}`;
}

/**
 * Escape HTML special characters to prevent XSS injection
 * @param {string} str 
 * @returns {string}
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * RFC 4180 compliant CSV cell escaping.
 * Handles commas, double-quotes, and newlines safely.
 * @param {any} value 
 * @returns {string}
 */
export function escapeCSV(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  // If string contains comma, quote, or newline, wrap in quotes and escape quotes with ""
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Trigger client-side CSV file download
 * @param {string} filename 
 * @param {string} csvContent 
 */
export function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Check if an item with a due date is overdue relative to today (midnight)
 * @param {string} dueDateStr - YYYY-MM-DD
 * @param {string} [status='Open']
 * @returns {boolean}
 */
export function isOverdue(dueDateStr, status = 'Open') {
  if (!dueDateStr || status === 'Resolved') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  return due.getTime() < today.getTime();
}

/**
 * Display non-intrusive toast alert message
 * @param {string} message 
 * @param {'info'|'success'|'warning'|'error'} [type='info'] 
 * @param {number} [duration=3000]
 */
export function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-visible');
  });

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Simple debounce function
 * @param {Function} fn 
 * @param {number} delay 
 * @returns {Function}
 */
export function debounce(fn, delay = 250) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
