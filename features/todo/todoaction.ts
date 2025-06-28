"use server";

import { db } from "@/db";
import {
  TodoSchema,
  todoTable,
  type NewTodo,
} from "@/features/todo/todoSchema";
import { and, eq } from "drizzle-orm";

// get all todos for user
export const getAllUserTodos = async (
  user_id: number
): Promise<TodoSchema[] | null> => {
  try {
    const allTodos = await db
      .select()
      .from(todoTable)
      .where(eq(todoTable.user_id, user_id));
    return allTodos;
  } catch (error) {
    return null;
  }
};

// update todo status (done/undone)
export const updateTodosStatus = async (
  user_id: number,
  todo_id: number,
  newStatus: boolean
): Promise<TodoSchema[] | null> => {
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
export const updatetodoData = async (todo: TodoSchema) => {
  const { id, user_id, name, description, category, priority, startDate, endDate } = todo;
  try {
    const updatedTodos = await db
      .update(todoTable)
      .set({ name, description, category, priority, startDate, endDate })
      .where(and(eq(todoTable.id, id), eq(todoTable.user_id, user_id)))
      .returning();
  } catch (error) {
    console.log(error);
  }
};

// add new todo
export const newtodoaction = async (todo: NewTodo) => {
  const { name, description, category, priority, user_id } = todo;
  try {
    const newTodos = await db
      .insert(todoTable)
      .values({ name, description, category, priority, user_id })
      .returning();
    return newTodos;
  } catch (error) {
    console.log(error);
  }
};
