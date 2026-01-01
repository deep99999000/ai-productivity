import type { Task, Milestone, Project } from "../schema";
import type {
  GanttTask,
  CriticalPathNode,
  VelocityData,
  BurndownData,
  ProjectMetrics,
  MilestoneMetrics,
  TaskMetrics,
  ResourceMetrics,
} from "../types";
import { differenceInDays, addDays, eachDayOfInterval, startOfWeek, endOfWeek, format } from "date-fns";

// ============================
// GANTT CHART UTILITIES
// ============================

export function convertToGanttTasks(
  projects: Project[],
  milestones: Milestone[],
  tasks: Task[]
): GanttTask[] {
  const ganttTasks: GanttTask[] = [];

  // Add projects
  projects.forEach((project) => {
    if (project.start_date && project.target_end_date) {
      ganttTasks.push({
        id: project.id,
        name: project.name,
        start: project.start_date,
        end: project.target_end_date,
        progress: project.completion_percentage || 0,
        type: "project",
      });
    }
  });

  // Add milestones
  milestones.forEach((milestone) => {
    if (milestone.start_date && milestone.due_date) {
      ganttTasks.push({
        id: milestone.id + 100000, // Offset to avoid ID conflicts
        name: milestone.name,
        start: milestone.start_date,
        end: milestone.due_date,
        progress: milestone.progress_percentage || 0,
        type: "milestone",
        parentId: milestone.project_id,
        dependencies: milestone.dependent_on || undefined,
      });
    }
  });

  // Add tasks
  tasks.forEach((task) => {
    if (task.start_date && task.due_date) {
      const status = task.status;
      let progress = 0;
      if (status === "completed") progress = 100;
      else if (status === "in_progress") progress = 50;
      else if (status === "in_review") progress = 75;

      ganttTasks.push({
        id: task.id + 200000, // Offset to avoid ID conflicts
        name: task.title,
        start: task.start_date,
        end: task.due_date,
        progress,
        type: "task",
        parentId: task.milestone_id + 100000,
        milestone_id: task.milestone_id,
        assignee: task.assigned_to || undefined,
        status: task.status,
        priority: (task.priority as any) || undefined,
        dependencies: task.depends_on?.map((id: number) => id + 200000),
      });
    }
  });

  return ganttTasks;
}

// ============================
// CRITICAL PATH ANALYSIS
// ============================

export function calculateCriticalPath(tasks: Task[]): CriticalPathNode[] {
  // Build dependency graph
  const taskMap = new Map<number, Task>();
  tasks.forEach((task) => taskMap.set(task.id, task));

  const nodes: CriticalPathNode[] = [];

  tasks.forEach((task) => {
    if (!task.start_date || !task.due_date) return;

    const duration = differenceInDays(task.due_date, task.start_date);
    const earliestStart = task.start_date;
    const earliestFinish = task.due_date;

    // Calculate latest start/finish (simplified - would need full backward pass in real implementation)
    const latestFinish = task.due_date;
    const latestStart = addDays(latestFinish, -duration);

    const slack = differenceInDays(latestStart, earliestStart);
    const isCritical = slack === 0;

    nodes.push({
      taskId: task.id,
      taskName: task.title,
      duration,
      earliestStart,
      earliestFinish,
      latestStart,
      latestFinish,
      slack,
      isCritical,
    });
  });

  // Mark critical path
  return nodes.sort((a, b) => a.earliestStart.getTime() - b.earliestStart.getTime());
}

// ============================
// ANALYTICS UTILITIES
// ============================

export function calculateProjectMetrics(projects: Project[]): ProjectMetrics {
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const atRiskProjects = projects.filter(
    (p) => p.health === "at_risk" || p.health === "critical"
  ).length;

  const totalHealth = projects.reduce((sum, p) => sum + (p.health_score || 0), 0);
  const overallHealthScore = totalProjects > 0 ? Math.round(totalHealth / totalProjects) : 0;

  const totalCompletion = projects.reduce((sum, p) => sum + (p.completion_percentage || 0), 0);
  const averageCompletion = totalProjects > 0 ? Math.round(totalCompletion / totalProjects) : 0;

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    atRiskProjects,
    overallHealthScore,
    averageCompletion,
  };
}

export function calculateMilestoneMetrics(milestones: Milestone[]): MilestoneMetrics {
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((m) => m.status === "completed").length;
  const blockedMilestones = milestones.filter((m) => m.status === "blocked").length;
  const pendingApproval = milestones.filter((m) => m.status === "pending_approval").length;

  const now = new Date();
  const onTrack = milestones.filter((m) => {
    if (m.status === "completed") return true;
    if (!m.due_date) return false;
    return m.due_date > now;
  }).length;

  const delayed = milestones.filter((m) => {
    if (m.status === "completed") return false;
    if (!m.due_date) return false;
    return m.due_date <= now;
  }).length;

  return {
    totalMilestones,
    completedMilestones,
    blockedMilestones,
    pendingApproval,
    onTrack,
    delayed,
  };
}

export function calculateTaskMetrics(tasks: Task[]): TaskMetrics {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const blockedTasks = tasks.filter((t) => t.is_blocked).length;

  const now = new Date();
  const overdueTasks = tasks.filter((t) => {
    if (t.status === "completed") return false;
    if (!t.due_date) return false;
    return t.due_date < now;
  }).length;

  const slaBreaches = tasks.filter((t) => t.sla_breached).length;

  // Calculate average completion time (in days)
  const completedWithTimes = tasks.filter(
    (t) => t.status === "completed" && t.completed_at && t.start_date
  );
  const totalTime = completedWithTimes.reduce((sum, t) => {
    if (t.completed_at && t.start_date) {
      return sum + differenceInDays(t.completed_at, t.start_date);
    }
    return sum;
  }, 0);
  const averageCompletionTime =
    completedWithTimes.length > 0 ? Math.round(totalTime / completedWithTimes.length) : 0;

  return {
    totalTasks,
    completedTasks,
    blockedTasks,
    overdueTasks,
    slaBreaches,
    averageCompletionTime,
  };
}

// ============================
// VELOCITY TRACKING
// ============================

export function calculateVelocity(tasks: Task[], weeks: number = 4): VelocityData[] {
  const velocityData: VelocityData[] = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(addDays(now, -i * 7), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    const tasksCompleted = tasks.filter((t) => {
      if (!t.completed_at) return false;
      return t.completed_at >= weekStart && t.completed_at <= weekEnd;
    }).length;

    // For milestones, we'd need to pass them separately
    const milestonesCompleted = 0; // Placeholder

    velocityData.push({
      week: format(weekStart, "MMM d"),
      tasksCompleted,
      milestonesCompleted,
      plannedVsActual: 100, // Placeholder - would need historical planning data
    });
  }

  return velocityData;
}

// ============================
// BURNDOWN CHART
// ============================

export function generateBurndownData(
  project: Project,
  tasks: Task[]
): BurndownData[] {
  if (!project.start_date || !project.target_end_date) return [];

  const days = eachDayOfInterval({
    start: project.start_date,
    end: project.target_end_date,
  });

  const totalTasks = tasks.length;
  const idealBurnRate = totalTasks / days.length;

  const burndownData: BurndownData[] = days.map((day, index) => {
    // Calculate ideal remaining
    const ideal = Math.max(0, totalTasks - idealBurnRate * (index + 1));

    // Calculate actual remaining
    const completedByDay = tasks.filter((t) => {
      if (!t.completed_at) return false;
      return t.completed_at <= day;
    }).length;
    const actual = totalTasks - completedByDay;
    const remaining = Math.max(0, actual);

    return {
      date: format(day, "MMM d"),
      ideal: Math.round(ideal),
      actual: Math.round(actual),
      remaining: Math.round(remaining),
    };
  });

  return burndownData;
}

// ============================
// RESOURCE UTILIZATION
// ============================

export function calculateResourceUtilization(
  tasks: Task[],
  userId: string
): number {
  const userTasks = tasks.filter((t) => t.assigned_to === userId);
  const totalEstimated = userTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
  const totalActual = userTasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0);

  const availableHours = 40; // Default work week
  return totalEstimated > 0 ? Math.round((totalActual / availableHours) * 100) : 0;
}

// ============================
// DEPENDENCY VALIDATION
// ============================

export function validateDependencies(tasks: Task[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const taskMap = new Map<number, Task>();
  tasks.forEach((task) => taskMap.set(task.id, task));

  tasks.forEach((task) => {
    if (!task.depends_on || task.depends_on.length === 0) return;

    task.depends_on.forEach((depId: number) => {
      const depTask = taskMap.get(depId);
      if (!depTask) {
        errors.push(`Task "${task.title}" depends on non-existent task ID ${depId}`);
        return;
      }

      // Check for circular dependencies (simplified)
      if (depTask.depends_on?.includes(task.id)) {
        errors.push(
          `Circular dependency detected between "${task.title}" and "${depTask.title}"`
        );
      }

      // Check for date conflicts
      if (task.start_date && depTask.due_date && task.start_date < depTask.due_date) {
        errors.push(
          `Task "${task.title}" starts before its dependency "${depTask.title}" is due`
        );
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================
// HEALTH SCORE CALCULATION
// ============================

export function calculateProjectHealthScore(
  project: Project,
  milestones: Milestone[],
  tasks: Task[]
): number {
  let score = 100;

  // Deduct points for overdue milestones
  const now = new Date();
  const overdueMilestones = milestones.filter((m) => {
    if (m.status === "completed") return false;
    if (!m.due_date) return false;
    return m.due_date < now;
  });
  score -= overdueMilestones.length * 10;

  // Deduct points for blocked tasks
  const blockedTasks = tasks.filter((t) => t.is_blocked);
  score -= blockedTasks.length * 5;

  // Deduct points for SLA breaches
  const slaBreaches = tasks.filter((t) => t.sla_breached);
  score -= slaBreaches.length * 15;

  // Deduct points for overdue tasks
  const overdueTasks = tasks.filter((t) => {
    if (t.status === "completed") return false;
    if (!t.due_date) return false;
    return t.due_date < now;
  });
  score -= overdueTasks.length * 3;

  // Bonus points for high completion rate
  if (project.completion_percentage && project.completion_percentage > 80) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

// ============================
// AUTO RESCHEDULING
// ============================

export function suggestReschedule(task: Task, delay: number): {
  newStartDate: Date | null;
  newDueDate: Date | null;
  impactedTasks: number[];
} {
  if (!task.start_date || !task.due_date) {
    return { newStartDate: null, newDueDate: null, impactedTasks: [] };
  }

  const newStartDate = addDays(task.start_date, delay);
  const newDueDate = addDays(task.due_date, delay);

  // Find tasks that depend on this one
  const impactedTasks = task.blocks || [];

  return {
    newStartDate,
    newDueDate,
    impactedTasks,
  };
}

// ============================
// SEARCH & FILTER UTILITIES
// ============================

export function searchTasks(tasks: Task[], query: string): Task[] {
  const lowercaseQuery = query.toLowerCase();
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description?.toLowerCase().includes(lowercaseQuery)
  );
}

export function searchProjects(projects: Project[], query: string): Project[] {
  const lowercaseQuery = query.toLowerCase();
  return projects.filter(
    (project) =>
      project.name.toLowerCase().includes(lowercaseQuery) ||
      project.description?.toLowerCase().includes(lowercaseQuery)
  );
}

// ============================
// PROGRESS CALCULATION
// ============================

export function calculateOverallProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;

  const totalProgress = milestones.reduce(
    (sum, m) => sum + (m.progress_percentage || 0),
    0
  );
  return Math.round(totalProgress / milestones.length);
}

// ============================
// WORKLOAD FORECASTING
// ============================

export function forecastWorkload(
  tasks: Task[],
  userId: string,
  weeks: number = 4
): number[] {
  const forecast: number[] = [];
  const now = new Date();

  for (let i = 0; i < weeks; i++) {
    const weekStart = startOfWeek(addDays(now, i * 7), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    const workload = tasks
      .filter((t) => {
        if (t.assigned_to !== userId) return false;
        if (t.status === "completed") return false;
        if (!t.due_date) return false;
        return t.due_date >= weekStart && t.due_date <= weekEnd;
      })
      .reduce((sum, t) => sum + (t.estimated_hours || 0), 0);

    forecast.push(workload);
  }

  return forecast;
}
