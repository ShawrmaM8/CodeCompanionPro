import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../index';
import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  describe('API Response Times', () => {
    it('should respond to user requests within 200ms', async () => {
      const start = performance.now();
      
      await request(app)
        .get('/api/user')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(200);
    });

    it('should respond to code analysis within 5 seconds', async () => {
      const start = performance.now();
      
      await request(app)
        .post('/api/code-analysis')
        .set('Authorization', 'Bearer mock-token')
        .send({
          code: 'function test() { return "hello"; }',
          fileName: 'test.js'
        })
        .expect(200);
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Database Performance', () => {
    it('should handle concurrent user requests', async () => {
      const concurrentRequests = 10;
      const promises = Array(concurrentRequests).fill(null).map(() =>
        request(app)
          .get('/api/user')
          .set('Authorization', 'Bearer mock-token')
      );

      const start = performance.now();
      const responses = await Promise.all(promises);
      const duration = performance.now() - start;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should handle concurrency efficiently
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during code analysis', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform multiple code analyses
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/code-analysis')
          .set('Authorization', 'Bearer mock-token')
          .send({
            code: `function test${i}() { return ${i}; }`,
            fileName: `test${i}.js`
          });
      }

      // Force garbage collection
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});
