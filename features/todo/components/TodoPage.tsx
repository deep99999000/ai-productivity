"use client";

import React, { useEffect, useState } from "react";
import { Todo } from "@/features/todo/todoSchema";
import { useTodo } from "@/features/todo/todostore";
import NewTodo from "@/features/todo/components/NewTodo";
import { SingleTodo } from "@/features/todo/components/SingleTodo";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const TodoPage = ({ allTodo }: { allTodo: Todo[] }) => {
  const { todos, setTodos } = useTodo();
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [search, setsearch] = useState("");

  useEffect(() => {
    setTodos(allTodo);
  }, [allTodo, setTodos]);
  useEffect(() => {
    console.log(search);
  }, [search]);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Todos</h1>
        <div className="flex  gap-3">
          <Input
            placeholder="search todo"
            onChange={(e) => setsearch(e.target.value)}
            className="w-full sm:w-64 rounded-lg"
          />
          <Button onClick={() => setIsNewOpen(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Todo
          </Button>
        </div>
      </div>

      {/* New Todo Dialog */}
      {isNewOpen && <NewTodo open={isNewOpen} onOpenChange={setIsNewOpen} />}

      {/* Todo List */}
      <div className="space-y-4">
        {todos.length > 0 ? (
          todos
            .filter((todo: Todo) =>
              search
                ? todo.name.toLowerCase().includes(search.toLowerCase())
                : true
            )
            .map((todo: Todo) => <SingleTodo key={todo.id} todo={todo} />)
        ) : (
          <p className="text-sm text-muted-foreground">
            No todos found. Add one!
          </p>
        )}
      </div>
    </div>
  );
};

export default TodoPage;
