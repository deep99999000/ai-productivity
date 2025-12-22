import { z } from "zod";

// Pomodoro task schema
export const pomodoroTaskSchema = z.object({
  id: z.number(),
  userId: z.string(),
  name: z.string().min(1, "Task name is required"),
  category: z.string().optional(),
  color: z.string().default("#8B5CF6"), // purple default
  emoji: z.string().optional(),
  duration: z.number().default(600), // in seconds, default 10 minutes
  habitId: z.number().optional().nullable(),
  goalId: z.number().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  isActive: z.boolean().default(true),
});

// Pomodoro session schema
export const pomodoroSessionSchema = z.object({
  id: z.number(),
  userId: z.string(),
  taskId: z.number(),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number(), // in seconds
  type: z.enum(["focus", "shortBreak", "longBreak"]).default("focus"),
  completed: z.boolean().default(false),
  createdAt: z.date().optional(),
});

export type PomodoroTask = z.infer<typeof pomodoroTaskSchema>;
export type PomodoroSession = z.infer<typeof pomodoroSessionSchema>;

export type CreatePomodoroTaskInput = Omit<PomodoroTask, "id" | "createdAt" | "updatedAt">;
export type CreatePomodoroSessionInput = Omit<PomodoroSession, "id" | "createdAt">;
