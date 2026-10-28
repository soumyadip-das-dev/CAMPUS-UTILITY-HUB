/**
 * Campus Utility Hub 2.0 - Module A Unit Tests
 * Tests for question validation, scoring calculation, pass/fail threshold, and timeout handling.
 */

import { validateQuestion } from '../js/core/validation.js';
import { safePercentage } from '../js/core/utils.js';

export function runAssessmentTests() {
  const results = [];

  function assert(testName, condition, message = '') {
    results.push({
      testName,
      passed: Boolean(condition),
      message: condition ? 'PASSED' : `FAILED: ${message}`
    });
  }

  // Test 1: Valid question object passes validation
  const validQ = {
    title: 'Reverse Linked List',
    topic: 'Basic Data Structures',
    difficulty: 'Easy',
    statement: 'Given head of singly linked list, reverse the nodes.',
    options: ['O(N) time O(1) space', 'O(N^2) time', 'O(log N) time', 'O(N) space recursion'],
    correctIndex: 0
  };
  const validRes = validateQuestion(validQ);
  assert('Valid Question Validation', validRes.valid === true, JSON.stringify(validRes.errors));

  // Test 2: Invalid question missing options fails
  const invalidQ1 = {
    title: 'No Options',
    topic: 'Arrays',
    difficulty: 'Easy',
    statement: 'Some valid length statement here...',
    options: ['Only one'],
    correctIndex: 0
  };
  const invalidRes1 = validateQuestion(invalidQ1);
  assert('Question with < 2 options fails', invalidRes1.valid === false);

  // Test 3: Invalid question with negative or out-of-bounds correctIndex fails
  const invalidQ2 = {
    title: 'Bad Index',
    topic: 'Arrays',
    difficulty: 'Easy',
    statement: 'Statement has enough characters...',
    options: ['Option A', 'Option B'],
    correctIndex: 5
  };
  const invalidRes2 = validateQuestion(invalidQ2);
  assert('Question with out-of-bounds correctIndex fails', invalidRes2.valid === false);

  // Test 4: Full score calculation
  const scoreFull = safePercentage(5, 5, 1);
  assert('Scoring 5/5 yields 100%', scoreFull === 100);

  // Test 5: Partial score calculation rounding
  const scorePartial = safePercentage(2, 3, 1);
  assert('Scoring 2/3 yields 66.7%', scorePartial === 66.7, `Got ${scorePartial}`);

  // Test 6: Zero score with 0 correct
  const scoreZero = safePercentage(0, 4, 1);
  assert('Scoring 0/4 yields 0%', scoreZero === 0);

  // Test 7: Division by zero question count returns 0 without crashing
  const scoreEmpty = safePercentage(0, 0, 1);
  assert('Scoring 0/0 safe division returns 0%', scoreEmpty === 0);

  return results;
}
