import {
  pgTable,
  integer,
  varchar,
  boolean,
  timestamp,
  json
} from "drizzle-orm/pg-core";
import { goalTable, usersTable } from "@/db/schema";
import { subgoalTable } from "@/features/goals/subGoalschema";

// todo table
export const todoTable = pgTable("todotable", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 2000 }),

  user_id: integer("user_id").notNull().references(() => usersTable.id),

  isDone: boolean("is_done").default(false),
  category: varchar("category", { length: 100 }),
  priority: varchar("priority", { length: 100 }),
  startDate: timestamp("start_date", { mode: "date" }),
  endDate: timestamp("end_date", { mode: "date" }),

  // Foreign keys
  goal_id: integer("goal_id").references(() => goalTable.id),
  subgoal_id: integer("subgoal_id").references(() => subgoalTable.id),
});

// types
export type NewTodo = typeof todoTable.$inferInsert; // for inserting
// for fetching
export type Todo = typeof todoTable.$inferSelect & {
  goalName: string | null;
  subgoalName: string | null;
};