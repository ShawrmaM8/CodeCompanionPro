# 🤖 AI Code Tutor

A simple, free AI-powered code tutor that provides instant feedback on your code and helps you learn programming skills.

## ✨ Features

- **Code Analysis**: Upload code and get instant AI feedback
- **Skill Tree**: Track your learning progress
- **AI Mascot**: Chat with an AI coding companion
- **Dashboard**: View your progress and achievements

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Application
```bash
npm run dev
```

### 3. Open Your Browser
Visit `http://localhost:5000`

## 📁 Project Structure

```
├── server/
│   └── index.js          # Express server
├── client/
│   └── index.html        # Frontend (vanilla HTML/JS)
├── package.json          # Dependencies
└── vercel.json          # Deployment config
```

## 🛠️ Technologies

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Styling**: Tailwind CSS (CDN)
- **Deployment**: Vercel

## 🚀 Deployment

1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

## 📊 API Endpoints

- `POST /api/analyze` - Analyze code
- `GET /api/skills` - Get skill tree data
- `POST /api/mascot/chat` - Chat with AI mascot
- `GET /api/health` - Health check

## 🎯 Core Features

### Code Analysis
- Upload JavaScript, Python, or any code
- Get instant feedback on code quality
- Receive improvement suggestions
- Identify skill tags and complexity

### Skill Tree
- Visual progress tracking
- Skill-based learning path
- Achievement system
- Level progression

### AI Mascot
- Interactive chat interface
- Coding help and explanations
- Learning recommendations
- Friendly AI companion

## 💡 Why Simple?

This project focuses on **core functionality** over complex tooling:

- ✅ **Fast Installation**: 2 dependencies vs 50+
- ✅ **No Build Process**: Direct HTML/JS
- ✅ **Easy Deployment**: Single Vercel config
- ✅ **Maintainable**: Simple, readable code
- ✅ **Free**: No external API costs

## 🤖 AI Integration

The app now includes **real HuggingFace AI integration**! 

### Setup AI Features (Optional)

1. **Get HuggingFace API Key** (Free):
   - Visit [HuggingFace Settings](https://huggingface.co/settings/tokens)
   - Create a new token
   - Copy the token

2. **Add to Environment**:
   ```bash
   # Create .env file
   cp env.example .env
   
   # Add your API key
   echo "HUGGINGFACE_API_KEY=hf_your_actual_key_here" >> .env
   ```

3. **Restart the Server**:
   ```bash
   npm run dev
   ```

### AI Features

- **🧠 Code Analysis**: Real AI-powered code feedback using CodeLlama
- **💬 AI Mascot**: Intelligent chat using DialoGPT
- **🔄 Smart Fallback**: Enhanced static analysis if AI is unavailable

### Without API Key

The app works perfectly without an API key using enhanced static analysis!

## 🔧 Troubleshooting

### Port Already in Use Error
If you get `EADDRINUSE` error:

**Quick Fix:**
```bash
# Kill existing process (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use smart startup
npm run dev:smart
```

**See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more solutions!**

## 📄 License

MIT License - Feel free to use and modify!