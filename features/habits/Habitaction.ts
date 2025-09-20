"use server"
import { and, eq, getTableColumns, inArray } from "drizzle-orm";
import { db } from "@/db";
import {Goal, goalTable, type NewGoal} from "@/features/goals/goalSchema"
import { habitTable, subgoalTable, todoTable } from "@/db/schema";
import type { NewSubgoal, Subgoal } from "@/features/subGoals/subGoalschema";
import type { Habit } from "@/features/habits/habitSchema";
//get all users goal
export const getAllUserHabits = async (user_id: number) => {
  try {
    console.log(user_id);
    const allgoals = await db
      .select()
      .from(habitTable)
      .where(eq(habitTable.user_id, user_id));
    return allgoals;
  } catch (error) {
    console.log(error);
    return null;
  }
};

//new habit

export const newhabitaction = async(data: Habit) => {
   const newhabit = await db.insert(habitTable)
   .values(data)
   .returning()
   console.log(newhabit);
   
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