import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

export const generationRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxGenerations,
  message: {
    success: false,
    error: 'Too many generation requests from this IP. Please wait a few minutes before generating more images.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
