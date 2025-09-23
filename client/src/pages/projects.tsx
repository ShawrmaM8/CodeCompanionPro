import { useState } from "react";
import { Layout } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectWizard } from "@/components/projects/project-wizard";
import { ProjectCard } from "@/components/projects/project-card";
import { useProjects } from "@/hooks/use-projects";
import { Plus } from "lucide-react";

export default function Projects() {
  const [showWizard, setShowWizard] = useState(false);
  const { data: projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="flex-1 overflow-auto">
        <Header title="My Projects" subtitle="Manage and track your coding projects" />
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Your Projects</h2>
              <p className="text-muted-foreground">
                Create and manage up to {/* subscription limit */} projects
              </p>
            </div>
            <Button 
              onClick={() => setShowWizard(true)}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-create-project"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first project to start tracking your coding journey
                </p>
                <Button 
                  onClick={() => setShowWizard(true)}
                  data-testid="button-create-first-project"
                >
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          )}

          <ProjectWizard 
            open={showWizard} 
            onClose={() => setShowWizard(false)} 
          />
        </div>
      </main>
    </Layout>
  );
}
