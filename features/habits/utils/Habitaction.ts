"use server"
import { and, eq, getTableColumns, inArray } from "drizzle-orm";
import { db } from "@/db";
import {Goal, goalTable, type NewGoal} from "@/features/goals/types/goalSchema"
import { habitTable, subgoalTable, todoTable } from "@/db/schema";
import type { NewSubgoal, Subgoal } from "@/features/subGoals/subGoalschema";
import type { Habit } from "@/features/habits/utils/habitSchema";
import { format } from "path";
//get all users goal
export const getAllUserHabits = async (user_id: number) => {
  try {
    console.log(user_id);
    const allhabits = await db
      .select()
      .from(habitTable)
      .where(eq(habitTable.user_id, user_id));
      console.log(allhabits);
    return allhabits;
  } catch (error) {
    console.log(error);
    return null;
  }
};

//new habit

export const newhabitaction = async (data: Habit) => {
  try {
    console.log(data);
    
    const inserted = await db
      .insert(habitTable)
      .values(data)
      .returning(); // works in Postgres only

    console.log("Inserted habit:", inserted);
    return inserted[0]; // return first inserted row
  } catch (err) {
    console.error("Error inserting habit:", err);
    throw err;
  }
};

export const updatewhabitaction = async(data: Habit) => {
   const newhabit = await db.update(habitTable)
   .set(data).where(eq(habitTable.id,data.id))
   .returning()
   console.log(newhabit);
   
};

export const deletehabitaction = async(id: number) => {
   const newhabit = await db.delete(habitTable)
   .where(eq(habitTable.id,id))
   .returning()
   console.log(newhabit);
   
};

export async function toggleCheckInHabitAction(habitId: number, date: string) {
  const dayString = date
  // Get habit
  const [habit] = await db
    .select()
    .from(habitTable)
    .where(eq(habitTable.id, habitId));

  if (!habit) {
    throw new Error("Habit not found");
  }

  let updatedDays: string[];

  if (habit.checkInDays?.includes(dayString)) {
    // Checkout → remove
    updatedDays = habit.checkInDays.filter((d) => d !== dayString);
  } else {
    // Checkin → add
    updatedDays = [...(habit.checkInDays ?? []), dayString];
  }

  await db
    .update(habitTable)
    .set({ checkInDays: updatedDays })
    .where(eq(habitTable.id, habitId));

  return { success: true, checkInDays: updatedDays };
}