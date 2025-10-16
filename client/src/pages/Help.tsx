import React, { useState } from 'react';

const Help: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const helpSections = {
    overview: {
      title: 'Welcome to AI Code Tutor',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            AI Code Tutor is your personal programming companion designed to help you learn, analyze, and improve your coding skills.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Quick Start Guide:</h4>
            <ol className="list-decimal list-inside text-blue-800 space-y-1">
              <li>Explore the Dashboard to see your progress</li>
              <li>Upload or paste code in Code Analysis for AI feedback</li>
              <li>Discover projects in the Engine tab</li>
              <li>Chat with the AI Mascot for help</li>
              <li>Track your skills in the Skill Tree</li>
            </ol>
          </div>
        </div>
      )
    },
    dashboard: {
      title: 'Dashboard',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Understanding Your Dashboard</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">📊 Total Points</h5>
              <p className="text-blue-800 text-sm">Earn points by completing code analysis, projects, and engaging with the AI mascot.</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2">🔥 Current Streak</h5>
              <p className="text-green-800 text-sm">Track your daily learning streak to maintain consistent progress.</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h5 className="font-semibold text-purple-900 mb-2">🎯 Skills Learned</h5>
              <p className="text-purple-800 text-sm">Count of programming skills and concepts you've mastered.</p>
            </div>
          </div>
        </div>
      )
    },
    codeAnalysis: {
      title: 'Code Analysis',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">How to Use Code Analysis</h4>
          
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <h5 className="font-semibold text-gray-900">Step 1: Upload Your Code</h5>
              <p className="text-gray-600 text-sm mt-1">
                <strong>Drag & Drop:</strong> Drag any code file (.py, .js, .ts, .java, .cpp, .c, .txt) into the upload area
              </p>
              <p className="text-gray-600 text-sm">
                <strong>Click to Upload:</strong> Click the upload area to browse and select files
              </p>
              <p className="text-gray-600 text-sm">
                <strong>Paste Directly:</strong> Copy and paste your code into the text area below
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h5 className="font-semibold text-gray-900">Step 2: Analyze</h5>
              <p className="text-gray-600 text-sm mt-1">
                Click "Analyze Code" to get AI-powered feedback on your code quality, structure, and improvements.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h5 className="font-semibold text-gray-900">Step 3: Review Results</h5>
              <p className="text-gray-600 text-sm mt-1">
                Get detailed feedback including:
              </p>
              <ul className="list-disc list-inside text-gray-600 text-sm mt-1 ml-4">
                <li>Overall quality score</li>
                <li>Code strengths and weaknesses</li>
                <li>Specific improvement suggestions</li>
                <li>Skill tags and complexity assessment</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-semibold text-yellow-900 mb-2">💡 Pro Tips:</h5>
            <ul className="list-disc list-inside text-yellow-800 text-sm space-y-1">
              <li>Upload complete files for better analysis</li>
              <li>Include comments in your code for context</li>
              <li>Try analyzing different types of code (functions, classes, algorithms)</li>
              <li>Use the feedback to improve your coding practices</li>
            </ul>
          </div>
        </div>
      )
    },
    engine: {
      title: 'Project Engine',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Discover Your Next Project</h4>
          
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <h5 className="font-semibold text-gray-900">Step 1: Set Your Filters</h5>
              <p className="text-gray-600 text-sm mt-1">
                <strong>Drag Filters:</strong> Drag difficulty levels, technologies, categories, and time estimates to filter projects
              </p>
              <p className="text-gray-600 text-sm">
                <strong>Multiple Selection:</strong> You can select multiple options in each category
              </p>
              <p className="text-gray-600 text-sm">
                <strong>Remove Filters:</strong> Click the "×" on any selected filter to remove it
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h5 className="font-semibold text-gray-900">Step 2: Browse Projects</h5>
              <p className="text-gray-600 text-sm mt-1">
                View filtered projects with detailed information including prerequisites, tools needed, and development sequence.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h5 className="font-semibold text-gray-900">Step 3: Explore Project Details</h5>
              <p className="text-gray-600 text-sm mt-1">
                Click "View Development Plan" to see:
              </p>
              <ul className="list-disc list-inside text-gray-600 text-sm mt-1 ml-4">
                <li>Prerequisites and skills needed</li>
                <li>Step-by-step development sequence</li>
                <li>Required tools and technologies</li>
                <li>Code examples and snippets</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-semibold text-green-900 mb-2">🎯 Filter Categories:</h5>
            <div className="grid grid-cols-2 gap-2 text-green-800 text-sm">
              <div>
                <strong>Difficulty:</strong> Beginner, Intermediate, Advanced
              </div>
              <div>
                <strong>Technologies:</strong> React, Node.js, Python, etc.
              </div>
              <div>
                <strong>Category:</strong> Web Dev, AI/ML, Mobile, etc.
              </div>
              <div>
                <strong>Time:</strong> 1-2 weeks to 6-8 weeks
              </div>
            </div>
          </div>
        </div>
      )
    },
    mascot: {
      title: 'AI Mascot',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Chat with Your AI Coding Companion</h4>
          
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <h5 className="font-semibold text-gray-900">Step 1: Start a Conversation</h5>
              <p className="text-gray-600 text-sm mt-1">
                Type your programming questions, problems, or concepts you want to learn about in the chat input.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h5 className="font-semibold text-gray-900">Step 2: Get Intelligent Responses</h5>
              <p className="text-gray-600 text-sm mt-1">
                The AI mascot provides helpful explanations, examples, and guidance tailored to your questions.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h5 className="font-semibold text-gray-900">Step 3: Interactive Learning</h5>
              <p className="text-gray-600 text-sm mt-1">
                Ask follow-up questions, request examples, or explore related concepts to deepen your understanding.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 mb-2">💬 Example Questions:</h5>
            <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
              <li>"What is a closure in JavaScript?"</li>
              <li>"How do I handle errors in Python?"</li>
              <li>"Explain async/await in simple terms"</li>
              <li>"What's the difference between let and var?"</li>
              <li>"How do I create a REST API?"</li>
            </ul>
          </div>
        </div>
      )
    },
    skillTree: {
      title: 'Skill Tree',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Track Your Learning Journey</h4>
          
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <h5 className="font-semibold text-gray-900">Visual Progress Tracking</h5>
              <p className="text-gray-600 text-sm mt-1">
                See your completed skills (green) and skills in progress (gray) with progress bars.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h5 className="font-semibold text-gray-900">Skill Levels</h5>
              <p className="text-gray-600 text-sm mt-1">
                Skills are organized by difficulty levels from 1 (beginner) to 4 (advanced).
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h5 className="font-semibold text-gray-900">Learning Path</h5>
              <p className="text-gray-600 text-sm mt-1">
                Follow the skill tree structure to understand the logical progression of programming concepts.
              </p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h5 className="font-semibold text-purple-900 mb-2">🎯 Skill Categories:</h5>
            <div className="grid grid-cols-2 gap-2 text-purple-800 text-sm">
              <div>
                <strong>Level 1:</strong> JavaScript Basics, Node.js Basics
              </div>
              <div>
                <strong>Level 2:</strong> DOM Manipulation
              </div>
              <div>
                <strong>Level 3:</strong> React Basics, Express API
              </div>
              <div>
                <strong>Level 4:</strong> State Management
              </div>
            </div>
          </div>
        </div>
      )
    },
    troubleshooting: {
      title: 'Troubleshooting',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Common Issues and Solutions</h4>
          
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h5 className="font-semibold text-red-900 mb-2">❌ File Upload Issues</h5>
              <p className="text-red-800 text-sm mb-2">Problem: File won't upload</p>
              <ul className="list-disc list-inside text-red-800 text-sm space-y-1">
                <li>Ensure file is one of the supported formats (.py, .js, .ts, .java, .cpp, .c, .txt)</li>
                <li>Check file size (should be under 10MB)</li>
                <li>Try refreshing the page and uploading again</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-semibold text-yellow-900 mb-2">⚠️ Analysis Not Working</h5>
              <p className="text-yellow-800 text-sm mb-2">Problem: Code analysis fails or returns errors</p>
              <ul className="list-disc list-inside text-yellow-800 text-sm space-y-1">
                <li>Ensure your code is syntactically correct</li>
                <li>Try with smaller code snippets first</li>
                <li>Check your internet connection</li>
                <li>Clear browser cache and try again</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">💬 AI Mascot Not Responding</h5>
              <p className="text-blue-800 text-sm mb-2">Problem: AI Mascot chat not working</p>
              <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
                <li>Check your internet connection</li>
                <li>Try asking a simpler question</li>
                <li>Refresh the page and try again</li>
                <li>Ensure you have a stable connection</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2">✅ General Tips</h5>
              <ul className="list-disc list-inside text-green-800 text-sm space-y-1">
                <li>Keep your browser updated</li>
                <li>Use Chrome, Firefox, or Safari for best compatibility</li>
                <li>Disable ad blockers if experiencing issues</li>
                <li>Clear browser cache regularly</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help & Guide</h1>
        <p className="mt-1 text-sm text-gray-500">Learn how to use all features of AI Code Tutor</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Navigation</h3>
            <nav className="space-y-2">
              {Object.entries(helpSections).map(([key, section]) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === key
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {helpSections[activeSection as keyof typeof helpSections].title}
            </h2>
            <div className="prose max-w-none">
              {helpSections[activeSection as keyof typeof helpSections].content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
