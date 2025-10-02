import { pgTable, bigint, varchar } from "drizzle-orm/pg-core";
import { goalTable, subgoalTable, usersTable } from "@/db/schema";
import { url } from "inspector";

export const attachmentTable = pgTable("attachmenttable", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  goal_id: bigint("goal_id", { mode: "number" })
    .notNull()
    .references(() => goalTable.id),
  user_id: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => usersTable.id),
url: varchar("url", { length: 2048 }).notNull()
});

export type Attachment = typeof attachmentTable.$inferSelect;
export type NewAttachment = typeof attachmentTable.$inferInsert;
