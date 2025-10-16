import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProjectSchema,
  insertMilestoneSchema,
  insertCodeAnalysisSchema,
  insertMascotInteractionSchema,
  Project,
  type InsertProject,
  type InsertMilestone,
  type InsertCodeAnalysis,
  type InsertMascotInteraction
} from "@shared/schema";
import { codeAnalysisService } from "./services/code-analysis.js";
import { gamificationService } from "./services/gamification.js";
import { mascotService } from "./services/mascot.js";
import { authenticateUser, optionalAuth, getCurrentUserId, type AuthenticatedRequest } from "./middleware/auth.js";
import { z } from "zod";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to get current user ID from request
  const getUserIdFromRequest = (req: AuthenticatedRequest): string => {
    const userId = getCurrentUserId(req);
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return userId;
  };

  // Initialize user and data (requires authentication)
  app.post("/api/init", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const user = req.user;
      
      // Check if user exists, create if not
      let dbUser = await storage.getUser(userId);
      if (!dbUser) {
        dbUser = await storage.createUser({
          firstName: user?.firstName || "User",
          lastName: user?.lastName || "Developer",
          email: user?.emailAddresses?.[0]?.emailAddress || "user@example.com",
          subscriptionTier: "free", // Start with free tier
          totalPoints: 0,
          currentStreak: 0,
          longestStreak: 0
        });

        // Create sample achievements and projects
        await gamificationService.initializeDefaultAchievements();
        await createSampleProjects(userId);
      }

      res.json({ user: dbUser });
    } catch (error) {
      console.error("Error initializing user:", error);
      res.status(500).json({ message: "Failed to initialize user" });
    }
  });

  // User routes
  app.get("/api/user", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/user/subscription", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const { tier } = req.body;
      
      if (!['free', 'pro', 'premium'].includes(tier)) {
        return res.status(400).json({ message: "Invalid subscription tier" });
      }

      const user = await storage.updateUserSubscription(userId, tier);
      res.json(user);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Project routes
  app.get("/api/projects", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const projectData = insertProjectSchema.parse({ ...req.body, userId });
      
      // Check project limit based on subscription
      const projectCount = await storage.getUserProjectCount(userId);
      const user = await storage.getUser(userId);
      
      const projectLimits = { free: 5, pro: 15, premium: -1 }; // -1 means unlimited
      const limit = projectLimits[user?.subscriptionTier || 'free'];
      
      if (limit !== -1 && projectCount >= limit) {
        const limitText = limit === -1 ? 'unlimited' : `${limit}`;
        return res.status(400).json({ 
          message: `Project limit reached. ${user?.subscriptionTier} plan allows ${limitText} projects.`
        });
      }

      const project = await storage.createProject(projectData);
      
      // Award points for creating project
      await storage.addPointsToUser(userId, 50, "Project created", { projectId: project.id });
      await storage.logActivity({
        userId,
        activityType: "project_created",
        description: `Created new project: ${project.name}`,
        pointsAwarded: 50,
        metadata: { projectId: project.id }
      });

      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get("/api/projects/:id", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.put("/api/projects/:id", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const projectData = req.body;
      const project = await storage.updateProject(req.params.id, projectData);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Milestone routes
  app.get("/api/projects/:id/milestones", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const milestones = await storage.getProjectMilestones(req.params.id);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  app.post("/api/projects/:id/milestones", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const milestoneData = insertMilestoneSchema.parse({
        ...req.body,
        projectId: req.params.id
      });
      
      const milestone = await storage.createMilestone(milestoneData);
      res.json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      res.status(500).json({ message: "Failed to create milestone" });
    }
  });

  app.put("/api/milestones/:id/complete", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const pointsReward = 100;
      
      const milestone = await storage.completeMilestone(req.params.id, pointsReward);
      
      // Award points
      await storage.addPointsToUser(userId, pointsReward, "Milestone completed", { milestoneId: milestone.id });
      await storage.logActivity({
        userId,
        activityType: "milestone_completed",
        description: `Completed milestone: ${milestone.title}`,
        pointsAwarded: pointsReward,
        metadata: { milestoneId: milestone.id }
      });

      // Check for achievements
      await gamificationService.checkAchievements(userId);

      res.json(milestone);
    } catch (error) {
      console.error("Error completing milestone:", error);
      res.status(500).json({ message: "Failed to complete milestone" });
    }
  });

  // Code Analysis routes
  app.post("/api/code-analysis", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const { projectId, code, fileName } = req.body;

      if (!code) {
        return res.status(400).json({ message: "Code is required" });
      }

      // Perform code analysis
      const analysisResults = await codeAnalysisService.analyzeCode(code, fileName);
      
      const analysisData = insertCodeAnalysisSchema.parse({
        projectId,
        userId,
        fileName,
        analysisResults,
        pointsAwarded: analysisResults.overallScore > 80 ? 25 : 10
      });

      const analysis = await storage.createCodeAnalysis(analysisData);
      
      // Award points
      await storage.addPointsToUser(userId, analysisData.pointsAwarded ?? 0, "Code analysis completed", { 
        analysisId: analysis.id 
      });
      
      await storage.logActivity({
        userId,
        activityType: "code_analysis",
        description: `Code analysis completed for ${fileName || 'code snippet'}`,
        pointsAwarded: analysisData.pointsAwarded,
        metadata: { analysisId: analysis.id, score: analysisResults.overallScore }
      });

      // Update project code quality score
      if (projectId) {
        const projectAnalyses = await storage.getProjectAnalysis(projectId);
        const avgScore = projectAnalyses.reduce((sum, a) => sum + a.analysisResults.overallScore, 0) / projectAnalyses.length;
        await storage.updateProject(projectId, { codeQualityScore: Math.round(avgScore) });
      }

      res.json(analysis);
    } catch (error) {
      console.error("Error performing code analysis:", error);
      res.status(500).json({ message: "Failed to analyze code" });
    }
  });

  app.get("/api/code-analysis/history", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await storage.getUserAnalysisHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching analysis history:", error);
      res.status(500).json({ message: "Failed to fetch analysis history" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", async (req: Request, res: Response) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get("/api/user/achievements", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  // Mascot routes
  app.post("/api/mascot/chat", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const { message, context } = req.body;

      const response = await mascotService.generateResponse(message, context, userId);
      
      const interactionData = insertMascotInteractionSchema.parse({
        userId,
        message,
        response,
        context: context || {}
      });

      const interaction = await storage.createMascotInteraction(interactionData);
      res.json(interaction);
    } catch (error) {
      console.error("Error chatting with mascot:", error);
      res.status(500).json({ message: "Failed to chat with mascot" });
    }
  });

  app.get("/api/mascot/suggestion", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const suggestion = await mascotService.generateSuggestion(userId);
      res.json(suggestion);
    } catch (error) {
      console.error("Error getting mascot suggestion:", error);
      res.status(500).json({ message: "Failed to get mascot suggestion" });
    }
  });

  // Enhanced Gamification routes
  // Mini challenges for Free tier
  app.get("/api/gamification/challenge", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const challenge = await gamificationService.generateMiniChallenge(userId);
      res.json(challenge);
    } catch (error) {
      console.error("Error generating challenge:", error);
      res.status(500).json({ message: "Failed to generate challenge" });
    }
  });

  // Mentor hints for Pro tier
  app.get("/api/gamification/mentor-hint", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const context = req.query.context ? JSON.parse(req.query.context as string) : undefined;
      const hint = await gamificationService.generateMentorHint(userId, context);
      res.json({ hint });
    } catch (error) {
      console.error("Error generating mentor hint:", error);
      res.status(500).json({ message: "Failed to generate mentor hint" });
    }
  });

  // Deep dive explanations for Premium tier
  app.get("/api/gamification/deep-dive/:topic", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const { topic } = req.params;
      const explanation = await gamificationService.generateDeepDiveExplanation(userId, topic);
      res.json(explanation);
    } catch (error) {
      console.error("Error generating deep dive explanation:", error);
      res.status(500).json({ message: "Failed to generate deep dive explanation" });
    }
  });

  // Award points for tier-specific activities
  app.post("/api/gamification/award-points", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const { action, metadata } = req.body;
      
      // Get user tier for points calculation
      const user = await storage.getUser(userId);
      const userTier = user?.subscriptionTier || 'free';
      
      const points = gamificationService.calculatePoints(action, { ...metadata, userTier });
      await storage.addPointsToUser(userId, points, action, metadata);
      
      res.json({ points });
    } catch (error) {
      console.error("Error awarding points:", error);
      res.status(500).json({ message: "Failed to award points" });
    }
  });

  // Activity routes
  app.get("/api/activity", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const limit = parseInt(req.query.limit as string) || 20;
      const activities = await storage.getUserActivity(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Points routes
  app.get("/api/points/history", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const limit = parseInt(req.query.limit as string) || 20;
      const history = await storage.getUserPointsHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching points history:", error);
      res.status(500).json({ message: "Failed to fetch points history" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const user = await storage.getUser(userId);
      const projects = await storage.getUserProjects(userId);
      const recentAnalysis = await storage.getUserAnalysisHistory(userId, 1);
      
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const totalMilestones = projects.reduce((sum, p) => sum + (p.completedMilestones ?? 0), 0);
      const avgCodeQuality = projects.length > 0 
        ? Math.round(projects.reduce((sum, p) => sum + (p.codeQualityScore ?? 0), 0) / projects.length)
        : 0;

      const stats = {
        activeProjects,
        codeQuality: avgCodeQuality,
        completedMilestones: totalMilestones,
        learningHours: 142, // This would be calculated from actual activity data
        currentStreak: user?.currentStreak || 0,
        totalPoints: user?.totalPoints || 0
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Health check and monitoring routes
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  app.get("/api/health/detailed", async (req: Request, res: Response) => {
    try {
      // Check database connection
      const dbHealth = await storage.getUser('health-check') ? 'connected' : 'disconnected';
      
      // Check HuggingFace API (if configured)
      const hfHealth = process.env.HUGGINGFACE_API_KEY ? 'configured' : 'not-configured';
      
      // Check Clerk (if configured)
      const clerkHealth = process.env.CLERK_SECRET_KEY ? 'configured' : 'not-configured';

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: dbHealth,
          huggingface: hfHealth,
          clerk: clerkHealth
        },
        limits: {
          freeTier: {
            projects: 5,
            codeAnalysesPerDay: 10,
            mascotChatsPerDay: 50,
            fileSizeMB: 1,
            codeSizeKB: 10
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Usage statistics endpoint
  app.get("/api/usage", authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get user's current usage
      const projects = await storage.getUserProjects(userId);
      const recentAnalysis = await storage.getUserAnalysisHistory(userId, 30);
      const recentActivity = await storage.getUserActivity(userId, 30);

      const usage = {
        userId,
        subscriptionTier: user.subscriptionTier,
        currentPeriod: {
          start: new Date().toISOString().split('T')[0],
          end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        limits: {
          free: {
            projects: 5,
            codeAnalysesPerDay: 10,
            mascotChatsPerDay: 50
          },
          pro: {
            projects: 15,
            codeAnalysesPerDay: 50,
            mascotChatsPerDay: 200
          },
          premium: {
            projects: -1, // unlimited
            codeAnalysesPerDay: -1, // unlimited
            mascotChatsPerDay: -1 // unlimited
          }
        },
        usage: {
          projects: projects.length,
          codeAnalyses: recentAnalysis.length,
          mascotChats: recentActivity.filter(a => a.activityType === 'mascot_chat').length
        },
        remaining: {
          projects: user.subscriptionTier === 'free' ? Math.max(0, 5 - projects.length) : -1,
          codeAnalyses: user.subscriptionTier === 'free' ? Math.max(0, 10 - recentAnalysis.length) : -1,
          mascotChats: user.subscriptionTier === 'free' ? Math.max(0, 50 - recentActivity.filter(a => a.activityType === 'mascot_chat').length) : -1
        }
      };

      res.json(usage);
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      res.status(500).json({ message: 'Failed to fetch usage statistics' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to create sample projects
async function createSampleProjects(userId: string) {
  const sampleProjects: InsertProject[] = [
    {
      userId,
      name: "E-commerce Platform",
      description: "Building a full-stack e-commerce platform with authentication, cart, and payment integration",
      language: "React + Node.js",
      framework: "Next.js",
      status: "active",
      progress: 67,
      codeQualityScore: 87,
      totalMilestones: 12,
      completedMilestones: 8,
      deadline: new Date("2024-12-15")
    },
    {
      userId,
      name: "Task Management App",
      description: "A collaborative task management application with real-time updates and team features",
      language: "Vue.js + Firebase",
      framework: "Vue 3",
      status: "active",
      progress: 34,
      codeQualityScore: 79,
      totalMilestones: 10,
      completedMilestones: 4,
      deadline: new Date("2025-01-20")
    },
    {
      userId,
      name: "Machine Learning Dashboard",
      description: "Data visualization dashboard for ML model performance tracking and analysis",
      language: "Python + FastAPI",
      framework: "FastAPI",
      status: "active",
      progress: 91,
      codeQualityScore: 94,
      totalMilestones: 12,
      completedMilestones: 11,
      deadline: new Date("2024-11-30")
    }
  ];

  for (const project of sampleProjects) {
    await storage.createProject(project);
  }
}
