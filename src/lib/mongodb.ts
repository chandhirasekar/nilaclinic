import mongoose from 'mongoose';

const DEFAULT_ATLAS_URI =
  'mongodb://chandhirasekar76_db_user:chandhirasekar%407620@ac-oewk9ja-shard-00-00.uwhh84c.mongodb.net:27017,ac-oewk9ja-shard-00-01.uwhh84c.mongodb.net:27017,ac-oewk9ja-shard-00-02.uwhh84c.mongodb.net:27017/Neelaclinic?ssl=true&replicaSet=atlas-sfvqm2-shard-0&authSource=admin';

const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
  lastFailedTime?: number;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, lastFailedTime: 0 };
}

/**
 * High-performance cached Mongoose connection singleton with connection pooling
 * configured specifically for serverless Next.js App Router on Vercel.
 *
 * NOTE: In serverless environments, serverSelectionTimeoutMS must be short (1500ms)
 * to avoid stalling lambdas for 5+ seconds if MongoDB Atlas IP whitelist drops packets.
 */
export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  // Fast-fail circuit breaker: If connection failed recently (within 60s),
  // immediately serve from in-memory fallback in 0ms without waiting.
  const now = Date.now();
  if (cached.lastFailedTime && now - cached.lastFailedTime < 60000) {
    return null;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 0, // In serverless, minPoolSize must be 0 to prevent stale socket hangs
      serverSelectionTimeoutMS: 1500, // Fast 1.5s timeout: working Atlas connects in <500ms
      connectTimeoutMS: 1500,
      socketTimeoutMS: 3000,
      dbName: 'Neelaclinic',
      autoIndex: false, // Never build indexes during runtime in serverless
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        cached!.lastFailedTime = 0;
        return m;
      })
      .catch((err) => {
        console.warn('MongoDB connection unavailable. Circuit breaker active (60s):', err.message);
        cached!.lastFailedTime = Date.now();
        cached!.promise = null;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.lastFailedTime = Date.now();
    return null;
  }

  return cached.conn;
}

export default connectToDatabase;
