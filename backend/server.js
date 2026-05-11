/**
 * Faculty Webpage Backend Server
 * Main application entry point - MVC Architecture
 * 
 * This server implements a clean MVC (Model-View-Controller) architecture:
 * - Models: Data access layer (models/facultyModel.js)
 * - Controllers: Business logic and request handlers (controllers/facultyController.js)
 * - Routes: API endpoint definitions (routes/)
 * - Services: External integrations like Google Sheets (services/)
 * - Middleware: Request processing and validation (middleware/)
 * - Config: Application configuration (config/config.js)
 * - Utils: Helper functions and utilities (utils/)
 * 
 * @module server
 * @version 2.0.0
 */

import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import { facultyRoutes, healthRoutes } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import { getFacultyCount } from './models/facultyModel.js';
import morgan from 'morgan';

// Initialize Express app
const app = express();

// ==================== MIDDLEWARE ====================

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Request logging middleware (development only)
if (config.server.env === 'development') {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });
}

// Development logging
if ((process.env.NODE_ENV || "").trim() === "development") {
    app.use(morgan('dev'));
}
// ==================== ROUTES ====================

// Health check route
app.use('/health', healthRoutes);

// Faculty management API routes
app.use('/api/faculty', facultyRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// ==================== SERVER STARTUP ====================

const PORT = config.server.port;


const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.success('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('\nSIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.success('Server closed');
    process.exit(0);
  });
});

export default app;
