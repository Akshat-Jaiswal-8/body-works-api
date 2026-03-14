import { PrismaClient } from '@prisma/client';

import { logger } from './logger.js';

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const prismaLogConfig =
  process.env.LOG_PRISMA_QUERIES === 'true'
    ? [
        { emit: 'event' as const, level: 'query' as const },
        { emit: 'event' as const, level: 'warn' as const },
        { emit: 'event' as const, level: 'error' as const },
      ]
    : [
        { emit: 'event' as const, level: 'warn' as const },
        { emit: 'event' as const, level: 'error' as const },
      ];

const createPrismaClient = () => {
  const prisma = new PrismaClient({
    log: prismaLogConfig,
  });

  prisma.$on('warn', (event) => {
    logger.warn('prisma.warn', {
      target: event.target,
      message: event.message,
    });
  });

  prisma.$on('error', (event) => {
    logger.error('prisma.error', {
      target: event.target,
      message: event.message,
    });
  });

  if (process.env.LOG_PRISMA_QUERIES === 'true') {
    prisma.$on('query', (event) => {
      logger.debug('prisma.query', {
        target: event.target,
        durationMs: event.duration,
        query: event.query,
        params: event.params,
      });
    });
  }

  return prisma;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
