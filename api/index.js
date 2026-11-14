import app from '../backend/app.js';
import connectDB from '../backend/config/db.js';

/**
 * Vercel Serverless Function Handler
 * Wraps the Express application for event-driven serverless execution.
 */
export default async function handler(req, res) {
  // Ensure database connection is active or pooled before processing request
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection error in serverless handler:', error.message);
    // If an API request requires database and connection failed, return 503 early
    if (req.url && (req.url.startsWith('/api') || req.url.startsWith('/api/v1')) && !req.url.includes('/health')) {
      return res.status(503).json({
        success: false,
        message: 'Database connection error. Please try again in a moment.',
        error: error.message,
      });
    }
  }

  // Forward request to Express application
  return app(req, res);
}
