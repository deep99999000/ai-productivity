import { Button } from "@/components/ui/button";
import NewTodoDialog from "@/features/todo/components/NewTodo";
import { useDialog } from "@/hooks/usedialog";
import { Plus } from "lucide-react";
import React from "react";

type NewTaskButtonProps = {
  subgoal_id: number;
  children?: React.ReactNode;
};

const NewTaskButtonForGoal = ({ subgoal_id, children }: NewTaskButtonProps) => {
  const { open, isOpen, close } = useDialog();

  return (
    <>
      <div onClick={open} className="inline-block">
        {children ? (
          children
        ) : (
            <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border text-gray-600 hover:bg-gray-100"><Plus className="w-3 h-3"/> Task</button>
        )}
      </div>

      <NewTodoDialog
        isOpen={isOpen}
        setIsOpen={close}
        defaultSubgoalId={subgoal_id}
      />
    </>
  );
};

export default NewTaskButtonForGoal;
