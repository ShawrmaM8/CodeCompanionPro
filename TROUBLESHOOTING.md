# 🔧 Troubleshooting Guide

## Port Already in Use Error

### Problem
```
Error: listen EADDRINUSE: address already in use :::5000
```

### Solutions

#### Option 1: Kill Existing Process (Windows)
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### Option 2: Kill Existing Process (Mac/Linux)
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)
```

#### Option 3: Use Different Port
```bash
# Set different port
PORT=5001 npm run dev
```

#### Option 4: Use Smart Startup (Recommended)
```bash
# Automatically finds available port
npm run dev:smart
```

## Common Issues

### 1. Server Won't Start
- **Check**: Is another process using the port?
- **Fix**: Kill existing process or use different port

### 2. AI Features Not Working
- **Check**: Do you have HuggingFace API key?
- **Fix**: Add `HUGGINGFACE_API_KEY` to `.env` file

### 3. Frontend Not Loading
- **Check**: Is server running on correct port?
- **Fix**: Visit `http://localhost:5000` (or your port)

### 4. API Calls Failing
- **Check**: Is CORS enabled?
- **Fix**: Server includes CORS middleware

## Quick Fixes

### Reset Everything
```bash
# Kill all Node processes
taskkill /f /im node.exe

# Start fresh
npm run dev
```

### Check Server Status
```bash
# Test health endpoint
curl http://localhost:5000/api/health
```

### View Logs
```bash
# Run with verbose output
DEBUG=* npm run dev
```

## Development Tips

### 1. Use Smart Port Detection
```bash
npm run dev:smart
```

### 2. Check Available Ports
```bash
# Windows
netstat -an | findstr :5000

# Mac/Linux
lsof -i :5000
```

### 3. Environment Variables
```bash
# Create .env file
cp env.example .env

# Add your API key
echo "HUGGINGFACE_API_KEY=hf_your_key" >> .env
```

## Still Having Issues?

1. **Check Node.js version**: `node --version` (should be 16+)
2. **Check dependencies**: `npm install`
3. **Clear cache**: `npm cache clean --force`
4. **Restart terminal**: Close and reopen your terminal
5. **Check firewall**: Ensure port is not blocked

## Success Indicators

✅ **Server Running**: `🚀 AI Code Tutor running on port 5000`
✅ **Health Check**: Visit `http://localhost:5000/api/health`
✅ **Frontend**: Visit `http://localhost:5000`
✅ **AI Features**: Test code analysis and mascot chat

---

**Need more help?** Check the main README.md for setup instructions!
