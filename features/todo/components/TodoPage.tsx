"use client";

import React, { useEffect } from "react";
import NewTodo from "@/features/todo/components/NewTodo";
import { SingleTodo } from "@/features/todo/components/singleTodo";
import type { TodoSchema } from "@/features/todo/todoSchema";
import { useTodo } from "@/store/todostore";

const TodoPage = ({ allTodo }: { allTodo: TodoSchema[] }) => {
  const { todos, setTodos } = useTodo();

  // Initialize todos from props
  useEffect(() => {
    setTodos(allTodo);
  }, [allTodo, setTodos]);

  return (
    <div className="space-y-4 p-4">
      {/* Add new todo */}
      <NewTodo />

      {/* List all todos */}
      <div>
        {todos.map((todo) => (
          <SingleTodo key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
};

export default TodoPage;
