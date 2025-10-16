import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Validation schemas for free tier limits
export const freeTierValidation = {
  // Project limits
  projectLimit: (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (user?.subscriptionTier === 'free') {
      // Check project count limit
      // This would be implemented in the route handler
      next();
    } else {
      next();
    }
  },

  // Code analysis limits
  codeAnalysisLimit: (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (user?.subscriptionTier === 'free') {
      // Check daily analysis limit
      // This would be implemented with a counter in the database
      next();
    } else {
      next();
    }
  },

  // File size limits
  fileSizeLimit: (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSize = 1024 * 1024; // 1MB for free tier
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'File too large',
        message: 'File size exceeds the free tier limit of 1MB',
        maxSize: maxSize
      });
    }
    
    next();
  }
};

// Request validation schemas
export const validationSchemas = {
  codeAnalysis: z.object({
    code: z.string().min(1).max(10000), // 10KB code limit for free tier
    fileName: z.string().optional(),
    projectId: z.string().uuid().optional()
  }),

  project: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500),
    language: z.string().max(50),
    framework: z.string().max(50)
  }),

  mascotChat: z.object({
    message: z.string().min(1).max(1000), // 1KB message limit
    context: z.object({}).optional()
  })
};

// Middleware to validate request body
export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid request data',
          details: error.errors
        });
      }
      next(error);
    }
  };
}

// Free tier usage tracking
export class FreeTierTracker {
  private static instance: FreeTierTracker;
  private usage: Map<string, { requests: number; resetTime: number }> = new Map();

  static getInstance(): FreeTierTracker {
    if (!FreeTierTracker.instance) {
      FreeTierTracker.instance = new FreeTierTracker();
    }
    return FreeTierTracker.instance;
  }

  checkLimit(userId: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const userUsage = this.usage.get(userId);

    if (!userUsage || now > userUsage.resetTime) {
      // Reset or initialize
      this.usage.set(userId, {
        requests: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (userUsage.requests >= limit) {
      return false;
    }

    userUsage.requests++;
    return true;
  }

  getRemainingRequests(userId: string, limit: number): number {
    const userUsage = this.usage.get(userId);
    if (!userUsage) return limit;
    return Math.max(0, limit - userUsage.requests);
  }

  getResetTime(userId: string): Date | null {
    const userUsage = this.usage.get(userId);
    if (!userUsage) return null;
    return new Date(userUsage.resetTime);
  }
}

// Free tier limits
export const FREE_TIER_LIMITS = {
  PROJECTS: 5,
  CODE_ANALYSES_PER_DAY: 10,
  MASCOT_CHATS_PER_DAY: 50,
  FILE_SIZE_MB: 1,
  CODE_SIZE_KB: 10,
  MESSAGE_SIZE_KB: 1
};

// Middleware to check free tier limits
export function checkFreeTierLimit(limitType: keyof typeof FREE_TIER_LIMITS) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (user?.subscriptionTier !== 'free') {
      return next();
    }

    const tracker = FreeTierTracker.getInstance();
    const limit = FREE_TIER_LIMITS[limitType];
    const windowMs = 24 * 60 * 60 * 1000; // 24 hours

    if (!tracker.checkLimit(user.id, limit, windowMs)) {
      const resetTime = tracker.getResetTime(user.id);
      return res.status(429).json({
        error: 'Free tier limit exceeded',
        message: `You have reached your daily limit of ${limit} ${limitType.toLowerCase()}`,
        resetTime: resetTime?.toISOString(),
        upgradeUrl: '/subscription'
      });
    }

    next();
  };
}
