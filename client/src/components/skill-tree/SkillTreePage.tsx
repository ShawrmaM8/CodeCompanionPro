import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  BookMarked,
  Star,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import SkillTree, { SkillNode, Challenge, Resource } from './SkillTree';

interface UserProgress {
  totalSkills: number;
  completedSkills: number;
  totalPoints: number;
  currentStreak: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  recentAchievements: string[];
}

const SkillTreePage: React.FC = () => {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalSkills: 20,
    completedSkills: 3,
    totalPoints: 450,
    currentStreak: 7,
    level: 'intermediate',
    recentAchievements: ['First Project', 'Code Quality Master', 'Streak Keeper']
  });

  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [activeTab, setActiveTab] = useState('tree');

  // Mock user skills based on progress
  const userSkills = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'];

  const handleSkillClick = (skill: SkillNode) => {
    setSelectedSkill(skill);
  };

  const handleChallengeStart = (challenge: Challenge) => {
    console.log('Starting challenge:', challenge);
    // Implement challenge start logic
  };

  const handleResourceClick = (resource: Resource) => {
    window.open(resource.url, '_blank');
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🚀';
      case 'advanced': return '🏆';
      default: return '💻';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning Path</h1>
          <p className="text-gray-600">Track your programming skills and unlock new challenges</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={`${getLevelColor(userProgress.level)} px-3 py-1`}>
            {getLevelIcon(userProgress.level)} {userProgress.level.charAt(0).toUpperCase() + userProgress.level.slice(1)}
          </Badge>
          <div className="text-right">
            <div className="text-2xl font-bold">{userProgress.totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{userProgress.completedSkills}/{userProgress.totalSkills}</div>
                <div className="text-sm text-gray-600">Skills Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{userProgress.totalPoints}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{userProgress.currentStreak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round((userProgress.completedSkills / userProgress.totalSkills) * 100)}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tree">Skill Tree</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="tree">
          <SkillTree
            userSkills={userSkills}
            userLevel={userProgress.level}
            onSkillClick={handleSkillClick}
            onChallengeStart={handleChallengeStart}
            onResourceClick={handleResourceClick}
          />
        </TabsContent>

        <TabsContent value="challenges">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'html-portfolio',
                title: 'Build a Portfolio',
                description: 'Create a responsive portfolio website using HTML and CSS',
                difficulty: 'beginner',
                points: 50,
                category: 'Frontend',
                isCompleted: false,
                timeEstimate: '2-3 hours'
              },
              {
                id: 'js-calculator',
                title: 'Interactive Calculator',
                description: 'Build a calculator with JavaScript that handles all basic operations',
                difficulty: 'beginner',
                points: 75,
                category: 'JavaScript',
                isCompleted: true,
                timeEstimate: '3-4 hours'
              },
              {
                id: 'react-todo',
                title: 'Todo Application',
                description: 'Create a full-featured todo app with React hooks and local storage',
                difficulty: 'intermediate',
                points: 100,
                category: 'React',
                isCompleted: false,
                timeEstimate: '4-6 hours'
              },
              {
                id: 'api-server',
                title: 'REST API Server',
                description: 'Build a REST API with Express.js and implement CRUD operations',
                difficulty: 'intermediate',
                points: 125,
                category: 'Backend',
                isCompleted: false,
                timeEstimate: '6-8 hours'
              },
              {
                id: 'auth-system',
                title: 'Authentication System',
                description: 'Implement JWT-based authentication with login, signup, and protected routes',
                difficulty: 'advanced',
                points: 200,
                category: 'Security',
                isCompleted: false,
                timeEstimate: '8-12 hours'
              },
              {
                id: 'fullstack-app',
                title: 'Full-Stack Application',
                description: 'Build a complete full-stack application with frontend, backend, and database',
                difficulty: 'advanced',
                points: 300,
                category: 'Full-Stack',
                isCompleted: false,
                timeEstimate: '2-3 weeks'
              }
            ].map(challenge => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    {challenge.isCompleted && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{challenge.difficulty}</Badge>
                    <Badge variant="secondary">{challenge.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{challenge.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {challenge.points} points
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {challenge.timeEstimate}
                      </span>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    variant={challenge.isCompleted ? "outline" : "default"}
                    disabled={challenge.isCompleted}
                  >
                    {challenge.isCompleted ? 'Completed' : 'Start Challenge'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'MDN Web Docs',
                description: 'Comprehensive documentation for web technologies',
                type: 'Documentation',
                isFree: true,
                url: 'https://developer.mozilla.org',
                category: 'General'
              },
              {
                title: 'JavaScript.info',
                description: 'Modern JavaScript tutorial from basics to advanced topics',
                type: 'Tutorial',
                isFree: true,
                url: 'https://javascript.info',
                category: 'JavaScript'
              },
              {
                title: 'React Documentation',
                description: 'Official React documentation and guides',
                type: 'Documentation',
                isFree: true,
                url: 'https://react.dev',
                category: 'React'
              },
              {
                title: 'Node.js Guide',
                description: 'Complete guide to Node.js development',
                type: 'Tutorial',
                isFree: true,
                url: 'https://nodejs.org/learn',
                category: 'Backend'
              },
              {
                title: 'FreeCodeCamp',
                description: 'Free coding bootcamp with interactive lessons',
                type: 'Course',
                isFree: true,
                url: 'https://freecodecamp.org',
                category: 'General'
              },
              {
                title: 'Stack Overflow',
                description: 'Q&A community for developers',
                type: 'Community',
                isFree: true,
                url: 'https://stackoverflow.com',
                category: 'General'
              }
            ].map(resource => (
              <Card key={resource.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    {resource.isFree && (
                      <Badge variant="outline" className="text-green-600">Free</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{resource.type}</Badge>
                    <Badge variant="outline">{resource.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{resource.description}</p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    Visit Resource
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'First Project',
                description: 'Complete your first coding project',
                icon: '🎯',
                isEarned: true,
                earnedDate: '2024-01-15',
                points: 50
              },
              {
                title: 'Code Quality Master',
                description: 'Achieve 90%+ code quality score',
                icon: '⭐',
                isEarned: true,
                earnedDate: '2024-01-20',
                points: 100
              },
              {
                title: 'Streak Keeper',
                description: 'Maintain a 7-day coding streak',
                icon: '🔥',
                isEarned: true,
                earnedDate: '2024-01-25',
                points: 75
              },
              {
                title: 'JavaScript Ninja',
                description: 'Complete all JavaScript challenges',
                icon: '⚡',
                isEarned: false,
                points: 150
              },
              {
                title: 'React Master',
                description: 'Build 5 React applications',
                icon: '⚛️',
                isEarned: false,
                points: 200
              },
              {
                title: 'Full-Stack Developer',
                description: 'Complete a full-stack project',
                icon: '🚀',
                isEarned: false,
                points: 300
              }
            ].map(achievement => (
              <Card key={achievement.title} className={`${achievement.isEarned ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{achievement.points} points</span>
                    </div>
                    {achievement.isEarned ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Earned {achievement.earnedDate}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Locked</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SkillTreePage;
