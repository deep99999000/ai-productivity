"use server";

import { db } from "@/db";
import { TodoSchema, todoTable, type NewTodo } from "./components/todoSchema";
import { and, eq } from "drizzle-orm";

// Function to get all user todos
export const getAllUserTodos = async (user_id:number): Promise<TodoSchema[] | null> => {
  try {
    const allTodos = await db.select()
    .from(todoTable)
    .where(eq(todoTable.user_id,user_id));
    return allTodos;
  } catch (error) {
    return null;
  }
};

// Function to update todo status
export const updateTodosStatus = async (
  user_id:number,
  todo_id:number,
  newStatus: boolean
): Promise<TodoSchema[] | null> => {
  try {
    const updatedTodos = await db
      .update(todoTable)
      .set({ isDone: newStatus })
      .where(and(eq(todoTable.id,todo_id),eq(todoTable.user_id,user_id)))
      .returning();
    return updatedTodos;
  } catch (error) {
    return null;
  }
};

//function to update todo
export const updatetodoData = async (NewTodo:TodoSchema) => {
  const {name,description,category,priority,startDate,endDate} = NewTodo
  try {
    const updatedTodos = await db
    .update(todoTable)
    .set({name,description,category,priority,startDate,endDate})
    .where(and(eq(todoTable.id,NewTodo.id),eq(todoTable.user_id,NewTodo.user_id)))
    .returning()
    console.log(updatedTodos);
  } catch (error) {
    console.log(error);
    
  }
}