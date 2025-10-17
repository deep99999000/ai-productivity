"use client";

import React, { useState } from "react";
import BaseDialog from "@/components/BaseDialog";
import { DateTimePicker } from "@/components/DateTimePicker";
import SelectComponent from "@/components/Selectcomponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { newSubGoalsAction } from "@/features/goals/actions/goalaction";
import type { NewSubgoal } from "@/features/subGoals/subGoalschema";
import { useSubgoal } from "@/features/subGoals/subgoalStore";
import { useTodo } from "@/features/todo/todostore";
import { newtodoaction } from "@/features/todo/todoaction";
import type { Todo } from "@/features/todo/todoSchema";
import useUser from "@/store/useUser";
import { Label } from "@radix-ui/react-label";
import { Target, Sparkles, Calendar, Tag, FileText, Loader2, Wand2, Brain, Zap } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { generateUniqueId } from "@/lib/generateUniqueId";
import { STATUS_OPTIONS } from "@/features/subGoals/components/StatusConfig";
import axios from "axios";
import { API } from "@/lib/actions/getbackendurl";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  goal_id: string;
}

const NewSubGoalDialog: React.FC<Props> = ({ isOpen, setIsOpen, goal_id }) => {
  const { register, control, handleSubmit, reset, setValue } = useForm<NewSubgoal>({
    defaultValues: {
      name: "",
      description: "",
      status: "Not Started",
      endDate: new Date(),
    },
  });

  const { user } = useUser();
  const { addSubgoal } = useSubgoal();
  const { addTodo } = useTodo();

  // Loading states
  const [loadingName, setLoadingName] = useState(false);
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [generateTasksEnabled, setGenerateTasksEnabled] = useState(true);
  const [taskGenerationStatus, setTaskGenerationStatus] = useState<string | null>(null);

  // Refine Name API
  const refineName = async (name: string) => {
    try {
      setLoadingName(true);
      const res = await axios.post("/api/content/refine/name", { type: "subgoal", name });
      if (res.data?.refinedName) setValue("name", res.data.refinedName);
    } catch (err) {
      console.error("Refine name error:", err);
    } finally {
      setLoadingName(false);
    }
  };

  // Refine Description API
  const refineDescription = async (description: string) => {
    try {
      setLoadingDesc(true);
      const res = await axios.post("/api/content/refine/description", {
        type: "subgoal",
        description,
      });
      if (res.data?.refinedDescription) setValue("description", res.data.refinedDescription);
    } catch (err) {
      console.error("Refine description error:", err);
    } finally {
      setLoadingDesc(false);
    }
  };

  // Generate AI tasks for the milestone
  const generateAITasks = async (subgoalName: string, subgoalDescription: string, subgoalId: number) => {
    try {
      setIsGeneratingTasks(true);
      setTaskGenerationStatus("Generating AI tasks...");
      
      const enhancedContext = {
        name: `Tasks for "${subgoalName}"`,
        description: `Break down "${subgoalName}" into specific, actionable tasks. ${subgoalDescription}`,
        type: "task",
        context: {
          subgoalName,
          goalId: Number(goal_id),
          hasTimeConstraints: true,
          priorityFocus: "completion",
          detailLevel: "comprehensive"
        }
      };

      const response = await axios.post(`${API}/api/content/generate`, enhancedContext);
      const tasks = response.data;

      if (!Array.isArray(tasks)) {
        throw new Error("Invalid response: expected array of tasks");
      }

      setTaskGenerationStatus(`Saving ${tasks.length} tasks...`);

      // Save generated tasks to database and store
      for (const task of tasks) {
        const taskId = generateUniqueId();
        
        const newTask: Todo = {
          id: taskId,
          name: task.name,
          description: task.description || "",
          user_id: user,
          isDone: false,
          category: task.category || "General",
          priority: task.priority || "medium",
          startDate: task.startDate ? new Date(task.startDate) : new Date(),
          endDate: new Date(task.endDate),
          goal_id: Number(goal_id),
          subgoal_id: subgoalId,
          goalName: null,
          subgoalName: subgoalName,
        };

        // Add to Zustand store
        addTodo(newTask, user);
        
        // Save to database
        await newtodoaction({ ...newTask, user_id: user });
      }

      setTaskGenerationStatus(`Successfully generated ${tasks.length} AI tasks!`);
      console.log(`Generated ${tasks.length} AI tasks for milestone: ${subgoalName}`);
      
      // Clear status after delay
      setTimeout(() => setTaskGenerationStatus(null), 2000);
    } catch (error) {
      console.error("Failed to generate AI tasks:", error);
      setTaskGenerationStatus("Failed to generate AI tasks");
      // Clear error status after delay
      setTimeout(() => setTaskGenerationStatus(null), 3000);
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  // Submit
  const onSub = async (data: NewSubgoal) => {
    const id = generateUniqueId();
    const isdone = data.status === "Completed";

    const subgoalWithId = { ...data, id, user_id: user, goal_id: Number(goal_id), isdone };

    // Create the milestone first
    addSubgoal(subgoalWithId, user, Number(goal_id), id);
    await newSubGoalsAction(subgoalWithId);

    // Generate AI tasks if enabled
    if (generateTasksEnabled && data.name.trim()) {
      await generateAITasks(data.name, data.description || "", id);
    }

    setIsOpen(false);
    reset();
    setGenerateTasksEnabled(true); // Reset for next time
    setTaskGenerationStatus(null); // Clear any status messages
  };

  return (
    <BaseDialog isOpen={isOpen} setisOpen={setIsOpen} title="" description="">
      <div className="text-center mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Create New Milestone</h2>
        <p className="text-gray-600">Set your target and track your progress</p>
        
        {/* AI Generation Suggestion */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="text-gray-700">
              Need inspiration? Try our 
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="font-semibold text-blue-600 hover:text-blue-800 mx-1 underline"
              >
                AI Subgoal Generator
              </button>
              for smart suggestions!
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSub)} className="space-y-5">
        {/* Subgoal Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            Milestone Name *
          </Label>
          <div className="relative w-full">
            <Input
              id="name"
              placeholder="What do you want to achieve?"
              {...register("name", { required: true })}
              className="h-11 px-4 pr-12 w-full border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={async () => {
                const current = (document.getElementById("name") as HTMLInputElement)?.value;
                if (current) await refineName(current);
              }}
              disabled={loadingName}
              className="absolute right-2 top-2 h-8 w-8 p-0 rounded-lg 
                         bg-gradient-to-r from-blue-500 to-purple-600 
                         hover:from-blue-600 hover:to-purple-700 text-white shadow-md 
                         hover:shadow-lg transition-all duration-200 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              title="Enhance with AI"
            >
              {loadingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            Description
          </Label>
          <div className="relative w-full">
            <textarea
              id="description"
              placeholder="Add details about your milestone"
              {...register("description")}
              rows={3}
              className="px-4 py-2 flex-1 border-2 border-gray-200 rounded-lg 
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
                         transition-all duration-200 resize-none w-full"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={async () => {
                const current = (document.getElementById("description") as HTMLTextAreaElement)?.value;
                if (current) await refineDescription(current);
              }}
              disabled={loadingDesc}
              className="absolute right-2 top-2 h-8 w-8 p-0 rounded-lg 
                         bg-gradient-to-r from-blue-500 to-purple-600 
                         hover:from-blue-600 hover:to-purple-700 text-white shadow-md 
                         hover:shadow-lg transition-all duration-200 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              title="Enhance with AI"
            >
              {loadingDesc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* AI Task Generation Option */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="generateTasks"
              checked={generateTasksEnabled}
              onCheckedChange={(checked) => setGenerateTasksEnabled(checked === true)}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              disabled={isGeneratingTasks}
            />
            <div className="flex-1">
              <Label 
                htmlFor="generateTasks" 
                className="text-sm font-semibold text-gray-700 flex items-center gap-2 cursor-pointer"
              >
                <Brain className="w-4 h-4 text-blue-500" />
                Generate AI Tasks for this Milestone
                {isGeneratingTasks && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                Automatically create actionable tasks using AI to help you achieve this milestone
              </p>
              {taskGenerationStatus && (
                <p className={`text-xs mt-2 font-medium ${
                  taskGenerationStatus.includes('Failed') 
                    ? 'text-red-600' 
                    : taskGenerationStatus.includes('Successfully') 
                    ? 'text-green-600' 
                    : 'text-blue-600'
                }`}>
                  {taskGenerationStatus}
                </p>
              )}
            </div>
            <Zap className="w-5 h-5 text-purple-500" />
          </div>
        </div>

        {/* Status & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-500" />
              Status
            </Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <SelectComponent onchangefunc={field.onChange} deafultvalue={field.value} allvalues={STATUS_OPTIONS} />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-500" />
              Target Date
            </Label>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => <DateTimePicker label="endDate" setDate={field.onChange} date={field.value} />}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setTaskGenerationStatus(null);
            }}
            className="sm:order-1 px-6 py-2.5 rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isGeneratingTasks}
            className="sm:order-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingTasks ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Milestone & Tasks...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Create Milestone
              </>
            )}
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
};

export default NewSubGoalDialog;
