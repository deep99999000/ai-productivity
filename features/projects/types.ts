export type ProjectHealthType = "healthy" | "at_risk" | "critical";
export type ProjectStatusType = "active" | "on_hold" | "completed" | "archived";
export type PriorityLevel = "low" | "medium" | "high" | "critical";
export type SeverityLevel = "minor" | "moderate" | "major" | "blocker";
export type MilestoneStatusType = "not_started" | "in_progress" | "pending_approval" | "completed" | "blocked";
export type TaskStatusType = "todo" | "in_progress" | "in_review" | "blocked" | "completed" | "cancelled";
export type RoleType = "owner" | "admin" | "editor" | "viewer" | "external_collaborator";
export type NotificationType = "task_assigned" | "milestone_due" | "sla_breach" | "approval_required" | "escalation" | "mention" | "comment";
export type ViewType = "list" | "board" | "gantt" | "calendar";

// AI Insights types (following Habit pattern)
export type ProjectAISuggestion = {
  type:
    | "risk_mitigation"
    | "resource_optimization"
    | "deadline_adjustment"
    | "dependency_warning"
    | "bottleneck_detection"
    | "capacity_planning"
    | "milestone_strategy"
    | "team_collaboration"
    | "budget_optimization"
    | "quality_improvement"
    | "automation_opportunity"
    | "process_improvement";
  title: string;
  description: string;
  score?: number;
  actionable?: boolean;
  createdAt?: string;
  tags?: string[];
  projectId?: number;
  milestoneId?: number;
  taskId?: number;
};

// Gantt chart data types
export type GanttTask = {
  id: number;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies?: number[];
  type: "project" | "milestone" | "task";
  parentId?: number;
  milestone_id?: number;
  assignee?: string;
  status?: string;
  priority?: PriorityLevel;
  isOnCriticalPath?: boolean;
};

// Analytics types
export type ProjectMetrics = {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  atRiskProjects: number;
  overallHealthScore: number;
  averageCompletion: number;
};

export type MilestoneMetrics = {
  totalMilestones: number;
  completedMilestones: number;
  blockedMilestones: number;
  pendingApproval: number;
  onTrack: number;
  delayed: number;
};

export type TaskMetrics = {
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  slaBreaches: number;
  averageCompletionTime: number;
};

export type ResourceMetrics = {
  userId: string;
  userName: string;
  allocatedHours: number;
  availableHours: number;
  utilizationPercentage: number;
  assignedTasks: number;
  completedTasks: number;
};

export type VelocityData = {
  week: string;
  tasksCompleted: number;
  milestonesCompleted: number;
  plannedVsActual: number;
};

export type BurndownData = {
  date: string;
  ideal: number;
  actual: number;
  remaining: number;
};

// Filter configuration
export type ProjectFilter = {
  status?: ProjectStatusType[];
  health?: ProjectHealthType[];
  owner?: string[];
  tags?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  searchQuery?: string;
};

export type TaskFilter = {
  status?: TaskStatusType[];
  priority?: PriorityLevel[];
  assignee?: string[];
  milestone?: number[];
  isBlocked?: boolean;
  isEscalated?: boolean;
  slaBreached?: boolean;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  searchQuery?: string;
};

// Bulk operations
export type BulkOperation = {
  type: "update_status" | "assign" | "move_milestone" | "change_priority" | "delete";
  taskIds: number[];
  data?: any;
};

// Notification preferences
export type NotificationRule = {
  type: NotificationType;
  enabled: boolean;
  channels: ("in_app" | "email" | "push")[];
};

// Scenario planning
export type Scenario = {
  id: string;
  name: string;
  description: string;
  assumptions: {
    resourceChanges?: Record<string, number>;
    deadlineChanges?: Record<number, Date>;
    scopeChanges?: Record<number, boolean>;
  };
  projectedCompletion: Date;
  riskScore: number;
};

// Critical path analysis
export type CriticalPathNode = {
  taskId: number;
  taskName: string;
  duration: number;
  earliestStart: Date;
  earliestFinish: Date;
  latestStart: Date;
  latestFinish: Date;
  slack: number;
  isCritical: boolean;
};
