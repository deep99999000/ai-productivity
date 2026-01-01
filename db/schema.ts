import { usersTable } from "@/features/auth/userSchema";
import { todoTable } from "@/features/todo/schema";
import {goalTable} from "@/features/goals/schema"
import {subgoalTable} from "@/features/subGoals/schema"
import {habitTable} from "@/features/habits/schema"
import { messagesTable } from "./schema/chat";
import { attachmentTable } from "@/features/attachment/attachmentSchema";
import { pomodoroTasks, pomodoroSessions } from "./schema/pomodoro";
import { notes } from "./schema/notes";
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
} from "@/features/projects/schema";


export {
  usersTable,
  todoTable,
  goalTable,
  subgoalTable,
  messagesTable,
  habitTable,
  attachmentTable,
  pomodoroTasks,
  pomodoroSessions,
  notes,
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
}
