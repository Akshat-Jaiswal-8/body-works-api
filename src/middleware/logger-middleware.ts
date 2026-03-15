import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

import { logger } from '../lib/logger.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getRequestId = (req: Request) => {
  const headerValue = req.header('x-request-id')?.trim();

  if (headerValue && UUID_REGEX.test(headerValue)) {
    return headerValue;
  }

  return randomUUID();
};

const getRequestLogLevel = (statusCode: number) => {
  if (statusCode >= 500) {
    return 'error';
  }

  if (statusCode >= 400) {
    return 'warn';
  }

  return 'info';
};

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = getRequestId(req);
  const requestLogger = logger.child({
    requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  const startedAt = process.hrtime.bigint();
  let responseLogged = false;

  res.locals.logger = requestLogger;
  res.locals.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  requestLogger.info('request.started');

  res.on('finish', () => {
    if (res.locals.requestFailed) {
      responseLogged = true;
      return;
    }

    responseLogged = true;
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    requestLogger.log({
      level: getRequestLogLevel(res.statusCode),
      message: 'request.completed',
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      contentLength: res.getHeader('content-length'),
    });
  });

  res.on('close', () => {
    if (responseLogged) {
      return;
    }

    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    requestLogger.warn('request.aborted', {
      durationMs: Number(durationMs.toFixed(2)),
    });
  });

  next();
};
