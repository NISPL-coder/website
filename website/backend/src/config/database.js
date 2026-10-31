import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';

// Resolve SRV records using public DNS servers (fixes querySrv ECONNREFUSED on networks where local DNS blocks SRV queries)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch {
  // Ignore if setting custom DNS servers is not supported in the runtime environment
}

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

