import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, Rocket } from "lucide-react";
import { useAchievements } from "@/hooks/use-achievements";
import { Link } from "wouter";

export function AchievementsPanel() {
  const { data: userAchievements, isLoading } = useAchievements();

  const recentAchievements = [
    {
      title: "Code Quality Master",
      description: "Achieved 90% code quality score",
      points: 150,
      icon: Trophy,
      color: "accent",
    },
    {
      title: "Streak Champion",
      description: "10 day coding streak",
      points: 100,
      icon: Flame,
      color: "primary",
    },
    {
      title: "Project Pioneer",
      description: "Completed first milestone",
      points: 75,
      icon: Rocket,
      color: "secondary",
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Recent Achievements</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {recentAchievements.map((achievement, index) => {
          const IconComponent = achievement.icon;
          
          return (
            <div 
              key={index} 
              className={`flex items-center space-x-3 p-3 bg-${achievement.color}/5 rounded-lg border border-${achievement.color}/20`}
              data-testid={`achievement-${index}`}
            >
              <div className={`w-10 h-10 bg-gradient-to-br from-${achievement.color} to-secondary rounded-full flex items-center justify-center`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{achievement.title}</p>
                <p className="text-muted-foreground text-xs">{achievement.description}</p>
              </div>
              <div className="text-secondary font-bold text-sm">+{achievement.points}</div>
            </div>
          );
        })}
        
        <Link href="/achievements">
          <Button 
            variant="outline" 
            className="w-full mt-4"
            data-testid="button-view-all-achievements"
          >
            View All Achievements
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
