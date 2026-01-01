"use server";

import { and, eq, inArray, desc, asc, sql } from "drizzle-orm";
import { db } from "@/db";
import { usersTable } from "@/features/auth/userSchema";
import {
  projectsTable,
  milestonesTable,
  tasksTable,
  projectMembersTable,
  commentsTable,
  chatMessagesTable,
  attachmentsTable,
  documentsTable,
  notificationsTable,
  activityFeedTable,
  savedViewsTable,
  userPreferencesTable,
  approvalChainsTable,
  resourceCapacityTable,
  type Project,
  type NewProject,
  type Milestone,
  type NewMilestone,
  type Task,
  type NewTask,
  type ProjectMember,
  type NewProjectMember,
  type Comment,
  type NewComment,
  type ChatMessage,
  type NewChatMessage,
  type Attachment,
  type NewAttachment,
  type Document,
  type NewDocument,
  type Notification,
  type NewNotification,
  type ActivityFeed,
  type NewActivityFeed,
  type SavedView,
  type NewSavedView,
  type UserPreferences,
  type NewUserPreferences,
  type ApprovalChain,
  type NewApprovalChain,
  type ResourceCapacity,
  type NewResourceCapacity,
} from "./schema";

// ============================
// PROJECT ACTIONS
// ============================

// Get all projects for a user
export const getAllUserProjects = async (user_id: string) => {
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.owner_id, user_id),
          eq(projectsTable.is_archived, false)
        )
      )
      .orderBy(desc(projectsTable.created_at));
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return null;
  }
};

// Get projects where user is a collaborator (team member)
export const getCollaborativeProjects = async (user_id: string) => {
  try {
    const projects = await db
      .select({
        id: projectsTable.id,
        owner_id: projectsTable.owner_id,
        organization_id: projectsTable.organization_id,
        name: projectsTable.name,
        description: projectsTable.description,
        emoji: projectsTable.emoji,
        status: projectsTable.status,
        health: projectsTable.health,
        is_template: projectsTable.is_template,
        template_id: projectsTable.template_id,
        cloned_from_id: projectsTable.cloned_from_id,
        custom_fields: projectsTable.custom_fields,
        start_date: projectsTable.start_date,
        target_end_date: projectsTable.target_end_date,
        actual_end_date: projectsTable.actual_end_date,
        tags: projectsTable.tags,
        health_score: projectsTable.health_score,
        completion_percentage: projectsTable.completion_percentage,
        is_favorite: projectsTable.is_favorite,
        is_archived: projectsTable.is_archived,
        created_at: projectsTable.created_at,
        updated_at: projectsTable.updated_at,
        deleted_at: projectsTable.deleted_at,
        member_role: projectMembersTable.role,
      })
      .from(projectMembersTable)
      .innerJoin(projectsTable, eq(projectMembersTable.project_id, projectsTable.id))
      .where(
        and(
          eq(projectMembersTable.user_id, user_id),
          eq(projectsTable.is_archived, false)
        )
      )
      .orderBy(desc(projectsTable.updated_at));
    return projects;
  } catch (error) {
    console.error("Error fetching collaborative projects:", error);
    return null;
  }
};

// Get all projects (owned + collaborative)
export const getAllProjectsForUser = async (user_id: string) => {
  try {
    const ownedProjects = await getAllUserProjects(user_id) || [];
    const collaborativeProjects = await getCollaborativeProjects(user_id) || [];
    
    // Combine and deduplicate (in case user is both owner and member)
    const projectMap = new Map();
    
    ownedProjects.forEach(p => {
      projectMap.set(p.id, { ...p, member_role: 'owner' as const });
    });
    
    collaborativeProjects.forEach(p => {
      if (!projectMap.has(p.id)) {
        projectMap.set(p.id, p);
      }
    });
    
    return Array.from(projectMap.values());
  } catch (error) {
    console.error("Error fetching all projects:", error);
    return null;
  }
};

// Get project by ID
export const getProjectById = async (projectId: number) => {
  try {
    const project = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .limit(1);
    return project[0] || null;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
};

// Create new project
export const createProjectAction = async (data: NewProject) => {
  try {
    const inserted = await db.insert(projectsTable).values(data).returning();
    
    // Create activity feed entry
    if (inserted[0]) {
      await createActivityFeedEntry({
        project_id: inserted[0].id,
        user_id: data.owner_id,
        action: "created",
        entity_type: "project",
        entity_id: inserted[0].id,
        description: `Created project "${data.name}"`,
      });
    }
    
    return inserted[0];
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

// Update project
export const updateProjectAction = async (data: Project) => {
  try {
    const updated = await db
      .update(projectsTable)
      .set({ ...data, updated_at: new Date() })
      .where(eq(projectsTable.id, data.id))
      .returning();
    
    // Create activity feed entry
    if (updated[0]) {
      await createActivityFeedEntry({
        project_id: data.id,
        user_id: data.owner_id,
        action: "updated",
        entity_type: "project",
        entity_id: data.id,
        description: `Updated project "${data.name}"`,
      });
    }
    
    return updated[0];
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

// Delete project (soft delete)
export const deleteProjectAction = async (projectId: number, userId: string) => {
  try {
    const deleted = await db
      .update(projectsTable)
      .set({ deleted_at: new Date(), is_archived: true })
      .where(eq(projectsTable.id, projectId))
      .returning();
    
    if (deleted[0]) {
      await createActivityFeedEntry({
        project_id: projectId,
        user_id: userId,
        action: "deleted",
        entity_type: "project",
        entity_id: projectId,
        description: `Deleted project "${deleted[0].name}"`,
      });
    }
    
    return deleted[0];
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

// Clone project
export const cloneProjectAction = async (
  projectId: number,
  userId: string,
  newName: string
) => {
  try {
    const original = await getProjectById(projectId);
    if (!original) throw new Error("Project not found");
    
    const cloned = await createProjectAction({
      ...original,
      id: undefined as any,
      name: newName,
      owner_id: userId,
      cloned_from_id: projectId,
      created_at: undefined,
      updated_at: undefined,
    });
    
    return cloned;
  } catch (error) {
    console.error("Error cloning project:", error);
    throw error;
  }
};

// Create project from template
export const createProjectFromTemplate = async (
  templateId: number,
  userId: string,
  newName: string
) => {
  try {
    const template = await getProjectById(templateId);
    if (!template || !template.is_template) {
      throw new Error("Template not found");
    }
    
    const newProject = await createProjectAction({
      ...template,
      id: undefined as any,
      name: newName,
      owner_id: userId,
      template_id: templateId,
      is_template: false,
      created_at: undefined,
      updated_at: undefined,
    });
    
    return newProject;
  } catch (error) {
    console.error("Error creating project from template:", error);
    throw error;
  }
};

// ============================
// MILESTONE ACTIONS
// ============================

// Get milestones for a project
export const getMilestonesByProject = async (projectId: number) => {
  try {
    const milestones = await db
      .select()
      .from(milestonesTable)
      .where(eq(milestonesTable.project_id, projectId))
      .orderBy(asc(milestonesTable.display_order));
    return milestones;
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return null;
  }
};

// Create milestone
export const createMilestoneAction = async (data: NewMilestone) => {
  try {
    const inserted = await db.insert(milestonesTable).values(data).returning();
    
    if (inserted[0]) {
      await createActivityFeedEntry({
        project_id: data.project_id,
        user_id: data.owner_id || "",
        action: "created",
        entity_type: "milestone",
        entity_id: inserted[0].id,
        description: `Created milestone "${data.name}"`,
      });
    }
    
    return inserted[0];
  } catch (error) {
    console.error("Error creating milestone:", error);
    throw error;
  }
};

// Update milestone
export const updateMilestoneAction = async (data: Milestone) => {
  try {
    const updated = await db
      .update(milestonesTable)
      .set({ ...data, updated_at: new Date() })
      .where(eq(milestonesTable.id, data.id))
      .returning();
    
    // Update milestone progress
    await updateMilestoneProgress(data.id);
    
    return updated[0];
  } catch (error) {
    console.error("Error updating milestone:", error);
    throw error;
  }
};

// Delete milestone
export const deleteMilestoneAction = async (milestoneId: number, userId: string) => {
  try {
    const milestone = await db
      .select()
      .from(milestonesTable)
      .where(eq(milestonesTable.id, milestoneId))
      .limit(1);
    
    const deleted = await db
      .update(milestonesTable)
      .set({ deleted_at: new Date() })
      .where(eq(milestonesTable.id, milestoneId))
      .returning();
    
    if (deleted[0] && milestone[0]) {
      await createActivityFeedEntry({
        project_id: milestone[0].project_id,
        user_id: userId,
        action: "deleted",
        entity_type: "milestone",
        entity_id: milestoneId,
        description: `Deleted milestone "${milestone[0].name}"`,
      });
    }
    
    return deleted[0];
  } catch (error) {
    console.error("Error deleting milestone:", error);
    throw error;
  }
};

// Update milestone progress (rolled up from tasks)
export const updateMilestoneProgress = async (milestoneId: number) => {
  try {
    const tasks = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.milestone_id, milestoneId));
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    await db
      .update(milestonesTable)
      .set({
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        progress_percentage: progress,
      })
      .where(eq(milestonesTable.id, milestoneId));
    
    return { totalTasks, completedTasks, progress };
  } catch (error) {
    console.error("Error updating milestone progress:", error);
    throw error;
  }
};

// ============================
// TASK ACTIONS
// ============================

// Get tasks for a milestone
export const getTasksByMilestone = async (milestoneId: number) => {
  try {
    const tasks = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.milestone_id, milestoneId))
      .orderBy(asc(tasksTable.display_order));
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return null;
  }
};

// Get all tasks for a project
export const getTasksByProject = async (projectId: number) => {
  try {
    const tasks = await db
      .select({
        task: tasksTable,
        milestone: milestonesTable,
      })
      .from(tasksTable)
      .innerJoin(milestonesTable, eq(tasksTable.milestone_id, milestonesTable.id))
      .where(eq(milestonesTable.project_id, projectId))
      .orderBy(asc(tasksTable.created_at));
    
    return tasks.map((t) => t.task);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return null;
  }
};

// Create task
export const createTaskAction = async (data: NewTask, createdByUserId?: string) => {
  try {
    const inserted = await db.insert(tasksTable).values(data).returning();
    
    if (inserted[0]) {
      // Update milestone progress
      await updateMilestoneProgress(data.milestone_id);
      
      // Get milestone to find project
      const milestone = await db
        .select()
        .from(milestonesTable)
        .where(eq(milestonesTable.id, data.milestone_id))
        .limit(1);
      
      if (milestone[0] && createdByUserId) {
        await createActivityFeedEntry({
          project_id: milestone[0].project_id,
          user_id: createdByUserId,
          action: "created",
          entity_type: "task",
          entity_id: inserted[0].id,
          description: `Created task "${data.title}"`,
        });
        
        // Create notification for assigned user
        if (data.assigned_to) {
          await createNotificationAction({
            user_id: data.assigned_to,
            type: "task_assigned",
            title: "New Task Assigned",
            message: `You've been assigned to task: ${data.title}`,
            task_id: inserted[0].id,
            milestone_id: data.milestone_id,
            project_id: milestone[0].project_id,
          });
        }
      }
    }
    
    return inserted[0];
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// Update task
export const updateTaskAction = async (data: Task) => {
  try {
    const updated = await db
      .update(tasksTable)
      .set({ ...data, updated_at: new Date() })
      .where(eq(tasksTable.id, data.id))
      .returning();
    
    if (updated[0]) {
      await updateMilestoneProgress(data.milestone_id);
      
      // Check for SLA breach
      if (data.sla_due_date && new Date() > data.sla_due_date && !data.sla_breached) {
        await markTaskSLABreached(data.id);
      }
    }
    
    return updated[0];
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

// Delete task
export const deleteTaskAction = async (taskId: number, userId: string) => {
  try {
    const task = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, taskId))
      .limit(1);
    
    const deleted = await db
      .update(tasksTable)
      .set({ deleted_at: new Date() })
      .where(eq(tasksTable.id, taskId))
      .returning();
    
    if (deleted[0] && task[0]) {
      await updateMilestoneProgress(task[0].milestone_id);
      
      const milestone = await db
        .select()
        .from(milestonesTable)
        .where(eq(milestonesTable.id, task[0].milestone_id))
        .limit(1);
      
      if (milestone[0]) {
        await createActivityFeedEntry({
          project_id: milestone[0].project_id,
          user_id: userId,
          action: "deleted",
          entity_type: "task",
          entity_id: taskId,
          description: `Deleted task "${task[0].title}"`,
        });
      }
    }
    
    return deleted[0];
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// Bulk update tasks
export const bulkUpdateTasksAction = async (
  taskIds: number[],
  updates: Partial<Task>
) => {
  try {
    const updated = await db
      .update(tasksTable)
      .set({ ...updates, updated_at: new Date() })
      .where(inArray(tasksTable.id, taskIds))
      .returning();
    
    // Update milestone progress for affected milestones
    const milestoneIds = new Set(updated.map((t) => t.milestone_id));
    for (const milestoneId of milestoneIds) {
      await updateMilestoneProgress(milestoneId);
    }
    
    return updated;
  } catch (error) {
    console.error("Error bulk updating tasks:", error);
    throw error;
  }
};

// Mark task as blocked
export const markTaskAsBlockedAction = async (
  taskId: number,
  reason: string,
  userId: string
) => {
  try {
    const updated = await db
      .update(tasksTable)
      .set({
        is_blocked: true,
        blocker_reason: reason,
        status: "blocked",
        updated_at: new Date(),
      })
      .where(eq(tasksTable.id, taskId))
      .returning();
    
    if (updated[0] && updated[0].assigned_to) {
      await createNotificationAction({
        user_id: updated[0].assigned_to,
        type: "escalation",
        title: "Task Blocked",
        message: `Task "${updated[0].title}" has been blocked: ${reason}`,
        task_id: taskId,
        is_urgent: true,
      });
    }
    
    return updated[0];
  } catch (error) {
    console.error("Error marking task as blocked:", error);
    throw error;
  }
};

// Escalate task
export const escalateTaskAction = async (
  taskId: number,
  escalateTo: string,
  userId: string
) => {
  try {
    const updated = await db
      .update(tasksTable)
      .set({
        is_escalated: true,
        escalated_to: escalateTo,
        escalated_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(tasksTable.id, taskId))
      .returning();
    
    if (updated[0]) {
      await createNotificationAction({
        user_id: escalateTo,
        type: "escalation",
        title: "Task Escalated to You",
        message: `Task "${updated[0].title}" has been escalated to you`,
        task_id: taskId,
        is_urgent: true,
      });
    }
    
    return updated[0];
  } catch (error) {
    console.error("Error escalating task:", error);
    throw error;
  }
};

// Mark SLA breach
const markTaskSLABreached = async (taskId: number) => {
  try {
    const task = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, taskId))
      .limit(1);
    
    if (!task[0]) return;
    
    await db
      .update(tasksTable)
      .set({
        sla_breached: true,
        sla_breach_time: new Date(),
        updated_at: new Date(),
      })
      .where(eq(tasksTable.id, taskId));
    
    if (task[0].assigned_to) {
      await createNotificationAction({
        user_id: task[0].assigned_to,
        type: "sla_breach",
        title: "SLA Breach Alert",
        message: `Task "${task[0].title}" has breached its SLA`,
        task_id: taskId,
        is_urgent: true,
      });
    }
  } catch (error) {
    console.error("Error marking SLA breach:", error);
  }
};

// ============================
// PROJECT MEMBERS ACTIONS
// ============================

// Helper function to lookup user by email
export const getUserByEmail = async (email: string) => {
  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    return users[0] || null;
  } catch (error) {
    console.error("Error looking up user by email:", error);
    return null;
  }
};

export const getProjectMembers = async (projectId: number) => {
  try {
    // Join with users table to get name and email
    const members = await db
      .select({
        id: projectMembersTable.id,
        project_id: projectMembersTable.project_id,
        user_id: projectMembersTable.user_id,
        role: projectMembersTable.role,
        can_edit_project: projectMembersTable.can_edit_project,
        can_delete_project: projectMembersTable.can_delete_project,
        can_manage_members: projectMembersTable.can_manage_members,
        can_create_milestones: projectMembersTable.can_create_milestones,
        can_create_tasks: projectMembersTable.can_create_tasks,
        is_external: projectMembersTable.is_external,
        external_email: projectMembersTable.external_email,
        access_expires_at: projectMembersTable.access_expires_at,
        invited_by: projectMembersTable.invited_by,
        joined_at: projectMembersTable.joined_at,
        user_name: usersTable.name,
        user_email: usersTable.email,
      })
      .from(projectMembersTable)
      .leftJoin(usersTable, eq(projectMembersTable.user_id, usersTable.id))
      .where(eq(projectMembersTable.project_id, projectId));
    return members;
  } catch (error) {
    console.error("Error fetching project members:", error);
    return null;
  }
};

export const addProjectMemberAction = async (data: NewProjectMember) => {
  try {
    const inserted = await db.insert(projectMembersTable).values(data).returning();
    return inserted[0];
  } catch (error) {
    console.error("Error adding project member:", error);
    throw error;
  }
};

export const updateProjectMemberAction = async (data: ProjectMember) => {
  try {
    const updated = await db
      .update(projectMembersTable)
      .set(data)
      .where(eq(projectMembersTable.id, data.id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error("Error updating project member:", error);
    throw error;
  }
};

export const removeProjectMemberAction = async (memberId: number) => {
  try {
    const deleted = await db
      .delete(projectMembersTable)
      .where(eq(projectMembersTable.id, memberId))
      .returning();
    return deleted[0];
  } catch (error) {
    console.error("Error removing project member:", error);
    throw error;
  }
};

// ============================
// COMMENTS ACTIONS
// ============================

export const getComments = async (
  taskId?: number,
  milestoneId?: number,
  projectId?: number
) => {
  try {
    let query = db.select().from(commentsTable);
    
    if (taskId) {
      query = query.where(eq(commentsTable.task_id, taskId)) as any;
    } else if (milestoneId) {
      query = query.where(eq(commentsTable.milestone_id, milestoneId)) as any;
    } else if (projectId) {
      query = query.where(eq(commentsTable.project_id, projectId)) as any;
    }
    
    const comments = await query.orderBy(desc(commentsTable.created_at));
    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return null;
  }
};

export const createCommentAction = async (data: NewComment) => {
  try {
    const inserted = await db.insert(commentsTable).values(data).returning();
    
    // Notify mentioned users
    if (inserted[0] && data.mentions && data.mentions.length > 0) {
      for (const userId of data.mentions) {
        await createNotificationAction({
          user_id: userId,
          type: "mention",
          title: "You were mentioned",
          message: `You were mentioned in a comment`,
          task_id: data.task_id || undefined,
          milestone_id: data.milestone_id || undefined,
          project_id: data.project_id || undefined,
        });
      }
    }
    
    return inserted[0];
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

export const updateCommentAction = async (data: Comment) => {
  try {
    const updated = await db
      .update(commentsTable)
      .set({ ...data, updated_at: new Date() })
      .where(eq(commentsTable.id, data.id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
};

export const deleteCommentAction = async (commentId: number) => {
  try {
    const deleted = await db
      .update(commentsTable)
      .set({ deleted_at: new Date() })
      .where(eq(commentsTable.id, commentId))
      .returning();
    return deleted[0];
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

// ============================
// CHAT MESSAGES ACTIONS
// ============================

export const getChatMessages = async (projectId?: number, milestoneId?: number) => {
  try {
    let query = db.select().from(chatMessagesTable);
    
    if (projectId) {
      query = query.where(eq(chatMessagesTable.project_id, projectId)) as any;
    } else if (milestoneId) {
      query = query.where(eq(chatMessagesTable.milestone_id, milestoneId)) as any;
    }
    
    const messages = await query.orderBy(asc(chatMessagesTable.created_at));
    return messages;
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return null;
  }
};

export const createChatMessageAction = async (data: NewChatMessage) => {
  try {
    const inserted = await db.insert(chatMessagesTable).values(data).returning();
    
    // Notify mentioned users
    if (inserted[0] && data.mentions && data.mentions.length > 0) {
      for (const userId of data.mentions) {
        await createNotificationAction({
          user_id: userId,
          type: "mention",
          title: "You were mentioned in chat",
          message: `You were mentioned in a chat message`,
          project_id: data.project_id || undefined,
          milestone_id: data.milestone_id || undefined,
        });
      }
    }
    
    return inserted[0];
  } catch (error) {
    console.error("Error creating chat message:", error);
    throw error;
  }
};

export const deleteChatMessageAction = async (messageId: number) => {
  try {
    const deleted = await db
      .update(chatMessagesTable)
      .set({ deleted_at: new Date() })
      .where(eq(chatMessagesTable.id, messageId))
      .returning();
    return deleted[0];
  } catch (error) {
    console.error("Error deleting chat message:", error);
    throw error;
  }
};

// ============================
// NOTIFICATIONS ACTIONS
// ============================

export const getUserNotifications = async (userId: string) => {
  try {
    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.user_id, userId))
      .orderBy(desc(notificationsTable.created_at))
      .limit(50);
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
};

export const createNotificationAction = async (data: NewNotification) => {
  try {
    const inserted = await db.insert(notificationsTable).values(data).returning();
    return inserted[0];
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const markNotificationAsReadAction = async (notificationId: number) => {
  try {
    const updated = await db
      .update(notificationsTable)
      .set({ is_read: true, read_at: new Date() })
      .where(eq(notificationsTable.id, notificationId))
      .returning();
    return updated[0];
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsAsReadAction = async (userId: string) => {
  try {
    await db
      .update(notificationsTable)
      .set({ is_read: true, read_at: new Date() })
      .where(and(eq(notificationsTable.user_id, userId), eq(notificationsTable.is_read, false)));
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// ============================
// ACTIVITY FEED ACTIONS
// ============================

export const getActivityFeed = async (projectId: number, limit: number = 50) => {
  try {
    const activities = await db
      .select()
      .from(activityFeedTable)
      .where(eq(activityFeedTable.project_id, projectId))
      .orderBy(desc(activityFeedTable.created_at))
      .limit(limit);
    return activities;
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    return null;
  }
};

const createActivityFeedEntry = async (data: NewActivityFeed) => {
  try {
    await db.insert(activityFeedTable).values(data);
  } catch (error) {
    console.error("Error creating activity feed entry:", error);
  }
};

// ============================
// SAVED VIEWS ACTIONS
// ============================

export const getUserSavedViews = async (userId: string, projectId?: number) => {
  try {
    const conditions = [eq(savedViewsTable.user_id, userId)];
    
    if (projectId) {
      conditions.push(eq(savedViewsTable.project_id, projectId));
    }
    
    const views = await db
      .select()
      .from(savedViewsTable)
      .where(and(...conditions))
      .orderBy(desc(savedViewsTable.created_at));
    return views;
  } catch (error) {
    console.error("Error fetching saved views:", error);
    return null;
  }
};

export const createSavedViewAction = async (data: NewSavedView) => {
  try {
    const inserted = await db.insert(savedViewsTable).values(data).returning();
    return inserted[0];
  } catch (error) {
    console.error("Error creating saved view:", error);
    throw error;
  }
};

export const updateSavedViewAction = async (data: SavedView) => {
  try {
    const updated = await db
      .update(savedViewsTable)
      .set({ ...data, updated_at: new Date() })
      .where(eq(savedViewsTable.id, data.id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error("Error updating saved view:", error);
    throw error;
  }
};

export const deleteSavedViewAction = async (viewId: number) => {
  try {
    const deleted = await db
      .delete(savedViewsTable)
      .where(eq(savedViewsTable.id, viewId))
      .returning();
    return deleted[0];
  } catch (error) {
    console.error("Error deleting saved view:", error);
    throw error;
  }
};

// ============================
// ATTACHMENTS & DOCUMENTS
// ============================

export const getAttachments = async (
  projectId?: number,
  milestoneId?: number,
  taskId?: number
) => {
  try {
    let query = db.select().from(attachmentsTable);
    
    if (taskId) {
      query = query.where(eq(attachmentsTable.task_id, taskId)) as any;
    } else if (milestoneId) {
      query = query.where(eq(attachmentsTable.milestone_id, milestoneId)) as any;
    } else if (projectId) {
      query = query.where(eq(attachmentsTable.project_id, projectId)) as any;
    }
    
    const attachments = await query.orderBy(desc(attachmentsTable.created_at));
    return attachments;
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return null;
  }
};

export const createAttachmentAction = async (data: NewAttachment) => {
  try {
    const inserted = await db.insert(attachmentsTable).values(data).returning();
    return inserted[0];
  } catch (error) {
    console.error("Error creating attachment:", error);
    throw error;
  }
};

export const deleteAttachmentAction = async (attachmentId: number) => {
  try {
    const deleted = await db
      .update(attachmentsTable)
      .set({ deleted_at: new Date() })
      .where(eq(attachmentsTable.id, attachmentId))
      .returning();
    return deleted[0];
  } catch (error) {
    console.error("Error deleting attachment:", error);
    throw error;
  }
};

export const getDocumentsByProject = async (projectId: number) => {
  try {
    const documents = await db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.project_id, projectId))
      .orderBy(desc(documentsTable.updated_at));
    return documents;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return null;
  }
};

export const createDocumentAction = async (data: NewDocument) => {
  try {
    const inserted = await db.insert(documentsTable).values(data).returning();
    return inserted[0];
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

export const updateDocumentAction = async (data: Document) => {
  try {
    const updated = await db
      .update(documentsTable)
      .set({ ...data, updated_at: new Date() })
      .where(eq(documentsTable.id, data.id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteDocumentAction = async (documentId: number) => {
  try {
    const deleted = await db
      .update(documentsTable)
      .set({ deleted_at: new Date() })
      .where(eq(documentsTable.id, documentId))
      .returning();
    return deleted[0];
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};
