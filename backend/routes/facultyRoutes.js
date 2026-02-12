/**
 * Faculty Routes
 * Defines all routes for faculty management endpoints
 * 
 * @module routes/facultyRoutes
 */

import express from 'express';
import * as facultyController from '../controllers/facultyController.js';
import { validateSecret } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/faculty
 * @desc    Get list of all registered faculty (metadata only)
 * @access  Public
 */
router.get('/', facultyController.getAllFaculty);

/**
 * @route   GET /api/faculty/:facultyId
 * @desc    Get complete data for a specific faculty
 * @access  Public
 */
router.get('/:facultyId', facultyController.getFacultyById);

/**
 * @route   POST /api/faculty/register/:secretKey
 * @desc    Register a new faculty or update existing faculty
 * @access  Private (requires secret key)
 */
router.post('/register/:secretKey', validateSecret, facultyController.registerFaculty);

/**
 * @route   GET /api/faculty/:facultyId/refresh/:secretKey
 * @desc    Refresh/Fetch data for a specific faculty from Google Sheets
 * @access  Private (requires secret key)
 */
router.get('/:facultyId/refresh/:secretKey', validateSecret, facultyController.refreshFacultyData);

/**
 * @route   GET /api/faculty/refreshAll/:secretKey
 * @desc    Refresh data for all registered faculty
 * @access  Private (requires secret key)
 */
router.get('/refreshAll/:secretKey', validateSecret, facultyController.refreshAllFaculty);

/**
 * @route   DELETE /api/faculty/:facultyId/:secretKey
 * @desc    Delete a faculty from registry and remove their data file
 * @access  Private (requires secret key)
 */
router.delete('/:facultyId/:secretKey', validateSecret, facultyController.deleteFaculty);

export default router;
