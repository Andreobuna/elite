import { PrismaClient } from '@prisma/client';
import { env } from './env';

const databaseUrl = env.databaseUrl || env.databaseUrlPooler;
if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}
if (env.directUrl) {
  process.env.DIRECT_URL = env.directUrl;
}

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Prevents exhausting DB connections from hot-reloads in development.
export const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
