import type { Express } from "express";
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
import { z } from "zod";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user for development (replace with proper auth)
  const MOCK_USER_ID = "550e8400-e29b-41d4-a716-446655440000"; // Fixed UUID for development
  const getCurrentUserId = () => MOCK_USER_ID;

  // Initialize default user and data
  app.post("/api/init", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      
      // Check if user exists, create if not
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser({
          firstName: "John",
          lastName: "Developer",
          email: "john@example.com",
          subscriptionTier: "pro",
          totalPoints: 2847,
          currentStreak: 12,
          longestStreak: 25
        });

        // Create sample achievements and projects
        await gamificationService.initializeDefaultAchievements();
        await createSampleProjects(userId);
      }

      res.json({ user });
    } catch (error) {
      console.error("Error initializing user:", error);
      res.status(500).json({ message: "Failed to initialize user" });
    }
  });

  // User routes
  app.get("/api/user", async (req, res) => {
    try {
      const userId = getCurrentUserId();
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

  app.put("/api/user/subscription", async (req, res) => {
    try {
      const userId = getCurrentUserId();
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
  app.get("/api/projects", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const userId = getCurrentUserId();
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

  app.get("/api/projects/:id", async (req, res) => {
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

  app.put("/api/projects/:id", async (req, res) => {
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
  app.get("/api/projects/:id/milestones", async (req, res) => {
    try {
      const milestones = await storage.getProjectMilestones(req.params.id);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  app.post("/api/projects/:id/milestones", async (req, res) => {
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

  app.put("/api/milestones/:id/complete", async (req, res) => {
    try {
      const userId = getCurrentUserId();
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
  app.post("/api/code-analysis", async (req, res) => {
    try {
      const userId = getCurrentUserId();
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

  app.get("/api/code-analysis/history", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await storage.getUserAnalysisHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching analysis history:", error);
      res.status(500).json({ message: "Failed to fetch analysis history" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get("/api/user/achievements", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  // Mascot routes
  app.post("/api/mascot/chat", async (req, res) => {
    try {
      const userId = getCurrentUserId();
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

  app.get("/api/mascot/suggestion", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const suggestion = await mascotService.generateSuggestion(userId);
      res.json(suggestion);
    } catch (error) {
      console.error("Error getting mascot suggestion:", error);
      res.status(500).json({ message: "Failed to get mascot suggestion" });
    }
  });

  // Enhanced Gamification routes
  // Mini challenges for Free tier
  app.get("/api/gamification/challenge", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const challenge = await gamificationService.generateMiniChallenge(userId);
      res.json(challenge);
    } catch (error) {
      console.error("Error generating challenge:", error);
      res.status(500).json({ message: "Failed to generate challenge" });
    }
  });

  // Mentor hints for Pro tier
  app.get("/api/gamification/mentor-hint", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const context = req.query.context ? JSON.parse(req.query.context as string) : undefined;
      const hint = await gamificationService.generateMentorHint(userId, context);
      res.json({ hint });
    } catch (error) {
      console.error("Error generating mentor hint:", error);
      res.status(500).json({ message: "Failed to generate mentor hint" });
    }
  });

  // Deep dive explanations for Premium tier
  app.get("/api/gamification/deep-dive/:topic", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const { topic } = req.params;
      const explanation = await gamificationService.generateDeepDiveExplanation(userId, topic);
      res.json(explanation);
    } catch (error) {
      console.error("Error generating deep dive explanation:", error);
      res.status(500).json({ message: "Failed to generate deep dive explanation" });
    }
  });

  // Award points for tier-specific activities
  app.post("/api/gamification/award-points", async (req, res) => {
    try {
      const userId = getCurrentUserId();
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
  app.get("/api/activity", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const limit = parseInt(req.query.limit as string) || 20;
      const activities = await storage.getUserActivity(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Points routes
  app.get("/api/points/history", async (req, res) => {
    try {
      const userId = getCurrentUserId();
      const limit = parseInt(req.query.limit as string) || 20;
      const history = await storage.getUserPointsHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching points history:", error);
      res.status(500).json({ message: "Failed to fetch points history" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const userId = getCurrentUserId();
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
