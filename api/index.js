import app from '../backend/app.js';
import connectDB from '../backend/config/db.js';

/**
 * Vercel Serverless Function Handler
 * Wraps the Express application for event-driven serverless execution.
 */
export default async function handler(req, res) {
  // Ensure database connection is active or pooled
  try {
    if (process.env.MONGO_URI) {
      await connectDB();
    }
  } catch (error) {
    console.error('Failed to connect to database in serverless function:', error.message);
  }

  // Forward request to Express application
  return app(req, res);
}
