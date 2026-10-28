/**
 * Campus Utility Hub 2.0 - Student Utilities Unit Tests
 * Tests for Attendance percentages, CGPA weighted calculations, Number conversion, and Password strength.
 */

import { safePercentage } from '../js/core/utils.js';
import { GRADE_POINTS } from '../js/modules/existing-utilities.js';

export function runUtilitiesTests() {
  const results = [];

  function assert(testName, condition, message = '') {
    results.push({
      testName,
      passed: Boolean(condition),
      message: condition ? 'PASSED' : `FAILED: ${message}`
    });
  }

  // 1. Attendance Calculation Tests
  const att1 = safePercentage(24, 30, 1);
  assert('Attendance: 24/30 sessions equals 80.0%', att1 === 80.0);

  const att2 = safePercentage(30, 30, 1);
  assert('Attendance: 30/30 sessions equals 100.0%', att2 === 100.0);

  const att3 = safePercentage(0, 30, 1);
  assert('Attendance: 0/30 sessions equals 0.0%', att3 === 0.0);

  const attZeroDenom = safePercentage(10, 0, 1);
  assert('Attendance: division by zero sessions safely returns 0%', attZeroDenom === 0);

  // 2. CGPA & SGPA Weighted Points Calculation
  // Sample course load:
  // Math (4 credits, O: 10 pts) -> 40
  // Physics (3 credits, A: 8 pts) -> 24
  // Lab (2 credits, A+: 9 pts) -> 18
  // Total credits = 9, Total points = 82, SGPA = 82 / 9 = 9.11
  const subjects = [
    { credits: 4, grade: 'O' },
    { credits: 3, grade: 'A' },
    { credits: 2, grade: 'A+' }
  ];

  let totalCredits = 0;
  let weightedPoints = 0;
  subjects.forEach(s => {
    totalCredits += s.credits;
    weightedPoints += s.credits * GRADE_POINTS[s.grade];
  });
  const sgpa = (weightedPoints / totalCredits).toFixed(2);
  assert('CGPA: Weighted points sum equals 82', weightedPoints === 82);
  assert('CGPA: Total credits equals 9', totalCredits === 9);
  assert('CGPA: Calculated SGPA is 9.11', sgpa === '9.11');

  // 3. Number Converter Logic (Decimal to Base 2, 8, 16)
  function decimalToBases(n) {
    if (!Number.isInteger(n) || n < 0) return null;
    return {
      bin: n === 0 ? '0' : n.toString(2),
      oct: n.toString(8),
      hex: n.toString(16).toUpperCase()
    };
  }

  const convZero = decimalToBases(0);
  assert('Converter: 0 converts to binary "0"', convZero.bin === '0');
  assert('Converter: 0 converts to octal "0"', convZero.oct === '0');
  assert('Converter: 0 converts to hex "0"', convZero.hex === '0');

  const conv42 = decimalToBases(42);
  assert('Converter: 42 converts to binary "101010"', conv42.bin === '101010');
  assert('Converter: 42 converts to octal "52"', conv42.oct === '52');
  assert('Converter: 42 converts to hex "2A"', conv42.hex === '2A');

  const convNegative = decimalToBases(-5);
  assert('Converter: Negative numbers are rejected as null', convNegative === null);

  // 4. Password Criteria Evaluation
  function evaluatePassword(pwd) {
    if (!pwd) return 0;
    let score = 0;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) score++;
    if (pwd.length >= 8) score++;
    return score;
  }

  assert('Password: Empty string scores 0', evaluatePassword('') === 0);
  assert('Password: Simple lowercase scores 1 (Weak)', evaluatePassword('simple') === 1);
  assert('Password: Complex "Campus@2026" scores 5 (Strong)', evaluatePassword('Campus@2026') === 5);

  return results;
}
