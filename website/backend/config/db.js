import mongoose from 'mongoose';
import { config } from './index.js';

let isConnected = false;

/**
 * Connect to MongoDB Atlas
 */
export const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  const uri = config.mongoUri;
  if (!uri) {
    console.warn('[MongoDB] MONGODB_URI not provided. Skipping database connection.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log(`[MongoDB] Connected to Atlas Cluster: ${conn.connection.host} | DB: ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from MongoDB Atlas.');
      isConnected = false;
    });

    return conn.connection;
  } catch (error) {
    console.error('[MongoDB] Initial connection error:', error.message);
    // Don't crash process completely so server can report DB status
    return null;
  }
};

/**
 * Disconnect from MongoDB (useful for tests and graceful shutdown)
 */
export const disconnectDB = async () => {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB] Disconnected successfully.');
  }
};

export default connectDB;
