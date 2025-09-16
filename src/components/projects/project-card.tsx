import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Settings, Calendar, CheckCircle } from "lucide-react";
import { Project } from "@shared/schema";
import { Link } from "wouter";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progressColor = project.progress >= 80 ? "bg-accent" : project.progress >= 50 ? "bg-primary" : "bg-secondary";
  
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer" data-testid={`card-project-${project.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-semibold text-foreground text-lg" data-testid={`text-project-name-${project.id}`}>
                {project.name}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {project.language}
              </Badge>
              {project.framework && (
                <Badge variant="outline" className="text-xs">
                  {project.framework}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm mb-4" data-testid={`text-project-description-${project.id}`}>
              {project.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link href={`/analysis?project=${project.id}`}>
              <Button variant="ghost" size="icon" data-testid={`button-analyze-project-${project.id}`}>
                <BarChart className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" data-testid={`button-project-settings-${project.id}`}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium" data-testid={`text-progress-${project.id}`}>
              {project.progress}%
            </span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
        
        {/* Project Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground" data-testid={`text-milestones-${project.id}`}>
                {project.completedMilestones}
              </span>
              /{project.totalMilestones} milestones
            </span>
          </div>
          
          {project.deadline && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground" data-testid={`text-deadline-${project.id}`}>
                Due: {new Date(project.deadline).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        
        {/* Code Quality Score */}
        {project.codeQualityScore > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Code Quality</span>
            <span className="text-sm font-semibold text-foreground" data-testid={`text-quality-score-${project.id}`}>
              {project.codeQualityScore}%
            </span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="mt-4 flex justify-between items-center">
          <Badge 
            variant={project.status === 'active' ? 'default' : 'secondary'}
            className="capitalize"
            data-testid={`badge-status-${project.id}`}
          >
            {project.status}
          </Badge>
          
          <Link href={`/projects/${project.id}`}>
            <Button variant="outline" size="sm" data-testid={`button-view-project-${project.id}`}>
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
