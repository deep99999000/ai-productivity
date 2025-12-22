import { pgTable, varchar } from "drizzle-orm/pg-core";
import { json } from "stream/consumers";

// 👤 User database table schema
export const usersTable = pgTable("user", {
  id: varchar({ length: 255 }).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

// 📝 TypeScript type
export type UserSchema = typeof usersTable.$inferInsert;
