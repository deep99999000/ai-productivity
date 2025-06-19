import React from "react";
import { SingleTodo } from "@/features/todo/components/singleTodo";
import { getAllUserTodos } from "@/features/todo/todoaction";
import { getuser } from "@/actions/getuser";

export const dynamic = "force-dynamic";

const Todo = async () => {
  const user_id = await getuser()
  console.log(user_id);
  const allTodos = await getAllUserTodos(user_id);

  if (!allTodos || allTodos.length === 0) {
    return (
      <div className="p-4 text-center text-red-600">
        No todos found or failed to load.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {allTodos.map((todo) => (
        <SingleTodo key={todo.id} todo={todo} />
      ))}
    </div>
  );
};

export default Todo;
