"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SelectComponent from "@/components/Selectcomponent";
import { Controller, useForm } from "react-hook-form";
import { newtodoaction } from "@/features/todo/todoaction";
import type { NewTodo, TodoSchema } from "@/features/todo/todoSchema";
import { useTodo } from "@/store/todostore";
import useUser from "@/store/useUser";

const NewTodopage = () => {
  const user_id = useUser((s) => s.user); // get user ID from store
  const { addTodo } = useTodo(); // local addTodo method

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewTodo>({
    defaultValues: {
      category: "Personal",
      priority: "Low",
    },
  });

  // Submit new todo
  const onsub = async (data: NewTodo) => {
    const {
      name,
      description = "",
      category = "Personal",
      priority = "Low",
    } = data;

    const newTodo: TodoSchema = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      user_id: user_id ?? 0,
      name,
      description,
      category,
      priority,
      isDone: false,
      startDate: null,
      endDate: null,
    };

    addTodo(newTodo); // update local store
    await newtodoaction({ name, description, category, priority, user_id }); // backend sync
  };

  return (
    <form onSubmit={handleSubmit(onsub)} className="space-y-4">
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
        <Input placeholder="Enter description" {...register("description")} />
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
              deafultvalue={field.value || "Personal"}
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
              deafultvalue={field.value || "Low"}
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
  );
};

export default NewTodopage;
