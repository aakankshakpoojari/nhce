/**
 * @file app.ts
 * @description Express Application Factory & Router Setup.
 * Configures middleware, security, JSON parsing, master API router, health check, and global error handler.
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import apiRouter from './routes';
import { errorHandler } from './middlewares/errorHandler.middleware';

const app: Express = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Web3 Freelance Platform API',
    timestamp: new Date().toISOString()
  });
});

// Mount Main API Routes under /api
app.use('/api', apiRouter);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
