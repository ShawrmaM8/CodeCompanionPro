import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// AI-powered code analysis endpoint
app.post('/api/analyze', async (req, res) => {
  const { code, language = 'javascript' } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  try {
    // Use HuggingFace AI for real code analysis
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (hfApiKey) {
      // Real AI analysis with HuggingFace
      const response = await fetch('https://api-inference.huggingface.co/models/codellama/CodeLlama-7b-Instruct-hf', {
        headers: { 
          'Authorization': `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ 
          inputs: `Analyze this ${language} code and provide feedback on code quality, strengths, improvements, and suggestions. Rate overall quality 1-100. Code:\n\`\`\`${language}\n${code}\n\`\`\``,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            return_full_text: false
          }
        })
      });

      if (response.ok) {
        const aiResult = await response.json();
        const aiText = aiResult[0]?.generated_text || '';
        
        // Parse AI response to extract structured data
        const analysis = parseAIResponse(aiText, code, language);
        res.json(analysis);
        return;
      }
    }
    
    // Fallback to enhanced static analysis if AI fails
    const analysis = getEnhancedStaticAnalysis(code, language);
    res.json(analysis);
    
  } catch (error) {
    console.error('AI analysis failed, using fallback:', error);
    // Fallback to static analysis
    const analysis = getEnhancedStaticAnalysis(code, language);
    res.json(analysis);
  }
});

// Enhanced static analysis fallback
function getEnhancedStaticAnalysis(code, language) {
  const lines = code.split('\n').length;
  const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length;
  const comments = (code.match(/\/\/|\/\*|\*/g) || []).length;
  const variables = (code.match(/let\s+|const\s+|var\s+/g) || []).length;
  
  // Calculate score based on code metrics
  let score = 60;
  if (functions > 0) score += 10;
  if (comments > 0) score += 10;
  if (variables > 0) score += 10;
  if (lines < 50) score += 5;
  if (code.includes('async') || code.includes('await')) score += 5;
  
  const strengths = [];
  const improvements = [];
  const suggestions = [];
  
  if (functions > 0) strengths.push('Good use of functions');
  if (comments > 0) strengths.push('Well-commented code');
  if (variables > 0) strengths.push('Proper variable usage');
  if (code.includes('const')) strengths.push('Using const for immutable values');
  
  if (functions === 0) improvements.push('Consider breaking code into functions');
  if (comments === 0) improvements.push('Add comments to explain complex logic');
  if (code.includes('var')) improvements.push('Use let/const instead of var');
  if (!code.includes('try') && !code.includes('catch')) improvements.push('Add error handling');
  
  suggestions.push('Consider using TypeScript for better type safety');
  suggestions.push('Add unit tests for better reliability');
  suggestions.push('Use async/await for better async code');
  
  return {
    overallScore: Math.min(100, score),
    strengths: strengths.length > 0 ? strengths : ['Clean code structure'],
    improvements: improvements.length > 0 ? improvements : ['Consider adding more functionality'],
    suggestions: suggestions,
    skillTags: extractSkillTags(code, language),
    complexity: determineComplexity(code, language)
  };
}

// Parse AI response into structured format
function parseAIResponse(aiText, code, language) {
  // Extract score from AI response
  const scoreMatch = aiText.match(/(\d+)\/100|score[:\s]*(\d+)/i);
  const overallScore = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2]) : 75;
  
  // Extract strengths, improvements, suggestions
  const strengths = extractList(aiText, /strengths?[:\s]*([^\n]+)/i) || ['Good code structure'];
  const improvements = extractList(aiText, /improvements?[:\s]*([^\n]+)/i) || ['Consider adding error handling'];
  const suggestions = extractList(aiText, /suggestions?[:\s]*([^\n]+)/i) || ['Add unit tests'];
  
  return {
    overallScore: Math.min(100, Math.max(1, overallScore)),
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    suggestions: suggestions.slice(0, 3),
    skillTags: extractSkillTags(code, language),
    complexity: determineComplexity(code, language)
  };
}

// Helper function to extract lists from AI text
function extractList(text, regex) {
  const match = text.match(regex);
  if (match) {
    return match[1].split(',').map(item => item.trim()).filter(item => item.length > 0);
  }
  return null;
}

// Extract skill tags from code
function extractSkillTags(code, language) {
  const tags = [language.toLowerCase()];
  
  if (code.includes('function')) tags.push('functions');
  if (code.includes('class')) tags.push('oop');
  if (code.includes('async') || code.includes('await')) tags.push('async-programming');
  if (code.includes('fetch') || code.includes('axios')) tags.push('api-calls');
  if (code.includes('map') || code.includes('filter')) tags.push('array-methods');
  if (code.includes('try') || code.includes('catch')) tags.push('error-handling');
  if (code.includes('import') || code.includes('require')) tags.push('modules');
  
  return tags.slice(0, 5);
}

// Determine code complexity
function determineComplexity(code, language) {
  const lines = code.split('\n').length;
  const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length;
  const nested = (code.match(/\{[\s\S]*\{/g) || []).length;
  
  if (lines < 20 && functions < 2 && nested < 2) return 'beginner';
  if (lines < 50 && functions < 5 && nested < 4) return 'intermediate';
  return 'advanced';
}

// Simple skill tree data
app.get('/api/skills', (req, res) => {
  const skills = [
    { id: 'js-basics', name: 'JavaScript Basics', completed: true, level: 1 },
    { id: 'dom-manipulation', name: 'DOM Manipulation', completed: true, level: 2 },
    { id: 'react-basics', name: 'React Basics', completed: false, level: 3 },
    { id: 'state-management', name: 'State Management', completed: false, level: 4 },
    { id: 'node-basics', name: 'Node.js Basics', completed: true, level: 2 },
    { id: 'express-api', name: 'Express API', completed: false, level: 3 }
  ];
  
  res.json(skills);
});

// AI-powered mascot chat
app.post('/api/mascot/chat', async (req, res) => {
  const { message } = req.body;
  
  try {
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (hfApiKey) {
      // Real AI chat with HuggingFace
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        headers: { 
          'Authorization': `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ 
          inputs: `You are a friendly AI coding tutor. Help the user with their programming question. Be encouraging and educational. User: ${message}`,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.8,
            return_full_text: false
          }
        })
      });

      if (response.ok) {
        const aiResult = await response.json();
        const aiResponse = aiResult[0]?.generated_text || '';
        
        res.json({ 
          response: aiResponse.trim() || "I'm here to help you learn programming! What would you like to know? 🤖",
          timestamp: new Date().toISOString()
        });
        return;
      }
    }
    
    // Fallback to enhanced static responses
    const response = getEnhancedMascotResponse(message);
    res.json({ 
      response: response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('AI chat failed, using fallback:', error);
    // Fallback to static response
    const response = getEnhancedMascotResponse(message);
    res.json({ 
      response: response,
      timestamp: new Date().toISOString()
    });
  }
});

// Enhanced static mascot responses
function getEnhancedMascotResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Programming concept responses
  if (lowerMessage.includes('function')) {
    return "Functions are building blocks of code! They help you organize and reuse code. Think of them as recipes that take ingredients (parameters) and create something useful! 🍳";
  }
  
  if (lowerMessage.includes('variable')) {
    return "Variables are like labeled boxes that store information! Use 'const' for things that won't change, 'let' for things that might change, and avoid 'var' in modern JavaScript! 📦";
  }
  
  if (lowerMessage.includes('loop')) {
    return "Loops help you repeat actions! 'for' loops are great when you know how many times to repeat, 'while' loops are perfect when you're not sure! 🔄";
  }
  
  if (lowerMessage.includes('array')) {
    return "Arrays are like lists that hold multiple items! You can access items by their position (index) starting from 0. Arrays are super useful for storing related data! 📋";
  }
  
  if (lowerMessage.includes('error') || lowerMessage.includes('bug')) {
    return "Don't worry about errors - they're part of learning! Use console.log() to debug, check your syntax, and remember: every programmer makes mistakes! 🐛➡️🦋";
  }
  
  if (lowerMessage.includes('async') || lowerMessage.includes('promise')) {
    return "Async programming can be tricky! Think of it like ordering food - you don't wait at the counter, you get a ticket and come back later. Promises and async/await make this easier! 🎫";
  }
  
  if (lowerMessage.includes('react') || lowerMessage.includes('component')) {
    return "React is like building with LEGO blocks! Each component is a reusable piece. Props pass data down, state manages internal data, and hooks connect everything together! 🧱";
  }
  
  if (lowerMessage.includes('css') || lowerMessage.includes('styling')) {
    return "CSS is like decorating your house! Use classes for reusable styles, flexbox for layouts, and remember: mobile-first design makes your site work everywhere! 🎨";
  }
  
  if (lowerMessage.includes('database') || lowerMessage.includes('sql')) {
    return "Databases are like digital filing cabinets! SQL helps you ask questions about your data. Start with simple SELECT statements and work your way up! 🗄️";
  }
  
  if (lowerMessage.includes('git') || lowerMessage.includes('github')) {
    return "Git is like a time machine for your code! It saves snapshots so you can go back if something breaks. GitHub is like a social network for code - share and collaborate! ⏰";
  }
  
  // General encouraging responses
  const responses = [
    "Great question! Let me help you understand that concept better. 🚀",
    "That's a common challenge! Here's how you can approach it... 💡",
    "Excellent! You're on the right track. Let me explain the next step... ⭐",
    "I love your curiosity! This is a great learning opportunity... 🎯",
    "Perfect! Let me break this down into simpler parts... 🔧",
    "Programming is like learning a new language - practice makes perfect! Keep coding! 💪",
    "Every expert was once a beginner. You're doing great! Keep asking questions! 🌟",
    "Code is like poetry - it should be beautiful and functional! Keep writing! ✨"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve HTML app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`🚀 AI Code Tutor running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Open your browser: http://localhost:${PORT}`);
});

// Handle port already in use error
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use. Finding available port...`);
    findAvailablePort(PORT).then(availablePort => {
      const newServer = app.listen(availablePort, () => {
        console.log(`🚀 AI Code Tutor running on port ${availablePort}`);
        console.log(`📊 Health check: http://localhost:${availablePort}/api/health`);
        console.log(`🌐 Open your browser: http://localhost:${availablePort}`);
      });
    }).catch(error => {
      console.error('❌ Could not find available port:', error);
      process.exit(1);
    });
  } else {
    console.error('Server error:', err);
  }
});

// Function to find available port
function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}
