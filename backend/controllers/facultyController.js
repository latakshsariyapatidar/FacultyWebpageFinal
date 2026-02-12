/**
 * Faculty Controller
 * Handles all HTTP requests related to faculty management
 * Contains business logic for faculty operations
 * 
 * @module controllers/facultyController
 */

import * as FacultyModel from '../models/facultyModel.js';
import * as GoogleSheetsService from '../services/googleSheetsService.js';
import { validateRegistrationData } from '../utils/validators.js';
import logger from '../utils/logger.js';

/**
 * Get list of all registered faculty (metadata only)
 * 
 * @route GET /api/faculty
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getAllFaculty(req, res) {
  try {
    const registry = FacultyModel.getAllFaculty();

    const facultyList = registry.map((f) => ({
      facultyID: f.facultyID,
      name: f.name,
      email: f.email,
      department: f.department,
      lastUpdated: f.lastUpdated,
      registeredAt: f.registeredAt,
    }));

    res.json(facultyList);
  } catch (err) {
    logger.error('Error fetching faculty list:', err);
    res.status(500).json({ 
      message: 'Error fetching faculty list',
      success: false 
    });
  }
}

/**
 * Get complete data for a specific faculty
 * 
 * @route GET /api/faculty/:facultyId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getFacultyById(req, res) {
  const { facultyId } = req.params;

  try {
    const facultyData = FacultyModel.getFacultyData(facultyId);

    if (!facultyData) {
      return res.status(404).json({
        message: `Faculty with ID "${facultyId}" not found`,
        hint: 'Use GET /api/faculty to see all registered faculty',
        success: false,
      });
    }

    res.json(facultyData);
  } catch (err) {
    logger.error(`Error reading faculty data for ${facultyId}:`, err);
    res.status(500).json({ 
      message: 'Error reading faculty data',
      success: false 
    });
  }
}

/**
 * Register a new faculty or update existing faculty registry entry
 * 
 * @route POST /api/faculty/register/:secretKey
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function registerFaculty(req, res) {
  const { facultyID, sheetID, name, email, department } = req.body;

  // Validate required fields
  const validation = validateRegistrationData(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      message: validation.error,
      example: validation.example,
      success: false,
    });
  }

  try {
    const registry = FacultyModel.getAllFaculty();

    // Check if sheetID is already used by another faculty
    const existingSheet = FacultyModel.findFacultyBySheetId(sheetID);
    if (existingSheet && existingSheet.facultyID !== facultyID) {
      return res.status(400).json({
        message: `Sheet ID already registered to faculty: ${existingSheet.facultyID}`,
        existingFaculty: existingSheet.facultyID,
        success: false,
      });
    }

    const existingFaculty = FacultyModel.findFacultyById(facultyID);

    const facultyEntry = {
      facultyID,
      sheetID,
      name: name || '',
      email: email || '',
      department: department || '',
      jsonFile: `${facultyID}.json`,
      registeredAt: existingFaculty?.registeredAt || new Date().toISOString(),
      lastUpdated: null,
    };

    const result = FacultyModel.upsertFaculty(facultyEntry);

    res.json({
      message: `Faculty ${facultyID} ${result.isNew ? 'registered' : 'updated'} successfully`,
      faculty: result.faculty,
      dataFilePath: `backend/data/faculty/${facultyID}.json`,
      success: true,
      nextStep: `Use GET /api/faculty/${facultyID}/refresh/:secretKey to fetch data from Google Sheets`,
    });
  } catch (err) {
    logger.error('Error registering faculty:', err);
    res.status(500).json({
      message: 'Error registering faculty: ' + err.message,
      success: false,
    });
  }
}

/**
 * Refresh/Fetch data for a specific faculty from their Google Sheet
 * 
 * @route GET /api/faculty/:facultyId/refresh/:secretKey
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function refreshFacultyData(req, res) {
  const { facultyId } = req.params;

  try {
    const faculty = FacultyModel.findFacultyById(facultyId);

    if (!faculty) {
      return res.status(404).json({
        message: `Faculty ${facultyId} not registered. Please register first.`,
        hint: `Use POST /api/faculty/register/:secretKey to register`,
        success: false,
      });
    }

    logger.refresh(`Fetching data from Google Sheet for ${facultyId}...`);

    // Fetch data from faculty's Google Sheet
    const sheetData = await GoogleSheetsService.fetchFacultyDataFromSheet(faculty.sheetID);

    // Save individual faculty data
    FacultyModel.saveFacultyData(facultyId, sheetData);

    // Update last updated timestamp in registry
    const lastUpdated = FacultyModel.updateLastUpdated(facultyId);

    logger.success(`Data for ${facultyId} updated successfully`);

    res.json({
      message: `Data for ${facultyId} updated successfully from Google Sheets`,
      facultyID: facultyId,
      lastUpdated: lastUpdated,
      sheetID: faculty.sheetID,
      success: true,
    });
  } catch (err) {
    logger.error(`Error refreshing data for ${facultyId}:`, err);
    res.status(500).json({
      message: 'Error fetching data from Google Sheet: ' + err.message,
      success: false,
    });
  }
}

/**
 * Refresh data for all registered faculty from their respective Google Sheets
 * 
 * @route GET /api/faculty/refreshAll/:secretKey
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function refreshAllFaculty(req, res) {
  try {
    const registry = FacultyModel.getAllFaculty();

    if (registry.length === 0) {
      return res.json({
        message: 'No faculty registered yet',
        success: true,
        results: [],
      });
    }

    logger.refresh(`Refreshing data for ${registry.length} faculty members...`);

    const results = [];

    for (const faculty of registry) {
      try {
        logger.info(`  Fetching ${faculty.facultyID}...`);

        const sheetData = await GoogleSheetsService.fetchFacultyDataFromSheet(faculty.sheetID);
        FacultyModel.saveFacultyData(faculty.facultyID, sheetData);

        const lastUpdated = FacultyModel.updateLastUpdated(faculty.facultyID);

        results.push({
          facultyID: faculty.facultyID,
          status: 'success',
          lastUpdated: lastUpdated,
        });
      } catch (err) {
        logger.error(`  Error for ${faculty.facultyID}:`, err);
        results.push({
          facultyID: faculty.facultyID,
          status: 'failed',
          error: err.message,
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const failCount = results.filter((r) => r.status === 'failed').length;

    logger.success(`Bulk refresh completed: ${successCount} succeeded, ${failCount} failed`);

    res.json({
      message: `Bulk refresh completed: ${successCount} succeeded, ${failCount} failed`,
      totalFaculty: registry.length,
      success: true,
      results,
    });
  } catch (err) {
    logger.error('Error during bulk refresh:', err);
    res.status(500).json({
      message: 'Error during bulk refresh: ' + err.message,
      success: false,
    });
  }
}

/**
 * Delete a faculty from registry and remove their data file
 * 
 * @route DELETE /api/faculty/:facultyId/:secretKey
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function deleteFaculty(req, res) {
  const { facultyId } = req.params;

  try {
    const facultyExists = FacultyModel.findFacultyById(facultyId);

    if (!facultyExists) {
      return res.status(404).json({
        message: `Faculty ${facultyId} not found`,
        success: false,
      });
    }

    // Delete from registry
    FacultyModel.deleteFacultyFromRegistry(facultyId);

    // Delete data file
    FacultyModel.deleteFacultyDataFile(facultyId);

    logger.delete(`Faculty ${facultyId} deleted successfully`);

    res.json({
      message: `Faculty ${facultyId} deleted successfully`,
      success: true,
    });
  } catch (err) {
    logger.error('Error deleting faculty:', err);
    res.status(500).json({
      message: 'Error deleting faculty: ' + err.message,
      success: false,
    });
  }
}

/**
 * Health check endpoint
 * 
 * @route GET /health
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function healthCheck(req, res) {
  try {
    const totalFaculty = FacultyModel.getFacultyCount();

    res.json({
      status: 'Backend running',
      totalFaculty: totalFaculty,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('Error in health check:', err);
    res.status(500).json({
      status: 'Error',
      message: err.message,
    });
  }
}
