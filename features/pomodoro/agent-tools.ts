"use server";

import { db } from "@/db";
import { pomodoroTasks, pomodoroSessions } from "@/db/schema";
import { eq, and, desc, gte, lte, count, sum, sql } from "drizzle-orm";
import { startOfDay, subDays, endOfDay } from "date-fns";

/**
 * Get all tasks for a user
 */
export async function getAllTasks(userId: string) {
  try {
    const tasks = await db
      .select()
      .from(pomodoroTasks)
      .where(and(
        eq(pomodoroTasks.userId, userId),
        eq(pomodoroTasks.isActive, true)
      ))
      .orderBy(desc(pomodoroTasks.createdAt));
    
    return tasks;
  } catch (error) {
    console.error("Agent: Failed to get tasks:", error);
    return [];
  }
}

/**
 * Get all sessions for a user with optional date range
 */
export async function getAllSessions(userId: string, daysBack?: number) {
  try {
    const conditions = [eq(pomodoroSessions.userId, userId)];
    
    if (daysBack) {
      const startDate = startOfDay(subDays(new Date(), daysBack));
      conditions.push(gte(pomodoroSessions.startTime, startDate));
    }
    
    const sessions = await db
      .select()
      .from(pomodoroSessions)
      .where(and(...conditions))
      .orderBy(desc(pomodoroSessions.startTime));
    
    return sessions;
  } catch (error) {
    console.error("Agent: Failed to get sessions:", error);
    return [];
  }
}

/**
 * Get completion statistics
 */
export async function getCompletionStats(userId: string, daysBack: number = 30) {
  try {
    const startDate = startOfDay(subDays(new Date(), daysBack));
    
    const stats = await db
      .select({
        totalSessions: count(),
        completedSessions: sum(sql<number>`CASE WHEN ${pomodoroSessions.completed} = true THEN 1 ELSE 0 END`),
        totalDuration: sum(pomodoroSessions.duration),
        averageDuration: sql<number>`AVG(${pomodoroSessions.duration})`,
      })
      .from(pomodoroSessions)
      .where(and(
        eq(pomodoroSessions.userId, userId),
        gte(pomodoroSessions.startTime, startDate)
      ));
    
    return stats[0] || {
      totalSessions: 0,
      completedSessions: 0,
      totalDuration: 0,
      averageDuration: 0,
    };
  } catch (error) {
    console.error("Agent: Failed to get completion stats:", error);
    return {
      totalSessions: 0,
      completedSessions: 0,
      totalDuration: 0,
      averageDuration: 0,
    };
  }
}

/**
 * Get task-specific statistics
 */
export async function getTaskStats(userId: string, taskId: number) {
  try {
    const stats = await db
      .select({
        totalSessions: count(),
        completedSessions: sum(sql<number>`CASE WHEN ${pomodoroSessions.completed} = true THEN 1 ELSE 0 END`),
        totalDuration: sum(pomodoroSessions.duration),
      })
      .from(pomodoroSessions)
      .where(and(
        eq(pomodoroSessions.userId, userId),
        eq(pomodoroSessions.taskId, taskId)
      ));
    
    return stats[0] || {
      totalSessions: 0,
      completedSessions: 0,
      totalDuration: 0,
    };
  } catch (error) {
    console.error("Agent: Failed to get task stats:", error);
    return {
      totalSessions: 0,
      completedSessions: 0,
      totalDuration: 0,
    };
  }
}

/**
 * Get sessions by time of day
 */
export async function getSessionsByTimeOfDay(userId: string, daysBack: number = 30) {
  try {
    const startDate = startOfDay(subDays(new Date(), daysBack));
    
    const sessions = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${pomodoroSessions.startTime})`,
        sessionCount: count(),
        completedCount: sum(sql<number>`CASE WHEN ${pomodoroSessions.completed} = true THEN 1 ELSE 0 END`),
      })
      .from(pomodoroSessions)
      .where(and(
        eq(pomodoroSessions.userId, userId),
        gte(pomodoroSessions.startTime, startDate)
      ))
      .groupBy(sql`EXTRACT(HOUR FROM ${pomodoroSessions.startTime})`);
    
    return sessions;
  } catch (error) {
    console.error("Agent: Failed to get sessions by time:", error);
    return [];
  }
}

/**
 * Get daily productivity trends
 */
export async function getDailyTrends(userId: string, daysBack: number = 30) {
  try {
    const startDate = startOfDay(subDays(new Date(), daysBack));
    
    const trends = await db
      .select({
        date: sql<string>`DATE(${pomodoroSessions.startTime})`,
        sessionCount: count(),
        completedCount: sum(sql<number>`CASE WHEN ${pomodoroSessions.completed} = true THEN 1 ELSE 0 END`),
        totalDuration: sum(pomodoroSessions.duration),
      })
      .from(pomodoroSessions)
      .where(and(
        eq(pomodoroSessions.userId, userId),
        gte(pomodoroSessions.startTime, startDate)
      ))
      .groupBy(sql`DATE(${pomodoroSessions.startTime})`)
      .orderBy(sql`DATE(${pomodoroSessions.startTime}) DESC`);
    
    return trends;
  } catch (error) {
    console.error("Agent: Failed to get daily trends:", error);
    return [];
  }
}

/**
 * Get break patterns
 */
export async function getBreakPatterns(userId: string, daysBack: number = 30) {
  try {
    const startDate = startOfDay(subDays(new Date(), daysBack));
    
    const patterns = await db
      .select({
        type: pomodoroSessions.type,
        count: count(),
        avgDuration: sql<number>`AVG(${pomodoroSessions.duration})`,
      })
      .from(pomodoroSessions)
      .where(and(
        eq(pomodoroSessions.userId, userId),
        gte(pomodoroSessions.startTime, startDate)
      ))
      .groupBy(pomodoroSessions.type);
    
    return patterns;
  } catch (error) {
    console.error("Agent: Failed to get break patterns:", error);
    return [];
  }
}

/**
 * Get most productive tasks
 */
export async function getMostProductiveTasks(userId: string, limit: number = 5) {
  try {
    const taskStats = await db
      .select({
        taskId: pomodoroSessions.taskId,
        taskName: pomodoroTasks.name,
        completedSessions: sum(sql<number>`CASE WHEN ${pomodoroSessions.completed} = true THEN 1 ELSE 0 END`),
        totalDuration: sum(pomodoroSessions.duration),
      })
      .from(pomodoroSessions)
      .innerJoin(pomodoroTasks, eq(pomodoroSessions.taskId, pomodoroTasks.id))
      .where(eq(pomodoroSessions.userId, userId))
      .groupBy(pomodoroSessions.taskId, pomodoroTasks.name)
      .orderBy(desc(sql`SUM(CASE WHEN ${pomodoroSessions.completed} = true THEN 1 ELSE 0 END)`))
      .limit(limit);
    
    return taskStats;
  } catch (error) {
    console.error("Agent: Failed to get productive tasks:", error);
    return [];
  }
}
