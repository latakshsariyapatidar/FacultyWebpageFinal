/**
 * Health Check Routes
 * Routes for application health and status monitoring
 * 
 * @module routes/healthRoutes
 */

import express from 'express';
import * as facultyController from '../controllers/facultyController.js';

const router = express.Router();

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', facultyController.healthCheck);

export default router;
