import {
  pgTable,
  integer,
  varchar,
  timestamp,
  bigint,
} from "drizzle-orm/pg-core";
import { usersTable } from "@/db/schema";

// 🎯 Goal database table schema
export const goalTable = pgTable("goaltable", {
  id: bigint("id", { mode: "number" }).primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 2000 }),

  user_id: varchar("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  status: varchar("status").default("Not Started").notNull(),
  category: varchar("category", { length: 100 }),
  endDate: timestamp(),
});

// 📝 TypeScript types
export type Goal = typeof goalTable.$inferSelect;
export type NewGoal = typeof goalTable.$inferInsert;