import mongoose from 'mongoose';
import dns from 'dns';

// Fallback to high-reliability public DNS resolvers for mongodb+srv:// SRV lookups
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore in environments where custom DNS servers cannot be set
}

// Globally disable command buffering so queries don't hang for 10,000ms if connection is re-establishing
mongoose.set('bufferCommands', false);

/**
 * Global cache for Mongoose connection across serverless invocations (AWS Lambda / Vercel)
 */
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const mongoURI =
    process.env.MONGO_URI ||
    'mongodb+srv://AayanAnsari:Aayan123@cluster1.jgk7yf7.mongodb.net/mini-instagram?retryWrites=true&w=majority';

  if (!cached.promise || mongoose.connection.readyState === 0) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(mongoURI, opts).then((m) => {
      console.log(`[MongoDB Connected]: ${m.connection.host}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    console.error(`[MongoDB Connection Error]: ${e.message}`);
    throw e;
  }
};

export default connectDB;
