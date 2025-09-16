import { Card, CardContent } from "@/components/ui/card";
import { Code, CheckCircle, Flag, Clock, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function QuickStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const statItems = [
    {
      label: "Active Projects",
      value: stats?.activeProjects || 0,
      icon: Code,
      change: "+12%",
      changeLabel: "from last week",
      color: "primary",
    },
    {
      label: "Code Quality",
      value: `${stats?.codeQuality || 0}%`,
      icon: CheckCircle,
      change: "+5%",
      changeLabel: "improvement",
      color: "accent",
    },
    {
      label: "Milestones",
      value: stats?.completedMilestones || 0,
      icon: Flag,
      change: "+3",
      changeLabel: "this week",
      color: "secondary",
    },
    {
      label: "Learning Hours",
      value: stats?.learningHours || 0,
      icon: Clock,
      change: "8.5h",
      changeLabel: "this week",
      color: "accent",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat, index) => {
        const IconComponent = stat.icon;
        
        return (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}/10 rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`text-${stat.color} text-xl`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-accent mr-1" />
                <span className="text-accent">{stat.change}</span>
                <span className="text-muted-foreground ml-2">{stat.changeLabel}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
