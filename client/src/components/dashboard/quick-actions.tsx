import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, MessageCircle, Flag } from "lucide-react";
import { Link } from "wouter";

export function QuickActions() {
  const actions = [
    {
      title: "Upload Code",
      description: "Analyze new code files",
      icon: Upload,
      color: "primary",
      href: "/analysis",
    },
    {
      title: "Chat with AI",
      description: "Get coding help",
      icon: MessageCircle,
      color: "secondary",
      href: "/mascot",
    },
    {
      title: "Set Milestone",
      description: "Track your progress",
      icon: Flag,
      color: "accent",
      href: "/projects",
    },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          
          return (
            <Link key={index} href={action.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start space-x-3 p-3 bg-${action.color}/5 border border-${action.color}/20 hover:bg-${action.color}/10`}
                data-testid={`action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`w-8 h-8 bg-${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="text-white text-sm" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground text-sm">{action.title}</p>
                  <p className="text-muted-foreground text-xs">{action.description}</p>
                </div>
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
