import { Layout } from "@/components/layout/sidebar";
import { AIMascot } from "@/components/dashboard/ai-mascot";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { ProjectsPanel } from "@/components/dashboard/projects-panel";
import { AchievementsPanel } from "@/components/dashboard/achievements-panel";
import { AnalysisSummary } from "@/components/dashboard/analysis-summary";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Header } from "@/components/layout/header";

export default function Dashboard() {
  return (
    <Layout>
      <main className="flex-1 overflow-auto">
        <Header />
        
        <div className="p-6 space-y-6">
          {/* AI Mascot Section */}
          <AIMascot />
          
          {/* Quick Stats Grid */}
          <QuickStats />
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Projects */}
            <div className="lg:col-span-2">
              <ProjectsPanel />
            </div>
            
            {/* Right Sidebar Content */}
            <div className="space-y-6">
              <AchievementsPanel />
              <AnalysisSummary />
              <QuickActions />
            </div>
          </div>
          
          {/* Recent Activity Feed */}
          <ActivityFeed />
        </div>
      </main>
    </Layout>
  );
}
