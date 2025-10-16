import { describe, it, expect, beforeEach } from '@jest/globals';
import { FreeTierTracker, FREE_TIER_LIMITS } from '../middleware/validation';

describe('Free Tier Limits', () => {
  let tracker: FreeTierTracker;

  beforeEach(() => {
    tracker = FreeTierTracker.getInstance();
    // Reset tracker state
    (tracker as any).usage.clear();
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const userId = 'test-user-1';
      const limit = 10;
      const windowMs = 60000; // 1 minute

      // Make 10 requests (at limit)
      for (let i = 0; i < 10; i++) {
        const allowed = tracker.checkLimit(userId, limit, windowMs);
        expect(allowed).toBe(true);
      }
    });

    it('should block requests exceeding limit', () => {
      const userId = 'test-user-2';
      const limit = 5;
      const windowMs = 60000; // 1 minute

      // Make 5 requests (at limit)
      for (let i = 0; i < 5; i++) {
        const allowed = tracker.checkLimit(userId, limit, windowMs);
        expect(allowed).toBe(true);
      }

      // 6th request should be blocked
      const allowed = tracker.checkLimit(userId, limit, windowMs);
      expect(allowed).toBe(false);
    });

    it('should reset limits after window expires', () => {
      const userId = 'test-user-3';
      const limit = 3;
      const windowMs = 100; // 100ms window

      // Exhaust limit
      for (let i = 0; i < 3; i++) {
        tracker.checkLimit(userId, limit, windowMs);
      }

      // Should be blocked
      expect(tracker.checkLimit(userId, limit, windowMs)).toBe(false);

      // Wait for window to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          // Should be allowed again
          expect(tracker.checkLimit(userId, limit, windowMs)).toBe(true);
          resolve(undefined);
        }, 150);
      });
    });
  });

  describe('Free Tier Constants', () => {
    it('should have correct project limits', () => {
      expect(FREE_TIER_LIMITS.PROJECTS).toBe(5);
    });

    it('should have correct code analysis limits', () => {
      expect(FREE_TIER_LIMITS.CODE_ANALYSES_PER_DAY).toBe(10);
    });

    it('should have correct file size limits', () => {
      expect(FREE_TIER_LIMITS.FILE_SIZE_MB).toBe(1);
    });

    it('should have correct code size limits', () => {
      expect(FREE_TIER_LIMITS.CODE_SIZE_KB).toBe(10);
    });
  });

  describe('Usage Tracking', () => {
    it('should track remaining requests correctly', () => {
      const userId = 'test-user-4';
      const limit = 10;

      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        tracker.checkLimit(userId, limit, 60000);
      }

      const remaining = tracker.getRemainingRequests(userId, limit);
      expect(remaining).toBe(7);
    });

    it('should return correct reset time', () => {
      const userId = 'test-user-5';
      const limit = 5;
      const windowMs = 60000; // 1 minute

      tracker.checkLimit(userId, limit, windowMs);
      const resetTime = tracker.getResetTime(userId);

      expect(resetTime).toBeInstanceOf(Date);
      expect(resetTime!.getTime()).toBeGreaterThan(Date.now());
    });
  });
});
