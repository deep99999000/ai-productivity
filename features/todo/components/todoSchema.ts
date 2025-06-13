
import { usersTable } from "@/db/schema";
import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const todoTable = pgTable("todotable", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 2000 }),
  user_id: integer().notNull().references(() => usersTable.id),
  isDone: boolean("is_done").default(false),
});


export type TodoSchema = typeof todoTable.$inferInsert;
