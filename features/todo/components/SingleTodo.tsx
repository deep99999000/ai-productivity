"use client";

import React, { useState } from "react";
import { Todo } from "@/features/todo/todoSchema";
import { updateTodosStatus, deleteTodoFromdb } from "@/features/todo/todoaction";
import { Button } from "@/components/ui/button";
import EditTodoDialog from "./EditTodoDialog";
import { ShowDate } from "@/components/ShowDate";
import { useTodo } from "@/features/todo/todostore";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const SingleTodo = ({ todo }: { todo: Todo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toggleTodo, deleteTodo } = useTodo();

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
    goalName,
    subgoalName
  } = todo;

  // Toggle completion status
  const handleToggle = async () => {
    toggleTodo(id); // local toggle
    await updateTodosStatus(user_id, id, !isDone); // backend update
  };

  //Delete todo
  const handleDelete = (id: number) => {
    deleteTodo(id) //local delete
    deleteTodoFromdb(id) //remove from db
  };
  

  return (
    <div
      className={cn(
        "relative group rounded-xl border border-gray-6 bg-background p-4 shadow-sm transition-all hover:shadow-md",
        isDone && "opacity-70"
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: Checkbox + Title + Description */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isDone!!}
              onCheckedChange={handleToggle}
              className="mt-0.5"
            />
            <h2
              className={cn(
                "text-base font-semibold leading-tight",
                isDone && "line-through text-muted-foreground"
              )}
            >
              {name}
            </h2>
          </div>

          {description && (
            <p className="pl-6 text-sm text-muted-foreground leading-snug">
              {description}
            </p>
          )}
        </div>

        {/* Right: Edit + Delete buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-500"
            onClick={() => handleDelete(id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metadata: badges + dates */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="outline" color="green">{category}</Badge>
        <Badge variant="primary">{priority}</Badge>
        {goalName && <Badge variant="primary">{goalName}</Badge>}
        {subgoalName && <Badge variant="secondary">{subgoalName}</Badge>}
        {startDate && <ShowDate label="Start" date={startDate} />}
        {endDate && <ShowDate label="End" date={endDate} />}
      </div>
      {/* Edit dialog */}
      <EditTodoDialog
        initialData={todo}
        open={isEditing}
        onOpenChange={setIsEditing}
      />
    </div>
  );
};
