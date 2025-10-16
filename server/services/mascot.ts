import { storage } from "../storage";
import { MascotPersonality, mascotPersonality } from "../../client/src/lib/mascot-personality";
import { huggingFaceService, type ChatRequest, type ChatResponse } from "./huggingface";

interface MascotContext {
  userId: string;
  recentProjects?: any[];
  recentAnalysis?: any[];
  userStats?: any;
  chatHistory?: any[];
}

interface SuggestionContext {
  type: 'feature_suggestion' | 'improvement_suggestion' | 'learning_suggestion' | 'quality_suggestion';
  feature?: string;
  focus?: string;
  projectId?: string;
  analysisId?: string;
}

class MascotService {
  private personality = mascotPersonality;

  async generateResponse(message: string, context?: any, userId?: string): Promise<string> {
    try {
      if (!userId) {
        return this.getGenericResponse(message);
      }

      // Get user context for personalized responses
      const mascotContext = await this.buildUserContext(userId, context);
      
      // Try HuggingFace AI first if API key is available
      if (process.env.HUGGINGFACE_API_KEY) {
        try {
          const aiResponse = await huggingFaceService.generateChatResponse({
            message,
            context: {
              recentCode: mascotContext.recentAnalysis?.[0]?.analysisResults?.code || undefined,
              userLevel: this.determineUserLevel(mascotContext),
              currentProject: mascotContext.recentProjects?.[0]?.name || undefined
            }
          });
          
          // Enhance AI response with mascot personality
          return this.enhanceWithPersonality(aiResponse.response, mascotContext);
        } catch (aiError) {
          console.warn('HuggingFace AI response failed, falling back to static responses:', aiError);
        }
      }
      
      // Fallback to tier-specific static responses
      const response = await this.generateTierSpecificResponse(message, mascotContext);
      
      return response;
    } catch (error) {
      console.error('Error generating mascot response:', error);
      return this.getFallbackResponse();
    }
  }

  private async generateTierSpecificResponse(message: string, context: MascotContext): Promise<string> {
    const user = await storage.getUser(context.userId);
    const tier = user?.subscriptionTier || 'free';
    
    switch (tier) {
      case 'free':
        return this.generateFreeResponse(message, context);
      case 'pro':
        return this.generateProResponse(message, context);
      case 'premium':
        return this.generatePremiumResponse(message, context);
      default:
        return this.getGenericResponse(message);
    }
  }

  // Free tier: Basic encouragement and playful responses
  private generateFreeResponse(message: string, context: MascotContext): string {
    const encouragements = [
      "🚀 You're doing great! Keep building those projects!",
      "💡 That's a creative approach! I love seeing your progress.",
      "⭐ Nice work! Every line of code gets you closer to your goals.",
      "🎯 You're building something awesome! Keep it up!",
      "🌟 Great question! Learning is the key to becoming a better developer.",
    ];
    
    // Add basic contextual responses
    if (message.toLowerCase().includes('error') || message.toLowerCase().includes('bug')) {
      return "🐛 Don't worry about bugs - they're just opportunities to learn! Every developer faces them. You've got this!";
    }
    
    if (message.toLowerCase().includes('help') || message.toLowerCase().includes('stuck')) {
      return "🤝 I'm here to help! Try breaking the problem into smaller pieces. Sometimes a fresh perspective helps too!";
    }
    
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  // Pro tier: Enhanced personality with dynamic responses
  private generateProResponse(message: string, context: MascotContext): string {
    const userStats = context.userStats;
    const streak = userStats?.currentStreak || 0;
    const projects = userStats?.activeProjects || 0;
    
    // Dynamic responses based on user progress
    if (streak >= 7) {
      return `🔥 Wow! ${streak} days in a row! Your consistency is inspiring. I've noticed you're really getting into the zone with your projects!`;
    }
    
    if (projects >= 5) {
      return `🏗️ You're managing ${projects} projects like a pro! Your organizational skills have really evolved. What's your secret to staying focused?`;
    }
    
    // Mentor-style responses with technical insights
    if (message.toLowerCase().includes('architecture') || message.toLowerCase().includes('design')) {
      return "🏛️ Great question about architecture! I've seen your code quality improving. Consider the SOLID principles - they'll help you build more maintainable systems. Want me to share some specific patterns that match your coding style?";
    }
    
    if (message.toLowerCase().includes('performance')) {
      return "⚡ Performance optimization is an art! Based on your recent code, I think you'd benefit from learning about memoization and efficient data structures. Your analytical approach is perfect for this!";
    }
    
    const proResponses = [
      `💫 I've been watching your progress - your problem-solving approach has really matured! You're thinking more like a senior developer now.`,
      `🎓 Your coding style has evolved so much since we started! I love how you're breaking down complex problems now.`,
      `🔧 Based on your recent work, I think you're ready to explore some advanced patterns. Want to level up your architecture skills?`,
    ];
    
    return proResponses[Math.floor(Math.random() * proResponses.length)];
  }

  // Premium tier: Fully adaptive, mentoring personality  
  private generatePremiumResponse(message: string, context: MascotContext): string {
    const userStats = context.userStats;
    const totalPoints = userStats?.totalPoints || 0;
    const codeQuality = context.recentAnalysis?.[0]?.analysisResults?.overallScore || 0;
    
    // Highly personalized responses with deep technical insights
    if (totalPoints > 5000) {
      return `🏆 Your expertise is showing! With ${totalPoints} points, you're in the top tier of developers. I've analyzed your code patterns and I see you're developing your own unique architectural style. Let's explore how we can refine it further.`;
    }
    
    if (codeQuality > 90) {
      return `💎 Your code quality is exceptional at ${codeQuality}%! I've noticed you consistently apply best practices. You're ready for advanced topics like microservices architecture and system design patterns. Shall we dive deep into distributed systems?`;
    }
    
    // Advanced technical mentoring based on context
    if (message.toLowerCase().includes('scalability')) {
      return "🌐 Scalability is crucial! From analyzing your code, I can see you understand the fundamentals. Let's talk about horizontal vs vertical scaling, and I'll show you specific patterns from your projects where we could apply these concepts. Your recent API design shows great potential for microservices!";
    }
    
    if (message.toLowerCase().includes('best practices')) {
      return `📚 You're asking the right questions! I've been analyzing your coding patterns across your ${context.recentProjects?.length || 0} projects. Your error handling has improved 300% since we started, and your function decomposition is becoming more sophisticated. Let me show you some advanced patterns that align with your natural coding style.`;
    }
    
    const premiumResponses = [
      `🧠 I've been studying your problem-solving patterns across all your projects. You have a unique approach to ${this.identifyUserStrength(context)} that I find fascinating. Let's leverage this strength to tackle more complex architectural challenges.`,
      `🎯 Your development journey has been remarkable! I've tracked your evolution from ${this.calculateSkillProgression(context)} Your next breakthrough is in advanced system design - you're ready for it.`,
      `⚡ Based on deep analysis of your coding patterns, I've identified an opportunity to optimize your ${this.suggestOptimizationArea(context)}. This could be your next major skill unlock!`,
    ];
    
    return premiumResponses[Math.floor(Math.random() * premiumResponses.length)];
  }

  private identifyUserStrength(context: MascotContext): string {
    const strengths = ['algorithm optimization', 'clean architecture', 'error handling', 'code organization', 'performance tuning'];
    return strengths[Math.floor(Math.random() * strengths.length)];
  }

  private calculateSkillProgression(context: MascotContext): string {
    const progressions = ['basic problem-solving to advanced architecture', 'simple scripts to complex applications', 'beginner patterns to expert-level design'];
    return progressions[Math.floor(Math.random() * progressions.length)];
  }

  private suggestOptimizationArea(context: MascotContext): string {
    const areas = ['database query patterns', 'asynchronous processing', 'memory management', 'caching strategies', 'API design'];
    return areas[Math.floor(Math.random() * areas.length)];
  }

  async generateSuggestion(userId: string): Promise<{ message: string; suggestion: string; context?: any }> {
    try {
      const mascotContext = await this.buildUserContext(userId);
      
      // Try HuggingFace AI for enhanced suggestions if API key is available
      if (process.env.HUGGINGFACE_API_KEY) {
        try {
          const aiResponse = await huggingFaceService.generateLearningRecommendations({
            skills: mascotContext.recentAnalysis?.map(a => a.analysisResults?.skillTags || []).flat() || [],
            level: this.determineUserLevel(mascotContext),
            interests: ['programming', 'web development', 'software engineering']
          });
          
          return {
            message: `Hey! I've been thinking about your learning journey! 🤔`,
            suggestion: aiResponse.recommendations[0] || "Let's work on something new together!",
            context: { 
              type: 'ai_enhanced_suggestion',
              resources: aiResponse.resources,
              challenges: aiResponse.challenges
            }
          };
        } catch (aiError) {
          console.warn('HuggingFace AI suggestions failed, falling back to static suggestions:', aiError);
        }
      }
      
      // Fallback to static suggestion logic
      const suggestionType = await this.determineSuggestionType(mascotContext);
      const suggestion = await this.createContextualSuggestion(suggestionType, mascotContext);
      
      return suggestion;
    } catch (error) {
      console.error('Error generating mascot suggestion:', error);
      return this.getDefaultSuggestion();
    }
  }

  private async buildUserContext(userId: string, additionalContext?: any): Promise<MascotContext> {
    try {
      const [user, projects, recentAnalysis, recentActivity] = await Promise.all([
        storage.getUser(userId),
        storage.getUserProjects(userId),
        storage.getUserAnalysisHistory(userId, 5),
        storage.getUserActivity(userId, 10),
      ]);

      const userStats = {
        totalPoints: user?.totalPoints || 0,
        currentStreak: user?.currentStreak || 0,
        subscriptionTier: user?.subscriptionTier || 'free',
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedMilestones: projects.reduce((sum, p) => sum + (p.completedMilestones ?? 0), 0),
        avgCodeQuality: projects.length > 0 
          ? Math.round(projects.reduce((sum, p) => sum + (p.codeQualityScore ?? 0), 0) / projects.length)
          : 0,
      };

      return {
        userId,
        recentProjects: projects.slice(0, 3),
        recentAnalysis,
        userStats,
        chatHistory: additionalContext?.chatHistory || [],
      };
    } catch (error) {
      console.error('Error building user context:', error);
      return { userId };
    }
  }

  private async determineSuggestionType(context: MascotContext): Promise<SuggestionContext> {
    const { userStats, recentProjects, recentAnalysis } = context;

    // Prioritize suggestions based on user's current state
    
    // If no projects, suggest creating first project
    if (!recentProjects || recentProjects.length === 0) {
      return {
        type: 'learning_suggestion',
        focus: 'first_project',
      };
    }

    // If recent analysis shows low quality, suggest improvements
    if (recentAnalysis && recentAnalysis.length > 0) {
      const latestAnalysis = recentAnalysis[0];
      if (latestAnalysis.analysisResults.overallScore < 70) {
        return {
          type: 'quality_suggestion',
          focus: 'code_quality',
          analysisId: latestAnalysis.id,
        };
      }
    }

    // If user has active projects, suggest features
    const activeProjects = recentProjects?.filter(p => p.status === 'active') || [];
    if (activeProjects.length > 0) {
      const project = activeProjects[0];
      
      // Suggest next feature based on project progress
      if (project.progress < 30) {
        return {
          type: 'feature_suggestion',
          feature: 'authentication',
          projectId: project.id,
        };
      } else if (project.progress < 60) {
        return {
          type: 'feature_suggestion',
          feature: 'database_integration',
          projectId: project.id,
        };
      } else if (project.progress < 90) {
        return {
          type: 'improvement_suggestion',
          focus: 'testing',
          projectId: project.id,
        };
      }
    }

    // If user is advanced, suggest learning new technologies
    if (userStats?.avgCodeQuality && userStats.avgCodeQuality > 85) {
      return {
        type: 'learning_suggestion',
        focus: 'advanced_concepts',
      };
    }

    // Default suggestion
    return {
      type: 'improvement_suggestion',
      focus: 'general',
    };
  }

  private async createContextualSuggestion(
    suggestionType: SuggestionContext, 
    context: MascotContext
  ): Promise<{ message: string; suggestion: string; context?: any }> {
    
    const { userStats, recentProjects } = context;
    const userName = await this.getUserName(context.userId);

    switch (suggestionType.type) {
      case 'learning_suggestion':
        if (suggestionType.focus === 'first_project') {
          return {
            message: `Hey ${userName}! 👋 I see you're just getting started. That's awesome!`,
            suggestion: "Want me to help you create your first project? I can guide you through setting up a simple web application step by step!",
            context: { type: 'project_creation_help', difficulty: 'beginner' }
          };
        } else if (suggestionType.focus === 'advanced_concepts') {
          return {
            message: `${userName}, your code quality is impressive! 🌟 You're ready for the next level.`,
            suggestion: "How about exploring microservices architecture or implementing advanced testing patterns? I can suggest some cutting-edge concepts to master!",
            context: { type: 'advanced_learning', topics: ['microservices', 'testing', 'architecture'] }
          };
        }
        break;

      case 'feature_suggestion':
        const project = recentProjects?.find(p => p.id === suggestionType.projectId);
        if (project) {
          if (suggestionType.feature === 'authentication') {
            return {
              message: `Great progress on ${project.name}! 🚀 Your foundation looks solid.`,
              suggestion: "Ready to add user authentication? I can help you implement secure login/signup with JWT tokens or OAuth integration!",
              context: { type: 'feature_implementation', feature: 'auth', projectId: project.id }
            };
          } else if (suggestionType.feature === 'database_integration') {
            return {
              message: `${project.name} is shaping up nicely! 📊 Time to add some persistence.`,
              suggestion: "Want to integrate a database? I can guide you through setting up PostgreSQL, MongoDB, or even a simple SQLite database!",
              context: { type: 'feature_implementation', feature: 'database', projectId: project.id }
            };
          }
        }
        break;

      case 'quality_suggestion':
        return {
          message: `I noticed your recent code analysis! 🔍 There's always room for improvement.`,
          suggestion: "Your code has potential! Want me to help you boost that quality score? I can show you specific patterns and best practices to implement!",
          context: { type: 'quality_improvement', focus: 'code_patterns' }
        };

      case 'improvement_suggestion':
        if (suggestionType.focus === 'testing') {
          const project = recentProjects?.find(p => p.id === suggestionType.projectId);
          return {
            message: `${project?.name || 'Your project'} is nearly complete! 🎯 Let's make it bulletproof.`,
            suggestion: "How about adding some tests? I can help you set up unit tests, integration tests, or even end-to-end testing!",
            context: { type: 'testing_setup', projectId: suggestionType.projectId }
          };
        }
        break;
    }

    // Fallback suggestion
    return this.getDefaultSuggestion();
  }

  private async enhanceResponseWithContext(response: string, context: MascotContext): Promise<string> {
    const { userStats } = context;

    // Add user-specific encouragement based on stats
    let enhancement = "";

    if (userStats?.currentStreak && userStats.currentStreak > 5) {
      enhancement += ` By the way, that ${userStats.currentStreak}-day streak is amazing! 🔥`;
    }

    if (userStats?.totalPoints && userStats.totalPoints > 1000) {
      enhancement += ` You've earned ${userStats.totalPoints} points - you're really dedicated! ⭐`;
    }

    if (userStats?.avgCodeQuality && userStats.avgCodeQuality > 80) {
      enhancement += ` Your code quality average of ${userStats.avgCodeQuality}% shows real skill! 💎`;
    }

    return response + enhancement;
  }

  private async getUserName(userId: string): Promise<string> {
    try {
      const user = await storage.getUser(userId);
      return user?.firstName || 'there';
    } catch (error) {
      return 'there';
    }
  }

  private getGenericResponse(message: string): string {
    const responses = [
      "I'm here to help with your coding journey! What would you like to work on?",
      "Great question! Let me think about how I can best assist you with that.",
      "I love helping developers grow! Tell me more about what you're trying to achieve.",
      "That's an interesting challenge! Let's figure out the best approach together.",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getFallbackResponse(): string {
    return "I'm here to help! Sometimes I need a moment to think, but I'm always ready to support your coding journey. What would you like to work on? 🤖✨";
  }

  private getDefaultSuggestion(): { message: string; suggestion: string; context?: any } {
    const suggestions = [
      {
        message: "Hey! 👋 Ready to level up your coding skills?",
        suggestion: "I notice you're making progress! Want to try implementing a new feature or exploring a different technology stack?",
        context: { type: 'general_encouragement' }
      },
      {
        message: "Looking good! 🌟 Your coding journey is inspiring.",
        suggestion: "How about we work on improving your code quality or adding some exciting new functionality to your projects?",
        context: { type: 'quality_focus' }
      },
      {
        message: "Great to see you coding! 🚀 Every line of code is progress.",
        suggestion: "Want to tackle a coding challenge or learn about a new programming concept? I'm here to guide you!",
        context: { type: 'learning_opportunity' }
      }
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  // Helper methods for specialized responses
  async generateProjectGuidance(projectId: string, userId: string): Promise<string> {
    try {
      const project = await storage.getProject(projectId);
      if (!project) {
        return "I'd love to help with your project, but I can't seem to find it. Can you share more details?";
      }

      const milestones = await storage.getProjectMilestones(projectId);
      const completedCount = milestones.filter(m => m.isCompleted).length;
      const totalCount = milestones.length;

      let guidance = `Great work on ${project.name}! `;

      if (totalCount === 0) {
        guidance += "Let's start by breaking this project into smaller milestones. What's the first feature you'd like to implement?";
      } else if (completedCount === 0) {
        guidance += `You have ${totalCount} milestones planned. Want to tackle the first one? I can help you break it down into manageable steps.`;
      } else if (completedCount < totalCount) {
        guidance += `You've completed ${completedCount}/${totalCount} milestones! The next step looks like: ${milestones.find(m => !m.isCompleted)?.title}. Need help with that?`;
      } else {
        guidance += "Congratulations! 🎉 You've completed all planned milestones. Ready to add new features or start a new project?";
      }

      return guidance;
    } catch (error) {
      console.error('Error generating project guidance:', error);
      return "I'm here to help with your project! Tell me what you're working on and where you'd like assistance.";
    }
  }

  async generateCodeReview(analysisId: string, userId: string): Promise<string> {
    try {
      const analysisHistory = await storage.getUserAnalysisHistory(userId, 50);
      const analysis = analysisHistory.find(a => a.id === analysisId);
      
      if (!analysis) {
        return "I'd love to review your code, but I can't find that analysis. Can you run the analysis again?";
      }

      const results = analysis.analysisResults;
      let review = `Nice work on your code! Here's what I found:\n\n`;

      // Highlight strengths
      if (results.strengths.length > 0) {
        review += `🌟 **Strengths:**\n${results.strengths.map(s => `• ${s}`).join('\n')}\n\n`;
      }

      // Address issues
      if (results.issues.length > 0) {
        const criticalIssues = results.issues.filter(i => i.severity === 'error');
        const warnings = results.issues.filter(i => i.severity === 'warning');

        if (criticalIssues.length > 0) {
          review += `🚨 **Critical Issues:**\n${criticalIssues.slice(0, 3).map(i => `• ${i.message}`).join('\n')}\n\n`;
        }

        if (warnings.length > 0) {
          review += `⚠️ **Suggestions:**\n${warnings.slice(0, 3).map(i => `• ${i.message}`).join('\n')}\n\n`;
        }
      }

      // Provide encouragement and next steps
      if (results.overallScore >= 90) {
        review += `Excellent work! 🎉 Your code quality score of ${results.overallScore}% is outstanding!`;
      } else if (results.overallScore >= 70) {
        review += `Good job! 👍 Your ${results.overallScore}% score shows solid coding skills. Ready to push it even higher?`;
      } else {
        review += `Keep going! 💪 Your ${results.overallScore}% score has room for improvement, and I'm here to help you get there!`;
      }

      return review;
    } catch (error) {
      console.error('Error generating code review:', error);
      return "I'm ready to review your code! Run an analysis and I'll give you detailed feedback on your work.";
    }
  }

  // Achievement celebration responses
  generateAchievementCelebration(achievementName: string, pointsAwarded: number): string {
    const celebrations = [
      `🎉 AMAZING! You just unlocked "${achievementName}"! That's ${pointsAwarded} points well earned!`,
      `🏆 Fantastic work! "${achievementName}" is now yours! +${pointsAwarded} points to your total!`,
      `🌟 Incredible! You've achieved "${achievementName}"! ${pointsAwarded} points added to your score!`,
      `🚀 Outstanding! "${achievementName}" unlocked! You've earned ${pointsAwarded} points!`,
    ];

    return celebrations[Math.floor(Math.random() * celebrations.length)];
  }

  // Milestone completion responses
  generateMilestoneCompletion(milestoneName: string, projectName: string): string {
    const responses = [
      `🎯 Excellent! You've completed "${milestoneName}" for ${projectName}! Your project is really taking shape!`,
      `✅ Great work finishing "${milestoneName}"! ${projectName} is looking more awesome with each milestone!`,
      `🌟 Milestone achieved! "${milestoneName}" is done for ${projectName}. What's next on your roadmap?`,
      `🚀 Fantastic progress! "${milestoneName}" completed for ${projectName}. You're building something amazing!`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Helper methods for HuggingFace integration
  private determineUserLevel(context: MascotContext): string {
    const avgCodeQuality = context.userStats?.avgCodeQuality || 0;
    const totalPoints = context.userStats?.totalPoints || 0;
    
    if (avgCodeQuality > 85 && totalPoints > 2000) {
      return 'advanced';
    } else if (avgCodeQuality > 70 && totalPoints > 500) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  private enhanceWithPersonality(aiResponse: string, context: MascotContext): string {
    const userStats = context.userStats;
    let enhancedResponse = aiResponse;
    
    // Add mascot personality touches
    if (userStats?.currentStreak && userStats.currentStreak > 5) {
      enhancedResponse += ` 🔥 By the way, that ${userStats.currentStreak}-day streak is amazing!`;
    }
    
    if (userStats?.totalPoints && userStats.totalPoints > 1000) {
      enhancedResponse += ` ⭐ You've earned ${userStats.totalPoints} points - you're really dedicated!`;
    }
    
    // Add emoji based on response tone
    if (enhancedResponse.includes('great') || enhancedResponse.includes('excellent')) {
      enhancedResponse = `🌟 ${enhancedResponse}`;
    } else if (enhancedResponse.includes('help') || enhancedResponse.includes('assist')) {
      enhancedResponse = `🤝 ${enhancedResponse}`;
    } else {
      enhancedResponse = `💡 ${enhancedResponse}`;
    }
    
    return enhancedResponse;
  }
}

export const mascotService = new MascotService();
