import {
  pgTable,
  integer,
  varchar,
  boolean,
  timestamp,
  json,
} from "drizzle-orm/pg-core";
import { usersTable } from "@/db/schema";
import type { Todo } from "@/features/todo/todoSchema";
import { subgoalTable } from "@/features/goals/subGoalschema";

export const goalTable = pgTable("goaltable", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 2000 }),

  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id),

  category: varchar("category", { length: 100 }),
});

export type Goal = typeof goalTable.$inferSelect;
