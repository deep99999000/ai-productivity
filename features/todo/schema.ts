import {
  pgTable,
  integer,
  varchar,
  boolean,
  timestamp,
  json,
  bigint,
  text
} from "drizzle-orm/pg-core";
import { goalTable, usersTable } from "@/db/schema";
import { subgoalTable } from "@/features/subGoals/schema";

// ✅ Todo database table schema
export const todoTable = pgTable("todotable", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  user_id: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),

  isDone: boolean("is_done").default(false),
  category: varchar("category", { length: 100 }),
  priority: varchar("priority", { length: 100 }),
  tags: text("tags").array(),
  startDate: timestamp("start_date", { mode: "date" }),
  endDate: timestamp("end_date", { mode: "date" }),

  // 🔗 Foreign keys with cascade deletion
  goal_id:  bigint("goal_id", { mode: "number" }).references(() => goalTable.id, { onDelete: "cascade" }),
  subgoal_id:  bigint("subgoal_id", { mode: "number" }).references(() => subgoalTable.id, { onDelete: "cascade" }),
});

// 📝 TypeScript types
// For fetching
export type Todo = typeof todoTable.$inferSelect & {
  goalName: string | null;
  subgoalName: string | null;
};

// For inserting
export type NewTodo = typeof todoTable.$inferInsert & {
  goalName: string | null;
  subgoalName: string | null;
};