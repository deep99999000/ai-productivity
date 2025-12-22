"use server"
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {Goal, goalTable, type NewGoal} from "@/features/goals/schema"
import { subgoalTable } from "@/db/schema";
import type { NewSubgoal, Subgoal } from "@/features/subGoals/schema";
//get all users goal
export const getAllUserGoals = async (user_id: string) => {
  try {
    const allgoals = await db
      .select()
      .from(goalTable)
      .where(eq(goalTable.user_id, user_id));
    return allgoals;
  } catch (error) {
    console.log(error);
    return null;
  }
};

//new goal
export const newGoalsAction = async(newgoal: NewGoal) => {
  try {
    console.log(newgoal); 
    const todo = await db
    .insert(goalTable)
    .values(newgoal)
    .returning()
    return todo;
  } catch (error) {
    console.log(error);
  }
};

export const getsubGoal = async(id:number) => {
 try {
  const subgoal = await db
  .select()
  .from(subgoalTable)
  .where(eq(subgoalTable.goal_id,id))
  console.log(subgoal);
  return subgoal
 } catch (error) {
  console.log(error);
 }
};
export const getaallsubgoal = async(id:number) => {
    const a = await db.select()
    .from(subgoalTable)
    .where(eq(subgoalTable.goal_id,id))
    console.log(a);
    return a
}
export const newSubGoalsAction = async(NewSubgoal: NewSubgoal) => {
  try {
    console.log(NewSubgoal); 
    const todo = await db
    .insert(subgoalTable)
    .values(NewSubgoal)
    .returning()
    return todo;
  } catch (error) {
    console.log(error);
  }
};

export const DeleteGoalsAction = async (id: number) => {
  try {
    // Delete the goal - subgoals and todos will be cascade deleted automatically
    const deletedGoal = await db
      .delete(goalTable)
      .where(eq(goalTable.id, id))
      .returning();

    return deletedGoal;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

//toggle goal
export const toggleGoal = async (goalId: number, status: string) => {
  try {
    const updatedGoal = await db
      .update(goalTable)
      .set({ status: status })
      .where(eq(goalTable.id, goalId))
      .returning();
    return updatedGoal;
  } catch (error) {
    console.error("Error toggling goal:", error);
    throw error;
  }
};

//toggle subgoal 
export const toggleSubgoal = async (subgoalId: number, status: string) => {
  try {
    const updatedSubgoal = await db
      .update(subgoalTable)
      .set({ status: status })
      .where(eq(subgoalTable.id, subgoalId))
      .returning();
    return updatedSubgoal;
  } catch (error) {
    console.error("Error toggling subgoal:", error);
    throw error;
  }
};

//delete subgoal
export const DeleteSubGoalsAction = async (id: number) => {
  try {
    // Delete the subgoal - todos will be cascade deleted automatically
    const deletedSubgoal = await db
      .delete(subgoalTable)
      .where(eq(subgoalTable.id, id))
      .returning();

    return deletedSubgoal;
  } catch (error) {
    console.error("Error deleting subgoal:", error);
    throw error;
  }
};

//edit subgoal
export const EditSubGoalsAction = async (id: number, updatedSubgoal: NewSubgoal) => {
  try {
    const editedSubgoal = await db
      .update(subgoalTable)
      .set(updatedSubgoal)
      .where(eq(subgoalTable.id, id))
      .returning();

    return editedSubgoal;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

//edit goal
export const EditGoalsAction = async (id: number, updatedGoal: NewGoal) => {
  try {
    const editedGoal = await db
      .update(goalTable)
      .set(updatedGoal)
      .where(eq(goalTable.id, id))
      .returning();

    return editedGoal;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

//delete goal
export const deleteGoal = async (id: number) => {
  try {
    // Delete the goal - subgoals and todos will be cascade deleted automatically
    const deletedGoal = await db
      .delete(goalTable)
      .where(eq(goalTable.id, id))
      .returning();

    return deletedGoal;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

//edit goal by only taking data json as goal type
export const editGoalAction = async (updatedGoal: Goal) => {
  try {
    const editedGoal = await db
      .update(goalTable)
      .set(updatedGoal)
      .where(eq(goalTable.id, updatedGoal.id))
      .returning();
    return editedGoal;
  } catch (error) {
    console.error("Error editing goal:", error);
    throw error;
  }
}

//edit subgoal by only taking data json as subgoal type
export const editSubgoalAction = async (updatedSubgoal: Subgoal) => {
  try {
    const editedSubgoal = await db
      .update(subgoalTable)
      .set(updatedSubgoal)
      .where(eq(subgoalTable.id, updatedSubgoal.id))
      .returning();
    return editedSubgoal;
  } catch (error) {
    console.error("Error editing subgoal:", error);
    throw error;
  }
}