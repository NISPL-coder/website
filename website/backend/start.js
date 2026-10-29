#!/usr/bin/env node
// Fallback entry point when platforms execute "node start" or "node start.js"
import('./server.js').catch((err) => {
  console.error('[StartupError] Failed to initialize backend server:', err);
  process.exit(1);
});
