import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Trophy, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function ActivityFeed() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activity"],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "code_analysis":
        return Code;
      case "achievement_unlocked":
        return Trophy;
      case "milestone_completed":
        return CheckCircle;
      default:
        return Code;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "code_analysis":
        return "accent";
      case "achievement_unlocked":
        return "secondary";
      case "milestone_completed":
        return "primary";
      default:
        return "muted";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Recent Activity</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {activities && activities.length > 0 ? (
          activities.map((activity: any) => {
            const IconComponent = getActivityIcon(activity.activityType);
            const color = getActivityColor(activity.activityType);
            
            return (
              <div 
                key={activity.id} 
                className="flex items-start space-x-4 pb-4 border-b border-border last:border-b-0 last:pb-0"
                data-testid={`activity-${activity.id}`}
              >
                <div className={`w-10 h-10 bg-${color}/10 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className={`text-${color} w-5 h-5`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-foreground">{activity.description}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {activity.pointsAwarded > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        +{activity.pointsAwarded} points
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent activity found.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start coding to see your activity here!
            </p>
          </div>
        )}
        
        {activities && activities.length > 0 && (
          <Button 
            variant="outline" 
            className="w-full mt-6"
            data-testid="button-view-all-activity"
          >
            View All Activity
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
