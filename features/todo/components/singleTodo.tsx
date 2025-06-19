"use client";

import React, { useState } from "react";
import { TodoSchema } from "@/features/todo/components/todoSchema";
import { updateTodosStatus } from "@/features/todo/todoaction";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import EditTodoDialog from "@/features/todo/components/EditTodoDialog";
import { ShowDate } from "@/components/ShowDate";

interface SingleTodoProps {
  todo: TodoSchema;
}

export const SingleTodo: React.FC<SingleTodoProps> = ({ todo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [checked, setChecked] = useState(!!todo.isDone);
  const [todoData, setTodoData] = useState<TodoSchema>(todo);

  const {
    user_id,
    id,
    name,
    description,
    category,
    priority,
    startDate,
    endDate,
  } = todoData;

  const handleCheck = async () => {
    const newStatus = !checked;
    setChecked(newStatus);
    await updateTodosStatus(user_id,id,newStatus);
  };

  return (
    <div className="border p-4 rounded-md space-y-2">
      <p><strong>Name:</strong> {name}</p>
      <p><strong>Description:</strong> {description}</p>
      <p><strong>Category:</strong> {category}</p>
      <p><strong>Priority:</strong> {priority}</p>

      {startDate && <ShowDate label="Start" date={startDate} />}
      {endDate && <ShowDate label="End" date={endDate} />}

      <div className="flex items-center gap-2">
        <input type="checkbox" checked={checked} onChange={handleCheck} />
        <label>Mark as Done</label>
      </div>

      <Button onClick={() => setIsEditing(true)}>Edit Todo</Button>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <EditTodoDialog
          initialData={todoData}
          onUpdate={(updated) => {
            setTodoData(updated);
            setIsEditing(false);
          }}
        />
      </Dialog>
    </div>
  );
};

