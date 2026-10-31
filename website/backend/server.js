import app from './src/app.js';
import { connectDatabase } from './src/config/database.js';
import { env } from './src/config/env.js';

await connectDatabase();

const server = app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`NISPL API listening on port ${env.PORT}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Closing HTTP server...`);
  server.close(() => process.exit(0));
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
