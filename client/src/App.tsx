import React from 'react';
import Dashboard from './pages/Dashboard';
import SkillTree from './pages/SkillTree';
import CodeAnalysis from './pages/CodeAnalysis';
import Mascot from './pages/Mascot';

function App() {
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'skill-tree': return <SkillTree />;
      case 'code-analysis': return <CodeAnalysis />;
      case 'mascot': return <Mascot />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">CodeCompanionPro</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentPage('skill-tree')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 'skill-tree' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Skill Tree
                </button>
                <button
                  onClick={() => setCurrentPage('code-analysis')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 'code-analysis' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Code Analysis
                </button>
                <button
                  onClick={() => setCurrentPage('mascot')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 'mascot' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  AI Mascot
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;