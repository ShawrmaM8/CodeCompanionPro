import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Lock, Star, Flame, Target, Code, Rocket, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { UserAchievement, Achievement } from "@shared/schema";

interface AchievementsGridProps {
  userAchievements: UserAchievement[];
}

export function AchievementsGrid({ userAchievements }: AchievementsGridProps) {
  const { data: allAchievements, isLoading } = useQuery({
    queryKey: ["/api/achievements"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'code_quality':
        return Star;
      case 'streak':
        return Flame;
      case 'milestone':
        return Target;
      case 'project_completion':
        return Rocket;
      case 'learning':
        return Code;
      default:
        return Trophy;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'code_quality':
        return 'accent';
      case 'streak':
        return 'destructive';
      case 'milestone':
        return 'primary';
      case 'project_completion':
        return 'secondary';
      case 'learning':
        return 'default';
      default:
        return 'outline';
    }
  };

  const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));

  // Default achievements if none exist in database
  const defaultAchievements = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Create your first project',
      type: 'project_completion',
      pointsReward: 50,
      icon: 'rocket',
      isActive: true,
    },
    {
      id: '2',
      name: 'Code Quality Champion',
      description: 'Achieve 90% code quality score',
      type: 'code_quality',
      pointsReward: 150,
      icon: 'star',
      isActive: true,
    },
    {
      id: '3',
      name: 'Streak Master',
      description: 'Maintain a 7-day coding streak',
      type: 'streak',
      pointsReward: 100,
      icon: 'flame',
      isActive: true,
    },
    {
      id: '4',
      name: 'Milestone Hero',
      description: 'Complete 10 milestones',
      type: 'milestone',
      pointsReward: 200,
      icon: 'target',
      isActive: true,
    },
    {
      id: '5',
      name: 'Learning Enthusiast',
      description: 'Analyze 25 code files',
      type: 'learning',
      pointsReward: 75,
      icon: 'code',
      isActive: true,
    },
    {
      id: '6',
      name: 'Project Master',
      description: 'Complete 3 projects',
      type: 'project_completion',
      pointsReward: 300,
      icon: 'award',
      isActive: true,
    },
  ];

  const achievements = allAchievements && allAchievements.length > 0 ? allAchievements : defaultAchievements;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-secondary" />
          <span>All Achievements</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement: Achievement | any) => {
            const isEarned = earnedAchievementIds.has(achievement.id);
            const IconComponent = getAchievementIcon(achievement.type);
            const color = getAchievementColor(achievement.type);
            const earnedDate = userAchievements.find(ua => ua.achievementId === achievement.id)?.earnedAt;
            
            return (
              <Card
                key={achievement.id}
                className={`relative transition-all duration-200 ${
                  isEarned 
                    ? 'border-accent shadow-lg bg-accent/5' 
                    : 'opacity-60 hover:opacity-80'
                }`}
                data-testid={`achievement-card-${achievement.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isEarned 
                          ? `bg-${color} text-white` 
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isEarned ? (
                        <IconComponent className="w-6 h-6" />
                      ) : (
                        <Lock className="w-6 h-6" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm" data-testid={`text-achievement-name-${achievement.id}`}>
                          {achievement.name}
                        </h3>
                        {isEarned && (
                          <Badge variant="secondary" className="text-xs">
                            Earned
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3" data-testid={`text-achievement-description-${achievement.id}`}>
                        {achievement.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-secondary" />
                          <span className="text-xs font-medium" data-testid={`text-achievement-points-${achievement.id}`}>
                            {achievement.pointsReward} points
                          </span>
                        </div>
                        
                        <Badge 
                          variant="outline" 
                          className="text-xs capitalize"
                          data-testid={`badge-achievement-type-${achievement.id}`}
                        >
                          {achievement.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {isEarned && earnedDate && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Earned: {new Date(earnedDate).toLocaleDateString()}
                        </div>
                      )}
                      
                      {!isEarned && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span>0%</span>
                          </div>
                          <Progress value={0} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {achievements.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No achievements available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check back later for new achievements to unlock!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
