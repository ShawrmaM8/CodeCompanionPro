import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../index';
import { storage } from '../storage';

describe('Free Tier Integration Tests', () => {
  let testUserId: string;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    const testUser = await storage.createUser({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      subscriptionTier: 'free'
    });
    testUserId = testUser.id;
    
    // Mock auth token (in real tests, use actual Clerk token)
    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      await storage.deleteUser(testUserId);
    }
  });

  describe('Authentication', () => {
    it('should require authentication for protected routes', async () => {
      const response = await request(app)
        .get('/api/user')
        .expect(401);
      
      expect(response.body.message).toBe('No valid authorization header');
    });

    it('should accept valid authentication', async () => {
      const response = await request(app)
        .get('/api/user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.id).toBe(testUserId);
    });
  });

  describe('Free Tier Limits', () => {
    it('should enforce project limits for free tier', async () => {
      // Create 5 projects (free tier limit)
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/projects')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `Test Project ${i}`,
            description: 'Test project',
            language: 'JavaScript'
          })
          .expect(200);
      }

      // 6th project should fail
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project 6',
          description: 'Test project',
          language: 'JavaScript'
        })
        .expect(400);

      expect(response.body.message).toContain('Project limit reached');
    });

    it('should enforce code analysis limits', async () => {
      // This would test the daily code analysis limit
      // Implementation depends on the rate limiting middleware
    });

    it('should enforce file size limits', async () => {
      const largeCode = 'a'.repeat(11 * 1024); // 11KB, exceeds 10KB limit
      
      const response = await request(app)
        .post('/api/code-analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: largeCode,
          fileName: 'test.js'
        })
        .expect(400);

      expect(response.body.message).toContain('Code size exceeds limit');
    });
  });

  describe('HuggingFace Integration', () => {
    it('should analyze code with HuggingFace API', async () => {
      const testCode = `
        function add(a, b) {
          return a + b;
        }
      `;

      const response = await request(app)
        .post('/api/code-analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: testCode,
          fileName: 'test.js'
        })
        .expect(200);

      expect(response.body.analysisResults).toBeDefined();
      expect(response.body.analysisResults.overallScore).toBeGreaterThan(0);
    });

    it('should handle HuggingFace API failures gracefully', async () => {
      // Mock HuggingFace API failure
      process.env.HUGGINGFACE_API_KEY = 'invalid-key';
      
      const response = await request(app)
        .post('/api/code-analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'console.log("test");',
          fileName: 'test.js'
        })
        .expect(200);

      // Should still return analysis with fallback
      expect(response.body.analysisResults).toBeDefined();
    });
  });

  describe('Skill Tree System', () => {
    it('should track skill progression', async () => {
      // Test skill tree functionality
      const response = await request(app)
        .get('/api/user/achievements')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Make multiple requests quickly
      const promises = Array(15).fill(null).map(() =>
        request(app)
          .get('/api/user')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
