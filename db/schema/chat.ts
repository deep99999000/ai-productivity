import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const messagesTable = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomId: varchar("room_id", { length: 255 }).notNull(),
  sender: varchar("sender", { length: 255 }).notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export type Message = typeof messagesTable.$inferSelect;
export type NewMessage = typeof messagesTable.$inferInsert;
