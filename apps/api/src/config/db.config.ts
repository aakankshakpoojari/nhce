/**
 * @file db.config.ts
 * @description Database connection configuration module.
 * Instantiates and manages Prisma ORM Client connection pool for PostgreSQL / Supabase.
 */

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error('DIRECT_URL is not defined in environment variables');
}

const adapter = new PrismaPg({
  connectionString,
});

export const prisma = new PrismaClient({
  adapter,
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