import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { hostname } from 'os';
import { inspect } from 'util';
import winston from 'winston';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const serviceName = process.env.LOG_SERVICE_NAME || 'body-works-api';
const environment = process.env.NODE_ENV || 'development';
const logLevel = process.env.LOG_LEVEL || (environment === 'production' ? 'info' : 'debug');

const sensitiveKeys = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'password',
  'token',
  'access_token',
  'refresh_token',
  'secret',
  'api_key',
]);

const redactSensitiveData = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((entry) => redactSensitiveData(entry));
  }

  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => {
        if (sensitiveKeys.has(key.toLowerCase())) {
          return [key, '[REDACTED]'];
        }

        return [key, redactSensitiveData(entry)];
      }),
    );
  }

  return value;
};

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: 'Non-Error throwable received',
    value: error,
  };
};

const serializeErrorMetadata = winston.format((info) => {
  for (const [key, value] of Object.entries(info)) {
    if (value instanceof Error) {
      info[key] = serializeError(value);
    }
  }

  return info;
});

const developmentFormat = combine(
  colorize({ level: true }),
  timestamp(),
  errors({ stack: true }),
  serializeErrorMetadata(),
  printf((info) => {
    const { timestamp: loggedAt, level, message, stack, ...meta } = info;
    const metaOutput =
      Object.keys(meta).length > 0
        ? ` ${inspect(meta, { colors: true, depth: null, compact: true })}`
        : '';
    const stackOutput = stack ? `\n${stack}` : '';

    return `${loggedAt} ${level}: ${message}${metaOutput}${stackOutput}`;
  }),
);

const productionFormat = combine(
  timestamp(),
  errors({ stack: true }),
  serializeErrorMetadata(),
  json(),
);

export const logger = winston.createLogger({
  level: logLevel,
  defaultMeta: {
    service: serviceName,
    environment,
    hostname: hostname(),
    pid: process.pid,
  },
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
      format: environment === 'production' ? productionFormat : developmentFormat,
    }),
  ],
});

const getRequestId = (req: Request) => {
  const headerValue = req.header('x-request-id');

  if (headerValue && headerValue.trim().length > 0) {
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
      // An error for this request has already been logged; avoid duplicate completion log.
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

export const getRequestLogger = (res: Response) => {
  return res.locals.logger || logger;
};

export const logControllerError = (
  res: Response,
  message: string,
  error: unknown,
  context: Record<string, unknown> = {},
) => {
  // Mark this response as having encountered a logged error so the
  // request logger can avoid emitting a duplicate completion log.
  if (res.locals) {
    res.locals.requestFailed = true;
  }

  getRequestLogger(res).error(message, {
    ...((redactSensitiveData(context) as Record<string, unknown>) || {}),
    error: serializeError(error),
  });
};

export { redactSensitiveData, serializeError };
