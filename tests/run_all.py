#!/usr/bin/env python3
"""
Campus Utility Hub 2.0 - Standalone CLI Test Suite
Executes pure business logic and boundary condition tests without external dependencies.
"""

import sys
from datetime import datetime, timedelta

tests_run = 0
tests_passed = 0
tests_failed = 0

def assert_test(name, condition, details=""):
    global tests_run, tests_passed, tests_failed
    tests_run += 1
    if condition:
        tests_passed += 1
        print(f"  [PASS] {name}")
    else:
        tests_failed += 1
        print(f"  [FAIL] {name} - {details}")

def safe_percentage(numerator, denominator, decimals=1):
    den = float(denominator) if denominator else 0
    num = float(numerator) if numerator else 0
    if den <= 0:
        return 0.0
    return round((num / den) * 100, decimals)

def escape_csv(val):
    if val is None:
        return '""'
    s = str(val)
    if ',' in s or '"' in s or '\n' in s or '\r' in s:
        escaped = s.replace('"', '""')
        return f'"{escaped}"'
    return f'"{s}"'

def is_overdue(due_date_str, status="Open"):
    if not due_date_str or status == "Resolved":
        return False
    today = datetime.now().date()
    try:
        due = datetime.strptime(due_date_str, "%Y-%m-%d").date()
        return due < today
    except Exception:
        return False

def calculate_metrics(attempts, assessments):
    total_attempts = len(attempts)
    completed = [a for a in attempts if a.get("completed")]
    completed_count = len(completed)
    pending_count = total_attempts - completed_count
    completion_rate = safe_percentage(completed_count, total_attempts, 1)

    sum_score = sum(a.get("score", 0) for a in completed)
    avg_score = round(sum_score / completed_count, 1) if completed_count > 0 else 0.0
    passed_count = sum(1 for a in completed if a.get("score", 0) >= 70)
    pass_rate = safe_percentage(passed_count, completed_count, 1)

    return {
        "total": total_attempts,
        "completed": completed_count,
        "pending": pending_count,
        "completion_rate": completion_rate,
        "avg_score": avg_score,
        "passed_count": passed_count,
        "pass_rate": pass_rate
    }

def main():
    print("=" * 65)
    print(" Campus Utility Hub 2.0 - Automated Logic & Edge Cases Test Suite")
    print("=" * 65)

    print("\n[Suite 1: Safe Math & Utility Calculations]")
    assert_test("safe_percentage normal 24/30 = 80.0%", safe_percentage(24, 30) == 80.0)
    assert_test("safe_percentage division by zero safely returns 0.0%", safe_percentage(15, 0) == 0.0)
    assert_test("safe_percentage 0 numerator returns 0.0%", safe_percentage(0, 30) == 0.0)
    assert_test("safe_percentage rounding 2/3 = 66.7%", safe_percentage(2, 3, 1) == 66.7)

    print("\n[Suite 2: CGPA & SGPA Weighted Scoring]")
    # Courses: 4 credits (O: 10) = 40, 3 credits (A: 8) = 24, 2 credits (A+: 9) = 18 -> total 82 / 9 = 9.11
    grade_points = {"O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "F": 0}
    courses = [{"cr": 4, "g": "O"}, {"cr": 3, "g": "A"}, {"cr": 2, "g": "A+"}]
    tot_credits = sum(c["cr"] for c in courses)
    w_sum = sum(c["cr"] * grade_points[c["g"]] for c in courses)
    sgpa = round(w_sum / tot_credits, 2)
    assert_test("Total credits equals 9", tot_credits == 9)
    assert_test("Weighted points equals 82", w_sum == 82)
    assert_test("Calculated SGPA equals 9.11", sgpa == 9.11)

    print("\n[Suite 3: RFC 4180 CSV Escaping]")
    assert_test("Standard string escaping", escape_csv("Campus Hub") == '"Campus Hub"')
    assert_test("Comma enclosed in quotes", escape_csv("Das, Soumyadip") == '"Das, Soumyadip"')
    assert_test("Double quote replacement", escape_csv('Code "Review"') == '"Code ""Review"""')
    assert_test("Newline escaping", escape_csv("Line1\nLine2") == '"Line1\nLine2"')
    assert_test("None/Null handling", escape_csv(None) == '""')

    print("\n[Suite 4: Overdue Date & SLA Tracking]")
    today = datetime.now().date()
    yesterday = (today - timedelta(days=1)).strftime("%Y-%m-%d")
    tomorrow = (today + timedelta(days=1)).strftime("%Y-%m-%d")

    assert_test("Past due date on Open ticket is overdue", is_overdue(yesterday, "Open") is True)
    assert_test("Past due date on In Progress ticket is overdue", is_overdue(yesterday, "In Progress") is True)
    assert_test("Past due date on Resolved ticket is NOT overdue", is_overdue(yesterday, "Resolved") is False)
    assert_test("Future due date is NOT overdue", is_overdue(tomorrow, "Open") is False)

    print("\n[Suite 5: Module B Analytics Derived Metrics & Resilience]")
    attempts = [
        {"score": 80, "completed": True},
        {"score": 100, "completed": True},
        {"score": 60, "completed": True},
        {"score": 0, "completed": False}
    ]
    m = calculate_metrics(attempts, [1, 2])
    assert_test("Total attempts = 4", m["total"] == 4)
    assert_test("Completed = 3, Pending = 1", m["completed"] == 3 and m["pending"] == 1)
    assert_test("Completion rate = 75.0%", m["completion_rate"] == 75.0)
    assert_test("Average score = 80.0%", m["avg_score"] == 80.0)
    assert_test("Qualified candidates = 2", m["passed_count"] == 2)
    assert_test("Qualified pass rate = 66.7%", m["pass_rate"] == 66.7)

    # Empty metrics
    empty_m = calculate_metrics([], [])
    assert_test("Empty dataset yields 0% completion rate without crashing", empty_m["completion_rate"] == 0.0)
    assert_test("Empty dataset yields 0% avg score without crashing", empty_m["avg_score"] == 0.0)

    print("\n" + "=" * 65)
    print(f" Test Results: {tests_passed} passed, {tests_failed} failed, {tests_run} total assertions.")
    print("=" * 65)

    if tests_failed > 0:
        sys.exit(1)
    else:
        print("\nAll automated tests PASSED successfully!\n")

if __name__ == "__main__":
    main()
