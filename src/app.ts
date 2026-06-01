import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';

import { generalLimiter } from './helpers/rate-limiter.js';
import { logger, serializeError } from './lib/logger.js';
import { requestLoggerMiddleware } from './middleware/logger-middleware.js';
import loginRoutes from './routes/auth-routes.js';
import bodyPartsRoutes from './routes/body-parts-routes.js';
import equipmentsRoutes from './routes/equipments-routes.js';
import exerciseRoutes from './routes/exercise-routes.js';
import routinesRoutes from './routes/routines-routes.js';
import targetMusclesRoutes from './routes/target-muscles-routes.js';
import usersRoutes from './routes/users-routes.js';

dotenv.config();

export const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set('trust proxy', 1);
app.use(requestLoggerMiddleware);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins || false : true,
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(compression());

app.use(generalLimiter);

app.use('/api/v1/auth', loginRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/bodyParts', bodyPartsRoutes);
app.use('/api/v1/targetMuscles', targetMusclesRoutes);
app.use('/api/v1/equipments', equipmentsRoutes);
app.use('/api/v1/routines', routinesRoutes);
app.use('/api/v1/users', usersRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  });
  res.json({
    message:
      'Welcome to body works api! Review all the endpoints here: https://github.com/Akshat-Jaiswal-8/body-works-api.git',
    version: '1.1.0',
    status: 'active',
  });
});

app.use('*', (_req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'The requested resource does not exist',
  });
});

app.use((err, req, res, _next) => {
  const requestLogger = res.locals.logger || logger;
  const statusCode =
    typeof err?.status === 'number'
      ? err.status
      : typeof err?.statusCode === 'number'
        ? err.statusCode
        : 500;

  requestLogger.error('request.failed', {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    error: serializeError(err),
  });

  if (process.env.NODE_ENV === 'production') {
    res.status(statusCode).json({
      error: 'Internal server error',
      message: 'Something went wrong',
    });
  } else {
    res.status(statusCode).json({
      error: 'Internal server error',
      message: err.message,
      stack: err.stack,
    });
  }
});
