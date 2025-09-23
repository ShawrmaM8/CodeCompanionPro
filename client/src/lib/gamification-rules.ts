export interface AchievementRule {
  id: string;
  name: string;
  description: string;
  type: 'code_quality' | 'streak' | 'milestone' | 'project_completion' | 'learning';
  criteria: {
    threshold?: number;
    count?: number;
    condition?: string;
  };
  pointsReward: number;
  icon: string;
}

export interface PointsRule {
  action: string;
  basePoints: number;
  multiplier?: number;
  maxDaily?: number;
}

export class GamificationRules {
  private achievementRules: AchievementRule[] = [
    {
      id: 'first_project',
      name: 'First Steps',
      description: 'Create your first project',
      type: 'project_completion',
      criteria: { count: 1 },
      pointsReward: 50,
      icon: 'rocket',
    },
    {
      id: 'code_quality_master',
      name: 'Code Quality Master',
      description: 'Achieve 90% code quality score',
      type: 'code_quality',
      criteria: { threshold: 90 },
      pointsReward: 150,
      icon: 'star',
    },
    {
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day coding streak',
      type: 'streak',
      criteria: { threshold: 7 },
      pointsReward: 100,
      icon: 'flame',
    },
    {
      id: 'streak_30',
      name: 'Month Master',
      description: 'Maintain a 30-day coding streak',
      type: 'streak',
      criteria: { threshold: 30 },
      pointsReward: 500,
      icon: 'flame',
    },
    {
      id: 'milestone_10',
      name: 'Milestone Hero',
      description: 'Complete 10 milestones',
      type: 'milestone',
      criteria: { count: 10 },
      pointsReward: 200,
      icon: 'target',
    },
    {
      id: 'analysis_25',
      name: 'Analysis Expert',
      description: 'Analyze 25 code files',
      type: 'learning',
      criteria: { count: 25 },
      pointsReward: 75,
      icon: 'code',
    },
    {
      id: 'projects_3',
      name: 'Project Master',
      description: 'Complete 3 projects',
      type: 'project_completion',
      criteria: { count: 3 },
      pointsReward: 300,
      icon: 'award',
    },
  ];

  private pointsRules: PointsRule[] = [
    {
      action: 'project_created',
      basePoints: 50,
      maxDaily: 150, // Max 3 projects per day
    },
    {
      action: 'code_analysis',
      basePoints: 10,
      multiplier: 1.5, // Bonus for high quality code
      maxDaily: 100,
    },
    {
      action: 'milestone_completed',
      basePoints: 100,
      maxDaily: 500,
    },
    {
      action: 'achievement_unlocked',
      basePoints: 50,
      maxDaily: 1000,
    },
    {
      action: 'daily_streak',
      basePoints: 25,
      multiplier: 1.1, // Increases with streak length
      maxDaily: 25,
    },
  ];

  calculatePoints(action: string, metadata?: any): number {
    const rule = this.pointsRules.find(r => r.action === action);
    if (!rule) return 0;

    let points = rule.basePoints;

    // Apply multipliers based on context
    if (rule.multiplier && metadata) {
      switch (action) {
        case 'code_analysis':
          if (metadata.score >= 90) points *= rule.multiplier;
          break;
        case 'daily_streak':
          const streakMultiplier = Math.min(rule.multiplier * metadata.streakLength, 2.0);
          points = Math.round(points * streakMultiplier);
          break;
      }
    }

    return points;
  }

  checkAchievementCriteria(rule: AchievementRule, userStats: any): boolean {
    switch (rule.type) {
      case 'code_quality':
        return userStats.maxCodeQuality >= rule.criteria.threshold!;
      
      case 'streak':
        return userStats.currentStreak >= rule.criteria.threshold!;
      
      case 'milestone':
        return userStats.totalMilestones >= rule.criteria.count!;
      
      case 'project_completion':
        return userStats.completedProjects >= rule.criteria.count!;
      
      case 'learning':
        return userStats.totalAnalyses >= rule.criteria.count!;
      
      default:
        return false;
    }
  }

  getEligibleAchievements(userStats: any, earnedAchievements: string[]): AchievementRule[] {
    return this.achievementRules.filter(rule => 
      !earnedAchievements.includes(rule.id) && 
      this.checkAchievementCriteria(rule, userStats)
    );
  }

  getAllAchievements(): AchievementRule[] {
    return this.achievementRules;
  }

  getPointsRule(action: string): PointsRule | undefined {
    return this.pointsRules.find(r => r.action === action);
  }

  // Subscription tier limits
  getProjectLimit(tier: 'free' | 'pro' | 'premium'): number {
    const limits = {
      free: 5,       // Updated: Free tier now allows 5 projects
      pro: 15,       // Updated: Pro tier now allows 15 projects  
      premium: -1,   // Premium: unlimited projects
    };
    return limits[tier];
  }

  getFeatureAccess(tier: 'free' | 'pro' | 'premium') {
    return {
      advancedAnalysis: tier !== 'free',
      prioritySupport: tier === 'premium',
      customIntegrations: tier === 'premium',
      teamCollaboration: tier === 'premium',
      exportCapabilities: tier !== 'free',
      aiEnhancements: tier !== 'free',
    };
  }
}

export const gamificationRules = new GamificationRules();
