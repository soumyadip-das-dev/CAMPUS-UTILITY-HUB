/**
 * Campus Utility Hub 2.0 - Curated Programming Question Bank
 * Covers: Arrays, Strings, Sorting, Searching, and Basic Data Structures.
 * Includes constraints, sample I/O, explanations, reference solutions, and MCQ choices.
 */

export const INITIAL_QUESTIONS = [
  {
    id: 'q-arr-01',
    title: 'Two Sum Target Indices',
    topic: 'Arrays',
    difficulty: 'Easy',
    statement: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume each input has exactly one solution, and you may not use the same element twice.',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
    sampleInput: 'nums = [2, 7, 11, 15], target = 9',
    sampleOutput: '[0, 1]',
    explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1].',
    referenceSolution: `// Optimal Hash Map Approach: O(N) Time, O(N) Space
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    options: [
      'O(N^2) time using nested loops and O(1) extra space',
      'O(N) time using a hash map for complements and O(N) space',
      'O(N log N) time by sorting, but original indices are lost without extra pair storage',
      'O(1) time using bitwise operations'
    ],
    correctIndex: 1,
    mcqExplanation: 'Using a hash map allows us to look up the complement in O(1) average time, resulting in an optimal O(N) overall runtime.'
  },
  {
    id: 'q-arr-02',
    title: 'Maximum Subarray (Kadane Algorithm)',
    topic: 'Arrays',
    difficulty: 'Medium',
    statement: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
    constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
    sampleInput: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
    sampleOutput: '6',
    explanation: 'The subarray [4, -1, 2, 1] has the largest sum = 6.',
    referenceSolution: `// Kadane's Algorithm: O(N) Time, O(1) Space
function maxSubArray(nums) {
  let maxSoFar = nums[0];
  let currentMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    maxSoFar = Math.max(maxSoFar, currentMax);
  }
  return maxSoFar;
}`,
    options: [
      'currentMax is reset to 0 whenever it becomes negative, achieving O(N) time and O(1) space',
      'Divide and conquer in O(N^2) space',
      'Triple nested loop checking all subarrays in O(N^3) time',
      'Sorting the array first in O(N log N) time'
    ],
    correctIndex: 0,
    mcqExplanation: "Kadane's algorithm works by greedily extending or restarting the current running sum whenever adding earlier elements reduces the overall subarray sum below the current single element."
  },
  {
    id: 'q-str-01',
    title: 'Valid Palindrome Alphanumeric',
    topic: 'Strings',
    difficulty: 'Easy',
    statement: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
    constraints: '1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.',
    sampleInput: 's = "A man, a plan, a canal: Panama"',
    sampleOutput: 'true',
    explanation: '"amanaplanacanalpanama" is a palindrome.',
    referenceSolution: `// Two-Pointer In-Place Approach: O(N) Time, O(1) Space
function isPalindrome(s) {
  let left = 0;
  let right = s.length - 1;
  const isAlphaNum = c => /[a-z0-9]/i.test(c);

  while (left < right) {
    while (left < right && !isAlphaNum(s[left])) left++;
    while (left < right && !isAlphaNum(s[right])) right--;
    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
    left++;
    right--;
  }
  return true;
}`,
    options: [
      'Two pointers moving inward skipping non-alphanumerics in O(N) time and O(1) space',
      'Reversing the entire string with regex in O(N^2) time',
      'Using an auxiliary binary tree in O(N log N) space',
      'Sorting both halves of the string'
    ],
    correctIndex: 0,
    mcqExplanation: 'Two pointers converging from both boundaries inspect each character at most once, using constant extra memory without creating new full string copies.'
  },
  {
    id: 'q-str-02',
    title: 'Longest Substring Without Repeating Characters',
    topic: 'Strings',
    difficulty: 'Medium',
    statement: 'Given a string `s`, find the length of the longest substring without duplicate characters.',
    constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
    sampleInput: 's = "abcabcbb"',
    sampleOutput: '3',
    explanation: 'The answer is "abc", with the length of 3.',
    referenceSolution: `// Sliding Window with Character Map: O(N) Time, O(min(m, n)) Space
function lengthOfLongestSubstring(s) {
  const map = new Map();
  let maxLen = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    if (map.has(s[right])) {
      left = Math.max(left, map.get(s[right]) + 1);
    }
    map.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
    options: [
      'Sliding window with character index hash map in O(N) time',
      'Permutation generation in O(N!) time',
      'Dynamic programming with O(N^3) state table',
      'Binary search on string lengths in O(N^2) time'
    ],
    correctIndex: 0,
    mcqExplanation: 'A sliding window maintains a substring invariant. When a duplicate character is encountered, the left pointer jumps past the previous occurrence.'
  },
  {
    id: 'q-sort-01',
    title: 'Merge Two Sorted Arrays In-Place',
    topic: 'Sorting',
    difficulty: 'Easy',
    statement: 'You are given two integer arrays `nums1` and `nums2`, sorted in non-decreasing order, and two integers `m` and `n`. Merge `nums2` into `nums1` as one sorted array inside `nums1`.',
    constraints: 'nums1.length == m + n\nnums2.length == n\n0 <= m, n <= 200\n-10^9 <= nums1[i], nums2[j] <= 10^9',
    sampleInput: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3',
    sampleOutput: '[1,2,2,3,5,6]',
    explanation: 'The arrays being merged are [1,2,3] and [2,5,6]. Result is stored directly in nums1.',
    referenceSolution: `// Three Pointers starting from the back: O(M + N) Time, O(1) Space
function merge(nums1, m, nums2, n) {
  let p1 = m - 1;
  let p2 = n - 1;
  let p = m + n - 1;

  while (p2 >= 0) {
    if (p1 >= 0 && nums1[p1] > nums2[p2]) {
      nums1[p] = nums1[p1];
      p1--;
    } else {
      nums1[p] = nums2[p2];
      p2--;
    }
    p--;
  }
}`,
    options: [
      'Fill from the end (right to left) using 3 pointers without overwriting uninspected elements',
      'Concatenate nums2 to the beginning and run bubble sort',
      'Use an extra array of size 2 * (m + n) in O(N^2) space',
      'Reverse both arrays before insertion'
    ],
    correctIndex: 0,
    mcqExplanation: 'Starting from the back fills the empty buffer slots at the tail of nums1, avoiding any element overwrites and requiring zero auxiliary allocations.'
  },
  {
    id: 'q-sort-02',
    title: 'Kth Largest Element in an Array',
    topic: 'Sorting',
    difficulty: 'Medium',
    statement: 'Given an integer array `nums` and an integer `k`, return the `k`-th largest element in the array without full sorting.',
    constraints: '1 <= k <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
    sampleInput: 'nums = [3,2,1,5,6,4], k = 2',
    sampleOutput: '5',
    explanation: 'The sorted order is [1,2,3,4,5,6], 2nd largest is 5.',
    referenceSolution: `// Quickselect (Hoare selection) or Min-Heap: Average O(N) Time
function findKthLargest(nums, k) {
  const targetIndex = nums.length - k;
  function quickSelect(left, right) {
    const pivot = nums[right];
    let p = left;
    for (let i = left; i < right; i++) {
      if (nums[i] <= pivot) {
        [nums[i], nums[p]] = [nums[p], nums[i]];
        p++;
      }
    }
    [nums[p], nums[right]] = [nums[right], nums[p]];
    if (p === targetIndex) return nums[p];
    if (p < targetIndex) return quickSelect(p + 1, right);
    return quickSelect(left, p - 1);
  }
  return quickSelect(0, nums.length - 1);
}`,
    options: [
      'Quickselect partitions the array in expected O(N) average time',
      'Full Quicksort requiring O(N^2) space',
      'Insertion sort in guaranteed O(1) time',
      'Linear search checking all pairs in O(N^3) time'
    ],
    correctIndex: 0,
    mcqExplanation: 'Quickselect discards half the array on each partition step (similar to binary search), achieving an expected average runtime of O(N).'
  },
  {
    id: 'q-search-01',
    title: 'Binary Search in Rotated Sorted Array',
    topic: 'Searching',
    difficulty: 'Medium',
    statement: 'Given the array `nums` after possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not.',
    constraints: '1 <= nums.length <= 5000\n-10^4 <= nums[i] <= 10^4\nAll values of nums are unique.',
    sampleInput: 'nums = [4,5,6,7,0,1,2], target = 0',
    sampleOutput: '4',
    explanation: 'Target 0 exists at index 4.',
    referenceSolution: `// Modified Binary Search: O(log N) Time, O(1) Space
function search(nums, target) {
  let low = 0, high = nums.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) return mid;
    
    // Check if left half is sorted
    if (nums[low] <= nums[mid]) {
      if (nums[low] <= target && target < nums[mid]) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    } else { // Right half is sorted
      if (nums[mid] < target && target <= nums[high]) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
  }
  return -1;
}`,
    options: [
      'Identify the sorted half and narrow boundaries in O(log N) time',
      'Sequential scan only, because sorted property is destroyed',
      'Rotate back first requiring O(N^2) swaps',
      'Hash table lookup requiring O(N log N) space'
    ],
    correctIndex: 0,
    mcqExplanation: 'In any rotated sorted array, at least one half (left or right) is guaranteed to be strictly ordered. We determine if target lies in that ordered range to maintain O(log N) search complexity.'
  },
  {
    id: 'q-search-02',
    title: 'First and Last Position of Element in Sorted Array',
    topic: 'Searching',
    difficulty: 'Medium',
    statement: 'Given an array of integers `nums` sorted in non-decreasing order, find the starting and ending position of a given `target` value. If not found, return `[-1, -1]`.',
    constraints: '0 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9\nnums is a non-decreasing array.',
    sampleInput: 'nums = [5,7,7,8,8,10], target = 8',
    sampleOutput: '[3, 4]',
    explanation: 'Target 8 appears starting at index 3 and ending at index 4.',
    referenceSolution: `// Two Binary Searches: O(log N) Time, O(1) Space
function searchRange(nums, target) {
  const findBound = (isFirst) => {
    let low = 0, high = nums.length - 1, ans = -1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (nums[mid] === target) {
        ans = mid;
        if (isFirst) high = mid - 1;
        else low = mid + 1;
      } else if (nums[mid] < target) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return ans;
  };
  return [findBound(true), findBound(false)];
}`,
    options: [
      'Two binary search passes biasing low and high bounds in O(log N) time',
      'Linear scan from index 0 in O(N) time',
      'Quickselect in O(N) time',
      'Counting sort in O(N + K) space'
    ],
    correctIndex: 0,
    mcqExplanation: 'Running two binary searches (one biasing left to find the first occurrence and one biasing right for the last) solves this in O(log N) time with O(1) space.'
  },
  {
    id: 'q-ds-01',
    title: 'Valid Parentheses and Brackets Match',
    topic: 'Basic Data Structures',
    difficulty: 'Easy',
    statement: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid. Brackets must close in the correct order and open brackets must be closed by the same type of brackets.',
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only "()[]{}"',
    sampleInput: 's = "()[]{}"',
    sampleOutput: 'true',
    explanation: 'Every opening bracket has a corresponding correctly nested closing bracket.',
    referenceSolution: `// Stack Approach: O(N) Time, O(N) Space
function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (map[char]) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
    options: [
      'LIFO Stack tracking expected opening brackets in O(N) time and O(N) space',
      'FIFO Queue where elements exit in initial insertion order',
      'Counter variables for each bracket type without tracking order',
      'String replace loop in O(N^3) time'
    ],
    correctIndex: 0,
    mcqExplanation: 'A stack enforces Last-In First-Out (LIFO) discipline, which is required because innermost brackets must be closed before outer brackets.'
  },
  {
    id: 'q-ds-02',
    title: 'Reverse a Singly Linked List',
    topic: 'Basic Data Structures',
    difficulty: 'Easy',
    statement: 'Given the `head` of a singly linked list, reverse the list, and return the reversed list.',
    constraints: 'The number of nodes in the list is in the range [0, 5000].\n-5000 <= Node.val <= 5000',
    sampleInput: 'head = [1, 2, 3, 4, 5]',
    sampleOutput: '[5, 4, 3, 2, 1]',
    explanation: 'Nodes are re-linked backwards so the original tail becomes the new head.',
    referenceSolution: `// Iterative 3-Pointer Reversal: O(N) Time, O(1) Space
function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr !== null) {
    const nextTemp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextTemp;
  }
  return prev;
}`,
    options: [
      'Iterative pointer reassignment using prev, curr, nextTemp in O(N) time and O(1) space',
      'Copying all values to an array and re-creating nodes in O(N) space',
      'Recursion with O(N) call stack overhead',
      'Doubly linked list conversion in O(N^2) time'
    ],
    correctIndex: 0,
    mcqExplanation: 'Iterative reversal updates pointer directions in-place with three temporary references, executing in O(N) time and O(1) auxiliary space.'
  }
];
