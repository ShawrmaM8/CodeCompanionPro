import { Bell, Star, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/use-user-data";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data: user } = useUserData();

  const displayTitle = title || `Welcome back, ${user?.firstName || 'User'}!`;
  const displaySubtitle = subtitle || "Let's continue building amazing projects together";

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
            {displayTitle}
          </h2>
          <p className="text-muted-foreground" data-testid="text-page-subtitle">
            {displaySubtitle}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Points Display */}
          <div className="flex items-center space-x-2 bg-muted px-4 py-2 rounded-lg" data-testid="display-points">
            <Star className="w-4 h-4 text-secondary" />
            <span className="font-semibold text-foreground">
              {user?.totalPoints?.toLocaleString() || '0'}
            </span>
            <span className="text-muted-foreground text-sm">points</span>
          </div>
          
          {/* Streak Counter */}
          <div className="flex items-center space-x-2 bg-accent/10 px-4 py-2 rounded-lg" data-testid="display-streak">
            <Flame className="w-4 h-4 text-accent" />
            <span className="font-semibold text-foreground">
              {user?.currentStreak || '0'}
            </span>
            <span className="text-muted-foreground text-sm">day streak</span>
          </div>
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            data-testid="button-notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
}
