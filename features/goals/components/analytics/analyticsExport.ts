"use client";

import type { Goal } from "@/features/goals/schema";
import type { Subgoal } from "@/features/subGoals/schema";
import type { Todo } from "@/features/todo/schema";

interface AnalyticsExportData {
  timestamp: string;
  timeframe: string;
  goals: Goal[];
  subgoals: Subgoal[];
  todos: Todo[];
  metrics: {
    completionRate: number;
    velocityThisWeek: number;
    currentStreak: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
  };
}

export const exportAnalyticsData = (
  goals: Goal[],
  subgoals: Subgoal[],
  todos: Todo[],
  timeframe: string,
  format: 'json' | 'csv' = 'json'
) => {
  const data: AnalyticsExportData = {
    timestamp: new Date().toISOString(),
    timeframe,
    goals,
    subgoals,
    todos,
    metrics: {
      completionRate: todos.length > 0 ? (todos.filter(t => t.isDone).length / todos.length) * 100 : 0,
      velocityThisWeek: todos.filter(t => t.isDone).length, // Simplified
      currentStreak: 0, // Would be calculated
      totalTasks: todos.length,
      completedTasks: todos.filter(t => t.isDone).length,
      overdueTasks: todos.filter(t => !t.isDone && t.endDate && new Date(t.endDate) < new Date()).length,
    }
  };

  if (format === 'json') {
    return exportAsJSON(data);
  } else {
    return exportAsCSV(data);
  }
};

const exportAsJSON = (data: AnalyticsExportData) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportAsCSV = (data: AnalyticsExportData) => {
  // Create CSV for todos with analytics data
  const headers = [
    'Task Name',
    'Status',
    'Priority',
    'Category',
    'Start Date',
    'End Date',
    'Goal',
    'Subgoal',
    'Completion Rate',
    'Days to Complete'
  ];

  const rows = data.todos.map(todo => {
    const goal = data.goals.find(g => g.id === todo.goal_id);
    const subgoal = data.subgoals.find(sg => sg.id === todo.subgoal_id);
    const daysToComplete = todo.startDate && todo.endDate ? 
      Math.ceil((new Date(todo.endDate).getTime() - new Date(todo.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return [
      todo.name,
      todo.isDone ? 'Completed' : 'Pending',
      todo.priority || 'Medium',
      todo.category || 'General',
      todo.startDate || '',
      todo.endDate || '',
      goal?.name || '',
      subgoal?.name || '',
      data.metrics.completionRate.toFixed(1) + '%',
      daysToComplete.toString()
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareAnalytics = async (
  title: string,
  summary: string,
  url?: string
) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Analytics Report: ${title}`,
        text: summary,
        url: url || window.location.href
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  } else {
    // Fallback to clipboard
    const shareText = `${title}\n\n${summary}\n\n${url || window.location.href}`;
    try {
      await navigator.clipboard.writeText(shareText);
      alert('Analytics summary copied to clipboard!');
    } catch (error) {
      console.log('Error copying to clipboard:', error);
    }
  }
};

export const generateAnalyticsSummary = (
  completionRate: number,
  velocityThisWeek: number,
  currentStreak: number,
  timeframe: string
) => {
  return `Analytics Summary (${timeframe}):
• Completion Rate: ${completionRate.toFixed(1)}%
• Weekly Velocity: ${velocityThisWeek} tasks
• Current Streak: ${currentStreak} days
• Generated: ${new Date().toLocaleDateString()}`;
};
