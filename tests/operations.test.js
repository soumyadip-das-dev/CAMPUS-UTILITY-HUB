/**
 * Campus Utility Hub 2.0 - Module C Unit Tests
 * Tests for support ticket validation, overdue calculations, and operational summary KPIs.
 */

import { validateIssue } from '../js/core/validation.js';
import { isOverdue } from '../js/core/utils.js';
import { calculateOperationalStats } from '../js/modules/operations.js';

export function runOperationsTests() {
  const results = [];

  function assert(testName, condition, message = '') {
    results.push({
      testName,
      passed: Boolean(condition),
      message: condition ? 'PASSED' : `FAILED: ${message}`
    });
  }

  // Test 1: Valid issue passes validation
  const validTicket = {
    title: 'Lab 2 Workstation Network Glitch',
    category: 'Lab Infrastructure',
    priority: 'High',
    status: 'Open',
    assignedOwner: 'Prof. Mukherjee',
    dueDate: '2026-11-10'
  };
  const valResult = validateIssue(validTicket);
  assert('Valid issue passes validation', valResult.valid === true, JSON.stringify(valResult.errors));

  // Test 2: Invalid category fails
  const invalidCategory = {
    ...validTicket,
    category: 'NonExistentCategory'
  };
  assert('Invalid category fails validation', validateIssue(invalidCategory).valid === false);

  // Test 3: Missing due date fails
  const missingDueDate = {
    ...validTicket,
    dueDate: ''
  };
  assert('Missing due date fails validation', validateIssue(missingDueDate).valid === false);

  // Test 4: Overdue calculation
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  assert('Past due date on Open ticket is overdue', isOverdue(yesterday, 'Open') === true);
  assert('Past due date on In Progress ticket is overdue', isOverdue(yesterday, 'In Progress') === true);
  assert('Past due date on Resolved ticket is NOT overdue', isOverdue(yesterday, 'Resolved') === false);
  assert('Future due date is NOT overdue', isOverdue(tomorrow, 'Open') === false);

  // Test 5: Operational KPI Summary Metrics Calculation
  const testTickets = [
    { id: '1', status: 'Open', priority: 'High', dueDate: yesterday },       // Overdue, High, Open
    { id: '2', status: 'In Progress', priority: 'Urgent', dueDate: tomorrow }, // Urgent, In Progress
    { id: '3', status: 'Resolved', priority: 'High', dueDate: yesterday },    // Resolved (not overdue)
    { id: '4', status: 'Open', priority: 'Low', dueDate: tomorrow }           // Open
  ];

  const stats = calculateOperationalStats(testTickets);
  assert('Total ticket count is 4', stats.total === 4);
  assert('Open ticket count is 2', stats.openCount === 2);
  assert('In Progress count is 1', stats.inProgressCount === 1);
  assert('Resolved count is 1', stats.resolvedCount === 1);
  assert('Overdue count is 1', stats.overdueCount === 1);
  assert('Active Urgent/High priority count is 2 (tickets 1 and 2)', stats.highPriorityCount === 2);

  return results;
}
