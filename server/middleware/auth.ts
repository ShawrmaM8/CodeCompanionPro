import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    emailAddresses: Array<{ emailAddress: string }>;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
  body: any;
  params: any;
  query: any;
}

/**
 * Clerk authentication middleware
 * Verifies JWT tokens from Clerk
 */
export async function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No valid authorization header' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the token with Clerk
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!
    });

    if (!payload || !payload.sub) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    // Attach user info to request
    req.userId = payload.sub;
    req.user = {
      id: payload.sub,
      emailAddresses: payload.email ? [{ emailAddress: payload.email }] : [],
      firstName: payload.given_name || undefined,
      lastName: payload.family_name || undefined,
      imageUrl: payload.picture || undefined,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
}

/**
 * Optional authentication middleware
 * Doesn't fail if no token is provided
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth provided, continue without user
      next();
      return;
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!
    });

    if (payload && payload.sub) {
      req.userId = payload.sub;
      req.user = {
        id: payload.sub,
        emailAddresses: payload.email ? [{ emailAddress: payload.email }] : [],
        firstName: payload.given_name || undefined,
        lastName: payload.family_name || undefined,
        imageUrl: payload.picture || undefined,
      };
    }

    next();
  } catch (error) {
    console.warn('Optional auth failed:', error);
    // Continue without authentication
    next();
  }
}

/**
 * Get current user ID from request
 */
export function getCurrentUserId(req: AuthenticatedRequest): string | undefined {
  return req.userId;
}

/**
 * Get current user from request
 */
export function getCurrentUser(req: AuthenticatedRequest) {
  return req.user;
}
