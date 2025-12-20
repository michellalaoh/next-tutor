import mongoose, { Mongoose } from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null };
}

// Initialize the cached connection object
const cached: { conn: Mongoose | null; promise: Promise<Mongoose> | null } = global.mongoose || {
  conn: null,
  promise: null,
};

// Assign to global in development to persist across hot reloads
if (process.env.NODE_ENV !== 'production') {
  global.mongoose = cached;
}

/**
 * Connects to MongoDB using Mongoose.
 * Uses connection caching to prevent multiple connections during development.
 * 
 * @returns {Promise<Mongoose>} The Mongoose connection instance
 * @throws {Error} If MONGODB_URI is not defined or connection fails
 */
async function connectDB(): Promise<Mongoose> {
  // Check if MongoDB URI is provided
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  // Return cached connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing promise if connection is in progress
  if (cached.promise) {
    return cached.promise;
  }

  // Validate connection string format
  if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MONGODB_URI format. Must start with mongodb:// or mongodb+srv://');
  }

  // Create new connection promise with better options
  const opts: mongoose.ConnectOptions = {
    bufferCommands: false, // Disable mongoose buffering
    serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    socketTimeoutMS: 45000, // 45 seconds socket timeout
    connectTimeoutMS: 10000, // 10 seconds connection timeout
  };

  cached.promise = mongoose
    .connect(MONGODB_URI, opts)
    .then((mongooseInstance: Mongoose) => {
      // Store the connection instance
      cached.conn = mongooseInstance;
      console.log('✅ MongoDB connected successfully');
      return mongooseInstance;
    })
    .catch((error: Error) => {
      // Clear promise on error to allow retry
      cached.promise = null;
      console.error('❌ MongoDB connection error:', error.message);
      
      // Provide more helpful error messages
      if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        throw new Error('Cannot resolve MongoDB hostname. Check your connection string and network connection.');
      } else if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
        throw new Error('MongoDB authentication failed. Check your username and password in the connection string.');
      } else if (error.message.includes('timeout')) {
        throw new Error('MongoDB connection timeout. Check your network connection and IP whitelist (if using MongoDB Atlas).');
      } else if (error.message.includes('IP')) {
        throw new Error('Your IP address is not whitelisted in MongoDB Atlas. Add your IP to the Network Access list.');
      }
      
      throw error;
    });

  return cached.promise;
}

/**
 * Disconnects from MongoDB.
 * Useful for cleanup in tests or when shutting down the application.
 * 
 * @returns {Promise<void>}
 */
async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

export { connectDB, disconnectDB };
export default connectDB;

