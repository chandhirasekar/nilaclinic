import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/miosalon_neelaclinic';

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('Connected to MongoDB successfully.');
      return m;
    }).catch((err) => {
      console.warn('MongoDB live connection fallback active:', err.message);
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    return null;
  }

  return cached.conn;
}
