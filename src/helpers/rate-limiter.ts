import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20000,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    error: 'Rate limit exceeded for this endpoint.',
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
