import rateLimit from 'express-rate-limit';

const isProduction = process.env.NODE_ENV === 'production';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // Keep auth strict in production, but avoid frequent local lockouts.
  max: isProduction ? 10 : 100,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
