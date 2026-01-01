// Project status options
export const PROJECT_STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "from-indigo-500 to-purple-600" },
  { value: "on_hold", label: "On Hold", color: "from-amber-500 to-orange-600" },
  { value: "completed", label: "Completed", color: "from-green-500 to-emerald-600" },
  { value: "archived", label: "Archived", color: "from-slate-400 to-slate-600" },
] as const;

// Project health options
export const PROJECT_HEALTH_OPTIONS = [
  { value: "healthy", label: "Healthy", icon: "✅", color: "from-green-500 to-emerald-600" },
  { value: "at_risk", label: "At Risk", icon: "⚠️", color: "from-amber-500 to-orange-600" },
  { value: "critical", label: "Critical", icon: "🚨", color: "from-rose-500 to-pink-600" },
] as const;

// Priority levels
export const PRIORITY_LEVELS = [
  { value: "low", label: "Low", icon: "🔵", color: "from-slate-400 to-slate-500" },
  { value: "medium", label: "Medium", icon: "🟡", color: "from-indigo-500 to-purple-600" },
  { value: "high", label: "High", icon: "🟠", color: "from-amber-500 to-orange-600" },
  { value: "critical", label: "Critical", icon: "🔴", color: "from-rose-500 to-pink-600" },
] as const;

// Severity levels
export const SEVERITY_LEVELS = [
  { value: "minor", label: "Minor", color: "from-slate-400 to-slate-500" },
  { value: "moderate", label: "Moderate", color: "from-indigo-500 to-purple-600" },
  { value: "major", label: "Major", color: "from-amber-500 to-orange-600" },
  { value: "blocker", label: "Blocker", color: "from-rose-500 to-pink-600" },
] as const;

// Milestone status
export const MILESTONE_STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started", icon: "⚪", color: "from-slate-400 to-slate-500" },
  { value: "in_progress", label: "In Progress", icon: "🔵", color: "from-indigo-500 to-purple-600" },
  { value: "pending_approval", label: "Pending Approval", icon: "⏳", color: "from-amber-500 to-orange-600" },
  { value: "completed", label: "Completed", icon: "✅", color: "from-green-500 to-emerald-600" },
  { value: "blocked", label: "Blocked", icon: "🚫", color: "from-rose-500 to-pink-600" },
] as const;

// Task status
export const TASK_STATUS_OPTIONS = [
  { value: "todo", label: "To Do", icon: "⚪", color: "from-slate-400 to-slate-500" },
  { value: "in_progress", label: "In Progress", icon: "🔵", color: "from-indigo-500 to-purple-600" },
  { value: "in_review", label: "In Review", icon: "👀", color: "from-purple-500 to-violet-600" },
  { value: "blocked", label: "Blocked", icon: "🚫", color: "from-rose-500 to-pink-600" },
  { value: "completed", label: "Completed", icon: "✅", color: "from-green-500 to-emerald-600" },
  { value: "cancelled", label: "Cancelled", icon: "❌", color: "from-slate-500 to-slate-600" },
] as const;

// Role types
export const ROLE_OPTIONS = [
  { value: "owner", label: "Owner", permissions: ["all"] },
  { value: "admin", label: "Admin", permissions: ["edit", "delete", "manage_members", "create"] },
  { value: "editor", label: "Editor", permissions: ["edit", "create"] },
  { value: "viewer", label: "Viewer", permissions: ["view"] },
  { value: "external_collaborator", label: "External Collaborator", permissions: ["view", "comment"] },
] as const;

// Import icons (Note: These will be imported by components using the configs)
import { Zap, Pause, CheckCircle, Archive, Heart, AlertTriangle, AlertCircle } from "lucide-react";

// Status configurations with icons
export const STATUS_CONFIG = {
  active: {
    label: "Active",
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    icon: Zap,
  },
  on_hold: {
    label: "On Hold",
    color: "text-amber-600",
    bg: "bg-amber-100",
    icon: Pause,
  },
  completed: {
    label: "Completed",
    color: "text-green-600",
    bg: "bg-green-100",
    icon: CheckCircle,
  },
  archived: {
    label: "Archived",
    color: "text-slate-600",
    bg: "bg-slate-100",
    icon: Archive,
  },
};

// Health configurations with icons
export const HEALTH_CONFIG = {
  healthy: {
    label: "Healthy",
    color: "text-green-600",
    bg: "bg-green-100",
    icon: CheckCircle,
  },
  at_risk: {
    label: "At Risk",
    color: "text-amber-600",
    bg: "bg-amber-100",
    icon: AlertTriangle,
  },
  critical: {
    label: "Critical",
    color: "text-red-600",
    bg: "bg-red-100",
    icon: AlertCircle,
  },
};

// Notification types
export const NOTIFICATION_TYPES = [
  { value: "task_assigned", label: "Task Assigned", icon: "📋" },
  { value: "milestone_due", label: "Milestone Due", icon: "⏰" },
  { value: "sla_breach", label: "SLA Breach", icon: "🚨" },
  { value: "approval_required", label: "Approval Required", icon: "✋" },
  { value: "escalation", label: "Escalation", icon: "⚠️" },
  { value: "mention", label: "Mention", icon: "💬" },
  { value: "comment", label: "Comment", icon: "💭" },
] as const;

// View modes
export const VIEW_MODES = [
  { value: "list", label: "List View", icon: "📋" },
  { value: "board", label: "Board View", icon: "📊" },
  { value: "gantt", label: "Gantt Chart", icon: "📈" },
  { value: "calendar", label: "Calendar", icon: "📅" },
] as const;

// AI insight types
export const AI_INSIGHT_TYPES = [
  { value: "risk_mitigation", label: "Risk Mitigation", icon: "🛡️", color: "from-rose-500 to-pink-600" },
  { value: "resource_optimization", label: "Resource Optimization", icon: "⚡", color: "from-indigo-500 to-purple-600" },
  { value: "deadline_adjustment", label: "Deadline Adjustment", icon: "📅", color: "from-amber-500 to-orange-600" },
  { value: "dependency_warning", label: "Dependency Warning", icon: "⚠️", color: "from-rose-500 to-pink-600" },
  { value: "bottleneck_detection", label: "Bottleneck Detection", icon: "🔍", color: "from-indigo-500 to-purple-600" },
  { value: "capacity_planning", label: "Capacity Planning", icon: "📊", color: "from-purple-500 to-violet-600" },
  { value: "milestone_strategy", label: "Milestone Strategy", icon: "🎯", color: "from-indigo-500 to-purple-600" },
  { value: "team_collaboration", label: "Team Collaboration", icon: "👥", color: "from-green-500 to-emerald-600" },
  { value: "budget_optimization", label: "Budget Optimization", icon: "💰", color: "from-amber-500 to-orange-600" },
  { value: "quality_improvement", label: "Quality Improvement", icon: "⭐", color: "from-indigo-500 to-purple-600" },
  { value: "automation_opportunity", label: "Automation Opportunity", icon: "🤖", color: "from-purple-500 to-violet-600" },
  { value: "process_improvement", label: "Process Improvement", icon: "🔄", color: "from-indigo-500 to-purple-600" },
] as const;

// Enterprise-grade design system - Production level
export const COLORS = {
  // Primary brand colors - Refined neutral palette with accent
  primary: {
    from: "from-zinc-900",
    to: "to-zinc-800",
    gradient: "bg-gradient-to-r from-zinc-900 to-zinc-800",
    gradientHover: "hover:from-zinc-800 hover:to-zinc-700",
    gradientSubtle: "bg-gradient-to-br from-zinc-50 via-white to-zinc-50",
    text: "text-zinc-900",
    textAccent: "text-emerald-600",
    bg: "bg-zinc-50",
    bgLight: "bg-zinc-50/50",
    border: "border-zinc-200",
    shadow: "shadow-zinc-900/5",
    shadowHover: "hover:shadow-zinc-900/10",
    ring: "ring-zinc-900/10",
    // Accent for CTAs
    accent: "bg-emerald-600",
    accentHover: "hover:bg-emerald-700",
    accentGradient: "bg-gradient-to-r from-emerald-600 to-teal-600",
    accentGradientHover: "hover:from-emerald-700 hover:to-teal-700",
  },
  
  // Secondary colors - Softer variations
  secondary: {
    from: "from-zinc-100",
    to: "to-zinc-50",
    gradient: "bg-gradient-to-br from-zinc-100/80 to-zinc-50/50",
    text: "text-zinc-700",
    bg: "bg-zinc-100/80",
    border: "border-zinc-200/80",
  },
  
  // Background colors - Clean, minimal
  background: {
    main: "bg-zinc-50/50",
    card: "bg-white",
    cardHover: "hover:bg-zinc-50/50",
    hover: "hover:bg-zinc-50",
    overlay: "bg-zinc-100/50",
    overlayHover: "group-hover:bg-white",
    glass: "bg-white/80 backdrop-blur-xl",
    elevated: "bg-white shadow-xl shadow-zinc-900/5",
  },
  
  // Surface colors - Layered depth
  surface: {
    card: "bg-white",
    cardElevated: "bg-white shadow-lg shadow-zinc-900/5",
    slate: "bg-zinc-50",
    slateHover: "hover:bg-zinc-100",
    slate100: "bg-zinc-100",
    slate200: "bg-zinc-200",
    muted: "bg-zinc-100/60",
    interactive: "bg-zinc-50 hover:bg-zinc-100 transition-colors duration-200",
  },
  
  // Border colors - Subtle and refined
  border: {
    default: "border-zinc-200/80",
    hover: "hover:border-zinc-300",
    focus: "ring-2 ring-zinc-900/5 ring-offset-2",
    subtle: "border-zinc-100",
    strong: "border-zinc-300",
    interactive: "border-zinc-200 hover:border-zinc-300 transition-colors duration-200",
  },
  
  // Accent colors - Status semantic colors
  accent: {
    orange: "text-amber-600",
    green: "text-emerald-600",
    greenBg: "bg-emerald-50",
    greenBorder: "border-emerald-200",
    amber: "text-amber-600",
    amberBg: "bg-amber-50",
    amberBorder: "border-amber-200",
    rose: "text-rose-600",
    roseBg: "bg-rose-50",
    roseBorder: "border-rose-200",
    blue: "text-blue-600",
    blueBg: "bg-blue-50",
    blueBorder: "border-blue-200",
  },
  
  // Text colors - High contrast, readable
  text: {
    primary: "text-zinc-900",
    secondary: "text-zinc-600",
    muted: "text-zinc-500",
    subtle: "text-zinc-400",
    inverse: "text-white",
    link: "text-zinc-900 hover:text-zinc-600 transition-colors",
  },
  
  // Interactive states
  interactive: {
    hover: "hover:bg-zinc-50 transition-all duration-200",
    active: "active:bg-zinc-100",
    focus: "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10",
  },
  
  // Status colors - Clear semantic meaning
  status: {
    success: "text-emerald-700 bg-emerald-50 border-emerald-200/80",
    warning: "text-amber-700 bg-amber-50 border-amber-200/80",
    error: "text-rose-700 bg-rose-50 border-rose-200/80",
    info: "text-blue-700 bg-blue-50 border-blue-200/80",
    neutral: "text-zinc-700 bg-zinc-100 border-zinc-200/80",
  },
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = [
  { key: "n", description: "New Project", action: "new_project" },
  { key: "m", description: "New Milestone", action: "new_milestone" },
  { key: "t", description: "New Task", action: "new_task" },
  { key: "f", description: "Search/Filter", action: "search" },
  { key: "g", description: "Toggle Gantt View", action: "toggle_gantt" },
  { key: "/", description: "Show Shortcuts", action: "show_shortcuts" },
] as const;

// Default filters
export const DEFAULT_PROJECT_FILTER = {
  status: [],
  health: [],
  owner: [],
  tags: [],
  dateRange: undefined,
  searchQuery: "",
};

export const DEFAULT_TASK_FILTER = {
  status: [],
  priority: [],
  assignee: [],
  milestone: [],
  isBlocked: undefined,
  isEscalated: undefined,
  slaBreached: undefined,
  dateRange: undefined,
  searchQuery: "",
};

// Time periods for capacity planning
export const TIME_PERIODS = [
  { value: "this_week", label: "This Week" },
  { value: "next_week", label: "Next Week" },
  { value: "this_month", label: "This Month" },
  { value: "next_month", label: "Next Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "custom", label: "Custom Range" },
] as const;

// Chart colors (following Habit page color scheme)
export const CHART_COLORS = {
  primary: "#6366f1", // indigo-500
  secondary: "#8b5cf6", // purple-500
  success: "#10b981", // emerald-500
  warning: "#f59e0b", // amber-500
  danger: "#ef4444", // rose-500
  info: "#3b82f6", // blue-500
  muted: "#94a3b8", // slate-400
};

// Export all constants
export const CONSTANTS = {
  PROJECT_STATUS_OPTIONS,
  PROJECT_HEALTH_OPTIONS,
  PRIORITY_LEVELS,
  SEVERITY_LEVELS,
  MILESTONE_STATUS_OPTIONS,
  TASK_STATUS_OPTIONS,
  ROLE_OPTIONS,
  NOTIFICATION_TYPES,
  VIEW_MODES,
  AI_INSIGHT_TYPES,
  COLORS,
  KEYBOARD_SHORTCUTS,
  DEFAULT_PROJECT_FILTER,
  DEFAULT_TASK_FILTER,
  TIME_PERIODS,
  CHART_COLORS,
};
