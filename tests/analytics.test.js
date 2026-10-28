/**
 * Campus Utility Hub 2.0 - Module B Unit Tests
 * Tests for derived analytics metrics, completion rate, zero-division resilience, and CSV formatting.
 */

import { calculateMetrics } from '../js/modules/analytics.js';
import { escapeCSV, safePercentage } from '../js/core/utils.js';

export function runAnalyticsTests() {
  const results = [];

  function assert(testName, condition, message = '') {
    results.push({
      testName,
      passed: Boolean(condition),
      message: condition ? 'PASSED' : `FAILED: ${message}`
    });
  }

  const sampleAssessments = [
    { id: 'asmt-1', title: 'DSA Diagnostic', topic: 'Basic Data Structures' },
    { id: 'asmt-2', title: 'Strings Challenge', topic: 'Strings' }
  ];

  const sampleAttempts = [
    { id: 'att-1', assessmentId: 'asmt-1', score: 80, completed: true },
    { id: 'att-2', assessmentId: 'asmt-1', score: 100, completed: true },
    { id: 'att-3', assessmentId: 'asmt-2', score: 60, completed: true },
    { id: 'att-4', assessmentId: 'asmt-2', score: 0, completed: false } // Incomplete
  ];

  // Test 1: Standard Metrics Calculation
  const metrics = calculateMetrics(sampleAttempts, sampleAssessments);
  assert('Total Attempts Count', metrics.totalAttempts === 4);
  assert('Completed Attempts Count', metrics.completedAttempts === 3);
  assert('Pending / Incomplete Count', metrics.pendingAttempts === 1);

  // Test 2: Completion Rate = 3 / 4 * 100 = 75.0%
  assert('Completion Rate is 75%', metrics.completionRate === 75);

  // Test 3: Average Score = (80 + 100 + 60) / 3 = 80.0%
  assert('Average Score of completed attempts is 80%', metrics.averageScore === 80);

  // Test 4: Qualified Passing Count (score >= 70) = 2 (80 and 100)
  assert('Qualified count is 2', metrics.passedCount === 2);
  assert('Qualified rate is 66.7%', metrics.passRate === 66.7, `Got ${metrics.passRate}`);

  // Test 5: Empty dataset resilience (Zero denominators)
  const emptyMetrics = calculateMetrics([], []);
  assert('Empty attempts yields 0 total attempts', emptyMetrics.totalAttempts === 0);
  assert('Empty attempts yields 0% completion rate without NaN', emptyMetrics.completionRate === 0);
  assert('Empty attempts yields 0% average score without NaN', emptyMetrics.averageScore === 0);
  assert('Empty attempts yields 0% pass rate without NaN', emptyMetrics.passRate === 0);

  // Test 6: RFC 4180 CSV Escaping
  assert('Standard text escapes cleanly', escapeCSV('John Doe') === '"John Doe"');
  assert('Commas in text are enclosed in quotes', escapeCSV('Doe, John') === '"Doe, John"');
  assert('Double quotes inside values are doubled', escapeCSV('He said "Hello"') === '"He said ""Hello"""');
  assert('Newlines are safely quoted', escapeCSV("Line 1\nLine 2") === '"Line 1\nLine 2"');
  assert('Null or undefined values return empty quotes', escapeCSV(null) === '""' && escapeCSV(undefined) === '""');

  return results;
}
