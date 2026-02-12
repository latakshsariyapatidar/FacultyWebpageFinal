/**
 * Faculty Model
 * Data access layer for faculty data
 * Handles all file I/O operations for faculty registry and data files
 * 
 * @module models/facultyModel
 */

import fs from 'fs';
import config from '../config/config.js';
import logger from '../utils/logger.js';

const { registryFile, facultyDataDir } = config.paths;

/**
 * Ensure data directories exist
 */
function ensureDirectories() {
  if (!fs.existsSync(facultyDataDir)) {
    fs.mkdirSync(facultyDataDir, { recursive: true });
    logger.success('Created faculty data directory');
  }
}

// Initialize directories
ensureDirectories();

/**
 * Get all faculty from registry
 * 
 * @returns {Array} Array of faculty entries
 */
export function getAllFaculty() {
  try {
    if (!fs.existsSync(registryFile)) {
      fs.writeFileSync(registryFile, JSON.stringify([], null, 2));
      return [];
    }
    return JSON.parse(fs.readFileSync(registryFile, 'utf8'));
  } catch (err) {
    logger.error('Error reading registry:', err);
    return [];
  }
}

/**
 * Find faculty by ID in registry
 * 
 * @param {string} facultyId - Faculty ID to find
 * @returns {Object|null} Faculty entry or null if not found
 */
export function findFacultyById(facultyId) {
  const registry = getAllFaculty();
  return registry.find(f => f.facultyID === facultyId) || null;
}

/**
 * Find faculty by sheet ID
 * 
 * @param {string} sheetId - Sheet ID to find
 * @returns {Object|null} Faculty entry or null if not found
 */
export function findFacultyBySheetId(sheetId) {
  const registry = getAllFaculty();
  return registry.find(f => f.sheetID === sheetId) || null;
}

/**
 * Save faculty registry
 * 
 * @param {Array} registry - Faculty registry array to save
 */
export function saveRegistry(registry) {
  fs.writeFileSync(registryFile, JSON.stringify(registry, null, 2), 'utf8');
}

/**
 * Add or update faculty in registry
 * 
 * @param {Object} facultyEntry - Faculty entry to add/update
 * @returns {Object} Result with success status and message
 */
export function upsertFaculty(facultyEntry) {
  try {
    const registry = getAllFaculty();
    const existingIndex = registry.findIndex(f => f.facultyID === facultyEntry.facultyID);

    if (existingIndex >= 0) {
      // Update existing
      registry[existingIndex] = {
        ...registry[existingIndex],
        ...facultyEntry,
        registeredAt: registry[existingIndex].registeredAt, // Preserve original registration time
      };
      logger.info(`Updated existing faculty: ${facultyEntry.facultyID}`);
    } else {
      // Add new
      registry.push(facultyEntry);
      logger.create(`Registered new faculty: ${facultyEntry.facultyID}`);
    }

    saveRegistry(registry);

    return {
      success: true,
      isNew: existingIndex < 0,
      faculty: facultyEntry,
    };
  } catch (err) {
    logger.error('Error upserting faculty:', err);
    throw err;
  }
}

/**
 * Delete faculty from registry
 * 
 * @param {string} facultyId - Faculty ID to delete
 * @returns {boolean} Whether deletion was successful
 */
export function deleteFacultyFromRegistry(facultyId) {
  try {
    let registry = getAllFaculty();
    const initialLength = registry.length;

    registry = registry.filter(f => f.facultyID !== facultyId);

    if (registry.length === initialLength) {
      return false; // Faculty not found
    }

    saveRegistry(registry);
    logger.delete(`Removed faculty from registry: ${facultyId}`);
    return true;
  } catch (err) {
    logger.error('Error deleting faculty from registry:', err);
    throw err;
  }
}

/**
 * Get faculty data from JSON file
 * 
 * @param {string} facultyId - Faculty ID
 * @returns {Object|null} Faculty data object or null if not found
 */
export function getFacultyData(facultyId) {
  const filePath = `${facultyDataDir}/${facultyId}.json`;

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    logger.error(`Error reading faculty data file for ${facultyId}:`, err);
    return null;
  }
}

/**
 * Save faculty data to JSON file
 * 
 * @param {string} facultyId - Faculty ID
 * @param {Object} data - Faculty data to save
 */
export function saveFacultyData(facultyId, data) {
  const filePath = `${facultyDataDir}/${facultyId}.json`;

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    logger.success(`Saved data for ${facultyId}`);
  } catch (err) {
    logger.error(`Error saving faculty data for ${facultyId}:`, err);
    throw err;
  }
}

/**
 * Delete faculty data file
 * 
 * @param {string} facultyId - Faculty ID
 * @returns {boolean} Whether deletion was successful
 */
export function deleteFacultyDataFile(facultyId) {
  const filePath = `${facultyDataDir}/${facultyId}.json`;

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.delete(`Deleted data file for ${facultyId}`);
      return true;
    }
    return false;
  } catch (err) {
    logger.error(`Error deleting faculty data file for ${facultyId}:`, err);
    throw err;
  }
}

/**
 * Update faculty last updated timestamp
 * 
 * @param {string} facultyId - Faculty ID
 * @returns {string} New timestamp
 */
export function updateLastUpdated(facultyId) {
  const registry = getAllFaculty();
  const faculty = registry.find(f => f.facultyID === facultyId);

  if (!faculty) {
    throw new Error(`Faculty ${facultyId} not found in registry`);
  }

  const timestamp = new Date().toISOString();
  faculty.lastUpdated = timestamp;
  saveRegistry(registry);

  return timestamp;
}

/**
 * Get total count of registered faculty
 * 
 * @returns {number} Total faculty count
 */
export function getFacultyCount() {
  return getAllFaculty().length;
}
