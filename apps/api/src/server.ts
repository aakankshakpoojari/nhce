/**
 * @file server.ts
 * @description Application Server Listener Entry Point.
 * Establishes DB connection via Prisma ORM, starts 72-Hour Auto-Release Cron job, and opens HTTP listener on target PORT.
 */

import { createServer } from 'http';
import app from './app';
import { env } from './config/env.config';
import { connectDB } from './config/db.config';
import { autoReleaseCron } from './services/cron/autoRelease.cron';
import { initSocket } from './realtime/socket';

async function bootstrap() {
  console.log('Starting Web3 Freelance Platform Express Backend Services...');

  // Connect to Database
  await connectDB();

  // Start Background Cron Services
  autoReleaseCron.start();

  // Start HTTP Server (Express + Socket.IO share the same listener)
  const PORT = env.PORT || 3001;
  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Realtime (Socket.IO) gateway attached`);
    console.log(` Targeting EVM Devnet: Sepolia (${env.SEPOLIA_RPC_URL})`);
    console.log(` Environment: ${env.NODE_ENV}`);
    console.log(`=======================================================`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal error during server bootstrap:', err);
  process.exit(1);
});
