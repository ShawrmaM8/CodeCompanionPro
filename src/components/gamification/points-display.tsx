import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function PointsDisplay() {
  const { data: pointsHistory, isLoading } = useQuery({
    queryKey: ["/api/points/history"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getReasonIcon = (reason: string) => {
    if (reason.includes('analysis')) return '🔍';
    if (reason.includes('milestone')) return '🎯';
    if (reason.includes('project')) return '📁';
    if (reason.includes('achievement')) return '🏆';
    if (reason.includes('streak')) return '🔥';
    return '⭐';
  };

  const getReasonColor = (reason: string) => {
    if (reason.includes('analysis')) return 'primary';
    if (reason.includes('milestone')) return 'accent';
    if (reason.includes('project')) return 'secondary';
    if (reason.includes('achievement')) return 'default';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-secondary" />
          <span>Points History</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {pointsHistory && pointsHistory.length > 0 ? (
          <div className="space-y-3">
            {pointsHistory.map((entry: any) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                data-testid={`points-entry-${entry.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-lg">{getReasonIcon(entry.reason)}</div>
                  <div>
                    <p className="font-medium text-sm">{entry.reason}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={getReasonColor(entry.reason) as any}
                    className="font-semibold"
                    data-testid={`points-badge-${entry.id}`}
                  >
                    +{entry.points}
                  </Badge>
                </div>
              </div>
            ))}
            
            {pointsHistory.length === 0 && (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No points earned yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start coding to earn your first points!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No points history available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete activities to start earning points!
            </p>
          </div>
        )}
        
        {/* Points Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-lg border border-secondary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Points Earned Today</span>
            </div>
            <span className="font-bold text-foreground" data-testid="text-daily-points">
              +{pointsHistory?.filter((entry: any) => 
                new Date(entry.createdAt).toDateString() === new Date().toDateString()
              ).reduce((sum: number, entry: any) => sum + entry.points, 0) || 0}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
