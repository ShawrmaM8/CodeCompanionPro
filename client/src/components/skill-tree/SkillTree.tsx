import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { 
  BookOpen, 
  Code, 
  Database, 
  Globe, 
  Lock, 
  Zap, 
  Star,
  CheckCircle,
  Circle,
  ArrowRight
} from 'lucide-react';

export interface SkillNode {
  id: string;
  name: string;
  category: string;
  level: number; // 0-5
  prerequisites: string[];
  skills: string[];
  challenges: Challenge[];
  resources: Resource[];
  icon: string;
  color: string;
  description: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number; // 0-100
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  isCompleted: boolean;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'tutorial' | 'documentation' | 'video' | 'article';
  isFree: boolean;
}

interface SkillTreeProps {
  userSkills: string[];
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  onSkillClick: (skill: SkillNode) => void;
  onChallengeStart: (challenge: Challenge) => void;
  onResourceClick: (resource: Resource) => void;
}

const SkillTree: React.FC<SkillTreeProps> = ({
  userSkills,
  userLevel,
  onSkillClick,
  onChallengeStart,
  onResourceClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [skillNodes, setSkillNodes] = useState<SkillNode[]>([]);

  // Initialize skill tree data
  useEffect(() => {
    const skills = generateSkillTreeData(userSkills, userLevel);
    setSkillNodes(skills);
  }, [userSkills, userLevel]);

  // Create D3 visualization
  useEffect(() => {
    if (!svgRef.current || skillNodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    svg.attr("width", width).attr("height", height);

    // Create force simulation
    const simulation = d3.forceSimulation(skillNodes)
      .force("link", d3.forceLink<SkillNode, any>()
        .id(d => d.id)
        .distance(100)
        .strength(0.5))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Create links
    const links = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(skillNodes.flatMap(node => 
        node.prerequisites.map(prereq => ({ source: prereq, target: node.id }))
      ))
      .enter().append("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Create nodes
    const nodes = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(skillNodes)
      .enter().append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .call(d3.drag<SVGGElement, SkillNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add circles for nodes
    nodes.append("circle")
      .attr("r", d => getNodeRadius(d))
      .attr("fill", d => getNodeColor(d))
      .attr("stroke", d => d.isCompleted ? "#10b981" : d.isUnlocked ? "#3b82f6" : "#6b7280")
      .attr("stroke-width", 3);

    // Add icons
    nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "16px")
      .attr("fill", "white")
      .text(d => getSkillIcon(d.category));

    // Add skill names
    nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "2.5em")
      .attr("font-size", "12px")
      .attr("fill", "#374151")
      .text(d => d.name);

    // Add progress indicators
    nodes.append("circle")
      .attr("r", d => getNodeRadius(d) + 5)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", d => `${2 * Math.PI * (getNodeRadius(d) + 5)}`)
      .attr("stroke-dashoffset", d => `${2 * Math.PI * (getNodeRadius(d) + 5) * (1 - d.progress / 100)}`)
      .style("opacity", d => d.progress > 0 ? 1 : 0);

    // Add click handlers
    nodes.on("click", (event, d) => {
      setSelectedSkill(d);
      onSkillClick(d);
    });

    // Add hover effects
    nodes.on("mouseover", function(event, d) {
      d3.select(this).select("circle")
        .attr("stroke-width", 5);
    })
    .on("mouseout", function(event, d) {
      d3.select(this).select("circle")
        .attr("stroke-width", 3);
    });

    // Update positions
    simulation.on("tick", () => {
      links
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      nodes
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any, d: SkillNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: SkillNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: SkillNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [skillNodes, onSkillClick]);

  const getNodeRadius = (node: SkillNode): number => {
    if (node.isCompleted) return 25;
    if (node.isUnlocked) return 20;
    return 15;
  };

  const getNodeColor = (node: SkillNode): string => {
    if (node.isCompleted) return "#10b981";
    if (node.isUnlocked) return "#3b82f6";
    return "#6b7280";
  };

  const getSkillIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      'frontend': '🌐',
      'backend': '⚙️',
      'database': '🗄️',
      'security': '🔒',
      'devops': '🚀',
      'mobile': '📱',
      'ai': '🤖',
      'blockchain': '⛓️'
    };
    return icons[category] || '💻';
  };

  return (
    <div className="flex gap-6">
      {/* Skill Tree Visualization */}
      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Skill Tree
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <svg ref={svgRef} className="w-full h-[600px] border rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Details Panel */}
      {selectedSkill && (
        <div className="w-80">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getSkillIcon(selectedSkill.category)}
                {selectedSkill.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={selectedSkill.isCompleted ? "default" : selectedSkill.isUnlocked ? "secondary" : "outline"}>
                  {selectedSkill.isCompleted ? "Completed" : selectedSkill.isUnlocked ? "In Progress" : "Locked"}
                </Badge>
                <Badge variant="outline">
                  Level {selectedSkill.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{selectedSkill.description}</p>
              
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{selectedSkill.progress}%</span>
                </div>
                <Progress value={selectedSkill.progress} className="h-2" />
              </div>

              {/* Prerequisites */}
              {selectedSkill.prerequisites.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Prerequisites</h4>
                  <div className="space-y-1">
                    {selectedSkill.prerequisites.map(prereq => (
                      <div key={prereq} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{prereq}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              <div>
                <h4 className="font-medium text-sm mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedSkill.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Challenges */}
              <div>
                <h4 className="font-medium text-sm mb-2">Challenges</h4>
                <div className="space-y-2">
                  {selectedSkill.challenges.slice(0, 3).map(challenge => (
                    <div key={challenge.id} className="p-2 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{challenge.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{challenge.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-600">{challenge.points} points</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onChallengeStart(challenge)}
                          disabled={!selectedSkill.isUnlocked}
                        >
                          Start
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-medium text-sm mb-2">Resources</h4>
                <div className="space-y-1">
                  {selectedSkill.resources.slice(0, 3).map(resource => (
                    <div key={resource.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{resource.title}</span>
                        {resource.isFree && <Badge variant="outline" className="text-xs">Free</Badge>}
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => onResourceClick(resource)}
                      >
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Generate skill tree data based on user progress
function generateSkillTreeData(userSkills: string[], userLevel: string): SkillNode[] {
  const baseSkills: SkillNode[] = [
    {
      id: "html-css",
      name: "HTML & CSS",
      category: "frontend",
      level: 1,
      prerequisites: [],
      skills: ["HTML", "CSS", "Responsive Design"],
      challenges: [
        {
          id: "html-basics",
          title: "Build a Portfolio Page",
          description: "Create a responsive portfolio page using HTML and CSS",
          difficulty: "beginner",
          points: 50,
          isCompleted: false
        }
      ],
      resources: [
        {
          id: "mdn-html",
          title: "MDN HTML Guide",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
          type: "documentation",
          isFree: true
        }
      ],
      icon: "🌐",
      color: "#3b82f6",
      description: "Foundation of web development",
      isUnlocked: true,
      isCompleted: userSkills.includes("HTML") || userSkills.includes("CSS"),
      progress: userSkills.includes("HTML") && userSkills.includes("CSS") ? 100 : 50
    },
    {
      id: "javascript",
      name: "JavaScript",
      category: "frontend",
      level: 2,
      prerequisites: ["html-css"],
      skills: ["JavaScript", "ES6+", "DOM Manipulation"],
      challenges: [
        {
          id: "js-calculator",
          title: "Build a Calculator",
          description: "Create an interactive calculator with JavaScript",
          difficulty: "beginner",
          points: 75,
          isCompleted: false
        }
      ],
      resources: [
        {
          id: "js-tutorial",
          title: "JavaScript.info",
          url: "https://javascript.info",
          type: "tutorial",
          isFree: true
        }
      ],
      icon: "⚡",
      color: "#f59e0b",
      description: "Dynamic web programming",
      isUnlocked: userSkills.includes("HTML") || userSkills.includes("CSS"),
      isCompleted: userSkills.includes("JavaScript"),
      progress: userSkills.includes("JavaScript") ? 100 : 30
    },
    {
      id: "react",
      name: "React",
      category: "frontend",
      level: 3,
      prerequisites: ["javascript"],
      skills: ["React", "JSX", "Hooks", "State Management"],
      challenges: [
        {
          id: "react-todo",
          title: "Todo App",
          description: "Build a todo application with React",
          difficulty: "intermediate",
          points: 100,
          isCompleted: false
        }
      ],
      resources: [
        {
          id: "react-docs",
          title: "React Documentation",
          url: "https://react.dev",
          type: "documentation",
          isFree: true
        }
      ],
      icon: "⚛️",
      color: "#61dafb",
      description: "Modern UI library",
      isUnlocked: userSkills.includes("JavaScript"),
      isCompleted: userSkills.includes("React"),
      progress: userSkills.includes("React") ? 100 : 0
    },
    {
      id: "nodejs",
      name: "Node.js",
      category: "backend",
      level: 2,
      prerequisites: ["javascript"],
      skills: ["Node.js", "Express", "API Development"],
      challenges: [
        {
          id: "api-server",
          title: "REST API",
          description: "Build a REST API with Express",
          difficulty: "intermediate",
          points: 125,
          isCompleted: false
        }
      ],
      resources: [
        {
          id: "node-docs",
          title: "Node.js Documentation",
          url: "https://nodejs.org/docs",
          type: "documentation",
          isFree: true
        }
      ],
      icon: "🟢",
      color: "#68a063",
      description: "Server-side JavaScript",
      isUnlocked: userSkills.includes("JavaScript"),
      isCompleted: userSkills.includes("Node.js"),
      progress: userSkills.includes("Node.js") ? 100 : 0
    },
    {
      id: "database",
      name: "Database",
      category: "database",
      level: 2,
      prerequisites: ["nodejs"],
      skills: ["SQL", "PostgreSQL", "Database Design"],
      challenges: [
        {
          id: "db-design",
          title: "Database Schema",
          description: "Design a database schema for an e-commerce site",
          difficulty: "intermediate",
          points: 100,
          isCompleted: false
        }
      ],
      resources: [
        {
          id: "sql-tutorial",
          title: "SQL Tutorial",
          url: "https://www.w3schools.com/sql",
          type: "tutorial",
          isFree: true
        }
      ],
      icon: "🗄️",
      color: "#336791",
      description: "Data persistence and management",
      isUnlocked: userSkills.includes("Node.js"),
      isCompleted: userSkills.includes("SQL") || userSkills.includes("PostgreSQL"),
      progress: userSkills.includes("SQL") || userSkills.includes("PostgreSQL") ? 100 : 0
    },
    {
      id: "security",
      name: "Security",
      category: "security",
      level: 4,
      prerequisites: ["react", "nodejs", "database"],
      skills: ["Authentication", "Authorization", "HTTPS", "Security Best Practices"],
      challenges: [
        {
          id: "auth-system",
          title: "Authentication System",
          description: "Implement JWT-based authentication",
          difficulty: "advanced",
          points: 200,
          isCompleted: false
        }
      ],
      resources: [
        {
          id: "owasp",
          title: "OWASP Top 10",
          url: "https://owasp.org/www-project-top-ten",
          type: "documentation",
          isFree: true
        }
      ],
      icon: "🔒",
      color: "#dc2626",
      description: "Application security fundamentals",
      isUnlocked: userSkills.includes("React") && userSkills.includes("Node.js"),
      isCompleted: userSkills.includes("Authentication") || userSkills.includes("Security"),
      progress: userSkills.includes("Authentication") || userSkills.includes("Security") ? 100 : 0
    }
  ];

  return baseSkills;
}

export default SkillTree;
