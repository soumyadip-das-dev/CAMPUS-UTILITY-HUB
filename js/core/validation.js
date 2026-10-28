/**
 * Campus Utility Hub 2.0 - Core Validation Module
 * Reusable input validation rules with descriptive feedback.
 */

export const VALID_GRADES = ['O', 'A+', 'A', 'B+', 'B', 'C', 'F'];

export const VALID_TOPICS = [
  'Arrays',
  'Strings',
  'Sorting',
  'Searching',
  'Basic Data Structures',
  'General Programming'
];

export const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const VALID_STATUSES = ['Open', 'In Progress', 'Resolved'];

export const VALID_ISSUE_CATEGORIES = [
  'Assessment Platform',
  'Lab Infrastructure',
  'Grading & Evaluation',
  'Student Query',
  'Administrative'
];

/**
 * Validate that a field is non-empty after trimming
 * @param {string} value 
 * @param {string} fieldName 
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateRequired(value, fieldName = 'Field') {
  if (value === null || value === undefined || String(value).trim() === '') {
    return { valid: false, error: `${fieldName} is required and cannot be empty.` };
  }
  return { valid: true };
}

/**
 * Validate a numeric field within optional min and max bounds
 * @param {any} value 
 * @param {string} fieldName 
 * @param {{ min?: number, max?: number, integerOnly?: boolean }} [options={}]
 * @returns {{ valid: boolean, error?: string, parsedValue?: number }}
 */
export function validateNumber(value, fieldName = 'Number', options = {}) {
  const { min = -Infinity, max = Infinity, integerOnly = false } = options;
  if (value === '' || value === null || value === undefined) {
    return { valid: false, error: `${fieldName} is required.` };
  }
  const parsed = Number(value);
  if (isNaN(parsed)) {
    return { valid: false, error: `${fieldName} must be a valid number.` };
  }
  if (integerOnly && !Number.isInteger(parsed)) {
    return { valid: false, error: `${fieldName} must be a whole integer.` };
  }
  if (parsed < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}.` };
  }
  if (parsed > max) {
    return { valid: false, error: `${fieldName} must not exceed ${max}.` };
  }
  return { valid: true, parsedValue: parsed };
}

/**
 * Validate a student grade letter
 * @param {string} grade 
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateGrade(grade) {
  if (!grade || !VALID_GRADES.includes(grade.toUpperCase())) {
    return { valid: false, error: `Grade must be one of: ${VALID_GRADES.join(', ')}` };
  }
  return { valid: true };
}

/**
 * Validate a programming question object
 * @param {object} q 
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateQuestion(q) {
  const errors = [];
  if (!q.title || q.title.trim().length < 3) {
    errors.push('Question title must be at least 3 characters.');
  }
  if (!q.statement || q.statement.trim().length < 10) {
    errors.push('Problem statement must be at least 10 characters.');
  }
  if (!VALID_TOPICS.includes(q.topic)) {
    errors.push(`Topic must be one of: ${VALID_TOPICS.join(', ')}`);
  }
  if (!VALID_DIFFICULTIES.includes(q.difficulty)) {
    errors.push(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  }
  if (!Array.isArray(q.options) || q.options.length < 2) {
    errors.push('Question must have at least 2 multiple-choice options.');
  } else {
    const emptyOption = q.options.some(opt => !opt || String(opt).trim() === '');
    if (emptyOption) {
      errors.push('All options must be non-empty text.');
    }
  }
  if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= (q.options?.length || 0)) {
    errors.push('A valid correct answer index must be selected.');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validate an operational support ticket / issue
 * @param {object} issue 
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateIssue(issue) {
  const errors = [];
  if (!issue.title || issue.title.trim().length < 4) {
    errors.push('Issue title must be at least 4 characters.');
  }
  if (!issue.category || !VALID_ISSUE_CATEGORIES.includes(issue.category)) {
    errors.push(`Category must be one of: ${VALID_ISSUE_CATEGORIES.join(', ')}`);
  }
  if (!issue.priority || !VALID_PRIORITIES.includes(issue.priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  if (!issue.status || !VALID_STATUSES.includes(issue.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  if (!issue.assignedOwner || issue.assignedOwner.trim().length < 2) {
    errors.push('Assigned owner name is required.');
  }
  if (!issue.dueDate) {
    errors.push('Due date is required.');
  } else {
    const d = new Date(issue.dueDate);
    if (isNaN(d.getTime())) {
      errors.push('A valid due date is required.');
    }
  }
  return { valid: errors.length === 0, errors };
}
