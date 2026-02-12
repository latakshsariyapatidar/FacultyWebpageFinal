/**
 * Application Configuration
 * Centralized configuration for the application
 * 
 * @module config/config
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Application configuration object
 */
const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
  },

  // Security
  security: {
    refreshSecretKey: process.env.REFRESH_SECRET_KEY || 'iitdh_faculty_secret_2024',
  },

  // Google Sheets API
  google: {
    credentialsFile: process.env.GOOGLE_CREDENTIALS_FILE || './facultywebpage-e21344a1bd2a.json',
    serviceAccountBase64: process.env.GOOGLE_SERVICE_ACCOUNT_BASE64,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  },

  // Data paths
  paths: {
    root: path.join(__dirname, '..'),
    data: path.join(__dirname, '..', 'data'),
    registryFile: path.join(__dirname, '..', 'data', 'facultyRegistry.json'),
    facultyDataDir: path.join(__dirname, '..', 'data', 'faculty'),
  },

  // Google Sheets configuration
  sheets: {
    names: {
      links: 'Links',
      experience: 'Experience',
      education: 'Education',
      courses: 'Courses',
      researchInterests: 'Research_Interests',
      fundingInfo: 'Funding_Info',
      fundingRequirements: 'Funding_Requirements',
      patents: 'Patents',
      journals: 'Journals',
      conferences: 'Conferences',
      bookChapters: 'Book_Chapters',
      studentInstructions: 'Student_Instructions',
      currentStudents: 'Current_Students',
      graduatedStudents: 'Graduated_Students',
      personalInfo: 'Personal_Info',
      about: 'About',
      researchPositions: 'Research_Positions',
      news: 'News',
      image: 'Image',
      stats: 'Stats',
      resources: 'Resources',
    },
    defaultRange: 'A1:Z100',
  },

  // Validation rules
  validation: {
    facultyId: {
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9._-]+$/,
    },
  },
};

export default config;
