import mongoose from 'mongoose';
import { config } from './index.js';

let isConnected = false;
let reconnectTimer = null;

// Prevent Mongoose from buffering queries indefinitely when offline
mongoose.set('bufferTimeoutMS', 2500);

/**
 * Schedule automatic reconnection retry every 15 seconds
 */
const scheduleReconnect = () => {
  if (reconnectTimer) return;

  reconnectTimer = setInterval(async () => {
    if (mongoose.connection.readyState !== 1 && config.mongoUri) {
      console.log('[MongoDB] Retrying connection to Atlas Cluster in background...');
      try {
        await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
        isConnected = true;
        console.log('[MongoDB] Reconnected to MongoDB Atlas Cluster successfully.');
        clearInterval(reconnectTimer);
        reconnectTimer = null;
      } catch (e) {
        // Continue retry on next interval
      }
    } else if (mongoose.connection.readyState === 1) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }
  }, 15000);
};

/**
 * Connect to MongoDB Atlas
 */
export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  const uri = config.mongoUri;
  if (!uri) {
    console.warn('[MongoDB] MONGODB_URI not provided. Running in resilient local storage mode.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log(`[MongoDB] Connected to Atlas Cluster: ${conn.connection.host} | DB: ${conn.connection.name}`);

    if (reconnectTimer) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from MongoDB Atlas. Enabling background retry.');
      isConnected = false;
      scheduleReconnect();
    });

    return conn.connection;
  } catch (error) {
    console.error('[MongoDB] Initial connection error:', error.message);
    console.warn('[MongoDB] Notice: App will run with resilient local JSON storage until Atlas whitelist is active.');
    isConnected = false;
    scheduleReconnect();
    return null;
  }
};

/**
 * Disconnect from MongoDB (useful for tests and graceful shutdown)
 */
export const disconnectDB = async () => {
  if (reconnectTimer) {
    clearInterval(reconnectTimer);
    reconnectTimer = null;
  }

  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB] Disconnected successfully.');
  }
};

export default connectDB;
