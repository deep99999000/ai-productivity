"use server";

import { db } from "@/db";
import { TodoSchema, todoTable } from "./components/todoSchema";

// Function to get all user todos
export const getAllUserTodos = async (): Promise<TodoSchema[] | null> => {
  try {
    const allTodos = await db.select().from(todoTable);
    return allTodos;
  } catch (error) {
    return null;
  }
};

// Function to update todo status
export const updateTodosStatus = async (
  newStatus: boolean
): Promise<TodoSchema[] | null> => {
  try {
    const updatedTodos = await db
      .update(todoTable)
      .set({ isDone: newStatus })
      .returning();

    return updatedTodos;
  } catch (error) {
    return null;
  }
};
