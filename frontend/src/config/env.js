/**
 * Environment Configuration
 * 
 * Environment-specific configuration values.
 * Add your .env variables here with fallbacks.
 * 
 * @module config/env
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  baseUrl: (process.env.REACT_APP_API_URL || '/api').replace(/\/$/, ''),
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
};

/**
 * Feature Flags
 * Control feature availability across environments
 */
export const FEATURES = {
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  enableDebugMode: process.env.NODE_ENV === 'development',
};

/**
 * Application Metadata
 */
export const APP_CONFIG = {
  name: 'Faculty Webpage',
  version: '1.0.0',
  description: 'IIT Dharwad Faculty Information Portal',
};
