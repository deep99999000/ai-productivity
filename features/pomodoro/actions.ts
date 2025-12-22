"use server";

import { db } from "@/db";
import { pomodoroTasks, pomodoroSessions } from "@/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { PomodoroTask, PomodoroSession, CreatePomodoroTaskInput, CreatePomodoroSessionInput } from "./schema";

// Task Actions
export async function createPomodoroTask(userId: string, input: CreatePomodoroTaskInput): Promise<PomodoroTask | null> {
  try {
    // Clean up null/undefined values for habitId and goalId
    const cleanInput = {
      ...input,
      habitId: input.habitId || null,
      goalId: input.goalId || null,
    };
    
    const [task] = await db
      .insert(pomodoroTasks)
      .values({
        ...cleanInput,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    return task as PomodoroTask;
  } catch (error) {
    console.error("Failed to create pomodoro task:", error);
    return null;
  }
}

export async function getPomodoroTasks(userId: string): Promise<PomodoroTask[]> {
  try {
    const tasks = await db
      .select()
      .from(pomodoroTasks)
      .where(and(
        eq(pomodoroTasks.userId, userId),
        eq(pomodoroTasks.isActive, true)
      ))
      .orderBy(desc(pomodoroTasks.createdAt));
    
    return tasks as PomodoroTask[];
  } catch (error) {
    console.error("Failed to get pomodoro tasks:", error);
    return [];
  }
}

export async function updatePomodoroTask(
  userId: string,
  taskId: number,
  updates: Partial<CreatePomodoroTaskInput>
): Promise<PomodoroTask | null> {
  try {
    const [task] = await db
      .update(pomodoroTasks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(
        eq(pomodoroTasks.id, taskId),
        eq(pomodoroTasks.userId, userId)
      ))
      .returning();
    
    return task as PomodoroTask;
  } catch (error) {
    console.error("Failed to update pomodoro task:", error);
    return null;
  }
}

export async function deletePomodoroTask(userId: string, taskId: number): Promise<boolean> {
  try {
    await db
      .update(pomodoroTasks)
      .set({ isActive: false })
      .where(and(
        eq(pomodoroTasks.id, taskId),
        eq(pomodoroTasks.userId, userId)
      ));
    
    return true;
  } catch (error) {
    console.error("Failed to delete pomodoro task:", error);
    return false;
  }
}

// Session Actions
export async function createPomodoroSession(
  userId: string,
  input: CreatePomodoroSessionInput
): Promise<PomodoroSession | null> {
  try {
    const [session] = await db
      .insert(pomodoroSessions)
      .values({
        ...input,
        userId,
        createdAt: new Date(),
      })
      .returning();
    
    return session as PomodoroSession;
  } catch (error) {
    console.error("Failed to create pomodoro session:", error);
    return null;
  }
}

export async function updatePomodoroSessions(
  userId: string,
  sessionId: number,
  updates: Partial<PomodoroSession>
): Promise<PomodoroSession | null> {
  try {
    const [session] = await db
      .update(pomodoroSessions)
      .set(updates)
      .where(and(
        eq(pomodoroSessions.id, sessionId),
        eq(pomodoroSessions.userId, userId)
      ))
      .returning();
    
    return session as PomodoroSession;
  } catch (error) {
    console.error("Failed to update pomodoro session:", error);
    return null;
  }
}

export async function deletePomodoroSession(
  userId: string,
  sessionId: number
): Promise<boolean> {
  try {
    await db
      .delete(pomodoroSessions)
      .where(and(
        eq(pomodoroSessions.id, sessionId),
        eq(pomodoroSessions.userId, userId)
      ));
    
    return true;
  } catch (error) {
    console.error("Failed to delete pomodoro session:", error);
    return false;
  }
}

export async function getPomodoroSessions(
  userId: string,
  taskId?: number,
  startDate?: Date,
  endDate?: Date
): Promise<PomodoroSession[]> {
  try {
    const conditions = [eq(pomodoroSessions.userId, userId)];
    
    if (taskId) {
      conditions.push(eq(pomodoroSessions.taskId, taskId));
    }
    
    if (startDate) {
      conditions.push(gte(pomodoroSessions.startTime, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(pomodoroSessions.startTime, endDate));
    }
    
    const sessions = await db
      .select()
      .from(pomodoroSessions)
      .where(and(...conditions))
      .orderBy(desc(pomodoroSessions.startTime));
    
    return sessions as PomodoroSession[];
  } catch (error) {
    console.error("Failed to get pomodoro sessions:", error);
    return [];
  }
}

export async function updatePomodoroSession(
  userId: string,
  sessionId: number,
  updates: Partial<PomodoroSession>
): Promise<PomodoroSession | null> {
  try {
    const [session] = await db
      .update(pomodoroSessions)
      .set(updates)
      .where(and(
        eq(pomodoroSessions.id, sessionId),
        eq(pomodoroSessions.userId, userId)
      ))
      .returning();
    
    return session as PomodoroSession;
  } catch (error) {
    console.error("Failed to update pomodoro session:", error);
    return null;
  }
}
