"use client";

import { SingleTodo } from "@/features/todo/components/SingleTodo";
import type { Todo } from "@/features/todo/todoSchema";

interface SubgoalTaskListProps {
  tasks:Todo[];
}

const SubgoalTaskList = ({ tasks }: SubgoalTaskListProps) => {
  return (
    <div className="space-y-3">
      {tasks.map((t) => (
        <SingleTodo key={t.id} todo={t} />
      ))}
    </div>
  );
};

export default SubgoalTaskList;
