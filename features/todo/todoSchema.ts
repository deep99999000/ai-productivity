// db/schema.ts

import {
  pgTable,
  integer,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "@/db/schema"; // adjust path if needed

// todo table
export const todoTable = pgTable("todotable", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  // core fields
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 2000 }),

  // user relation
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id),

  // status
  isDone: boolean("is_done").default(false),

  // meta info
  category: varchar("category", { length: 100 }),
  priority: varchar("priority", { length: 100 }),
  startDate: timestamp("start_date", { mode: "date" }),
  endDate: timestamp("end_date", { mode: "date" }),
});

// types
export type NewTodo = typeof todoTable.$inferInsert; // for inserting
export type TodoSchema = typeof todoTable.$inferSelect; // for fetching
