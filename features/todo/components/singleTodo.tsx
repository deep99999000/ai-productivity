"use client";

// Component: SingleTodo
import React, { useState } from "react";
import { TodoSchema } from "@/features/todo/todoSchema";
import { updateTodosStatus } from "@/features/todo/todoaction";
import { Button } from "@/components/ui/button";
import EditTodoDialog from "./EditTodoDialog";
import { ShowDate } from "@/components/ShowDate";
import { useTodo } from "@/store/todostore";

export const SingleTodo = ({ todo }: { todo: TodoSchema }) => {
  const [isEditing, setIsEditing] = useState(false);

  const {
    id,
    user_id,
    name,
    description,
    category,
    priority,
    startDate,
    endDate,
    isDone,
  } = todo;

  const { toggleTodo } = useTodo();

  // Toggle completion status
  const handleToggle = async () => {
    toggleTodo(id); // local toggle
    await updateTodosStatus(user_id, id, !isDone); // backend update
  };

  return (
    <div className="rounded-md border p-4 space-y-2">
      <p>{name}</p>
      <p>{description}</p>
      <p>{category}</p>
      <p>{priority}</p>

      {/* Dates */}
      {startDate && <ShowDate label="Start" date={startDate} />}
      {endDate && <ShowDate label="End" date={endDate} />}

      {/* Done checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(isDone)}
          onChange={handleToggle}
        />
        <label>Mark as Done</label>
      </div>

      {/* Edit Todo dialog */}
      <Button onClick={() => setIsEditing(true)}>Edit Todo</Button>
      <EditTodoDialog
        initialData={todo}
        open={isEditing}
        onOpenChange={setIsEditing}
      />
    </div>
  );
};
