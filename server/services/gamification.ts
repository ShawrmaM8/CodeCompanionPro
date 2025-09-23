import { storage } from "../storage";
import { insertAchievementSchema, insertUserAchievementSchema, Achievement } from "@shared/schema";

interface UserStats {
  totalProjects: number;
  completedProjects: number;
  totalMilestones: number;
  currentStreak: number;
  maxCodeQuality: number;
  totalAnalyses: number;
  totalPoints: number;
}

class GamificationService {
  async initializeDefaultAchievements(): Promise<void> {
    const defaultAchievements = [
      {
        name: 'First Steps',
        description: 'Create your first project',
        type: 'project_completion' as const,
        icon: 'rocket',
        pointsReward: 50,
        criteria: { count: 1 },
        isActive: true,
      },
      {
        name: 'Code Quality Master',
        description: 'Achieve 90% code quality score',
        type: 'code_quality' as const,
        icon: 'star',
        pointsReward: 150,
        criteria: { threshold: 90 },
        isActive: true,
      },
      {
        name: 'Week Warrior',
        description: 'Maintain a 7-day coding streak',
        type: 'streak' as const,
        icon: 'flame',
        pointsReward: 100,
        criteria: { threshold: 7 },
        isActive: true,
      },
      {
        name: 'Month Master',
        description: 'Maintain a 30-day coding streak',
        type: 'streak' as const,
        icon: 'flame',
        pointsReward: 500,
        criteria: { threshold: 30 },
        isActive: true,
      },
      {
        name: 'Milestone Hero',
        description: 'Complete 10 milestones',
        type: 'milestone' as const,
        icon: 'target',
        pointsReward: 200,
        criteria: { count: 10 },
        isActive: true,
      },
      {
        name: 'Analysis Expert',
        description: 'Analyze 25 code files',
        type: 'learning' as const,
        icon: 'code',
        pointsReward: 75,
        criteria: { count: 25 },
        isActive: true,
      },
      {
        name: 'Project Master',
        description: 'Complete 3 projects',
        type: 'project_completion' as const,
        icon: 'award',
        pointsReward: 300,
        criteria: { count: 3 },
        isActive: true,
      },
      {
        name: 'Consistency Champion',
        description: 'Code for 5 days in a row',
        type: 'streak' as const,
        icon: 'calendar',
        pointsReward: 75,
        criteria: { threshold: 5 },
        isActive: true,
      },
      {
        name: 'Quality Assurance',
        description: 'Achieve 95% code quality score',
        type: 'code_quality' as const,
        icon: 'shield',
        pointsReward: 250,
        criteria: { threshold: 95 },
        isActive: true,
      },
      {
        name: 'Learning Machine',
        description: 'Analyze 50 code files',
        type: 'learning' as const,
        icon: 'brain',
        pointsReward: 150,
        criteria: { count: 50 },
        isActive: true,
      },
    ];

    try {
      const existingAchievements = await storage.getAllAchievements();
      
      if (existingAchievements.length === 0) {
        for (const achievement of defaultAchievements) {
          try {
            const validatedAchievement = insertAchievementSchema.parse(achievement);
            await storage.createAchievement?.(validatedAchievement);
          } catch (error) {
            console.error('Failed to create achievement:', achievement.name, error);
          }
        }
        console.log('Default achievements initialized');
      }
    } catch (error) {
      console.error('Failed to initialize achievements:', error);
    }
  }

  async checkAchievements(userId: string): Promise<void> {
    try {
      const userStats = await this.getUserStats(userId);
      const allAchievements = await storage.getAllAchievements();
      const userAchievements = await storage.getUserAchievements(userId);
      const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));

      for (const achievement of allAchievements) {
        if (earnedAchievementIds.has(achievement.id)) {
          continue; // Already earned
        }

        if (this.checkAchievementCriteria(achievement, userStats)) {
          await this.awardAchievement(userId, achievement.id, achievement.pointsReward ?? 0);
        }
      }
    } catch (error) {
      console.error('Failed to check achievements for user:', userId, error);
    }
  }

  private checkAchievementCriteria(achievement: Achievement, userStats: UserStats): boolean {
    const criteria = achievement.criteria as any;

    switch (achievement.type) {
      case 'project_completion':
        return userStats.completedProjects >= (criteria.count || 0);
      
      case 'code_quality':
        return userStats.maxCodeQuality >= (criteria.threshold || 0);
      
      case 'streak':
        return userStats.currentStreak >= (criteria.threshold || 0);
      
      case 'milestone':
        return userStats.totalMilestones >= (criteria.count || 0);
      
      case 'learning':
        return userStats.totalAnalyses >= (criteria.count || 0);
      
      default:
        return false;
    }
  }

  private async awardAchievement(userId: string, achievementId: string, pointsReward: number): Promise<void> {
    try {
      // Award the achievement
      await storage.awardAchievement(userId, achievementId);

      // Award points
      await storage.addPointsToUser(userId, pointsReward, 'Achievement unlocked', { achievementId });

      // Log activity
      const achievement = await this.getAchievementById(achievementId);
      await storage.logActivity({
        userId,
        activityType: 'achievement_unlocked',
        description: `Achievement unlocked: ${achievement?.name || 'Unknown'}`,
        pointsAwarded: pointsReward,
        metadata: { achievementId, achievementName: achievement?.name ?? 'Unknown' },
      });

      console.log(`Achievement awarded: ${achievement?.name} to user ${userId}`);
    } catch (error) {
      console.error('Failed to award achievement:', error);
    }
  }

  private async getAchievementById(achievementId: string): Promise<Achievement | null> {
    try {
      const achievements = await storage.getAllAchievements();
      return achievements.find(a => a.id === achievementId) || null;
    } catch (error) {
      console.error('Failed to get achievement by ID:', error);
      return null;
    }
  }

  private async getUserStats(userId: string): Promise<UserStats> {
    try {
      const [user, projects, analysisHistory] = await Promise.all([
        storage.getUser(userId),
        storage.getUserProjects(userId),
        storage.getUserAnalysisHistory(userId, 100), // Get more for accurate stats
      ]);

      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const totalMilestones = projects.reduce((sum, p) => sum + (p.completedMilestones ?? 0), 0);
      const maxCodeQuality = Math.max(0, ...projects.map(p => p.codeQualityScore ?? 0));

      return {
        totalProjects: projects.length,
        completedProjects,
        totalMilestones,
        currentStreak: user?.currentStreak || 0,
        maxCodeQuality,
        totalAnalyses: analysisHistory.length,
        totalPoints: user?.totalPoints || 0,
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        totalProjects: 0,
        completedProjects: 0,
        totalMilestones: 0,
        currentStreak: 0,
        maxCodeQuality: 0,
        totalAnalyses: 0,
        totalPoints: 0,
      };
    }
  }

  calculatePoints(action: string, metadata?: any): number {
    const pointsRules: { [key: string]: number } = {
      project_created: 50,
      code_analysis: 10,
      milestone_completed: 100,
      achievement_unlocked: 50,
      daily_streak: 25,
      challenge_completed: 75,    // Free tier: mini challenges
      mentor_hint_used: 15,       // Pro tier: mentor hints  
      deep_dive_completed: 200,   // Premium tier: deep dive mode
    };

    let basePoints = pointsRules[action] || 0;
    const tier = metadata?.userTier || 'free';

    // Apply tier-specific multipliers
    basePoints = this.applyTierMultipliers(basePoints, action, tier, metadata);

    // Apply context-based multipliers
    if (action === 'code_analysis' && metadata?.score >= 90) {
      basePoints = Math.round(basePoints * 1.5);
    }

    if (action === 'daily_streak' && metadata?.streakLength) {
      const multiplier = Math.min(1 + (metadata.streakLength * 0.1), 2.0);
      basePoints = Math.round(basePoints * multiplier);
    }

    return basePoints;
  }

  private applyTierMultipliers(basePoints: number, action: string, tier: 'free' | 'pro' | 'premium', metadata?: any): number {
    let multiplier = 1;

    switch (tier) {
      case 'pro':
        // Pro tier: Enhanced multipliers and streak bonuses
        if (action === 'achievement_unlocked') {
          multiplier = 1.5; // Achievement chains bonus
        }
        if (action === 'daily_streak' && metadata?.streakLength >= 7) {
          multiplier = 2.0; // Streak multiplier bonus
        }
        break;

      case 'premium':
        // Premium tier: Exponential multipliers and unlockable abilities  
        if (action === 'achievement_unlocked') {
          multiplier = 2.5; // Higher achievement bonus
        }
        if (action === 'daily_streak') {
          const streakBonus = Math.min(metadata?.streakLength / 5, 3); // Up to 3x for long streaks
          multiplier = Math.max(2.0, streakBonus);
        }
        if (action === 'code_analysis' && metadata?.score >= 95) {
          multiplier = 3.0; // Premium excellence bonus
        }
        break;

      default: // free tier
        // Free tier: Standard multipliers only
        break;
    }

    return Math.round(basePoints * multiplier);
  }

  async updateUserStreak(userId: string): Promise<void> {
    try {
      await storage.updateUserStreak(userId);
      
      // Check if this qualifies for streak achievements
      const user = await storage.getUser(userId);
      if (user) {
        await this.checkAchievements(userId);
        
        // Award daily streak points
        const streakPoints = this.calculatePoints('daily_streak', { streakLength: user.currentStreak });
        await storage.addPointsToUser(userId, streakPoints, 'Daily coding streak', { 
          streak: user.currentStreak 
        });
      }
    } catch (error) {
      console.error('Failed to update user streak:', error);
    }
  }

  // Challenge system for Free tier users
  async generateMiniChallenge(userId: string): Promise<{id: string, title: string, description: string, points: number} | null> {
    const user = await storage.getUser(userId);
    if (!user) return null;

    const challenges = [
      { id: 'challenge_1', title: 'Variable Naming Master', description: 'Rename 3 variables to follow camelCase convention', points: 25 },
      { id: 'challenge_2', title: 'Function Extractor', description: 'Extract a reusable function from repeated code', points: 50 },
      { id: 'challenge_3', title: 'Error Handler', description: 'Add proper error handling to a function', points: 35 },
      { id: 'challenge_4', title: 'Code Commenter', description: 'Add meaningful comments to 5 lines of code', points: 20 },
      { id: 'challenge_5', title: 'Performance Booster', description: 'Optimize a loop for better performance', points: 45 },
    ];

    // Return random challenge  
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    return randomChallenge;
  }

  // Mentor hints for Pro tier users
  async generateMentorHint(userId: string, context?: any): Promise<string | null> {
    const user = await storage.getUser(userId);
    if (!user || user.subscriptionTier === 'free') return null;

    const hints = [
      'Consider breaking this large function into smaller, focused functions',
      'This variable name could be more descriptive - try explaining what it stores',
      'Adding error handling here would make your code more robust',
      'This pattern could benefit from using a design pattern like Strategy or Factory',
      'Consider using const instead of let when the value won\'t change',
      'This loop could be optimized using built-in array methods like map or filter',
    ];

    return hints[Math.floor(Math.random() * hints.length)];
  }

  // Deep dive explanations for Premium tier users  
  async generateDeepDiveExplanation(userId: string, topic: string): Promise<{title: string, explanation: string, examples: string[]} | null> {
    const user = await storage.getUser(userId);
    if (!user || user.subscriptionTier !== 'premium') return null;

    const explanations: {[key: string]: any} = {
      'error_handling': {
        title: 'Comprehensive Error Handling Strategies',
        explanation: 'Error handling is crucial for robust applications. There are several approaches: try-catch blocks for synchronous code, promise rejection handling for asynchronous operations, and defensive programming with input validation.',
        examples: [
          'try { riskyOperation(); } catch (error) { handleError(error); }',
          'async function fetchData() { try { return await api.getData(); } catch (error) { throw new CustomError(error.message); } }',
          'function processInput(input) { if (!input || typeof input !== "string") { throw new Error("Invalid input"); } return input.trim(); }'
        ]
      },
      'performance_optimization': {
        title: 'Code Performance Optimization Techniques', 
        explanation: 'Performance optimization involves understanding bottlenecks, algorithmic complexity, and efficient data structures. Key strategies include minimizing DOM manipulation, using efficient algorithms, and leveraging browser caching.',
        examples: [
          'const memoized = useMemo(() => expensiveCalculation(data), [data]);',
          'const debounced = debounce(handleSearch, 300);',
          'for (const item of items) { /* more efficient than forEach for large arrays */ }'
        ]
      }
    };

    return explanations[topic] || null;
  }

  getSubscriptionLimits(tier: 'free' | 'pro' | 'premium') {
    const limits = {
      free: {
        projects: 5,
        analysisPerDay: 10,
        milestonePerProject: 5,
        features: {
          advancedAnalysis: false,
          prioritySupport: false,
          customIntegrations: false,
          teamCollaboration: false,
          exportCapabilities: false,
          aiEnhancements: false,
        },
      },
      pro: {
        projects: 15,
        analysisPerDay: 50,
        milestonePerProject: 20,
        features: {
          advancedAnalysis: true,
          prioritySupport: false,
          customIntegrations: false,
          teamCollaboration: false,
          exportCapabilities: true,
          aiEnhancements: true,
        },
      },
      premium: {
        projects: -1, // unlimited
        analysisPerDay: -1, // unlimited
        milestonePerProject: -1, // unlimited
        features: {
          advancedAnalysis: true,
          prioritySupport: true,
          customIntegrations: true,
          teamCollaboration: true,
          exportCapabilities: true,
          aiEnhancements: true,
        },
      },
    };

    return limits[tier];
  }

  async checkSubscriptionLimits(userId: string, action: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return false;

      const limits = this.getSubscriptionLimits(user.subscriptionTier ?? 'free');

      switch (action) {
        case 'create_project':
          if (limits.projects === -1) return true;
          const projectCount = await storage.getUserProjectCount(userId);
          return projectCount < limits.projects;

        case 'code_analysis':
          if (limits.analysisPerDay === -1) return true;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const analysisToday = await storage.getUserAnalysisHistory(userId, 100);
          const todayCount = analysisToday.filter(a => 
            a.createdAt && new Date(a.createdAt).toDateString() === today.toDateString()
          ).length;
          return todayCount < limits.analysisPerDay;

        default:
          return true;
      }
    } catch (error) {
      console.error('Failed to check subscription limits:', error);
      return false;
    }
  }
}

export const gamificationService = new GamificationService();
