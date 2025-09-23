import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Folder, 
  BarChart3, 
  Trophy, 
  Heart, 
  Bot,
  Settings
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUserData } from "@/hooks/use-user-data";

interface LayoutProps {
  children: ReactNode;
}

const navigationItems = [
  { path: "/", icon: Home, label: "Dashboard" },
  { path: "/projects", icon: Folder, label: "My Projects" },
  { path: "/analysis", icon: BarChart3, label: "Code Analysis" },
  { path: "/achievements", icon: Trophy, label: "Achievements" },
  { path: "/mascot", icon: Heart, label: "AI Companion" },
];

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { data: user } = useUserData();

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo and Brand */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center space-x-3" data-testid="link-home">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="text-primary-foreground text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CodeMentor</h1>
              <p className="text-sm text-muted-foreground">AI Coding Tutor</p>
            </div>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2" data-testid="navigation-menu">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* User Profile & Subscription */}
        <div className="p-4 border-t border-border" data-testid="user-profile-section">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar>
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate" data-testid="text-user-name">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">
                {user?.email}
              </p>
            </div>
          </div>
          
          {/* Subscription Badge */}
          <Link href="/subscription" className="block mb-3" data-testid="link-subscription">
            <div className="bg-gradient-to-r from-secondary to-accent px-3 py-2 rounded-lg text-center hover:opacity-90 transition-opacity">
              <p className="text-white text-xs font-medium capitalize" data-testid="text-subscription-tier">
                {user?.subscriptionTier || 'free'} Plan - {
                  user?.subscriptionTier === 'free' ? 'Free' :
                  user?.subscriptionTier === 'pro' ? '$20/month' :
                  '$50/month'
                }
              </p>
              <p className="text-white/80 text-xs">Active</p>
            </div>
          </Link>
          
          {/* Offline Status */}
          <div className="flex items-center justify-center text-xs">
            <div className="flex items-center space-x-2 text-accent" data-testid="status-connection">
              <div className="w-2 h-2 bg-accent rounded-full offline-pulse" />
              <span>Offline Mode</span>
            </div>
          </div>
        </div>
      </aside>
      
      {children}
    </div>
  );
}
