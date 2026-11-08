import mongoose from 'mongoose';
import dns from 'dns';

// Fallback to high-reliability public DNS resolvers for mongodb+srv:// SRV lookups
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore in environments where custom DNS servers cannot be set
}

/**
 * Global cache for Mongoose connection across serverless invocations (AWS Lambda / Vercel)
 */
let cachedConnection = null;

const connectDB = async () => {
  // If connection is already active or connecting, reuse it immediately
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mini-instagram';

  try {
    cachedConnection = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false, // Disable Mongoose buffering for serverless functions
    });
    console.log(`[MongoDB Connected]: ${cachedConnection.connection.host}`);
    return cachedConnection;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // Only exit in standalone container or non-serverless mode
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
