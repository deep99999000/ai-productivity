// db/schema.ts

import { pgTable, integer, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "@/db/schema"; // adjust path if needed

export const todoTable = pgTable("todotable", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 2000 }),
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  isDone: boolean("is_done").default(false),

  category: varchar("category", { length: 100 }),
  priority: varchar("priority", { length: 100 }),

  startDate: timestamp("start_date", { mode: "date" }),
  endDate: timestamp("end_date", { mode: "date" }),
});

// Type for inserting new todos (without needing all fields)
export type NewTodo = typeof todoTable.$inferInsert;

// Type for fetching todos (includes auto-generated fields like id)
export type TodoSchema = typeof todoTable.$inferSelect;
