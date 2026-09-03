/**
 * @file db.config.ts
 * @description Database connection configuration module.
 * Instantiates and manages Prisma ORM Client connection pool for PostgreSQL / Supabase.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
});

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('Database connected successfully via Prisma ORM.');
  } catch (error) {
    console.error('Failed to connect to Database:', error);
    throw error;
  }
}