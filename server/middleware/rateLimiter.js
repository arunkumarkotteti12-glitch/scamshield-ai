import rateLimit from 'express-rate-limit';

// Limit scan requests to prevent Gemini API quota abuse
export const scanRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the scan rate limit. Please try again in a few minutes.'
  }
});
