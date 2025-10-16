import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Free tier rate limiting
export const freeTierLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes for free tier
  message: {
    error: 'Rate limit exceeded',
    message: 'You have exceeded the free tier rate limit. Please upgrade to Pro for higher limits.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for authenticated users with higher tiers
  skip: (req: Request) => {
    const user = (req as any).user;
    return user?.subscriptionTier === 'pro' || user?.subscriptionTier === 'premium';
  }
});

// Pro tier rate limiting
export const proTierLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per 15 minutes for pro tier
  message: {
    error: 'Rate limit exceeded',
    message: 'You have exceeded the pro tier rate limit.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    const user = (req as any).user;
    return user?.subscriptionTier === 'premium';
  }
});

// Premium tier rate limiting
export const premiumTierLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes for premium tier
  message: {
    error: 'Rate limit exceeded',
    message: 'You have exceeded the premium tier rate limit.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// HuggingFace API rate limiting (monthly limits)
export const huggingFaceLimiter = rateLimit({
  windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
  max: 1000, // 1000 requests per month (free tier)
  message: {
    error: 'Monthly API limit exceeded',
    message: 'You have reached your monthly HuggingFace API limit. Please try again next month.',
    retryAfter: '30 days'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Store rate limit info in memory (in production, use Redis)
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    return `hf_limit_${user?.id || 'anonymous'}`;
  }
});

// Database query optimization
export const databaseLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 database queries per minute
  message: {
    error: 'Database rate limit exceeded',
    message: 'Too many database queries. Please slow down your requests.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// File upload limits
export const fileUploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 file uploads per minute
  message: {
    error: 'File upload rate limit exceeded',
    message: 'Too many file uploads. Please wait before uploading more files.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Code analysis limits
export const codeAnalysisLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 code analyses per minute
  message: {
    error: 'Code analysis rate limit exceeded',
    message: 'Too many code analysis requests. Please wait before analyzing more code.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Mascot chat limits
export const mascotChatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 mascot interactions per minute
  message: {
    error: 'Mascot chat rate limit exceeded',
    message: 'Too many mascot interactions. Please wait before chatting again.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Get appropriate rate limiter based on user tier
export function getRateLimiterForTier(tier: 'free' | 'pro' | 'premium') {
  switch (tier) {
    case 'free':
      return freeTierLimiter;
    case 'pro':
      return proTierLimiter;
    case 'premium':
      return premiumTierLimiter;
    default:
      return freeTierLimiter;
  }
}

// Middleware to apply tier-specific rate limiting
export function applyTierRateLimit(req: Request, res: Response, next: Function) {
  const user = (req as any).user;
  const tier = user?.subscriptionTier || 'free';
  
  const limiter = getRateLimiterForTier(tier);
  return limiter(req, res, next);
}
