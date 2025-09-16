import {
  users,
  projects,
  milestones,
  codeAnalysis,
  achievements,
  userAchievements,
  pointsHistory,
  mascotInteractions,
  activityLog,
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type Milestone,
  type InsertMilestone,
  type CodeAnalysis,
  type InsertCodeAnalysis,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type PointsHistory,
  type InsertPointsHistory,
  type MascotInteraction,
  type InsertMascotInteraction,
  type ActivityLog,
  type InsertActivityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  updateUserSubscription(id: string, tier: 'free' | 'pro' | 'premium'): Promise<User>;
  addPointsToUser(userId: string, points: number, reason: string, metadata?: any): Promise<void>;

  // Project operations
  getUserProjects(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  getUserProjectCount(userId: string): Promise<number>;

  // Milestone operations
  getProjectMilestones(projectId: string): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  completeMilestone(id: string, pointsReward?: number): Promise<Milestone>;

  // Code Analysis operations
  createCodeAnalysis(analysis: InsertCodeAnalysis): Promise<CodeAnalysis>;
  getProjectAnalysis(projectId: string): Promise<CodeAnalysis[]>;
  getUserAnalysisHistory(userId: string, limit?: number): Promise<CodeAnalysis[]>;

  // Achievement operations
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  getAchievementById(id: string): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  createUserAchievement(data: InsertUserAchievement): Promise<UserAchievement>;
  awardAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  checkAndAwardAchievements(userId: string): Promise<UserAchievement[]>;

  // Gamification operations
  getUserPointsHistory(userId: string, limit?: number): Promise<PointsHistory[]>;
  updateUserStreak(userId: string): Promise<void>;

  // Mascot operations
  createMascotInteraction(interaction: InsertMascotInteraction): Promise<MascotInteraction>;
  getUserMascotHistory(userId: string, limit?: number): Promise<MascotInteraction[]>;

  // Activity operations
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getUserActivity(userId: string, limit?: number): Promise<ActivityLog[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Handle preferences field type conversion
    const userDataWithTypedPreferences = {
      ...userData,
      preferences: userData.preferences as { mascotPersonality?: string; codeAnalysisSettings?: any; notificationSettings?: any; } | undefined
    };
    const [user] = await db.insert(users).values(userDataWithTypedPreferences).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const updateData = { 
      ...updates, 
      updatedAt: new Date(),
      // Properly type the preferences field if it exists
      preferences: updates.preferences ? 
        updates.preferences as { mascotPersonality?: string; codeAnalysisSettings?: any; notificationSettings?: any; } : 
        updates.preferences
    };
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserSubscription(id: string, tier: 'free' | 'pro' | 'premium'): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ subscriptionTier: tier, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async addPointsToUser(userId: string, points: number, reason: string, metadata?: any): Promise<void> {
    await db.transaction(async (tx) => {
      // Update user's total points
      await tx
        .update(users)
        .set({ 
          totalPoints: sql`${users.totalPoints} + ${points}`,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Record points history
      await tx.insert(pointsHistory).values([{
        userId,
        points,
        reason,
        metadata: metadata || {},
      }]);
    });
  }

  // Project operations
  async getUserProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(projectData: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values([projectData]).returning();
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getUserProjectCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.userId, userId));
    return result.count;
  }

  // Milestone operations
  async getProjectMilestones(projectId: string): Promise<Milestone[]> {
    return await db
      .select()
      .from(milestones)
      .where(eq(milestones.projectId, projectId))
      .orderBy(milestones.createdAt);
  }

  async createMilestone(milestoneData: InsertMilestone): Promise<Milestone> {
    const [milestone] = await db.insert(milestones).values([milestoneData]).returning();
    return milestone;
  }

  async completeMilestone(id: string, pointsReward?: number): Promise<Milestone> {
    const [milestone] = await db
      .update(milestones)
      .set({ 
        isCompleted: true, 
        completedAt: new Date(),
        pointsReward: pointsReward || 0
      })
      .where(eq(milestones.id, id))
      .returning();
    return milestone;
  }

  // Code Analysis operations
  async createCodeAnalysis(analysisData: InsertCodeAnalysis): Promise<CodeAnalysis> {
    // Type the analysisResults properly
    const typedAnalysisData = {
      ...analysisData,
      analysisResults: analysisData.analysisResults as {
        overallScore: number;
        bestPractices: number;
        performance: number;
        maintainability: number;
        security: number;
        issues: Array<{
          type: string;
          severity: string;
          message: string;
          line?: number;
          suggestion?: string;
        }>;
        strengths: string[];
        improvements: string[];
      }
    };
    const [analysis] = await db.insert(codeAnalysis).values(typedAnalysisData).returning();
    return analysis;
  }

  async getProjectAnalysis(projectId: string): Promise<CodeAnalysis[]> {
    return await db
      .select()
      .from(codeAnalysis)
      .where(eq(codeAnalysis.projectId, projectId))
      .orderBy(desc(codeAnalysis.createdAt));
  }

  async getUserAnalysisHistory(userId: string, limit: number = 10): Promise<CodeAnalysis[]> {
    return await db
      .select()
      .from(codeAnalysis)
      .where(eq(codeAnalysis.userId, userId))
      .orderBy(desc(codeAnalysis.createdAt))
      .limit(limit);
  }

  // Achievement operations
  async getAllAchievements(): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.isActive, true))
      .orderBy(achievements.createdAt);
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.earnedAt));
  }

  async getAchievementById(id: string): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement || undefined;
  }

  async createAchievement(achievementData: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db.insert(achievements).values(achievementData).returning();
    return achievement;
  }

  async createUserAchievement(data: InsertUserAchievement): Promise<UserAchievement> {
    const [userAchievement] = await db.insert(userAchievements).values(data).returning();
    return userAchievement;
  }

  async awardAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const [userAchievement] = await db
      .insert(userAchievements)
      .values({ userId, achievementId })
      .returning();
    return userAchievement;
  }

  async checkAndAwardAchievements(userId: string): Promise<UserAchievement[]> {
    // This would contain complex logic to check achievement criteria
    // For now, return empty array - implementation would be in gamification service
    return [];
  }

  // Gamification operations
  async getUserPointsHistory(userId: string, limit: number = 20): Promise<PointsHistory[]> {
    return await db
      .select()
      .from(pointsHistory)
      .where(eq(pointsHistory.userId, userId))
      .orderBy(desc(pointsHistory.createdAt))
      .limit(limit);
  }

  async updateUserStreak(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if user was active yesterday
    const [recentActivity] = await db
      .select()
      .from(activityLog)
      .where(
        and(
          eq(activityLog.userId, userId),
          gte(activityLog.createdAt, yesterday)
        )
      )
      .limit(1);

    if (recentActivity) {
      // Continue streak
      await db
        .update(users)
        .set({ 
          currentStreak: (user.currentStreak ?? 0) + 1,
          longestStreak: Math.max(user.longestStreak ?? 0, (user.currentStreak ?? 0) + 1),
          lastActiveAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    } else {
      // Reset streak
      await db
        .update(users)
        .set({ 
          currentStreak: 1,
          lastActiveAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    }
  }

  // Mascot operations
  async createMascotInteraction(interactionData: InsertMascotInteraction): Promise<MascotInteraction> {
    const [interaction] = await db.insert(mascotInteractions).values([interactionData]).returning();
    return interaction;
  }

  async getUserMascotHistory(userId: string, limit: number = 50): Promise<MascotInteraction[]> {
    return await db
      .select()
      .from(mascotInteractions)
      .where(eq(mascotInteractions.userId, userId))
      .orderBy(desc(mascotInteractions.createdAt))
      .limit(limit);
  }

  // Activity operations
  async logActivity(activityData: InsertActivityLog): Promise<ActivityLog> {
    const [activity] = await db.insert(activityLog).values([activityData]).returning();
    return activity;
  }

  async getUserActivity(userId: string, limit: number = 20): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.userId, userId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
