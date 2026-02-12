/**
 * Faculty Data Service
 * 
 * Service layer for fetching faculty data from the backend API.
 * Handles all API calls, error handling, and data transformation.
 * 
 * @module services/facultyService
 */

import axios from 'axios';
import { API_ENDPOINTS, API_TIMEOUT, API_ERROR_MESSAGES } from '../constants/apiConfig';

/**
 * Configure axios instance with defaults
 */
const apiClient = axios.create({
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch list of all faculty from the backend
 * Returns metadata for all registered faculty (not full data)
 * 
 * @returns {Promise<Array>} Array of faculty metadata objects
 * @throws {Error} When the API request fails
 */
export const fetchAllFacultyData = async () => {
  try {
    // Get list of all faculty (metadata only)
    const response = await apiClient.get(API_ENDPOINTS.FACULTY_LIST);
    const data = response.data;
    
    // Ensure we always return an array
    if (Array.isArray(data)) {
      return data;
    } else {
      // If single object, wrap in array
      return [data];
    }
  } catch (error) {
    // Handle different error types
    if (error.response) {
      throw new Error(`${API_ERROR_MESSAGES.SERVER_ERROR} (${error.response.status})`);
    } else if (error.request) {
      throw new Error(API_ERROR_MESSAGES.NETWORK_ERROR);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error(API_ERROR_MESSAGES.TIMEOUT_ERROR);
    } else {
      throw new Error(API_ERROR_MESSAGES.GENERIC_ERROR);
    }
  }
};

/**
 * Fetch complete faculty data from the backend by facultyID
 * Reads from individual faculty JSON file (backend/data/faculty/{facultyId}.json)
 * 
 * @param {string} facultyId - Required faculty ID to fetch specific faculty
 * @returns {Promise<Object>} Complete faculty data object
 * @throws {Error} When the API request fails or facultyID not found
 */
export const fetchFacultyData = async (facultyId) => {
  try {
    // facultyId is required
    if (!facultyId) {
      throw new Error('Faculty ID is required');
    }
    
    // Use path parameter instead of query parameter
    const response = await apiClient.get(API_ENDPOINTS.FACULTY_DATA(facultyId));
    const data = response.data;
    
    // Backend returns single faculty object
    if (!data) {
      throw new Error('No faculty data received');
    }
    
    return data;
  } catch (error) {
    // Handle different error types
    if (error.response) {
      // Backend returned an error (404, 500, etc.)
      const errorMsg = error.response.data?.message || `Server error (${error.response.status})`;
      throw new Error(errorMsg);
    } else if (error.request) {
      throw new Error(API_ERROR_MESSAGES.NETWORK_ERROR);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error(API_ERROR_MESSAGES.TIMEOUT_ERROR);
    } else {
      throw error; // Re-throw if it's our custom error
    }
  }
};

/**
 * Validate faculty data structure
 * 
 * @param {Object} data - Faculty data object
 * @returns {boolean} True if data is valid
 */
export const validateFacultyData = (data) => {
  const requiredFields = [
    'personalInfo',
    'about',
    'biography',
    'courses',
    'research',
    'publications',
    'students',
    'news',
    'gallery'
  ];

  return requiredFields.every(field => data && data.hasOwnProperty(field));
};
