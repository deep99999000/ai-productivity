"use server";

import { db } from "@/db";
import { goalTable, subgoalTable } from "@/db/schema";
import {
  Todo,
  todoTable,
  type NewTodo,
} from "@/features/todo/schema";
import { and, eq, getTableColumns } from "drizzle-orm";

// get all todos for user
export const getAllUserTodos = async (
  user_id: string
): Promise<Todo[] | null> => {
  try {
    const allTodos = await db
      .select({
        ...getTableColumns(todoTable),
        goalName: goalTable.name,
        subgoalName: subgoalTable.name,
      })
      .from(todoTable)
      .where(eq(todoTable.user_id, user_id))
      .leftJoin(goalTable, eq(todoTable.goal_id, goalTable.id))
      .leftJoin(subgoalTable, eq(todoTable.subgoal_id, subgoalTable.id));
    return allTodos
  } catch (error) {
    console.error("Error fetching todos:", error);
    return null;
  }
};

// update todo status (done/undone)
export type upTodo = {
  id: number;
  name: string;
  description: string | null;
  user_id: string;
  isDone: boolean | null;
  category: string | null;
  priority: string | null;
  startDate: Date | null;
  endDate: Date | null;
  goal_id: number | null;
  subgoal_id: number | null;
};

export const updateTodosStatus = async (
  user_id: string,
  todo_id: number,
  newStatus: boolean
): Promise<upTodo[] | null> => {
  try {
    const updatedTodos = await db
      .update(todoTable)
      .set({ isDone: newStatus })
      .where(and(eq(todoTable.id, todo_id), eq(todoTable.user_id, user_id)))
      .returning();
    return updatedTodos;
  } catch (error) {
    return null;
  }
};

// update todo data
export const updatetodoData = async (todo: Todo) => {
  const { id, user_id, name, description, category, priority, startDate, endDate, tags } = todo;
  try {
    const updatedTodos = await db
      .update(todoTable)
      .set({ name, description, category, priority, startDate, endDate, tags })
      .where(and(eq(todoTable.id, id), eq(todoTable.user_id, user_id)))
      .returning();
  } catch (error) {
    console.log(error);
  }
};

// add new todo
export const newtodoaction = async (todo: NewTodo) => {

  try {
    const newTodos = await db
      .insert(todoTable)
      .values(todo)
      .returning();
    return newTodos;
  } catch (error) {
    console.log(error);
  }
};
//delete todo
export const deleteTodoFromdb = async(id: number) => {
  try {
    const deletedtodo = await db.delete(todoTable).where(eq(todoTable.id,id)).returning()
    console.log(deletedtodo);
    return deletedtodo
  } catch (error) {
    console.log(error);
  }
};

