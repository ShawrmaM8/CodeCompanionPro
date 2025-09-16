import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProjectCard } from "@/components/projects/project-card";
import { useProjects } from "@/hooks/use-projects";
import { Plus, BarChart } from "lucide-react";
import { Link } from "wouter";

export function ProjectsPanel() {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Active Projects</CardTitle>
          <Link href="/projects">
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-new-project">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {projects && projects.length > 0 ? (
          projects.slice(0, 3).map((project) => (
            <div 
              key={project.id} 
              className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
              data-testid={`project-card-${project.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-foreground">{project.name}</h4>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                      {project.language}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    {project.description}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  
                  {/* Milestones */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">
                        <span className="text-foreground font-medium">{project.completedMilestones}</span>
                        /{project.totalMilestones} milestones
                      </span>
                    </div>
                    {project.deadline && (
                      <div className="text-muted-foreground">
                        Due: {new Date(project.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    data-testid={`button-analyze-${project.id}`}
                  >
                    <BarChart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to start tracking your coding journey
            </p>
            <Link href="/projects">
              <Button data-testid="button-create-first-project">
                Create Your First Project
              </Button>
            </Link>
          </div>
        )}
        
        {projects && projects.length > 3 && (
          <div className="text-center pt-4 border-t border-border">
            <Link href="/projects">
              <Button variant="outline" data-testid="button-view-all-projects">
                View All Projects ({projects.length})
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
