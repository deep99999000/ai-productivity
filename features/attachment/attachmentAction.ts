"use server";
import { db } from "@/db";
import { attachmentTable } from "./attachmentSchema";
import { and, eq } from "drizzle-orm";
import type { NewAttachment } from "./attachmentSchema";

export const createAttachment = async (data: NewAttachment) => {
  try {
    const res = await db.insert(attachmentTable).values(data).returning();
    return res[0];
  } catch (e) {
    console.error("createAttachment error", e);
    throw e;
  }
};

export const getgoalAttachments = async (subgoal_id: number, user_id: number) => {
  try {
    const res = await db
      .select()
      .from(attachmentTable)
      .where(and(eq(attachmentTable.goal_id, subgoal_id), eq(attachmentTable.user_id, user_id)));
    return res;
  } catch (e) {
    console.error("getSubgoalAttachments error", e);
    return [];
  }
};

export const deleteAttachment = async (id: number, user_id: number) => {
  try {
    const res = await db
      .delete(attachmentTable)
      .where(and(eq(attachmentTable.id, id), eq(attachmentTable.user_id, user_id)))
      .returning();
    return res[0];
  } catch (e) {
    console.error("deleteAttachment error", e);
    throw e;
  }
};
