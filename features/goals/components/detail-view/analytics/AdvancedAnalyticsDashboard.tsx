"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  LineChart, 
  PieChart,
  TrendingUp, 
  TrendingDown,
  Calendar,
  Target,
  Clock,
  Zap,
  Brain,
  Activity,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import type { Goal } from "@/features/goals/types/goalSchema";
import type { Subgoal } from "@/features/subGoals/subGoalschema";
import type { Todo } from "@/features/todo/todoSchema";

interface AdvancedAnalyticsProps {
  goals: Goal[];
  subgoals: Subgoal[];
  todos: Todo[];
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
}

interface AnalyticsInsight {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  description: string;
  value?: string | number;
  trend?: 'up' | 'down' | 'stable';
  actionable?: boolean;
}

// Helper functions
const calculateWeeklyVelocity = (completedTodos: Todo[]): number[] => {
  const weeks = Array.from({ length: 8 }, () => 0);
  const now = new Date();
  
  completedTodos.forEach(todo => {
    const completionDate = new Date(todo.endDate || '');
    const weeksDiff = Math.floor((now.getTime() - completionDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (weeksDiff >= 0 && weeksDiff < 8) {
      weeks[7 - weeksDiff]++;
    }
  });
  
  return weeks;
};

const calculateAvgCompletionTime = (completedTodos: Todo[]): number => {
  const timesToComplete = completedTodos
    .filter(t => t.startDate && t.endDate)
    .map(t => {
      const start = new Date(t.startDate!);
      const end = new Date(t.endDate!);
      return Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    });
  
  return timesToComplete.length > 0 
    ? Math.round(timesToComplete.reduce((a, b) => a + b, 0) / timesToComplete.length)
    : 0;
};

const calculateCategoryStats = (goals: Goal[], todos: Todo[]) => {
  const categories: Record<string, { goals: number; todos: number; completed: number }> = {};
  
  goals.forEach(goal => {
    const cat = goal.category || 'Uncategorized';
    if (!categories[cat]) categories[cat] = { goals: 0, todos: 0, completed: 0 };
    categories[cat].goals++;
  });
  
  todos.forEach(todo => {
    const cat = todo.category || 'Uncategorized';
    if (!categories[cat]) categories[cat] = { goals: 0, todos: 0, completed: 0 };
    categories[cat].todos++;
    if (todo.isDone) categories[cat].completed++;
  });
  
  return Object.entries(categories).map(([name, stats]) => ({
    name,
    ...stats,
    completionRate: stats.todos > 0 ? Math.round((stats.completed / stats.todos) * 100) : 0
  }));
};

const calculatePriorityStats = (todos: Todo[]) => {
  const priorities = { high: 0, medium: 0, low: 0, none: 0 };
  todos.forEach(todo => {
    const priority = todo.priority || 'none';
    priorities[priority as keyof typeof priorities]++;
  });
  return priorities;
};

const analyzeProductivityPatterns = (completedTodos: Todo[]) => {
  // Analyze completion patterns by day of week, time, etc.
  const dayOfWeek = Array.from({ length: 7 }, () => 0);
  
  completedTodos.forEach(todo => {
    if (todo.endDate) {
      const day = new Date(todo.endDate).getDay();
      dayOfWeek[day]++;
    }
  });
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayOfWeek.map((count, index) => ({
    day: dayNames[index],
    completions: count
  }));
};

const calculateSuccessRates = (goals: Goal[], subgoals: Subgoal[], todos: Todo[]) => {
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      goalCompletions: 0,
      taskCompletions: 0
    };
  }).reverse();

  // This would be calculated from actual historical data
  // For now, return mock trending data
  return monthlyData;
};

const calculateTrend = (data: number[]): 'up' | 'down' | 'stable' => {
  if (data.length < 2) return 'stable';
  const recent = data.slice(-2);
  const change = recent[1] - recent[0];
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'stable';
};

const generateInsights = (
  goals: Goal[], 
  todos: Todo[], 
  completed: Todo[], 
  overdue: Todo[],
  analytics: any
): AnalyticsInsight[] => {
  const insights: AnalyticsInsight[] = [];

  // Velocity insights
  if (analytics.overview.weeklyVelocity.length >= 2) {
    const recent = analytics.overview.weeklyVelocity.slice(-2);
    const trend = recent[1] - recent[0];
    
    if (trend > 0) {
      insights.push({
        id: 'velocity-up',
        type: 'positive',
        title: 'Velocity Increasing',
        description: `Your task completion rate has improved by ${trend} tasks per week`,
        trend: 'up',
        actionable: false
      });
    } else if (trend < -2) {
      insights.push({
        id: 'velocity-down',
        type: 'warning',
        title: 'Velocity Declining',
        description: `Task completion has decreased by ${Math.abs(trend)} tasks per week`,
        trend: 'down',
        actionable: true
      });
    }
  }

  // Overdue analysis
  if (overdue.length > 0) {
    const overdueRate = Math.round((overdue.length / todos.length) * 100);
    insights.push({
      id: 'overdue-tasks',
      type: overdueRate > 20 ? 'negative' : 'warning',
      title: 'Overdue Tasks',
      description: `${overdue.length} tasks (${overdueRate}%) are overdue`,
      value: overdue.length,
      actionable: true
    });
  }

  // Completion rate insights
  const completionRate = analytics.overview.todoCompletionRate;
  if (completionRate >= 80) {
    insights.push({
      id: 'high-completion',
      type: 'positive',
      title: 'Excellent Completion Rate',
      description: `${completionRate}% task completion rate - keep it up!`,
      value: `${completionRate}%`
    });
  } else if (completionRate < 50) {
    insights.push({
      id: 'low-completion',
      type: 'negative',
      title: 'Low Completion Rate',
      description: `Only ${completionRate}% of tasks completed - consider reviewing priorities`,
      value: `${completionRate}%`,
      actionable: true
    });
  }

  // Priority analysis
  const highPriorityPending = todos.filter(t => t.priority === 'high' && !t.isDone).length;
  if (highPriorityPending > 3) {
    insights.push({
      id: 'high-priority-backlog',
      type: 'warning',
      title: 'High Priority Backlog',
      description: `${highPriorityPending} high-priority tasks are pending`,
      value: highPriorityPending,
      actionable: true
    });
  }

  // Goal progress insights
  const stuckGoals = goals.filter(g => g.status === 'In Progress').length;
  if (stuckGoals > 0) {
    const stuckRate = Math.round((stuckGoals / goals.length) * 100);
    if (stuckRate > 60) {
      insights.push({
        id: 'stuck-goals',
        type: 'warning',
        title: 'Many Goals In Progress',
        description: `${stuckRate}% of goals are in progress - consider focusing efforts`,
        actionable: true
      });
    }
  }

  return insights.slice(0, 6); // Limit to top 6 insights
};

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsProps> = ({ 
  goals, 
  subgoals, 
  todos, 
  timeframe = 'month' 
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [activeTab, setActiveTab] = useState('overview');

  const analytics = useMemo(() => {
    const now = new Date();
    const timeframeDays = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };

    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - timeframeDays[selectedTimeframe]);

    // Filter data by timeframe
    const periodTodos = todos.filter(todo => {
      const todoDate = new Date(todo.endDate || todo.startDate || '');
      return todoDate >= periodStart;
    });

    const periodGoals = goals.filter(goal => {
      const goalDate = new Date(goal.endDate || '');
      return goalDate >= periodStart;
    });

    // Core Metrics
    const completedTodos = periodTodos.filter(t => t.isDone);
    const overdueTodos = periodTodos.filter(t => !t.isDone && t.endDate && new Date(t.endDate) < now);
    const completedGoals = periodGoals.filter(g => g.status === 'Completed');
    const inProgressGoals = periodGoals.filter(g => g.status === 'In Progress');

    // Velocity Analysis
    const weeklyVelocity = calculateWeeklyVelocity(completedTodos);
    const avgCompletionTime = calculateAvgCompletionTime(completedTodos);
    
    // Category Performance
    const categoryStats = calculateCategoryStats(periodGoals, periodTodos);
    
    // Priority Distribution
    const priorityStats = calculatePriorityStats(periodTodos);
    
    // Productivity Patterns
    const productivityPatterns = analyzeProductivityPatterns(completedTodos);
    
    // Success Rate Trends
    const successRates = calculateSuccessRates(periodGoals, subgoals, periodTodos);

    const analyticsData = {
      overview: {
        totalGoals: periodGoals.length,
        completedGoals: completedGoals.length,
        completionRate: periodGoals.length > 0 ? Math.round((completedGoals.length / periodGoals.length) * 100) : 0,
        totalTodos: periodTodos.length,
        completedTodos: completedTodos.length,
        todoCompletionRate: periodTodos.length > 0 ? Math.round((completedTodos.length / periodTodos.length) * 100) : 0,
        overdueTodos: overdueTodos.length,
        avgCompletionTime,
        weeklyVelocity
      },
      trends: {
        velocityTrend: calculateTrend(weeklyVelocity),
        categoryPerformance: categoryStats,
        priorityDistribution: priorityStats,
        successRates
      },
      patterns: productivityPatterns
    };

    return {
      ...analyticsData,
      insights: generateInsights(periodGoals, periodTodos, completedTodos, overdueTodos, analyticsData)
    };
  }, [goals, subgoals, todos, selectedTimeframe]);

  const getInsightIcon = (insight: AnalyticsInsight) => {
    switch (insight.type) {
      case 'positive':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'negative':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Brain className="w-5 h-5 text-blue-600" />;
    }
  };

  const getInsightColor = (insight: AnalyticsInsight) => {
    switch (insight.type) {
      case 'positive':
        return 'bg-green-50 border-green-200';
      case 'negative':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Timeframe Selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart className="w-6 h-6 text-indigo-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
            <p className="text-gray-600">Comprehensive insights into your goal progress</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map(period => (
            <Button
              key={period}
              variant={selectedTimeframe === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeframe(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Goal Completion</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.completionRate}%</p>
            </div>
            <Target className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Task Velocity</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overview.weeklyVelocity.slice(-1)[0] || 0}
              </p>
            </div>
            <Zap className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Completion</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.avgCompletionTime}d</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.overdueTodos}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Velocity Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Weekly Task Velocity
              </h3>
              <div className="space-y-3">
                {analytics.overview.weeklyVelocity.map((count, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-16">Week {index + 1}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((count / Math.max(...analytics.overview.weeklyVelocity)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Category Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Category Performance
              </h3>
              <div className="space-y-3">
                {analytics.trends.categoryPerformance.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{category.name}</span>
                      <Badge variant="outline">{category.completionRate}%</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${category.completionRate}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600">
                      {category.completed}/{category.todos} tasks completed
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Priority Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
              <div className="space-y-3">
                {Object.entries(analytics.trends.priorityDistribution).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between">
                    <span className="capitalize font-medium">{priority}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            priority === 'high' ? 'bg-red-500' :
                            priority === 'medium' ? 'bg-yellow-500' :
                            priority === 'low' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${(count / todos.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Productivity Patterns */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Daily Completion Pattern</h3>
              <div className="space-y-3">
                {analytics.patterns.map((day, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-12">{day.day}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((day.completions / Math.max(...analytics.patterns.map(p => p.completions))) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{day.completions}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {analytics.insights.length === 0 ? (
            <Card className="p-8 text-center">
              <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600">No insights available yet.</p>
              <p className="text-sm text-gray-500">Complete more tasks to generate AI-powered insights.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {analytics.insights.map(insight => (
                <Card key={insight.id} className={`p-4 border-2 ${getInsightColor(insight)}`}>
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        {insight.trend && (
                          <div className="flex items-center gap-1">
                            {insight.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                            {insight.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{insight.description}</p>
                      {insight.actionable && (
                        <Badge className="mt-2" variant="outline">Actionable</Badge>
                      )}
                    </div>
                    {insight.value && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{insight.value}</div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Productivity Heat Map
            </h3>
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Advanced heat map visualization coming soon.</p>
              <p className="text-sm">Track your productivity patterns across time and categories.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
