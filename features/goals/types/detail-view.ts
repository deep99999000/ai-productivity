// Goal Detail View Types
export type FocusMode = "all" | "today" | "urgent" | "active";

export interface TaskFilters {
  subgoalIds: number[];
  priorities: string[];
  deadlineRange: "all" | "today" | "week" | "overdue";
}

export interface MomentumMetrics {
  streak: number;
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  daysActive: number;
  recentWins: string[];
}

export interface AnalyticsMetrics {
  completedTasks: number;
  totalTasks: number;
  weeklyVelocity: number[];
  addedThisWeek: number;
  completedThisWeek: number;
}

export interface FocusCounts {
  all: number;
  today: number;
  urgent: number;
  active: number;
}
