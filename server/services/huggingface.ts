import { HfInference } from '@huggingface/inference';
import rateLimit from 'express-rate-limit';

export interface HuggingFaceConfig {
  apiKey: string;
  rateLimitWindowMs: number;
  maxRequests: number;
}

export interface CodeAnalysisRequest {
  code: string;
  language: string;
  fileName?: string;
}

export interface CodeAnalysisResponse {
  summary: string;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  skillTags: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  confidence: number;
}

export interface ChatRequest {
  message: string;
  context?: {
    recentCode?: string;
    userLevel?: string;
    currentProject?: string;
  };
}

export interface ChatResponse {
  response: string;
  suggestions?: string[];
  nextSteps?: string[];
}

class HuggingFaceService {
  private hf: HfInference;
  private rateLimiter: any;
  private requestCount: number = 0;
  private lastReset: number = Date.now();
  private readonly maxRequestsPerMonth: number = 1000; // Free tier limit

  constructor(config: HuggingFaceConfig) {
    this.hf = new HfInference(config.apiKey);
    this.rateLimiter = rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: config.maxRequests,
      message: 'Rate limit exceeded. Please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  /**
   * Check if we're within rate limits
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    const monthInMs = 30 * 24 * 60 * 60 * 1000; // 30 days

    // Reset counter if a month has passed
    if (now - this.lastReset > monthInMs) {
      this.requestCount = 0;
      this.lastReset = now;
    }

    return this.requestCount < this.maxRequestsPerMonth;
  }

  /**
   * Increment request counter
   */
  private incrementCounter(): void {
    this.requestCount++;
  }

  /**
   * Analyze code using HuggingFace models
   */
  async analyzeCode(request: CodeAnalysisRequest): Promise<CodeAnalysisResponse> {
    if (!this.checkRateLimit()) {
      throw new Error('Monthly rate limit exceeded. Please try again next month.');
    }

    try {
      this.incrementCounter();

      // Use CodeT5 model for code understanding
      const codeAnalysis = await this.hf.textGeneration({
        model: 'Salesforce/codet5-base',
        inputs: `Analyze this ${request.language} code and provide feedback:\n\n${request.code}`,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          return_full_text: false,
        },
      });

      // Use a smaller model for skill extraction
      const skillExtraction = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: `Extract programming skills from this code: ${request.code}`,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.5,
          return_full_text: false,
        },
      });

      // Parse the AI response and structure it
      const analysisText = codeAnalysis.generated_text || '';
      const skillsText = skillExtraction.generated_text || '';

      return this.parseCodeAnalysis(analysisText, skillsText, request.code);
    } catch (error) {
      console.error('HuggingFace API error:', error);
      // Fallback to static analysis if API fails
      return this.getFallbackAnalysis(request);
    }
  }

  /**
   * Generate conversational response for mascot
   */
  async generateChatResponse(request: ChatRequest): Promise<ChatResponse> {
    if (!this.checkRateLimit()) {
      return {
        response: "I'm sorry, I've reached my monthly limit for AI responses. I can still help with basic guidance and encouragement!",
        suggestions: ['Try again next month', 'Use static analysis features', 'Explore the skill tree']
      };
    }

    try {
      this.incrementCounter();

      const contextPrompt = this.buildContextPrompt(request);
      
      const response = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: contextPrompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.8,
          return_full_text: false,
        },
      });

      const responseText = response.generated_text || 'I\'m here to help with your coding journey!';
      
      return {
        response: this.cleanResponse(responseText),
        suggestions: this.generateSuggestions(request.context),
        nextSteps: this.generateNextSteps(request.context)
      };
    } catch (error) {
      console.error('HuggingFace chat error:', error);
      return this.getFallbackChatResponse(request);
    }
  }

  /**
   * Generate learning recommendations based on user progress
   */
  async generateLearningRecommendations(userContext: {
    skills: string[];
    level: string;
    interests: string[];
  }): Promise<{
    recommendations: string[];
    resources: string[];
    challenges: string[];
  }> {
    if (!this.checkRateLimit()) {
      return {
        recommendations: ['Continue practicing with your current projects'],
        resources: ['FreeCodeCamp', 'MDN Web Docs', 'Stack Overflow'],
        challenges: ['Build a todo app', 'Create a calculator', 'Make a weather app']
      };
    }

    try {
      this.incrementCounter();

      const prompt = `Based on these skills: ${userContext.skills.join(', ')}, level: ${userContext.level}, interests: ${userContext.interests.join(', ')}, suggest learning recommendations.`;

      const response = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          return_full_text: false,
        },
      });

      return this.parseLearningRecommendations(response.generated_text || '');
    } catch (error) {
      console.error('HuggingFace recommendations error:', error);
      return this.getFallbackRecommendations(userContext);
    }
  }

  /**
   * Parse code analysis response from AI
   */
  private parseCodeAnalysis(analysisText: string, skillsText: string, code: string): CodeAnalysisResponse {
    // Extract strengths (look for positive keywords)
    const strengths = this.extractStrengths(analysisText, code);
    
    // Extract improvements (look for improvement keywords)
    const improvements = this.extractImprovements(analysisText, code);
    
    // Extract skill tags
    const skillTags = this.extractSkillTags(skillsText, code);
    
    // Determine complexity
    const complexity = this.determineComplexity(code);
    
    // Calculate confidence based on response quality
    const confidence = this.calculateConfidence(analysisText);

    return {
      summary: this.generateSummary(analysisText, code),
      strengths,
      improvements,
      suggestions: this.generateSuggestionsFromAnalysis(analysisText, code),
      skillTags,
      complexity,
      confidence
    };
  }

  /**
   * Extract strengths from analysis text
   */
  private extractStrengths(analysisText: string, code: string): string[] {
    const strengths: string[] = [];
    
    // Check for good patterns in code
    if (code.includes('const ') || code.includes('let ')) {
      strengths.push('Good use of modern variable declarations');
    }
    
    if (code.includes('function ') && code.includes('return ')) {
      strengths.push('Proper function structure');
    }
    
    if (code.includes('try ') && code.includes('catch ')) {
      strengths.push('Good error handling');
    }
    
    if (code.includes('//') || code.includes('/*')) {
      strengths.push('Well-documented code');
    }
    
    // Extract from AI analysis
    const positiveKeywords = ['good', 'excellent', 'well', 'proper', 'clean', 'efficient'];
    positiveKeywords.forEach(keyword => {
      if (analysisText.toLowerCase().includes(keyword)) {
        strengths.push(`AI detected: ${keyword} practices`);
      }
    });
    
    return strengths.slice(0, 5); // Limit to 5 strengths
  }

  /**
   * Extract improvements from analysis text
   */
  private extractImprovements(analysisText: string, code: string): string[] {
    const improvements: string[] = [];
    
    // Check for common issues
    if (code.includes('var ')) {
      improvements.push('Replace var with const or let for better scoping');
    }
    
    if (code.includes('== ') && !code.includes('=== ')) {
      improvements.push('Use strict equality (===) for better type safety');
    }
    
    if (code.includes('console.log')) {
      improvements.push('Remove or replace console.log statements for production');
    }
    
    // Extract from AI analysis
    const improvementKeywords = ['improve', 'better', 'consider', 'suggest', 'recommend'];
    improvementKeywords.forEach(keyword => {
      if (analysisText.toLowerCase().includes(keyword)) {
        improvements.push(`AI suggestion: ${keyword} implementation`);
      }
    });
    
    return improvements.slice(0, 5); // Limit to 5 improvements
  }

  /**
   * Extract skill tags from skills text
   */
  private extractSkillTags(skillsText: string, code: string): string[] {
    const skills: string[] = [];
    
    // Detect skills from code patterns
    if (code.includes('class ') || code.includes('interface ')) {
      skills.push('Object-Oriented Programming');
    }
    
    if (code.includes('async ') && code.includes('await ')) {
      skills.push('Asynchronous Programming');
    }
    
    if (code.includes('import ') || code.includes('export ')) {
      skills.push('Module System');
    }
    
    if (code.includes('if ') && code.includes('else ')) {
      skills.push('Conditional Logic');
    }
    
    if (code.includes('for ') || code.includes('while ')) {
      skills.push('Loops and Iteration');
    }
    
    // Extract from AI analysis
    const commonSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'API', 'Database'];
    commonSkills.forEach(skill => {
      if (skillsText.toLowerCase().includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    });
    
    return [...new Set(skills)]; // Remove duplicates
  }

  /**
   * Determine code complexity
   */
  private determineComplexity(code: string): 'beginner' | 'intermediate' | 'advanced' {
    const lines = code.split('\n').length;
    const functions = (code.match(/function\s+\w+/g) || []).length;
    const classes = (code.match(/class\s+\w+/g) || []).length;
    const asyncPatterns = (code.match(/async\s+/g) || []).length;
    
    if (lines < 20 && functions < 2 && classes === 0) {
      return 'beginner';
    } else if (lines < 100 && functions < 10 && classes < 3) {
      return 'intermediate';
    } else {
      return 'advanced';
    }
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(analysisText: string): number {
    // Simple confidence calculation based on response length and keywords
    const length = analysisText.length;
    const hasKeywords = /good|excellent|improve|suggest|recommend/.test(analysisText.toLowerCase());
    
    if (length > 100 && hasKeywords) {
      return 0.9;
    } else if (length > 50) {
      return 0.7;
    } else {
      return 0.5;
    }
  }

  /**
   * Generate summary from analysis
   */
  private generateSummary(analysisText: string, code: string): string {
    const complexity = this.determineComplexity(code);
    const lines = code.split('\n').length;
    
    return `This ${complexity} level code (${lines} lines) shows ${this.extractStrengths(analysisText, code).length} strengths and ${this.extractImprovements(analysisText, code).length} areas for improvement.`;
  }

  /**
   * Generate suggestions from analysis
   */
  private generateSuggestionsFromAnalysis(analysisText: string, code: string): string[] {
    const suggestions: string[] = [];
    
    if (code.includes('var ')) {
      suggestions.push('Consider using const or let instead of var');
    }
    
    if (!code.includes('//') && code.length > 50) {
      suggestions.push('Add comments to explain complex logic');
    }
    
    if (code.includes('console.log')) {
      suggestions.push('Use a proper logging library for production');
    }
    
    return suggestions.slice(0, 3);
  }

  /**
   * Build context prompt for chat
   */
  private buildContextPrompt(request: ChatRequest): string {
    let prompt = `You are a helpful coding tutor. User message: "${request.message}"`;
    
    if (request.context?.recentCode) {
      prompt += `\n\nRecent code context: ${request.context.recentCode}`;
    }
    
    if (request.context?.userLevel) {
      prompt += `\n\nUser level: ${request.context.userLevel}`;
    }
    
    if (request.context?.currentProject) {
      prompt += `\n\nCurrent project: ${request.context.currentProject}`;
    }
    
    return prompt;
  }

  /**
   * Clean AI response
   */
  private cleanResponse(response: string): string {
    return response
      .replace(/[^\w\s.,!?]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Generate suggestions based on context
   */
  private generateSuggestions(context?: ChatRequest['context']): string[] {
    const suggestions: string[] = [];
    
    if (context?.userLevel === 'beginner') {
      suggestions.push('Try building a simple calculator', 'Learn about variables and functions');
    } else if (context?.userLevel === 'intermediate') {
      suggestions.push('Explore async programming', 'Learn about design patterns');
    } else {
      suggestions.push('Study system architecture', 'Contribute to open source');
    }
    
    return suggestions.slice(0, 3);
  }

  /**
   * Generate next steps
   */
  private generateNextSteps(context?: ChatRequest['context']): string[] {
    const steps: string[] = [];
    
    if (context?.currentProject) {
      steps.push(`Continue working on ${context.currentProject}`, 'Add new features', 'Test your code');
    } else {
      steps.push('Start a new project', 'Practice coding challenges', 'Learn new technologies');
    }
    
    return steps.slice(0, 3);
  }

  /**
   * Parse learning recommendations
   */
  private parseLearningRecommendations(response: string): {
    recommendations: string[];
    resources: string[];
    challenges: string[];
  } {
    return {
      recommendations: ['Continue practicing', 'Learn new frameworks', 'Build projects'],
      resources: ['FreeCodeCamp', 'MDN Web Docs', 'Stack Overflow'],
      challenges: ['Build a todo app', 'Create a calculator', 'Make a weather app']
    };
  }

  /**
   * Fallback methods for when API fails
   */
  private getFallbackAnalysis(request: CodeAnalysisRequest): CodeAnalysisResponse {
    return {
      summary: `Basic analysis of ${request.language} code`,
      strengths: ['Code structure looks good'],
      improvements: ['Consider adding comments', 'Use modern syntax'],
      suggestions: ['Keep practicing', 'Learn best practices'],
      skillTags: [request.language],
      complexity: 'beginner',
      confidence: 0.3
    };
  }

  private getFallbackChatResponse(request: ChatRequest): ChatResponse {
    return {
      response: "I'm here to help with your coding journey! What would you like to work on?",
      suggestions: ['Try a coding challenge', 'Build a project', 'Learn new concepts'],
      nextSteps: ['Set up your development environment', 'Choose a project', 'Start coding']
    };
  }

  private getFallbackRecommendations(userContext: {
    skills: string[];
    level: string;
    interests: string[];
  }): {
    recommendations: string[];
    resources: string[];
    challenges: string[];
  } {
    return {
      recommendations: ['Continue practicing with your current projects'],
      resources: ['FreeCodeCamp', 'MDN Web Docs', 'Stack Overflow'],
      challenges: ['Build a todo app', 'Create a calculator', 'Make a weather app']
    };
  }

  /**
   * Get current usage statistics
   */
  getUsageStats(): { requestsUsed: number; requestsRemaining: number; resetDate: Date } {
    const resetDate = new Date(this.lastReset + (30 * 24 * 60 * 60 * 1000));
    return {
      requestsUsed: this.requestCount,
      requestsRemaining: this.maxRequestsPerMonth - this.requestCount,
      resetDate
    };
  }
}

// Export singleton instance
export const huggingFaceService = new HuggingFaceService({
  apiKey: process.env.HUGGINGFACE_API_KEY || '',
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10 // 10 requests per 15 minutes
});
