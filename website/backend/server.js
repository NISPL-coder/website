import http from 'http';
import app from './src/app.js';
import { connectDatabase } from './src/config/database.js';
import { env } from './src/config/env.js';

await connectDatabase();

const server = http.createServer(app);

const startServer = () => {
  server.listen(env.PORT, '0.0.0.0', () => {
    console.log(`NISPL API listening on port ${env.PORT}`);

    // Keep-alive self-ping for cloud hosting (e.g. Render) to prevent cold start spin-downs
    const hostingUrl = process.env.RENDER_EXTERNAL_URL || 'https://website-ebxt.onrender.com';
    if (process.env.NODE_ENV === 'production' || process.env.RENDER_EXTERNAL_URL) {
      const pingInterval = 10 * 60 * 1000; // 10 minutes
      setInterval(async () => {
        try {
          const pingUrl = `${hostingUrl.replace(/\/+$/, '')}/health`;
          await fetch(pingUrl, { signal: AbortSignal.timeout(5000) });
        } catch {
          // Ignore background keep-alive ping errors
        }
      }, pingInterval);
    }
  });
};

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[Server] Port ${env.PORT} in use, retrying in 1000ms...`);
    setTimeout(() => {
      startServer();
    }, 1000);
  } else {
    console.error('[Server] Fatal listen error:', err);
    process.exit(1);
  }
});

startServer();

const shutdown = (signal) => {
  console.log(`${signal} received. Closing HTTP server...`);
  server.close(() => process.exit(0));
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
