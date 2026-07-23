import { PrismaClient } from '../prisma/generated/main/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!globalForPrisma.pool) {
  globalForPrisma.pool = new pg.Pool({ connectionString });
}

const pool = globalForPrisma.pool;
const adapter = new PrismaPg(pool);

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
