/**
 * Validation Utilities
 * Input validation and sanitization functions
 * 
 * @module utils/validators
 */

import config from '../config/config.js';

/**
 * Validate faculty ID format
 * 
 * @param {string} facultyID - The faculty ID to validate
 * @returns {Object} Validation result with isValid boolean and error message
 */
export function validateFacultyID(facultyID) {
  const { minLength, maxLength, pattern } = config.validation.facultyId;

  if (!facultyID) {
    return {
      isValid: false,
      error: 'Faculty ID is required',
    };
  }

  if (typeof facultyID !== 'string') {
    return {
      isValid: false,
      error: 'Faculty ID must be a string',
    };
  }

  if (facultyID.length < minLength || facultyID.length > maxLength) {
    return {
      isValid: false,
      error: `Faculty ID must be between ${minLength} and ${maxLength} characters`,
    };
  }

  if (!pattern.test(facultyID)) {
    return {
      isValid: false,
      error: 'Faculty ID can only contain letters, numbers, dots, underscores, and hyphens',
      example: 'prof_john_doe or cs_ramesh_kumar or john.doe',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validate registration request body
 * 
 * @param {Object} body - Request body to validate
 * @returns {Object} Validation result
 */
export function validateRegistrationData(body) {
  const { facultyID, sheetID } = body;

  if (!facultyID || !sheetID) {
    return {
      isValid: false,
      error: 'facultyID and sheetID are required',
    };
  }

  const facultyIdValidation = validateFacultyID(facultyID);
  if (!facultyIdValidation.isValid) {
    return facultyIdValidation;
  }

  if (!sheetID || typeof sheetID !== 'string') {
    return {
      isValid: false,
      error: 'Valid sheetID is required',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validate secret key
 * 
 * @param {string} providedKey - The secret key to validate
 * @returns {boolean} Whether the key is valid
 */
export function validateSecretKey(providedKey) {
  return providedKey === config.security.refreshSecretKey;
}
