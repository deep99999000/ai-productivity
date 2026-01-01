"use server";
import { db } from "@/db";
import { attachmentTable } from "./attachmentSchema";
import { and, eq } from "drizzle-orm";
import type { NewAttachment } from "./attachmentSchema";

// ➕ Create a new attachment
export const createAttachment = async (data: NewAttachment) => {
  try {
    const res = await db.insert(attachmentTable).values(data).returning();
    return res[0];
  } catch (e) {
    // ⚠️ Handle error
    console.error("createAttachment error", e);
    throw e;
  }
};

// 📥 Get all attachments for a goal
export const getgoalAttachments = async (subgoal_id: number, user_id: string) => {
  try {
    const res = await db
      .select()
      .from(attachmentTable)
      .where(and(eq(attachmentTable.goal_id, subgoal_id), eq(attachmentTable.user_id, user_id)));
    return res;
  } catch (e) {
    // ⚠️ Handle error
    console.error("getSubgoalAttachments error", e);
    return [];
  }
};

// 📥 Get all attachments for a project
export const getProjectAttachments = async (project_id: number, user_id: string) => {
  try {
    const res = await db
      .select({
        id: attachmentTable.id,
        name: attachmentTable.name,
        description: attachmentTable.description,
        project_id: attachmentTable.project_id,
        goal_id: attachmentTable.goal_id,
        user_id: attachmentTable.user_id,
        url: attachmentTable.url,
        uploaded_by_name: usersTable.name,
        uploaded_by_image: usersTable.image,
      })
      .from(attachmentTable)
      .leftJoin(usersTable, eq(attachmentTable.user_id, usersTable.id))
      .where(eq(attachmentTable.project_id, project_id));
    return res;
  } catch (e) {
    // ⚠️ Handle error
    console.error("getProjectAttachments error", e);
    return [];
  }
};

// 🗑️ Delete an attachment
export const deleteAttachment = async (id: number, user_id: string) => {
  try {
    const res = await db
      .delete(attachmentTable)
      .where(and(eq(attachmentTable.id, id), eq(attachmentTable.user_id, user_id)))
      .returning();
    return res[0];
  } catch (e) {
    // ⚠️ Handle error
    console.error("deleteAttachment error", e);
    throw e;
  }
};
