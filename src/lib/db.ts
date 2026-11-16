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

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (cached.conn) {
    return cached.conn;
  }

  // Fast-fail circuit breaker: If connection failed recently (within 60s),
  // don't stall serverless functions waiting for network timeouts.
  const now = Date.now();
  if (cached.lastFailedTime && now - cached.lastFailedTime < 60000) {
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 1500, // Fast 1.5s timeout for serverless
      connectTimeoutMS: 1500,
      socketTimeoutMS: 2000,
      dbName: 'Neelaclinic',
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        console.log('Connected to MongoDB Atlas (Neelaclinic) successfully.');
        cached!.lastFailedTime = 0;
        return m;
      })
      .catch((err) => {
        console.warn('MongoDB Atlas connection unavailable (IP whitelist or network). Serving fast in-memory store:', err.message);
        cached!.lastFailedTime = Date.now();
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
