import React from "react";
import SingleTodo from "@/features/todo/components/singleTodo";
import { getAllUserTodos } from "@/features/todo/todoaction";

export const dynamic = "force-dynamic";

const Todo = async () => {
  const allTodo = await getAllUserTodos();

  if (!allTodo) {
    return <>Error loading todos.</>;
  }

  return (
    <div>
      {allTodo.map((todo) => (
        <SingleTodo
          key={todo.name}
          name={todo.name}
          description={todo.description}
          isDone={todo.isDone}
        />
      ))}
    </div>
  );
};

export default Todo;
