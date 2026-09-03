/**
 * @file db.config.ts
 * @description Database connection configuration module.
 * Instantiates and manages Prisma ORM Client connection pool for PostgreSQL / Supabase.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/web3_freelance';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

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