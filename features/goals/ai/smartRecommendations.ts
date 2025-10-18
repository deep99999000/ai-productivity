import type { Goal } from "@/features/goals/types/goalSchema";
import type { Subgoal } from "@/features/subGoals/subGoalschema";
import type { Todo } from "@/features/todo/todoSchema";

export interface SmartRecommendation {
  id: string;
  type: 'optimization' | 'risk' | 'opportunity' | 'automation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'quick' | 'medium' | 'complex';
  confidence: number; // 0-100
  actionable: boolean;
  automatable?: boolean;
  estimatedTimeToImplement: string;
  relatedGoalIds: number[];
  createdAt: Date;
}

export interface PredictiveInsights {
  completionProbability: number;
  estimatedCompletionDate: Date;
  riskFactors: string[];
  bottlenecks: string[];
  suggestionImprovements: string[];
}

export class GoalIntelligenceEngine {
  static analyzeGoalHealth(
    goal: Goal, 
    subgoals: Subgoal[], 
    todos: Todo[]
  ): PredictiveInsights {
    const goalTodos = todos.filter(t => t.goal_id === goal.id);
    const completedTodos = goalTodos.filter(t => t.isDone);
    const completionRate = goalTodos.length > 0 ? completedTodos.length / goalTodos.length : 0;
    
    // Calculate velocity and trends
    const velocityTrend = this.calculateVelocityTrend(goalTodos);
    const riskFactors = this.identifyRiskFactors(goal, subgoals, goalTodos);
    
    return {
      completionProbability: this.predictCompletionProbability(completionRate, velocityTrend, riskFactors),
      estimatedCompletionDate: this.estimateCompletionDate(goal, goalTodos, velocityTrend),
      riskFactors,
      bottlenecks: this.identifyBottlenecks(subgoals, goalTodos),
      suggestionImprovements: this.generateImprovementSuggestions(goal, subgoals, goalTodos)
    };
  }

  static generateSmartRecommendations(
    goals: Goal[],
    subgoals: Subgoal[],
    todos: Todo[]
  ): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];

    // Analyze each goal for optimization opportunities
    goals.forEach(goal => {
      const goalTodos = todos.filter(t => t.goal_id === goal.id);
      const goalSubgoals = subgoals.filter(s => s.goal_id === goal.id);

      // Detect stalled goals
      if (this.isGoalStalled(goal, goalTodos)) {
        recommendations.push(this.createStallRecommendation(goal));
      }

      // Detect overscoped goals
      if (this.isGoalOverscoped(goalSubgoals, goalTodos)) {
        recommendations.push(this.createScopeRecommendation(goal));
      }

      // Detect automation opportunities
      const automationOpps = this.detectAutomationOpportunities(goalTodos);
      automationOpps.forEach(opp => recommendations.push(opp));
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  private static calculateVelocityTrend(todos: Todo[]): number {
    // Calculate weekly completion velocity over last 4 weeks
    const now = new Date();
    const weeks = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      return todos.filter(t => 
        t.isDone && 
        t.endDate && 
        new Date(t.endDate) >= weekStart && 
        new Date(t.endDate) < weekEnd
      ).length;
    });

    // Calculate trend (positive = improving, negative = declining)
    const [recent, ...older] = weeks;
    const avgOlder = older.reduce((a, b) => a + b, 0) / older.length;
    return recent - avgOlder;
  }

  private static identifyRiskFactors(goal: Goal, subgoals: Subgoal[], todos: Todo[]): string[] {
    const risks: string[] = [];
    const goalTodos = todos.filter(t => t.goal_id === goal.id);

    // Time-based risks
    if (goal.endDate) {
      const daysRemaining = Math.ceil((new Date(goal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const completionRate = goalTodos.length > 0 ? goalTodos.filter(t => t.isDone).length / goalTodos.length : 0;
      
      if (daysRemaining < 14 && completionRate < 0.7) {
        risks.push("Timeline pressure: Less than 2 weeks remaining with <70% completion");
      }
    }

    // Dependency risks
    const blockedTodos = goalTodos.filter(t => !t.isDone && !t.startDate);
    if (blockedTodos.length > goalTodos.length * 0.4) {
      risks.push("High backlog: 40%+ of tasks not yet started");
    }

    // Resource risks
    const highPriorityIncomplete = goalTodos.filter(t => t.priority === 'high' && !t.isDone);
    if (highPriorityIncomplete.length > 3) {
      risks.push("Multiple high-priority items incomplete");
    }

    return risks;
  }

  private static identifyBottlenecks(subgoals: Subgoal[], todos: Todo[]): string[] {
    const bottlenecks: string[] = [];

    subgoals.forEach(subgoal => {
      const subgoalTodos = todos.filter(t => t.subgoal_id === subgoal.id);
      const stuckTodos = subgoalTodos.filter(t => 
        !t.isDone && 
        t.startDate && 
        new Date(t.startDate) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Started >1 week ago
      );

      if (stuckTodos.length > 0) {
        bottlenecks.push(`"${subgoal.name}" has ${stuckTodos.length} tasks in progress >1 week`);
      }
    });

    return bottlenecks;
  }

  private static generateImprovementSuggestions(goal: Goal, subgoals: Subgoal[], todos: Todo[]): string[] {
    const suggestions: string[] = [];
    const goalTodos = todos.filter(t => t.goal_id === goal.id);

    // Prioritization suggestions
    const unprioritzed = goalTodos.filter(t => !t.priority && !t.isDone);
    if (unprioritzed.length > 5) {
      suggestions.push("Add priority levels to unprioritized tasks for better focus");
    }

    // Time management suggestions
    const noDeadlines = goalTodos.filter(t => !t.endDate && !t.isDone);
    if (noDeadlines.length > 3) {
      suggestions.push("Set deadlines for open tasks to improve time management");
    }

    // Milestone suggestions
    if (subgoals.length === 0 && goalTodos.length > 10) {
      suggestions.push("Break down large goal into milestones for better tracking");
    }

    return suggestions;
  }

  private static isGoalStalled(goal: Goal, todos: Todo[]): boolean {
    const recentActivity = todos.filter(t => {
      const activityDate = new Date(t.endDate || t.startDate || '');
      return activityDate > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // 14 days
    });
    return recentActivity.length === 0 && todos.length > 0;
  }

  private static isGoalOverscoped(subgoals: Subgoal[], todos: Todo[]): boolean {
    return subgoals.length > 10 || todos.length > 50;
  }

  private static detectAutomationOpportunities(todos: Todo[]): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    // Detect recurring task patterns
    const taskNames = todos.map(t => t.name.toLowerCase());
    const patterns = this.findRecurringPatterns(taskNames);
    
    patterns.forEach(pattern => {
      recommendations.push({
        id: `auto-${pattern}`,
        type: 'automation',
        title: `Automate recurring "${pattern}" tasks`,
        description: `Detected recurring pattern. Consider creating a template or automation.`,
        impact: 'medium',
        effort: 'medium',
        confidence: 75,
        actionable: true,
        automatable: true,
        estimatedTimeToImplement: '2-4 hours',
        relatedGoalIds: [],
        createdAt: new Date()
      });
    });

    return recommendations;
  }

  private static findRecurringPatterns(taskNames: string[]): string[] {
    // Simple pattern detection - could be enhanced with ML
    const words = taskNames.flatMap(name => name.split(' '));
    const wordCounts: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 3) { // Ignore short words
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });

    return Object.entries(wordCounts)
      .filter(([_, count]) => count >= 3)
      .map(([word]) => word);
  }

  private static predictCompletionProbability(
    completionRate: number,
    velocityTrend: number,
    riskFactors: string[]
  ): number {
    let probability = completionRate * 0.6; // Base on current progress
    probability += velocityTrend > 0 ? 0.2 : -0.1; // Adjust for trend
    probability -= riskFactors.length * 0.05; // Reduce for each risk
    return Math.max(0, Math.min(1, probability)) * 100;
  }

  private static estimateCompletionDate(goal: Goal, todos: Todo[], velocityTrend: number): Date {
    const remaining = todos.filter(t => !t.isDone).length;
    const avgVelocity = Math.max(1, velocityTrend + 2); // Weekly velocity with minimum
    const weeksToComplete = Math.ceil(remaining / avgVelocity);
    
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + weeksToComplete * 7);
    
    return estimatedDate;
  }

  private static createStallRecommendation(goal: Goal): SmartRecommendation {
    return {
      id: `stall-${goal.id}`,
      type: 'risk',
      title: 'Goal appears stalled',
      description: 'No recent activity detected. Consider reviewing and breaking down next steps.',
      impact: 'high',
      effort: 'quick',
      confidence: 85,
      actionable: true,
      estimatedTimeToImplement: '30 minutes',
      relatedGoalIds: [goal.id],
      createdAt: new Date()
    };
  }

  private static createScopeRecommendation(goal: Goal): SmartRecommendation {
    return {
      id: `scope-${goal.id}`,
      type: 'optimization',
      title: 'Goal may be overscoped',
      description: 'Consider breaking into smaller, more manageable goals for better progress tracking.',
      impact: 'medium',
      effort: 'medium',
      confidence: 70,
      actionable: true,
      estimatedTimeToImplement: '1-2 hours',
      relatedGoalIds: [goal.id],
      createdAt: new Date()
    };
  }
}
