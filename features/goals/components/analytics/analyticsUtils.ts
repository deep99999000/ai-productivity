import type { Goal } from "@/features/goals/schema";
import type { Subgoal } from "@/features/subGoals/schema";
import type { Todo } from "@/features/todo/schema";

export const calculateVelocityTrends = (completedTodos: Todo[], days: number) => {
  const periods = Math.min(12, Math.floor(days / 7));
  const data = [] as Array<{ period: string; value: number; date: string }>;
  for (let i = 0; i < periods; i++) {
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() - i * 7);
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - 7);
    const periodTodos = completedTodos.filter((todo) => {
      const todoDate = new Date(todo.endDate || "");
      return todoDate >= periodStart && todoDate <= periodEnd;
    });
    data.unshift({ period: `W${periods - i}`, value: periodTodos.length, date: periodStart.toISOString().split("T")[0] });
  }
  return data;
};

export const analyzeProductivityPatterns = (completedTodos: Todo[]) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const patterns = days.map((day) => ({ day, completions: 0 }));
  completedTodos.forEach((todo) => {
    if (todo.endDate) {
      const dayIndex = new Date(todo.endDate).getDay();
      patterns[dayIndex].completions++;
    }
  });
  return patterns;
};

export const analyzeCategoryPerformance = (goals: Goal[], todos: Todo[]) => {
  const categories: Record<string, { total: number; completed: number }> = {};
  todos.forEach((todo) => {
    const category = todo.category || 'Uncategorized';
    if (!categories[category]) categories[category] = { total: 0, completed: 0 };
    categories[category].total++;
    if (todo.isDone) categories[category].completed++;
  });
  return Object.entries(categories).map(([name, stats]) => ({
    name,
    completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    total: stats.total,
    completed: stats.completed,
  }));
};

export const calculateGoalHealthScores = (goals: Goal[], subgoals: Subgoal[], todos: Todo[]) => {
  return goals.map((goal) => {
    const goalSubgoals = subgoals.filter((sg) => sg.goal_id === goal.id);
    const goalTodos = todos.filter((t) => t.goal_id === goal.id);
    let healthScore = 50;
    const completedTodos = goalTodos.filter((t) => t.isDone).length;
    const progressRate = goalTodos.length > 0 ? (completedTodos / goalTodos.length) * 100 : 0;
    healthScore += progressRate * 0.4;
    if (goal.endDate) {
      const daysLeft = Math.ceil((new Date(goal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft > 0) healthScore += Math.min((daysLeft / 30) * 20, 20);
      else healthScore -= 30;
    }
    const recentActivity = goalTodos.filter((t) => {
      const activityDate = new Date(t.endDate || t.startDate || "");
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return activityDate >= sevenDaysAgo;
    }).length;
    healthScore += Math.min(recentActivity * 5, 20);
    const completedSubgoals = goalSubgoals.filter((sg) => sg.status.toLowerCase().includes('completed')).length;
    const subgoalProgress = goalSubgoals.length > 0 ? (completedSubgoals / goalSubgoals.length) * 20 : 0;
    healthScore += subgoalProgress;
    return { name: goal.name, healthScore: Math.max(0, Math.min(100, Math.round(healthScore))), id: goal.id };
  });
};

export const calculatePerformanceMetrics = (todos: Todo[], goals: Goal[]) => {
  const completedGoals = goals.filter((g) => g.status === 'Completed').length;
  const completedTasks = todos.filter((t) => t.isDone).length;
  return [
    { metric: 'This Week', goals: completedGoals, tasks: Math.round(completedTasks * 0.3) },
    { metric: 'Last Week', goals: Math.max(0, completedGoals - 1), tasks: Math.round(completedTasks * 0.25) },
    { metric: 'This Month', goals: completedGoals, tasks: completedTasks },
    { metric: 'Last Month', goals: Math.max(0, completedGoals - 1), tasks: Math.round(completedTasks * 0.8) },
  ];
};

export const calculateBurndownChart = (todos: Todo[], goalEndDate?: Date | string | null) => {
  if (!goalEndDate) return [] as Array<{ date: string; remaining: number; ideal: number }>;
  const endDate = new Date(goalEndDate);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const totalTasks = todos.length;
  const data: Array<{ date: string; remaining: number; ideal: number }> = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
    const completedByDate = todos.filter((t) => t.isDone && t.endDate && new Date(t.endDate) <= d).length;
    const remaining = Math.max(0, totalTasks - completedByDate);
    const weeksFromStart = Math.ceil((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const ideal = Math.max(0, totalTasks - (totalTasks * weeksFromStart) / totalWeeks);
    data.push({ date: d.toISOString().split('T')[0], remaining, ideal: Math.round(ideal) });
  }
  return data;
};

export const calculateVelocityComparison = (completedTodos: Todo[], timeframe: string) => {
  const now = new Date();
  const timeframeDays = { week: 7, month: 30, quarter: 90, year: 365 } as const;
  const days = timeframeDays[timeframe as keyof typeof timeframeDays];
  const currentPeriodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const previousPeriodStart = new Date(currentPeriodStart.getTime() - days * 24 * 60 * 60 * 1000);
  const currentTodos = completedTodos.filter((t) => t.endDate && new Date(t.endDate) >= currentPeriodStart);
  const previousTodos = completedTodos.filter((t) => t.endDate && new Date(t.endDate) >= previousPeriodStart && new Date(t.endDate) < currentPeriodStart);
  const current = currentTodos.length;
  const previous = previousTodos.length;
  const change = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;
  return { period: timeframe, current, previous, change, projected: current + Math.round(current * 0.1) };
};

export const calculateTimeDistribution = (completedTodos: Todo[]) => {
  const ranges: Record<string, number> = {
    'Quick (< 1h)': 0,
    'Short (1-4h)': 0,
    'Medium (4h-1d)': 0,
    'Long (1-3d)': 0,
    'Extended (3d+)': 0,
  };
  completedTodos.forEach((todo) => {
    if (!todo.startDate || !todo.endDate) return;
    const hours = (new Date(todo.endDate).getTime() - new Date(todo.startDate).getTime()) / (1000 * 60 * 60);
    if (hours < 1) ranges['Quick (< 1h)']++;
    else if (hours < 4) ranges['Short (1-4h)']++;
    else if (hours < 24) ranges['Medium (4h-1d)']++;
    else if (hours < 72) ranges['Long (1-3d)']++;
    else ranges['Extended (3d+)']++;
  });
  return Object.entries(ranges).map(([range, count]) => ({ range, count }));
};

export const calculateProgressTrends = (todos: Todo[], timeframe: string) => {
  const periods = timeframe === 'week' ? 4 : timeframe === 'month' ? 6 : 12;
  const data: Array<{ period: string; completionRate: number; completed: number; total: number }> = [];
  for (let i = 0; i < periods; i++) {
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() - i * 7);
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - 7);
    const periodTodos = todos.filter((todo) => {
      const todoDate = new Date(todo.startDate || "");
      return todoDate >= periodStart && todoDate <= periodEnd;
    });
    const completed = periodTodos.filter((t) => t.isDone).length;
    const completionRate = periodTodos.length > 0 ? (completed / periodTodos.length) * 100 : 0;
    data.unshift({ period: `P${periods - i}`, completionRate: Math.round(completionRate), completed, total: periodTodos.length });
  }
  return data;
};

export const analyzePriorityEffectiveness = (todos: Todo[]) => {
  const priorityGroups = {
    High: todos.filter((t) => t.priority === 'High'),
    Medium: todos.filter((t) => t.priority === 'Medium'),
    Low: todos.filter((t) => t.priority === 'Low'),
  } as const;
  const effectiveness = Object.entries(priorityGroups).map(([priority, tasks]) => {
    const completed = (tasks as Todo[]).filter((t) => t.isDone);
    const completionRate = (tasks as Todo[]).length > 0 ? (completed.length / (tasks as Todo[]).length) * 100 : 0;
    return { priority, total: (tasks as Todo[]).length, completed: completed.length, completionRate: Math.round(completionRate), efficiency: Math.round(completionRate) };
  });
  const highPriorityRate = effectiveness.find((e) => e.priority === 'High')?.completionRate || 0;
  const mediumPriorityRate = effectiveness.find((e) => e.priority === 'Medium')?.completionRate || 0;
  const lowPriorityRate = effectiveness.find((e) => e.priority === 'Low')?.completionRate || 0;
  const alignmentScore = Math.round(highPriorityRate * 0.5 + mediumPriorityRate * 0.3 + lowPriorityRate * 0.2);
  return {
    effectiveness,
    alignmentScore,
    recommendations: alignmentScore < 60 ? ['Focus more on high-priority tasks', 'Review task prioritization'] : ['Good priority management'],
  };
};

export const calculateCompletionForecast = (todos: Todo[], goal?: Goal) => {
  const completedTodos = todos.filter((t) => t.isDone);
  const remainingTodos = todos.filter((t) => !t.isDone);
  if (completedTodos.length === 0) return { estimatedCompletionDate: null as string | null, confidence: 0, timeline: [] as Array<{ date: string; actual: number; forecast: number }> };
  const avgCompletionTime = completedTodos.reduce((acc, todo) => {
    if (!todo.startDate || !todo.endDate) return acc;
    return acc + (new Date(todo.endDate).getTime() - new Date(todo.startDate).getTime());
  }, 0) / (completedTodos.length * 1000 * 60 * 60 * 24);
  const estimatedDaysRemaining = remainingTodos.length * Math.max(avgCompletionTime, 1);
  const estimatedCompletionDate = new Date();
  estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDaysRemaining);
  const timeline: Array<{ date: string; actual: number; forecast: number }> = [];
  const totalTodos = todos.length;
  const startDate = new Date();
  for (let i = 0; i <= 10; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * 7);
    const actualCompleted = completedTodos.filter((t) => t.endDate && new Date(t.endDate) <= date).length;
    const forecastCompleted = Math.min(totalTodos, completedTodos.length + Math.round((i * 7) / Math.max(avgCompletionTime, 1)));
    timeline.push({ date: date.toISOString().split('T')[0], actual: actualCompleted, forecast: forecastCompleted });
  }
  const confidence = Math.min(100, Math.max(20, 100 - remainingTodos.length * 5));
  return { estimatedCompletionDate: estimatedCompletionDate.toISOString(), confidence, timeline };
};

export const calculateProductivityHeatmap = (completedTodos: Todo[]) => {
  const heatmapData: Array<{ date: string; completions: number; intensity: number }> = [];
  const maxCompletions = Math.max(...completedTodos.map(() => 1), 1);
  for (let i = 41; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayCompletions = completedTodos.filter((todo) => {
      if (!todo.endDate) return false;
      const todoDate = new Date(todo.endDate);
      return todoDate.toDateString() === date.toDateString();
    }).length;
    heatmapData.push({ date: date.toISOString().split('T')[0], completions: dayCompletions, intensity: dayCompletions / Math.max(maxCompletions, 1) });
  }
  return heatmapData;
};

export const calculateSprintAnalytics = (todos: Todo[], timeframe: string) => {
  const sprintLength = timeframe === 'week' ? 7 : 14;
  const numberOfSprints = 6;
  const sprints: Array<{ sprint: string; velocity: number; quality: number; planned: number; completed: number }> = [];
  for (let i = numberOfSprints - 1; i >= 0; i--) {
    const sprintEnd = new Date();
    sprintEnd.setDate(sprintEnd.getDate() - i * sprintLength);
    const sprintStart = new Date(sprintEnd);
    sprintStart.setDate(sprintStart.getDate() - sprintLength);
    const sprintTodos = todos.filter((todo) => {
      const todoDate = new Date(todo.startDate || "");
      return todoDate >= sprintStart && todoDate <= sprintEnd;
    });
    const completed = sprintTodos.filter((t) => t.isDone).length;
    const velocity = completed;
    const quality = sprintTodos.length > 0 ? (completed / sprintTodos.length) * 100 : 0;
    sprints.push({ sprint: `S${numberOfSprints - i}`, velocity, quality: Math.round(quality), planned: sprintTodos.length, completed });
  }
  return {
    sprints,
    averageVelocity: Math.round(sprints.reduce((acc, s) => acc + s.velocity, 0) / sprints.length || 0),
    averageQuality: Math.round(sprints.reduce((acc, s) => acc + s.quality, 0) / sprints.length || 0),
  };
};

export const calculateCollaborationMetrics = (goals: Goal[], subgoals: Subgoal[], todos: Todo[]) => {
  const collaborativeKeywords = ['team', 'meeting', 'review', 'discuss', 'collaboration', 'shared'];
  const sharedGoals = goals.filter((g) => collaborativeKeywords.some((keyword) => g.name.toLowerCase().includes(keyword) || (g.description && g.description.toLowerCase().includes(keyword))));
  const collaborativeTodos = todos.filter((t) => collaborativeKeywords.some((keyword) => t.name.toLowerCase().includes(keyword) || (t.description && t.description.toLowerCase().includes(keyword))));
  const collaborationRate = todos.length > 0 ? (collaborativeTodos.length / todos.length) * 100 : 0;
  const teamEfficiency = collaborativeTodos.length > 0 ? (collaborativeTodos.filter((t) => t.isDone).length / collaborativeTodos.length) * 100 : 0;
  return { sharedGoalsCount: sharedGoals.length, individualGoalsCount: goals.length - sharedGoals.length, collaborativeTasks: collaborativeTodos.length, collaborationRate: Math.round(collaborationRate), teamEfficiency: Math.round(teamEfficiency) };
};

export const calculateFocusTimeMetrics = (todos: Todo[], timeframe: string) => {
  const completedTodos = todos.filter((t) => t.isDone);
  const focusTimes = completedTodos
    .map((todo) => {
      if (!todo.startDate || !todo.endDate) return 0;
      const start = new Date(todo.startDate);
      const end = new Date(todo.endDate);
      return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
    })
    .filter((time) => time > 0 && time < 24);
  if (focusTimes.length === 0) return { averageFocusTime: 0, longestSession: 0, shortestSession: 0, deepWorkSessions: 0, deepWorkPercentage: 0, totalFocusTime: 0, sessionCount: 0 };
  const averageFocusTime = focusTimes.reduce((a, b) => a + b, 0) / focusTimes.length;
  const longestSession = Math.max(...focusTimes);
  const shortestSession = Math.min(...focusTimes);
  const deepWorkSessions = focusTimes.filter((time) => time >= 2).length;
  const deepWorkPercentage = (deepWorkSessions / focusTimes.length) * 100;
  return {
    averageFocusTime: Math.round(averageFocusTime * 10) / 10,
    longestSession: Math.round(longestSession * 10) / 10,
    shortestSession: Math.round(shortestSession * 10) / 10,
    deepWorkSessions,
    deepWorkPercentage: Math.round(deepWorkPercentage),
    totalFocusTime: Math.round(focusTimes.reduce((a, b) => a + b, 0) * 10) / 10,
    sessionCount: focusTimes.length,
  };
};

export const analyzeDifficultyCorrelation = (todos: Todo[]) => {
  const priorityMap = { High: 3, Medium: 2, Low: 1 } as const;
  const completedTodos = todos.filter((t) => t.isDone);
  if (completedTodos.length === 0) return { correlation: 0, insights: [] as any[], effectiveness: 0 };
  const priorityStats = Object.entries(priorityMap).map(([priority, weight]) => {
    const priorityTodos = todos.filter((t) => t.priority === priority);
    const completed = priorityTodos.filter((t) => t.isDone);
    const completionRate = priorityTodos.length > 0 ? (completed.length / priorityTodos.length) * 100 : 0;
    return { priority, weight, total: priorityTodos.length, completed: completed.length, completionRate: Math.round(completionRate) };
  });
  const effectiveness = priorityStats.reduce((acc, stat) => acc + (stat.completionRate * stat.weight) / 3, 0) / priorityStats.length;
  return { correlation: Math.round(effectiveness), priorityStats, effectiveness: Math.round(effectiveness), insights: [] };
};

export const analyzeEnergyPatterns = (todos: Todo[]) => {
  const completedTodos = todos.filter((t) => t.isDone && (t.endDate || t.startDate));
  const hourlyPatterns = Array.from({ length: 24 }, (_, hour) => ({ hour, completions: 0, productivity: 0 }));
  completedTodos.forEach((todo) => {
    const completionDate = new Date(todo.endDate || todo.startDate || "");
    const hour = completionDate.getHours();
    hourlyPatterns[hour].completions++;
    const priorityWeight = todo.priority === 'High' ? 3 : todo.priority === 'Medium' ? 2 : 1;
    hourlyPatterns[hour].productivity += priorityWeight;
  });
  const peakHour = hourlyPatterns.reduce((max, current) => (current.completions > max.completions ? current : max));
  return {
    hourlyPatterns,
    peakHour,
    lowEnergyHours: hourlyPatterns.filter((h) => h.completions === 0).map((h) => h.hour),
    morningProductivity: hourlyPatterns.slice(6, 12).reduce((acc, h) => acc + h.completions, 0),
    afternoonProductivity: hourlyPatterns.slice(12, 18).reduce((acc, h) => acc + h.completions, 0),
    eveningProductivity: hourlyPatterns.slice(18, 24).reduce((acc, h) => acc + h.completions, 0),
  };
};

export const calculateGoalRiskAssessment = (goal: Goal | undefined, subgoals: Subgoal[], todos: Todo[]) => {
  if (!goal) return { riskLevel: 'low' as const, riskFactors: [] as string[], score: 0, recommendations: ['Maintain current momentum', 'Continue good practices'] };
  let riskScore = 0;
  const riskFactors: string[] = [];
  if (goal.endDate) {
    const daysLeft = Math.ceil((new Date(goal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const totalTodos = todos.length;
    const completedTodos = todos.filter((t) => t.isDone).length;
    const remainingTodos = totalTodos - completedTodos;
    if (daysLeft < remainingTodos && remainingTodos > 0) {
      riskScore += 30;
      riskFactors.push('Timeline pressure: More tasks than days remaining');
    }
    if (daysLeft < 0) {
      riskScore += 40;
      riskFactors.push('Goal is overdue');
    }
  }
  const progressRate = todos.length > 0 ? (todos.filter((t) => t.isDone).length / todos.length) * 100 : 0;
  if (progressRate < 25) {
    riskScore += 25;
    riskFactors.push('Low progress rate (< 25%)');
  }
  const recentActivity = todos.filter((t) => {
    const activityDate = new Date(t.endDate || t.startDate || "");
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    return activityDate >= threeDaysAgo;
  }).length;
  if (recentActivity === 0 && todos.length > 0) {
    riskScore += 20;
    riskFactors.push('No recent activity (last 3 days)');
  }
  const highPriorityTasks = todos.filter((t) => t.priority === 'High' && !t.isDone).length;
  if (highPriorityTasks > 3) {
    riskScore += 15;
    riskFactors.push('Many high-priority tasks remaining');
  }
  const overdueSubgoals = subgoals.filter((sg) => sg.status.toLowerCase().includes('overdue') || sg.status.toLowerCase().includes('delayed')).length;
  if (overdueSubgoals > 0) {
    riskScore += 10;
    riskFactors.push(`${overdueSubgoals} milestone(s) behind schedule`);
  }
  const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';
  return {
    riskLevel,
    riskFactors,
    score: Math.min(riskScore, 100),
    recommendations: riskLevel === 'high'
      ? ['Break down large tasks immediately', 'Review and adjust timeline', 'Remove blockers', 'Increase daily focus time']
      : riskLevel === 'medium'
      ? ['Monitor progress closely', 'Adjust schedule if needed', 'Focus on high-priority items']
      : ['Maintain current momentum', 'Continue good practices'],
  };
};

export const calculateGoalComparison = (goals: Goal[], todos: Todo[]) => {
  const currentGoal = goals[0];
  if (!currentGoal) return [] as Array<{ metric: string; current: number; average: number }>;
  const currentGoalTodos = todos.filter((t) => t.goal_id === currentGoal.id);
  const currentCompletionRate = currentGoalTodos.length > 0 ? (currentGoalTodos.filter((t) => t.isDone).length / currentGoalTodos.length) * 100 : 0;
  const avgCompletionRate = 75;
  const avgVelocity = 8;
  const avgQuality = 85;
  const currentVelocity = currentGoalTodos.filter((t) => t.isDone).length;
  const currentQuality = currentCompletionRate;
  return [
    { metric: 'Completion Rate', current: Math.round(currentCompletionRate), average: avgCompletionRate },
    { metric: 'Weekly Velocity', current: currentVelocity, average: avgVelocity },
    { metric: 'Quality Score', current: Math.round(currentQuality), average: avgQuality },
    { metric: 'Task Count', current: currentGoalTodos.length, average: 15 },
  ];
};

export const calculateMilestoneAnalysis = (subgoals: Subgoal[], todos: Todo[]) => {
  const milestones = subgoals.map((subgoal) => {
    const subgoalTodos = todos.filter((t) => t.subgoal_id === subgoal.id);
    const completed = subgoalTodos.filter((t) => t.isDone).length;
    const progress = subgoalTodos.length > 0 ? (completed / subgoalTodos.length) * 100 : 0;
    const status = progress === 100 ? 'completed' : progress > 50 ? 'in-progress' : 'not-started';
    return { name: subgoal.name, progress: Math.round(progress), status, totalTasks: subgoalTodos.length, completedTasks: completed };
  });
  const completedMilestones = milestones.filter((m) => m.status === 'completed').length;
  const totalMilestones = milestones.length;
  return { milestones, completedMilestones, totalMilestones, completionRate: totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0 };
};

export const calculateCurrentStreak = (completedTodos: Todo[]) => {
  if (completedTodos.length === 0) return 0;
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const hasCompletion = completedTodos.some((todo) => {
      if (!todo.endDate) return false;
      const todoDate = new Date(todo.endDate);
      return todoDate.toDateString() === checkDate.toDateString();
    });
    if (hasCompletion) streak++;
    else break;
  }
  return streak;
};

export const calculateLongestStreak = (completedTodos: Todo[]) => {
  if (completedTodos.length === 0) return 0;
  let maxStreak = 0;
  let currentStreak = 0;
  const today = new Date();
  for (let i = 365; i >= 0; i--) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const hasCompletion = completedTodos.some((todo) => {
      if (!todo.endDate) return false;
      const todoDate = new Date(todo.endDate);
      return todoDate.toDateString() === checkDate.toDateString();
    });
    if (hasCompletion) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  return maxStreak;
};
