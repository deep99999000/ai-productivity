"use client";

// UI & form imports
import SelectComponent from "@/components/Selectcomponent";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";

// app logic imports
import { Todo } from "@/features/todo/todoSchema";
import { updatetodoData } from "@/features/todo/todoaction";
import { useTodo } from "@/features/todo/todostore";

// component props interface
interface EditTodoDialogProps {
  open: boolean;
  initialData: Todo;
  onOpenChange: (open: boolean) => void;
}

const EditTodoDialog: React.FC<EditTodoDialogProps> = ({
  open,
  initialData,
  onOpenChange,
}) => {
  // form setup with default values
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Todo>({ defaultValues: initialData });

  const { updateTodo } = useTodo();

  // local + server update
  const handleUpdate = (data: Todo) => {
    updateTodo(data); // local update
    onOpenChange(false); // close dialog
    updatetodoData(data); // backend sync
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Todo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              placeholder="Enter task name"
              {...register("name", { required: true })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              placeholder="Enter description"
              {...register("description")}
            />
          </div>

          {/* Category */}
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

          {/* Priority */}
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

          {/* Submit */}
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTodoDialog;
