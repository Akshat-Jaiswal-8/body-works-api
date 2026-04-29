import { app } from './app.js';
import { logger, serializeError } from './lib/logger.js';

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  logger.info('server.started', {
    port: Number(PORT),
    environment: process.env.NODE_ENV || 'development',
  });
});

let shutdownStarted = false;

const shutdown = (reason: string, exitCode = 0) => {
  if (shutdownStarted) {
    return;
  }

  shutdownStarted = true;
  logger.info('server.shutdown.started', { reason, exitCode });

  server.close((error) => {
    if (error) {
      logger.error('server.shutdown.failed', {
        reason,
        error: serializeError(error),
      });
      process.exit(1);
    }

    logger.info('server.shutdown.completed', { reason, exitCode });
    process.exit(exitCode);
  });

  setTimeout(() => {
    logger.error('server.shutdown.timeout', {
      reason,
      timeoutMs: 10000,
    });
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => {
  shutdown('SIGTERM', 0);
});

process.on('SIGINT', () => {
  shutdown('SIGINT', 0);
});

process.on('unhandledRejection', (reason) => {
  logger.error('process.unhandledRejection', {
    error:
      reason instanceof Error
        ? serializeError(reason)
        : { message: 'Unhandled rejection', value: reason },
  });
  shutdown('UNHANDLED_REJECTION', 1);
});

process.on('uncaughtException', (error) => {
  logger.error('process.uncaughtException', {
    error: serializeError(error),
  });
  shutdown('UNCAUGHT_EXCEPTION', 1);
});
