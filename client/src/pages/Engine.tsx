import React, { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  technologies: string[];
  timeEstimate: string;
  category: string;
  prerequisites: string[];
  tools: string[];
  sequence: string[];
  codeSnippets: string[];
}

const Engine: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedFilters, setSelectedFilters] = useState({
    difficulty: [] as string[],
    technologies: [] as string[],
    category: [] as string[],
    timeEstimate: [] as string[]
  });
  const [draggedFilter, setDraggedFilter] = useState<string | null>(null);

  // Sample projects data (inspired by ProjectRecommender2)
  const sampleProjects: Project[] = [
    {
      id: '1',
      name: 'Task Management App',
      description: 'Build a full-stack task management application with user authentication',
      difficulty: 'intermediate',
      technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
      timeEstimate: '2-4 weeks',
      category: 'Web Development',
      prerequisites: ['JavaScript', 'HTML/CSS', 'Basic React'],
      tools: ['VS Code', 'MongoDB Compass', 'Postman'],
      sequence: [
        'Setup project structure',
        'Create backend API with Express',
        'Setup MongoDB database',
        'Implement user authentication',
        'Build React frontend',
        'Connect frontend to backend',
        'Add task CRUD operations',
        'Implement real-time updates',
        'Add user management',
        'Deploy to production'
      ],
      codeSnippets: [
        '// Express server setup\nconst express = require("express");\nconst app = express();\napp.use(express.json());',
        '// React component\nimport React, { useState } from "react";\nconst TaskManager = () => {\n  const [tasks, setTasks] = useState([]);\n  return (\n    <div>\n      {/* Task list */}\n    </div>\n  );\n};'
      ]
    },
    {
      id: '2',
      name: 'AI Chatbot',
      description: 'Create an intelligent chatbot using machine learning',
      difficulty: 'advanced',
      technologies: ['Python', 'TensorFlow', 'Flask', 'OpenAI API'],
      timeEstimate: '4-6 weeks',
      category: 'AI/ML',
      prerequisites: ['Python', 'Machine Learning Basics', 'API Integration'],
      tools: ['Jupyter Notebook', 'Postman', 'Git'],
      sequence: [
        'Research chatbot frameworks',
        'Setup development environment',
        'Collect and prepare training data',
        'Train ML model',
        'Create Flask API',
        'Integrate with frontend',
        'Test and refine responses',
        'Deploy chatbot'
      ],
      codeSnippets: [
        '# Python Flask setup\nfrom flask import Flask, request, jsonify\napp = Flask(__name__)\n\n@app.route("/chat", methods=["POST"])\ndef chat():\n    message = request.json["message"]\n    response = generate_response(message)\n    return jsonify({"response": response})'
      ]
    },
    {
      id: '3',
      name: 'E-commerce Website',
      description: 'Build a complete e-commerce platform with payment integration',
      difficulty: 'advanced',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      timeEstimate: '6-8 weeks',
      category: 'Web Development',
      prerequisites: ['Full-stack Development', 'Database Design', 'Payment Systems'],
      tools: ['VS Code', 'pgAdmin', 'Stripe Dashboard'],
      sequence: [
        'Design database schema',
        'Setup backend API',
        'Implement user authentication',
        'Create product management',
        'Build shopping cart',
        'Integrate payment processing',
        'Develop admin dashboard',
        'Add inventory management',
        'Implement order tracking',
        'Deploy and test'
      ],
      codeSnippets: [
        '// Stripe payment integration\nconst stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);\n\nconst paymentIntent = await stripe.paymentIntents.create({\n  amount: totalAmount,\n  currency: "usd"\n});'
      ]
    },
    {
      id: '4',
      name: 'Mobile Weather App',
      description: 'Create a cross-platform weather application',
      difficulty: 'beginner',
      technologies: ['React Native', 'JavaScript', 'Weather API'],
      timeEstimate: '1-2 weeks',
      category: 'Mobile Development',
      prerequisites: ['JavaScript', 'React Basics', 'API Usage'],
      tools: ['Expo CLI', 'VS Code', 'Android Studio'],
      sequence: [
        'Setup React Native project',
        'Install required dependencies',
        'Create weather API integration',
        'Design user interface',
        'Implement location services',
        'Add weather data display',
        'Test on devices',
        'Deploy to app stores'
      ],
      codeSnippets: [
        '// Weather API call\nconst getWeather = async (city) => {\n  const response = await fetch(\n    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`\n  );\n  return response.json();\n};'
      ]
    }
  ];

  const filterOptions = {
    difficulty: ['beginner', 'intermediate', 'advanced'],
    technologies: ['React', 'Node.js', 'Python', 'JavaScript', 'MongoDB', 'PostgreSQL', 'Flask', 'Express', 'TensorFlow', 'React Native'],
    category: ['Web Development', 'AI/ML', 'Mobile Development', 'Data Science', 'DevOps'],
    timeEstimate: ['1-2 weeks', '2-4 weeks', '4-6 weeks', '6-8 weeks']
  };

  useEffect(() => {
    setProjects(sampleProjects);
    setFilteredProjects(sampleProjects);
  }, []);

  useEffect(() => {
    let filtered = projects;

    if (selectedFilters.difficulty.length > 0) {
      filtered = filtered.filter(project => 
        selectedFilters.difficulty.includes(project.difficulty)
      );
    }

    if (selectedFilters.technologies.length > 0) {
      filtered = filtered.filter(project => 
        selectedFilters.technologies.some(tech => 
          project.technologies.includes(tech)
        )
      );
    }

    if (selectedFilters.category.length > 0) {
      filtered = filtered.filter(project => 
        selectedFilters.category.includes(project.category)
      );
    }

    if (selectedFilters.timeEstimate.length > 0) {
      filtered = filtered.filter(project => 
        selectedFilters.timeEstimate.includes(project.timeEstimate)
      );
    }

    setFilteredProjects(filtered);
  }, [selectedFilters, projects]);

  const handleDragStart = (e: React.DragEvent, filterType: string, value: string) => {
    setDraggedFilter(`${filterType}:${value}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, filterType: keyof typeof selectedFilters) => {
    e.preventDefault();
    if (draggedFilter) {
      const [sourceFilterType, value] = draggedFilter.split(':');
      if (sourceFilterType === filterType) {
        const newFilters = { ...selectedFilters };
        if (!newFilters[filterType].includes(value)) {
          newFilters[filterType] = [...newFilters[filterType], value];
          setSelectedFilters(newFilters);
        }
      }
    }
  };

  const removeFilter = (filterType: keyof typeof selectedFilters, value: string) => {
    const newFilters = { ...selectedFilters };
    newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
    setSelectedFilters(newFilters);
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      difficulty: [],
      technologies: [],
      category: [],
      timeEstimate: []
    });
  };

  const FilterSection = ({ title, type, options }: { title: string; type: keyof typeof selectedFilters; options: string[] }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <div 
        className="min-h-[100px] p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, type)}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {options.map(option => (
            <div
              key={option}
              draggable
              onDragStart={(e) => handleDragStart(e, type, option)}
              className={`px-3 py-2 rounded-full text-sm cursor-move transition-colors ${
                selectedFilters[type].includes(option)
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {option}
              {selectedFilters[type].includes(option) && (
                <button
                  onClick={() => removeFilter(type, option)}
                  className="ml-2 text-white hover:text-red-200"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Project Engine</h1>
        <p className="mt-1 text-sm text-gray-500">Discover and filter projects based on your skills and interests</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Project Filters</h2>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
          >
            Clear All Filters
          </button>
        </div>

        <FilterSection title="Difficulty Level" type="difficulty" options={filterOptions.difficulty} />
        <FilterSection title="Technologies" type="technologies" options={filterOptions.technologies} />
        <FilterSection title="Category" type="category" options={filterOptions.category} />
        <FilterSection title="Time Estimate" type="timeEstimate" options={filterOptions.timeEstimate} />
      </div>

      {/* Results Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Recommended Projects ({filteredProjects.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map(project => (
            <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  project.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {project.difficulty}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{project.description}</p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Technologies:</h4>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map(tech => (
                      <span key={tech} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span><strong>Time:</strong> {project.timeEstimate}</span>
                  <span><strong>Category:</strong> {project.category}</span>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-gray-900 hover:text-blue-600">
                    View Development Plan
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Prerequisites:</h5>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {project.prerequisites.map((prereq, idx) => (
                          <li key={idx}>{prereq}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Development Sequence:</h5>
                      <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                        {project.sequence.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Tools Needed:</h5>
                      <div className="flex flex-wrap gap-1">
                        {project.tools.map(tool => (
                          <span key={tool} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    {project.codeSnippets.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Code Examples:</h5>
                        {project.codeSnippets.map((snippet, idx) => (
                          <pre key={idx} className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                            {snippet}
                          </pre>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No projects match your current filters. Try adjusting your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Engine;
