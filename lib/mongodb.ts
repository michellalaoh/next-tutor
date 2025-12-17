import mongoose, { Connection, ConnectOptions } from "mongoose";

/**
 * Shape of the cached connection object that we keep on the Node.js global scope.
 * This avoids creating multiple MongoDB connections during development
 * when Next.js performs hot reloading.
 */
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

// Augment the global type definition so TypeScript knows about `mongoose`.
// We use `declare global` instead of casting to `any` to keep strong typing.
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Reuse the cached connection across hot reloads in development.
// In production, this will always be undefined and a new connection is created once.
const globalForMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache;
};

const cached: MongooseCache =
  globalForMongoose.mongoose ?? { conn: null, promise: null };

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = cached;
}

/**
 * Establish a singleton Mongoose connection.
 *
 * - Uses `MONGODB_URI` from environment variables.
 * - Caches the connection + in‑flight promise to prevent duplicate connections.
 * - Throws a descriptive error if the URI is not configured.
 */
export async function connectToDatabase(): Promise<Connection> {
  if (cached.conn) {
    // Reuse existing database connection
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside your environment configuration."
    );
  }

  if (!cached.promise) {
    const opts: ConnectOptions = {
      // Add common, production‑friendly Mongoose options here.
      // Example: set `maxPoolSize` or `serverSelectionTimeoutMS` if needed.
      bufferCommands: false,
    };

    // Start the connection once and store the in‑flight promise to avoid
    // creating multiple connections in parallel during hot reloads.
    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Ensure a failed connection attempt does not keep a rejected promise cached.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * Optional helper to access the underlying Mongoose instance (models, Schema, etc.)
 * while ensuring a connection has been established.
 */
export async function getMongoose(): Promise<typeof mongoose> {
  await connectToDatabase();
  return mongoose;
}


