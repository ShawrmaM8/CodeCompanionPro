import { Request, Response, NextFunction } from 'express';

interface MonitoringData {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastReset: number;
}

class MonitoringService {
  private static instance: MonitoringService;
  private data: MonitoringData = {
    requestCount: 0,
    errorCount: 0,
    averageResponseTime: 0,
    lastReset: Date.now()
  };

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  recordRequest(responseTime: number) {
    this.data.requestCount++;
    this.data.averageResponseTime = 
      (this.data.averageResponseTime * (this.data.requestCount - 1) + responseTime) / this.data.requestCount;
  }

  recordError() {
    this.data.errorCount++;
  }

  getStats(): MonitoringData & { 
    errorRate: number; 
    requestsPerMinute: number;
    uptime: number;
  } {
    const now = Date.now();
    const uptime = now - this.data.lastReset;
    const minutes = uptime / (1000 * 60);
    
    return {
      ...this.data,
      errorRate: this.data.requestCount > 0 ? (this.data.errorCount / this.data.requestCount) * 100 : 0,
      requestsPerMinute: minutes > 0 ? this.data.requestCount / minutes : 0,
      uptime
    };
  }

  reset() {
    this.data = {
      requestCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      lastReset: Date.now()
    };
  }
}

// Request monitoring middleware
export function requestMonitoring(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const monitoring = MonitoringService.getInstance();

  // Record response time
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    monitoring.recordRequest(responseTime);
  });

  // Record errors
  res.on('error', () => {
    monitoring.recordError();
  });

  next();
}

// Error monitoring middleware
export function errorMonitoring(err: any, req: Request, res: Response, next: NextFunction) {
  const monitoring = MonitoringService.getInstance();
  monitoring.recordError();

  console.error('Request error:', {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  next(err);
}

// Health check endpoint
export function healthCheck(req: Request, res: Response) {
  const monitoring = MonitoringService.getInstance();
  const stats = monitoring.getStats();

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: stats.uptime,
    stats: {
      totalRequests: stats.requestCount,
      errorRate: `${stats.errorRate.toFixed(2)}%`,
      averageResponseTime: `${stats.averageResponseTime.toFixed(2)}ms`,
      requestsPerMinute: stats.requestsPerMinute.toFixed(2)
    },
    limits: {
      freeTier: {
        projects: 5,
        codeAnalysesPerDay: 10,
        mascotChatsPerDay: 50
      }
    }
  };

  res.json(health);
}

// Usage statistics endpoint
export function usageStats(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const monitoring = MonitoringService.getInstance();
  const stats = monitoring.getStats();

  // Calculate user's usage for the current period
  const userUsage = {
    userId: user.id,
    subscriptionTier: user.subscriptionTier,
    currentPeriod: {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    limits: {
      free: {
        projects: 5,
        codeAnalysesPerDay: 10,
        mascotChatsPerDay: 50
      },
      pro: {
        projects: 15,
        codeAnalysesPerDay: 50,
        mascotChatsPerDay: 200
      },
      premium: {
        projects: -1, // unlimited
        codeAnalysesPerDay: -1, // unlimited
        mascotChatsPerDay: -1 // unlimited
      }
    },
    usage: {
      // This would be calculated from actual database queries
      projects: 0,
      codeAnalyses: 0,
      mascotChats: 0
    }
  };

  res.json(userUsage);
}

// Free tier limit monitoring
export function checkFreeTierUsage(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  
  if (user?.subscriptionTier === 'free') {
    // Add usage headers to response
    res.set({
      'X-RateLimit-Limit': '10',
      'X-RateLimit-Remaining': '9',
      'X-RateLimit-Reset': new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });
  }

  next();
}

export { MonitoringService };
