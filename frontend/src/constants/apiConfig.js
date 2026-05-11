/**
 * API Configuration
 * 
 * Centralized API configuration for all backend endpoints.
 * Environment-aware configuration for development and production.
 * 
 * @module constants/apiConfig
 */

// Base URL configuration
const API_BASE_URL = (process.env.REACT_APP_API_URL || '/api').replace(/\/$/, '');

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  FACULTY_LIST: `${API_BASE_URL}/faculty`,
  FACULTY_DATA: (facultyId) => `${API_BASE_URL}/faculty/${facultyId}`,
};

/**
 * API request timeout in milliseconds
 */
export const API_TIMEOUT = 10000;

/**
 * API error messages
 */
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'Resource not found.',
  GENERIC_ERROR: 'An error occurred. Please try again.',
};

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};
