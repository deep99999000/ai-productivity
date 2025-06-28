import React from "react";
import { getAllUserTodos } from "@/features/todo/todoaction";
import TodoPage from "@/features/todo/components/TodoPage";
import { getuser } from "@/lib/actions/getuser";

export const dynamic = "force-dynamic";

const Todo = async () => {
  const user_id = await getuser(); // get user id
  const allTodos = await getAllUserTodos(user_id); // fetch all todos

  // show error if no todo found
  if (!allTodos || allTodos.length === 0) {
    return (
      <div className="p-4 text-center text-red-600">
        No todos found or failed to load.
      </div>
    );
  }

  return <TodoPage allTodo={allTodos} />; // pass data to todo page
};

export default Todo;
