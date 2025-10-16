// Jest setup file for CodeCompanionPro
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.CLERK_SECRET_KEY = 'sk_test_mock_key';
process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_mock_key';
process.env.HUGGINGFACE_API_KEY = 'hf_mock_key';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch for HuggingFace API calls
global.fetch = jest.fn();

// Mock WebSocket for real-time features
global.WebSocket = jest.fn(() => ({
  close: jest.fn(),
  send: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Set test timeout
jest.setTimeout(10000);
