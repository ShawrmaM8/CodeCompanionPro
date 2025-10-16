import React from 'react';

const SkillTree: React.FC = () => {
  const skills = [
    { id: 'js-basics', name: 'JavaScript Basics', completed: true, level: 1 },
    { id: 'dom-manipulation', name: 'DOM Manipulation', completed: true, level: 2 },
    { id: 'react-basics', name: 'React Basics', completed: false, level: 3 },
    { id: 'state-management', name: 'State Management', completed: false, level: 4 },
    { id: 'node-basics', name: 'Node.js Basics', completed: true, level: 2 },
    { id: 'express-api', name: 'Express API', completed: false, level: 3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Skill Tree</h1>
        <p className="mt-1 text-sm text-gray-500">Track your learning progress</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className={`relative rounded-lg border p-4 ${
                  skill.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{skill.name}</h3>
                    <p className="text-xs text-gray-500">Level {skill.level}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {skill.completed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        skill.completed ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: skill.completed ? '100%' : '60%' }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTree;
