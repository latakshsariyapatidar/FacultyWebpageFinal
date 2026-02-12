/**
 * Authentication Middleware
 * Validates secret key for protected routes
 * 
 * @module middleware/authMiddleware
 */

import { validateSecretKey } from '../utils/validators.js';
import logger from '../utils/logger.js';

/**
 * Middleware to validate secret key from request parameters
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function validateSecret(req, res, next) {
  const { secretKey } = req.params;

  if (!validateSecretKey(secretKey)) {
    logger.warn('Unauthorized access attempt - Invalid secret key');
    return res.status(401).json({
      message: 'Unauthorized - Invalid secret key',
      success: false,
    });
  }

  next();
}
