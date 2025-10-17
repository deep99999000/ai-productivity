"use client";

import type { Goal } from "@/features/goals/types/goalSchema";
import { getuser } from "@/lib/actions/getuser";
import { getAllUserGoals } from '@/features/goals/actions/goalaction';

export async function fetchUserGoals(): Promise<Goal[]> {
  const userId = await getuser();
  if (!userId) throw new Error("User not found");

  const goals = await getAllUserGoals(userId);
  if (!goals || goals.length === 0) return [];

  return goals;
}
