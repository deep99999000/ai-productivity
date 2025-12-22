import { pgTable, serial, text, timestamp, integer, boolean, varchar, bigint } from "drizzle-orm/pg-core";
import { usersTable } from "@/features/auth/userSchema";
import { habitTable } from "@/features/habits/schema";
import { goalTable } from "@/features/goals/schema";

export const pomodoroTasks = pgTable("pomodoro_tasks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  color: varchar("color", { length: 50 }).default("#8B5CF6"),
  emoji: varchar("emoji", { length: 10 }),
  duration: integer("duration").default(600).notNull(), // default 10 minutes in seconds
  habitId: bigint("habit_id", { mode: "number" }).references(() => habitTable.id, { onDelete: "set null" }),
  goalId: bigint("goal_id", { mode: "number" }).references(() => goalTable.id, { onDelete: "set null" }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  taskId: integer("task_id").notNull().references(() => pomodoroTasks.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration").notNull(), // in seconds
  type: varchar("type", { length: 20 }).default("focus").notNull(), // focus, shortBreak, longBreak
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
