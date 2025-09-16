import { Layout } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AchievementsGrid } from "@/components/gamification/achievements-grid";
import { PointsDisplay } from "@/components/gamification/points-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAchievements } from "@/hooks/use-achievements";
import { useUserData } from "@/hooks/use-user-data";

export default function Achievements() {
  const { data: userAchievements, isLoading: achievementsLoading } = useAchievements();
  const { data: user, isLoading: userLoading } = useUserData();

  if (achievementsLoading || userLoading) {
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
        <Header 
          title="Achievements" 
          subtitle="Track your progress and celebrate your coding milestones" 
        />
        
        <div className="p-6 space-y-6">
          {/* Points and Streak Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Total Points</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-primary" data-testid="text-total-points">
                  {user?.totalPoints || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Points earned
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Current Streak</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-accent" data-testid="text-current-streak">
                  {user?.currentStreak || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Days in a row
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Achievements</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-secondary" data-testid="text-achievement-count">
                  {userAchievements?.length || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Unlocked
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Points History */}
          <PointsDisplay />
          
          {/* Achievements Grid */}
          <AchievementsGrid userAchievements={userAchievements || []} />
        </div>
      </main>
    </Layout>
  );
}
