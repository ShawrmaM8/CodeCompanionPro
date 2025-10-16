# 🧪 CodeCompanionPro Testing Guide

## **Testing Strategy**

### **🎯 Test Categories**

1. **Unit Tests** - Individual components
2. **Integration Tests** - API endpoints
3. **Performance Tests** - Response times and limits
4. **Free Tier Tests** - Rate limiting and constraints
5. **End-to-End Tests** - Complete user workflows

## **🔧 Test Setup**

### **Prerequisites**
```bash
# Install testing dependencies
npm install --save-dev jest supertest @types/jest @types/supertest

# Install additional testing tools
npm install --save-dev @jest/globals
```

### **Test Configuration**
Create `jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
```

## **📋 Test Checklist**

### **✅ Authentication Tests**
- [ ] User registration with Clerk
- [ ] User login/logout
- [ ] Protected route access
- [ ] Token validation
- [ ] Session management

### **✅ Free Tier Limit Tests**
- [ ] Project creation limits (5 for free tier)
- [ ] Code analysis limits (10/day for free tier)
- [ ] Mascot chat limits (50/day for free tier)
- [ ] File size limits (1MB for free tier)
- [ ] Code size limits (10KB for free tier)

### **✅ API Endpoint Tests**
- [ ] Health check endpoints
- [ ] User management endpoints
- [ ] Project CRUD operations
- [ ] Code analysis endpoints
- [ ] Mascot chat endpoints
- [ ] Skill tree endpoints

### **✅ HuggingFace Integration Tests**
- [ ] Code analysis with AI
- [ ] Mascot chat with AI
- [ ] API rate limiting
- [ ] Fallback mechanisms
- [ ] Error handling

### **✅ Database Tests**
- [ ] Connection stability
- [ ] Query performance
- [ ] Data integrity
- [ ] Migration scripts
- [ ] Backup/restore

### **✅ Performance Tests**
- [ ] Response time < 2 seconds
- [ ] Memory usage < 100MB
- [ ] Concurrent user handling
- [ ] Database query optimization
- [ ] API rate limiting

## **🚀 Running Tests**

### **Local Testing**
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testNamePattern="Free Tier"

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### **CI/CD Testing**
```bash
# Pre-deployment tests
npm run test:ci

# Performance tests
npm run test:performance

# Integration tests
npm run test:integration
```

## **📊 Test Results**

### **Expected Results**
- ✅ All tests passing
- ✅ Coverage > 80%
- ✅ No memory leaks
- ✅ Performance within limits
- ✅ Free tier limits enforced

### **Performance Benchmarks**
| Metric | Target | Test Command |
|--------|--------|--------------|
| Response Time | < 2s | `npm run test:performance` |
| Memory Usage | < 100MB | `npm run test:memory` |
| Error Rate | < 1% | `npm run test:errors` |
| Uptime | > 99% | `npm run test:uptime` |

## **🔍 Debugging Tests**

### **Common Test Issues**

1. **Database Connection**
   ```bash
   # Check database URL
   echo $DATABASE_URL
   
   # Test connection
   npm run db:push
   ```

2. **Environment Variables**
   ```bash
   # Check all required variables
   cat .env
   
   # Verify API keys
   curl -H "Authorization: Bearer $HUGGINGFACE_API_KEY" \
        https://api-inference.huggingface.co/models/Salesforce/codet5-base
   ```

3. **Rate Limiting**
   ```bash
   # Test rate limits
   for i in {1..15}; do
     curl -X GET http://localhost:5000/api/user
   done
   ```

### **Test Data Management**
```bash
# Reset test database
npm run db:reset

# Seed test data
npm run db:seed

# Clean up test data
npm run db:clean
```

## **📈 Monitoring Tests**

### **Health Check Tests**
```bash
# Basic health check
curl http://localhost:5000/api/health

# Detailed health check
curl http://localhost:5000/api/health/detailed

# Usage statistics
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:5000/api/usage
```

### **Load Testing**
```bash
# Install artillery for load testing
npm install -g artillery

# Run load test
artillery run tests/load-test.yml
```

## **🎯 Test Scenarios**

### **Scenario 1: New User Onboarding**
1. User signs up with Clerk
2. User creates first project
3. User uploads code for analysis
4. User interacts with mascot
5. User explores skill tree

### **Scenario 2: Free Tier Limits**
1. User creates 5 projects (limit reached)
2. User attempts 6th project (should fail)
3. User runs 10 code analyses (limit reached)
4. User attempts 11th analysis (should fail)
5. User chats with mascot 50 times (limit reached)

### **Scenario 3: AI Integration**
1. User uploads JavaScript code
2. HuggingFace analyzes code
3. AI provides feedback and suggestions
4. User chats with AI mascot
5. AI provides learning recommendations

### **Scenario 4: Performance Under Load**
1. 10 concurrent users
2. Multiple code analyses
3. Database queries
4. API rate limiting
5. Memory usage monitoring

## **📋 Test Reports**

### **Test Report Template**
```markdown
# Test Report - CodeCompanionPro

## Test Summary
- Total Tests: X
- Passed: X
- Failed: X
- Coverage: X%

## Performance Results
- Average Response Time: Xms
- Memory Usage: XMB
- Error Rate: X%

## Free Tier Validation
- Project Limits: ✅
- Code Analysis Limits: ✅
- Mascot Chat Limits: ✅
- File Size Limits: ✅

## Issues Found
1. Issue 1: Description
2. Issue 2: Description

## Recommendations
1. Recommendation 1
2. Recommendation 2
```

## **🔄 Continuous Testing**

### **Automated Testing Pipeline**
1. **Pre-commit**: Run unit tests
2. **Pull Request**: Run integration tests
3. **Deployment**: Run full test suite
4. **Post-deployment**: Run smoke tests

### **Test Automation**
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## **📚 Test Resources**

### **Testing Tools**
- **Jest**: Unit testing framework
- **Supertest**: API testing
- **Artillery**: Load testing
- **Playwright**: E2E testing

### **Testing Best Practices**
1. **Test Isolation**: Each test should be independent
2. **Mock External Services**: Don't hit real APIs in tests
3. **Test Data Management**: Use fixtures and factories
4. **Assertion Clarity**: Clear, descriptive assertions
5. **Coverage Goals**: Aim for >80% code coverage

---

**🎉 Happy Testing! Your free AI code tutor is ready for the world!**
