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

  // frequency: daily | weekly | custom
  frequency: varchar("frequency", { length: 20 }).default("daily").notNull(),

  // ✅ NEW: store streak stats
  highestStreak: integer("highest_streak").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Track daily check-ins for streaks and completion rates
export const habitCheckinTable = pgTable("habit_checkin", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  habit_id: bigint("habit_id", { mode: "number" }).notNull(),
  user_id: integer("user_id").notNull(),
  date: timestamp("date", { mode: "date" }).notNull(),
});

export type Habit = typeof habitTable.$inferSelect;
export type NewHabit = typeof habitTable.$inferInsert;

export type HabitCheckin = typeof habitCheckinTable.$inferSelect;
export type NewHabitCheckin = typeof habitCheckinTable.$inferInsert;
