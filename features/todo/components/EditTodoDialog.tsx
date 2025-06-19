"use client";

import SelectComponent from "@/components/Selectcomponent";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { TodoSchema } from "@/features/todo/components/todoSchema";
import { updatetodoData } from "@/features/todo/todoaction";

interface EditTodoDialogProps {
  initialData: TodoSchema;
  onUpdate: (updatedTodo: TodoSchema) => void;
}

const EditTodoDialog: React.FC<EditTodoDialogProps> = ({
  initialData,
  onUpdate,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TodoSchema>({
    defaultValues: {
      ...initialData,
      name: initialData.name || "",
      description: initialData.description || "",
      category: initialData.category || "",
      priority: initialData.priority || "",
    },
  });

  const handleUpdate = (data: TodoSchema) => {
    onUpdate(data);
    updatetodoData(data)
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Update Todo</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input
            placeholder="Enter task name"
            {...register("name", { required: true })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Input
            placeholder="Enter description"
            {...register("description")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <SelectComponent
                onchangefunc={field.onChange}
                deafultvalue={field.value || ""}
                allvalues={["Personal", "Goal", "Tech"]}
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <SelectComponent
                onchangefunc={field.onChange}
                deafultvalue={field.value || ""} 
                allvalues={["Low", "Medium", "High"]}
              />
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </DialogContent>
  );
};

export default EditTodoDialog;
