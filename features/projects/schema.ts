import { 
  pgTable, 
  integer, 
  varchar, 
  boolean, 
  timestamp, 
  json, 
  bigint,
  serial,
  text
} from "drizzle-orm/pg-core";
import { usersTable } from "@/db/schema";

// Projects table
export const projectsTable = pgTable("projects", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull().$defaultFn(() => Date.now()),
  owner_id: varchar("owner_id").notNull().references(() => usersTable.id),
  organization_id: varchar("organization_id"),
  
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  emoji: varchar("emoji", { length: 8 }).default("📁"),
  
  status: varchar("status", { length: 50 }).default("active").notNull(),
  health: varchar("health", { length: 50 }).default("healthy").notNull(),
  
  // Template and cloning
  is_template: boolean("is_template").default(false).notNull(),
  template_id: bigint("template_id", { mode: "number" }),
  cloned_from_id: bigint("cloned_from_id", { mode: "number" }),
  
  // Custom fields stored as JSON
  custom_fields: json("custom_fields").$type<Record<string, any>>(),
  
  // Dates
  start_date: timestamp("start_date", { mode: "date" }),
  target_end_date: timestamp("target_end_date", { mode: "date" }),
  actual_end_date: timestamp("actual_end_date", { mode: "date" }),
  
  // Metadata
  tags: json("tags").$type<string[]>(),
  health_score: integer("health_score").default(100),
  completion_percentage: integer("completion_percentage").default(0),
  is_favorite: boolean("is_favorite").default(false),
  is_archived: boolean("is_archived").default(false),
  
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
  deleted_at: timestamp("deleted_at", { mode: "date" }),
});

// Milestones table (task containers)
export const milestonesTable = pgTable("milestones", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull().$defaultFn(() => Date.now()),
  project_id: bigint("project_id", { mode: "number" }).notNull().references(() => projectsTable.id),
  owner_id: varchar("owner_id").references(() => usersTable.id),
  
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  emoji: varchar("emoji", { length: 8 }).default("🎯"),
  
  status: varchar("status", { length: 50 }).default("not_started").notNull(),
  
  // Dependencies
  dependent_on: json("dependent_on").$type<number[]>(), // Array of milestone IDs
  
  // Approval gating
  requires_approval: boolean("requires_approval").default(false),
  approved_by: varchar("approved_by").references(() => usersTable.id),
  approved_at: timestamp("approved_at", { mode: "date" }),
  
  // Dates
  start_date: timestamp("start_date", { mode: "date" }),
  due_date: timestamp("due_date", { mode: "date" }),
  completed_at: timestamp("completed_at", { mode: "date" }),
  
  // Progress tracking (rolled up from tasks)
  total_tasks: integer("total_tasks").default(0),
  completed_tasks: integer("completed_tasks").default(0),
  progress_percentage: integer("progress_percentage").default(0),
  
  // Order
  display_order: integer("display_order").default(0),
  
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
  deleted_at: timestamp("deleted_at", { mode: "date" }),
});

// Tasks table (nested hierarchy)
export const tasksTable = pgTable("tasks", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull().$defaultFn(() => Date.now()),
  milestone_id: bigint("milestone_id", { mode: "number" }).notNull().references(() => milestonesTable.id),
  parent_task_id: bigint("parent_task_id", { mode: "number" }), // For nested tasks
  
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  
  status: varchar("status", { length: 50 }).default("todo").notNull(),
  priority: varchar("priority", { length: 50 }).default("medium"),
  severity: varchar("severity", { length: 50 }),
  
  // Assignment
  assigned_to: varchar("assigned_to").references(() => usersTable.id),
  delegated_by: varchar("delegated_by").references(() => usersTable.id),
  
  // Dependencies
  depends_on: json("depends_on").$type<number[]>(), // Array of task IDs
  blocks: json("blocks").$type<number[]>(), // Array of task IDs this blocks
  cross_milestone_links: json("cross_milestone_links").$type<number[]>(), // Tasks in other milestones
  
  // Blockers and escalation
  is_blocked: boolean("is_blocked").default(false),
  blocker_reason: text("blocker_reason"),
  is_escalated: boolean("is_escalated").default(false),
  escalated_to: varchar("escalated_to").references(() => usersTable.id),
  escalated_at: timestamp("escalated_at", { mode: "date" }),
  
  // SLA tracking
  sla_due_date: timestamp("sla_due_date", { mode: "date" }),
  sla_breached: boolean("sla_breached").default(false),
  sla_breach_time: timestamp("sla_breach_time", { mode: "date" }),
  
  // Custom workflow
  workflow_stage: varchar("workflow_stage", { length: 100 }),
  
  // Dates
  start_date: timestamp("start_date", { mode: "date" }),
  due_date: timestamp("due_date", { mode: "date" }),
  completed_at: timestamp("completed_at", { mode: "date" }),
  
  // Effort estimation
  estimated_hours: integer("estimated_hours"),
  actual_hours: integer("actual_hours"),
  
  // Order and nesting level
  display_order: integer("display_order").default(0),
  nesting_level: integer("nesting_level").default(0),
  
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
  deleted_at: timestamp("deleted_at", { mode: "date" }),
});

// Project members and roles
export const projectMembersTable = pgTable("project_members", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull().$defaultFn(() => Date.now()),
  project_id: bigint("project_id", { mode: "number" }).notNull().references(() => projectsTable.id),
  user_id: varchar("user_id").notNull().references(() => usersTable.id),
  
  role: varchar("role", { length: 50 }).default("viewer").notNull(),
  
  // Permissions
  can_edit_project: boolean("can_edit_project").default(false),
  can_delete_project: boolean("can_delete_project").default(false),
  can_manage_members: boolean("can_manage_members").default(false),
  can_create_milestones: boolean("can_create_milestones").default(false),
  can_create_tasks: boolean("can_create_tasks").default(false),
  
  // External collaborator metadata
  is_external: boolean("is_external").default(false),
  external_email: varchar("external_email", { length: 255 }),
  access_expires_at: timestamp("access_expires_at", { mode: "date" }),
  
  invited_by: varchar("invited_by").references(() => usersTable.id),
  joined_at: timestamp("joined_at", { mode: "date" }).defaultNow(),
});

// Comments (threaded)
export const commentsTable = pgTable("comments", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull().$defaultFn(() => Date.now()),
  task_id: bigint("task_id", { mode: "number" }).references(() => tasksTable.id),
  milestone_id: bigint("milestone_id", { mode: "number" }).references(() => milestonesTable.id),
  project_id: bigint("project_id", { mode: "number" }).references(() => projectsTable.id),
  
  parent_comment_id: bigint("parent_comment_id", { mode: "number" }), // For threading
  
  author_id: varchar("author_id").notNull().references(() => usersTable.id),
  content: text("content").notNull(),
  
  // Rich text metadata
  mentions: json("mentions").$type<string[]>(), // User IDs mentioned
  reactions: json("reactions").$type<Record<string, string[]>>(), // emoji -> user IDs
  
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
  deleted_at: timestamp("deleted_at", { mode: "date" }),
});

// Chat messages (real-time collaboration)
export const chatMessagesTable = pgTable("chat_messages", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull().$defaultFn(() => Date.now()),
  project_id: bigint("project_id", { mode: "number" }).references(() => projectsTable.id),
  milestone_id: bigint("milestone_id", { mode: "number" }).references(() => milestonesTable.id),
  
  sender_id: varchar("sender_id").notNull().references(() => usersTable.id),
  content: text("content").notNull(),
  
  // Attachments and files
  has_files: boolean("has_files").default(false),
  file_urls: json("file_urls").$type<string[]>(),
  
  // Mentions and reactions
  mentions: json("mentions").$type<string[]>(),
  reactions: json("reactions").$type<Record<string, string[]>>(),
  
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
  deleted_at: timestamp("deleted_at", { mode: "date" }),
});

// Attachments (files for tasks/milestones)
export const attachmentsTable = pgTable("attachments", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull().$defaultFn(() => Date.now()),
  project_id: bigint("project_id", { mode: "number" }).references(() => projectsTable.id),
  milestone_id: bigint("milestone_id", { mode: "number" }).references(() => milestonesTable.id),
  task_id: bigint("task_id", { mode: "number" }).references(() => tasksTable.id),
  
  uploader_id: varchar("uploader_id").notNull().references(() => usersTable.id),
  
  file_name: varchar("file_name", { length: 500 }).notNull(),
  file_url: text("file_url").notNull(),
  file_size: bigint("file_size", { mode: "number" }),
  file_type: varchar("file_type", { length: 100 }),
  
  // Version control
  version: integer("version").default(1),
  previous_version_id: bigint("previous_version_id", { mode: "number" }),
  
  // Permissions
  is_public: boolean("is_public").default(false),
  allowed_users: json("allowed_users").$type<string[]>(),
  
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  deleted_at: timestamp("deleted_at", { mode: "date" }),
});

// Document repository
export const documentsTable = pgTable("documents", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull().$defaultFn(() => Date.now()),
  project_id: bigint("project_id", { mode: "number" }).notNull().references(() => projectsTable.id),
  
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content"),
  
  created_by: varchar("created_by").notNull().references(() => usersTable.id),
  
  // Version control
  version: integer("version").default(1),
  previous_version_id: bigint("previous_version_id", { mode: "number" }),
  
  // Permissions
  is_public: boolean("is_public").default(false),
  allowed_users: json("allowed_users").$type<string[]>(),
  
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
  deleted_at: timestamp("deleted_at", { mode: "date" }),
});

// Notifications
export const notificationsTable = pgTable("notifications", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull().$defaultFn(() => Date.now()),
  user_id: varchar("user_id").notNull().references(() => usersTable.id),
  
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  
  // Links
  project_id: bigint("project_id", { mode: "number" }).references(() => projectsTable.id),
  milestone_id: bigint("milestone_id", { mode: "number" }).references(() => milestonesTable.id),
  task_id: bigint("task_id", { mode: "number" }).references(() => tasksTable.id),
  
  // Status
  is_read: boolean("is_read").default(false),
  read_at: timestamp("read_at", { mode: "date" }),
  
  // Priority for escalations
  is_urgent: boolean("is_urgent").default(false),
  
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Activity feed
export const activityFeedTable = pgTable("activity_feed", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull().$defaultFn(() => Date.now()),
  project_id: bigint("project_id", { mode: "number" }).notNull().references(() => projectsTable.id),
  
  user_id: varchar("user_id").notNull().references(() => usersTable.id),
  action: varchar("action", { length: 100 }).notNull(), // created, updated, deleted, commented, etc.
  
  entity_type: varchar("entity_type", { length: 50 }).notNull(), // project, milestone, task
  entity_id: bigint("entity_id", { mode: "number" }).notNull(),
  
  description: text("description"),
  metadata: json("metadata").$type<Record<string, any>>(),
  
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Saved views
export const savedViewsTable = pgTable("saved_views", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull().$defaultFn(() => Date.now()),
  user_id: varchar("user_id").notNull().references(() => usersTable.id),
  project_id: bigint("project_id", { mode: "number" }).references(() => projectsTable.id),
  
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Filter configuration stored as JSON
  filters: json("filters").$type<Record<string, any>>().notNull(),
  
  // View type: list, board, gantt, calendar
  view_type: varchar("view_type", { length: 50 }).default("list"),
  
  is_default: boolean("is_default").default(false),
  is_shared: boolean("is_shared").default(false),
  
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// User preferences and settings
export const userPreferencesTable = pgTable("user_preferences", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull().$defaultFn(() => Date.now()),
  user_id: varchar("user_id").notNull().references(() => usersTable.id),
  
  // Notification preferences
  quiet_hours_start: varchar("quiet_hours_start", { length: 5 }), // HH:MM
  quiet_hours_end: varchar("quiet_hours_end", { length: 5 }), // HH:MM
  
  notification_rules: json("notification_rules").$type<Record<string, boolean>>(),
  
  // Keyboard shortcuts
  keyboard_shortcuts_enabled: boolean("keyboard_shortcuts_enabled").default(true),
  custom_shortcuts: json("custom_shortcuts").$type<Record<string, string>>(),
  
  // Default view preferences
  default_view: varchar("default_view", { length: 50 }).default("list"),
  
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// Approval chains
export const approvalChainsTable = pgTable("approval_chains", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull().$defaultFn(() => Date.now()),
  project_id: bigint("project_id", { mode: "number" }).notNull().references(() => projectsTable.id),
  
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Chain of approvers (ordered array of user IDs)
  approvers: json("approvers").$type<string[]>().notNull(),
  
  // Approval rules
  requires_all: boolean("requires_all").default(true), // All approvers or just one
  
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// Resource capacity planning
export const resourceCapacityTable = pgTable("resource_capacity", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull().$defaultFn(() => Date.now()),
  user_id: varchar("user_id").notNull().references(() => usersTable.id),
  project_id: bigint("project_id", { mode: "number" }).references(() => projectsTable.id),
  
  // Time period
  week_start_date: timestamp("week_start_date", { mode: "date" }).notNull(),
  
  // Capacity in hours
  available_hours: integer("available_hours").default(40),
  allocated_hours: integer("allocated_hours").default(0),
  actual_hours: integer("actual_hours").default(0),
  
  // Utilization percentage
  utilization_percentage: integer("utilization_percentage").default(0),
  
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// Type exports
export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;
export type Milestone = typeof milestonesTable.$inferSelect;
export type NewMilestone = typeof milestonesTable.$inferInsert;
export type Task = typeof tasksTable.$inferSelect;
export type NewTask = typeof tasksTable.$inferInsert;
export type ProjectMember = typeof projectMembersTable.$inferSelect;
export type NewProjectMember = typeof projectMembersTable.$inferInsert;
export type Comment = typeof commentsTable.$inferSelect;
export type NewComment = typeof commentsTable.$inferInsert;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;
export type NewChatMessage = typeof chatMessagesTable.$inferInsert;
export type Attachment = typeof attachmentsTable.$inferSelect;
export type NewAttachment = typeof attachmentsTable.$inferInsert;
export type Document = typeof documentsTable.$inferSelect;
export type NewDocument = typeof documentsTable.$inferInsert;
export type Notification = typeof notificationsTable.$inferSelect;
export type NewNotification = typeof notificationsTable.$inferInsert;
export type ActivityFeed = typeof activityFeedTable.$inferSelect;
export type NewActivityFeed = typeof activityFeedTable.$inferInsert;
export type SavedView = typeof savedViewsTable.$inferSelect;
export type NewSavedView = typeof savedViewsTable.$inferInsert;
export type UserPreferences = typeof userPreferencesTable.$inferSelect;
export type NewUserPreferences = typeof userPreferencesTable.$inferInsert;
export type ApprovalChain = typeof approvalChainsTable.$inferSelect;
export type NewApprovalChain = typeof approvalChainsTable.$inferInsert;
export type ResourceCapacity = typeof resourceCapacityTable.$inferSelect;
export type NewResourceCapacity = typeof resourceCapacityTable.$inferInsert;
