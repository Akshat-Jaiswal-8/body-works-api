import { PrismaClient } from '@prisma/client';

import { logger } from './logger.js';

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const shouldLogPrismaQueries =
  process.env.LOG_PRISMA_QUERIES === 'true' && process.env.NODE_ENV !== 'production';

const MAX_PRISMA_QUERY_LOG_LENGTH = 2000;

const truncateForLog = (value: string, maxLength: number) => {
  if (value.length <= maxLength) {
    return value;
  }

  return value.slice(0, maxLength) + '...[truncated]';
};

const prismaLogConfig = shouldLogPrismaQueries
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

  if (shouldLogPrismaQueries) {
    prisma.$on('query', (event) => {
      logger.debug('prisma.query', {
        target: event.target,
        durationMs: event.duration,
        query: truncateForLog(event.query ?? '', MAX_PRISMA_QUERY_LOG_LENGTH),
        params: '[REDACTED]',
      });
    });
  }

  return prisma;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
