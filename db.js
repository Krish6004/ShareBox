require("dotenv").config();
const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Track connection lifecycle events
if (!global.mongooseListenersRegistered) {
  mongoose.connection.on("connected", () => {
    // console.log("MongoDB connection event: connected");
  });
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection event error:", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    if (cached) {
      cached.conn = null;
      cached.promise = null;
    }
  });
  global.mongooseListenersRegistered = true;
}

async function connectDB() {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === "") {
    return null;
  }

  // If already connected and ready, return existing connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise || mongoose.connection.readyState === 0) {
    const opts = {
      bufferCommands: false, // Fail fast if disconnected rather than hanging
      maxPoolSize: 10,       // Connection pooling optimized for Atlas and serverless
      minPoolSize: 2,        // Maintain warm connections
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if cluster is unreachable
      socketTimeoutMS: 45000,
      dbName: "quickshare",  // Use quickshare database
    };

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((m) => {
        cached.conn = m;
        return m;
      })
      .catch((err) => {
        cached.conn = null;
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.conn = null;
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
