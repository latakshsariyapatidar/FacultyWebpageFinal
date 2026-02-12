/**
 * Logger Utility
 * Centralized logging with consistent formatting
 * 
 * @module utils/logger
 */

/**
 * Log levels with emoji indicators
 */
const logger = {
  /**
   * Log success message
   * @param {string} message - Message to log
   */
  success: (message) => {
    console.log(`✅ ${message}`);
  },

  /**
   * Log error message
   * @param {string} message - Message to log
   * @param {Error} [error] - Optional error object
   */
  error: (message, error = null) => {
    console.error(`❌ ${message}`);
    if (error) {
      console.error(error);
    }
  },

  /**
   * Log info message
   * @param {string} message - Message to log
   */
  info: (message) => {
    console.log(`ℹ️  ${message}`);
  },

  /**
   * Log warning message
   * @param {string} message - Message to log
   */
  warn: (message) => {
    console.warn(`⚠️  ${message}`);
  },

  /**
   * Log refresh/update message
   * @param {string} message - Message to log
   */
  refresh: (message) => {
    console.log(`🔄 ${message}`);
  },

  /**
   * Log delete message
   * @param {string} message - Message to log
   */
  delete: (message) => {
    console.log(`🗑️  ${message}`);
  },

  /**
   * Log creation message
   * @param {string} message - Message to log
   */
  create: (message) => {
    console.log(`✨ ${message}`);
  },

  /**
   * Log document/file message
   * @param {string} message - Message to log
   */
  document: (message) => {
    console.log(`📄 ${message}`);
  },

  /**
   * Log stats message
   * @param {string} message - Message to log
   */
  stats: (message) => {
    console.log(`📊 ${message}`);
  },
};

export default logger;
