"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SelectComponent from "@/components/Selectcomponent";
import { Controller, useForm } from "react-hook-form";
import { newtodoaction } from "@/features/todo/todoaction";
import type { NewTodo, Todo } from "@/features/todo/todoSchema";
import { useTodo } from "@/features/todo/todostore";
import useUser from "@/store/useUser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DateTimePicker } from "@/components/DateTimePicker";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
interface NewTodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewTodoDialog = ({ open, onOpenChange }: NewTodoDialogProps) => {
  const user_id = useUser((s) => s.user);
  const { addTodo } = useTodo();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<NewTodo>({
    defaultValues: {
      category: "Personal",
      priority: "Low",
    },
  });
  const [advanceoption, setAdvanceoption] = useState(false);

  const onSubmit = async (data: NewTodo) => {
    const {
      name,
      description = "",
      category = "Personal",
      priority = "Low",
    } = data;

    const newTodo: Todo = {
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

    addTodo(newTodo);
    onOpenChange(false);
    reset();
    await newtodoaction({ name, description, category, priority, user_id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-lg sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">
              Task Name *
            </Label>
            <Input
              id="name"
              placeholder="What needs to be done?"
              className="focus-visible:ring-2 focus-visible:ring-primary"
              {...register("name", { required: "Task name is required" })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700">
              Description
            </Label>
            <Input
              id="description"
              placeholder="Add details (optional)"
              className="focus-visible:ring-2 focus-visible:ring-primary"
              {...register("description")}
            />
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label className="text-gray-700">Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    onchangefunc={field.onChange}
                    deafultvalue={field.value}
                    allvalues={["Personal", "Goal", "Tech"]}
                  />
                )}
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-gray-700">Priority</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    onchangefunc={field.onChange}
                    deafultvalue={field.value}
                    allvalues={["Low", "Medium", "High"]}
                  />
                )}
              />
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label className="text-gray-700">Start Date</Label>
              <Controller
                name="startdate"
                control={control}
                render={({ field }) => (
                  <DateTimePicker field={field} className="w-full" />
                )}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label className="text-gray-700">End Date</Label>
              <Controller
                name="enddate"
                control={control}
                render={({ field }) => (
                  <DateTimePicker field={field} className="w-full" />
                )}
              />
            </div>
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>advance option</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Goal */}
                  <div className="space-y-2">
                    <Label className="text-gray-700">Goal</Label>
                    <Controller
                      name="goal"
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          onchangefunc={field.onChange}
                          deafultvalue={field.value}
                          allvalues={["Personal", "Goal", "Tech"]}
                        />
                      )}
                    />
                  </div>

                  {/* Subgoal */}
                  <div className="space-y-2">
                    <Label className="text-gray-700">Subgoal</Label>
                    <Controller
                      name="Subgoal"
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          onchangefunc={field.onChange}
                          deafultvalue={field.value}
                          allvalues={["Low", "Medium", "High"]}
                        />
                      )}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full  py-5 bg-primary hover:bg-primary-dark"
          >
            Create Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTodoDialog;
