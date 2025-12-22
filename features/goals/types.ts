// 🎯 Goal Detail View Types

// 🔍 Focus mode options
export type FocusMode = "all" | "today" | "urgent" | "active";

// 📊 Focus counts interface
export interface FocusCounts {
  all: number;
  today: number;
  urgent: number;
  active: number;
}

// 🔧 Task filtering options
export interface TaskFilters {
  subgoalIds: number[];
  priorities: string[];
  deadlineRange: "all" | "today" | "week" | "overdue";
}

// 📈 Momentum tracking metrics
export interface MomentumMetrics {
  streak: number;
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  daysActive: number;
  recentWins: string[];
}

// 📊 Analytics metrics interface
export interface AnalyticsMetrics {
  completedTasks: number;
  totalTasks: number;
  weeklyVelocity: number[];
  addedThisWeek: number;
  completedThisWeek: number;
}

// 🤖 AI insight response structure
export interface AIInsightResponse {
  completionProbability: number;
  estimatedCompletionDate: string;
  riskFactors: string[];
  bottlenecks: string[];
  suggestionImprovements: string[];
  recommendations: Array<{
    id: string;
    type: "optimization" | "risk" | "opportunity" | "automation";
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    effort: "quick" | "medium" | "complex";
    confidence: number;
    actionable: boolean;
    automatable?: boolean;
    estimatedTimeToImplement: string;
    relatedGoalIds: number[];
    createdAt: string;
  }>;
}

export interface AIRecommendation {
  id: string;
  type: "optimization" | "risk" | "opportunity" | "automation";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "quick" | "medium" | "complex";
  confidence: number;
  actionable: boolean;
  automatable?: boolean;
  estimatedTimeToImplement: string;
  relatedGoalIds: number[];
  createdAt: string;
}

export type { Goal } from './schema';

export type GoalAISuggestion = {
  type:
    | "progress"
    | "timeline"
    | "optimization"
    | "motivation"
    | "prioritization"
    | "strategy"
    | "collaboration"
    | "resources"
    | "efficiency"
    | "learning"
    | "analytics"
    | "planning"
    | "risk"
    | "execution";
  title: string;
  description: string;
  score?: number;
  actionable?: boolean;
};

export interface SmartInsight {
  id: string;
  type: 'achievement' | 'warning' | 'opportunity' | 'trend' | 'prediction';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: number;
  confidence: number;
  actionable: boolean;
  category: string;
  icon: React.ReactNode;
  color: string;
  data?: any;
  suggestion?: string;
  estimatedTimeToFix?: string;
}
