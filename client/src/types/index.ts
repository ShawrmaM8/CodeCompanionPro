export interface DashboardStats {
  activeProjects: number;
  codeQuality: number;
  completedMilestones: number;
  learningHours: number;
  currentStreak: number;
  totalPoints: number;
}

export interface MascotSuggestion {
  message: string;
  suggestion: string;
  context?: any;
}

export interface ActivityItem {
  id: string;
  activityType: string;
  description: string;
  pointsAwarded: number;
  createdAt: string;
  metadata?: any;
}

export interface PointsHistoryItem {
  id: string;
  points: number;
  reason: string;
  createdAt: string;
  metadata?: any;
}

export interface AnalysisIssue {
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  suggestion?: string;
}

export interface CodeAnalysisResults {
  overallScore: number;
  bestPractices: number;
  performance: number;
  maintainability: number;
  security: number;
  issues: AnalysisIssue[];
  strengths: string[];
  improvements: string[];
}

export interface ProjectMetrics {
  totalLines: number;
  testCoverage?: number;
  complexity?: number;
  dependencies?: number;
}

export interface SubscriptionFeatures {
  projectLimit: number;
  advancedAnalysis: boolean;
  prioritySupport: boolean;
  customIntegrations: boolean;
  teamCollaboration: boolean;
  exportCapabilities: boolean;
  aiEnhancements: boolean;
}

export interface UserPreferences {
  mascotPersonality?: string;
  codeAnalysisSettings?: {
    autoAnalyze: boolean;
    strictMode: boolean;
    frameworks: string[];
  };
  notificationSettings?: {
    achievements: boolean;
    milestones: boolean;
    suggestions: boolean;
    reminders: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
}

export interface ConnectionStatus {
  isOnline: boolean;
  lastSync?: Date;
  pendingSyncCount: number;
}

export type SubscriptionTier = 'free' | 'pro' | 'premium';
export type ProjectStatus = 'active' | 'completed' | 'paused' | 'archived';
export type AchievementType = 'code_quality' | 'streak' | 'milestone' | 'project_completion' | 'learning';
