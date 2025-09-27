import { 
  pgTable, 
  integer, 
  varchar, 
  boolean, 
  timestamp, 
  json, 
  bigint 
} from "drizzle-orm/pg-core";
import { usersTable } from "@/db/schema";

// Habit table captures definition + user preferences
export const habitTable = pgTable("habit_table", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  user_id: integer("user_id").notNull().references(() => usersTable.id),

  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 2000 }),
  emoji: varchar("emoji", { length: 8 }).default("✅"),


  // ✅ NEW: store streak stats
  highestStreak: integer("highest_streak").default(0).notNull(),
  checkInDays:json("checkInDays").$type<string[]>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export type Habit = typeof habitTable.$inferSelect;
export type NewHabit = typeof habitTable.$inferInsert;
