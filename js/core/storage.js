/**
 * Campus Utility Hub 2.0 - Core Storage Module
 * Centralized, safe LocalStorage manager with schema versioning and fallback defaults.
 */

const STORAGE_PREFIX = 'CHUB_';
export const SCHEMA_VERSION = '2.0.0';

export const STORAGE_KEYS = {
  VERSION: `${STORAGE_PREFIX}SCHEMA_VERSION`,
  THEME: `${STORAGE_PREFIX}THEME`,
  ATTENDANCE: `${STORAGE_PREFIX}ATTENDANCE`,
  SUBJECTS: `${STORAGE_PREFIX}SUBJECTS`,
  EXPENSES: `${STORAGE_PREFIX}EXPENSES`,
  QUESTIONS: `${STORAGE_PREFIX}QUESTIONS`,
  ASSESSMENTS: `${STORAGE_PREFIX}ASSESSMENTS`,
  ATTEMPTS: `${STORAGE_PREFIX}ATTEMPTS`,
  ISSUES: `${STORAGE_PREFIX}ISSUES`,
  SCHEDULES: `${STORAGE_PREFIX}SCHEDULES`,
};

/**
 * Safely retrieve JSON data from localStorage
 * @template T
 * @param {string} key 
 * @param {T} defaultValue 
 * @returns {T}
 */
export function getItem(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[Storage] Failed to read key "${key}":`, err);
    return defaultValue;
  }
}

/**
 * Safely save data into localStorage as JSON
 * @param {string} key 
 * @param {any} value 
 * @returns {boolean} True if successfully stored
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[Storage] Failed to write key "${key}":`, err);
    return false;
  }
}

/**
 * Remove an item from localStorage
 * @param {string} key 
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[Storage] Failed to remove key "${key}":`, err);
  }
}

/**
 * Clear all Campus Utility Hub data
 */
export function clearAll() {
  try {
    Object.values(STORAGE_KEYS).forEach(k => {
      localStorage.removeItem(k);
    });
  } catch (err) {
    console.error('[Storage] Failed to clear application storage:', err);
  }
}

/**
 * Initialize storage with default/demo data if not already present or outdated
 * @param {object} defaultDataMap - Key-value map of initial datasets
 */
export function initializeStorage(defaultDataMap = {}) {
  const currentVersion = getItem(STORAGE_KEYS.VERSION, null);

  if (currentVersion !== SCHEMA_VERSION) {
    // Fresh setup or schema migration needed
    console.info(`[Storage] Migrating/Initializing storage to schema version ${SCHEMA_VERSION}`);
    Object.entries(defaultDataMap).forEach(([key, value]) => {
      // If key doesn't exist, seed with default
      if (localStorage.getItem(key) === null) {
        setItem(key, value);
      }
    });
    setItem(STORAGE_KEYS.VERSION, SCHEMA_VERSION);
  }
}
