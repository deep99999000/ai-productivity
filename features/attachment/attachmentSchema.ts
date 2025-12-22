import { pgTable, bigint, varchar } from "drizzle-orm/pg-core";
import { goalTable, subgoalTable, usersTable } from "@/db/schema";
import { url } from "inspector";

// 📎 Attachment database table schema
export const attachmentTable = pgTable("attachmenttable", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  goal_id: bigint("goal_id", { mode: "number" })
    .notNull()
    .references(() => goalTable.id),
  user_id: varchar("user_id")
    .notNull()
    .references(() => usersTable.id),
url: varchar("url", { length: 2048 }).notNull()
});

// 📝 TypeScript types
export type Attachment = typeof attachmentTable.$inferSelect;
export type NewAttachment = typeof attachmentTable.$inferInsert;
