// components/GenerateTasksWithAIDialog.tsx
import { Button } from "@/components/ui/button";
import BaseDialog from "@/components/BaseDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Sparkles, FileText, X, Edit, Trash2, Plus, Calendar } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { generateUniqueId } from "@/lib/generateUniqueId";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useTodo } from "@/features/todo/todostore";
import { NewTodo, type Todo } from "@/features/todo/todoSchema";
import GeneratedTaskCard from "./GeneratedTaskCard";
import useUser from "@/store/useUser";

// Type for AI-generated task (frontend only)
export type GeneratedTask = {
  name: string;
  description?: string;
  endDate: string; // ISO string
  priority?: "low" | "medium" | "high";
  category?: string;
  isDone?: boolean;
};

const GenerateTasksWithAIDialog = ({
  subgoalId,
  subgoalName,
}: {
  subgoalId: number;
  subgoalName: string;
}) => {
  const { user } = useUser();
  const { addTodo } = useTodo();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [generatedTasks, setGeneratedTasks] = React.useState<
    (GeneratedTask & { tempId: number })[]
  >([]);

  const { register, handleSubmit, reset } = useForm<{
    name?: string;
    description?: string;
  }>({
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    console.log("Subgoal:", subgoalName);
  }, [subgoalName]);

  const onSubmit = async (data: { name?: string; description?: string }) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedTasks([]);

    try {
      const response = await axios.post<{ content: GeneratedTask[] }>(
        "http://localhost:3000/api/content/generate",
        {
          name: data.name,
          description: data.description,
          type: "task",
        }
      );
      console.log("AI Response:", response.data);
      
      const tasks = response.data;

      if (!Array.isArray(tasks)) {
        throw new Error("Invalid response: expected array of tasks");
      }

      const formattedTasks = tasks.map((task) => ({
        ...task,
        tempId: generateUniqueId(),
        priority: task.priority || "medium",
        isDone: task.isDone || false,
        endDate: task.endDate || new Date(Date.now() + 3 * 86400000).toISOString(), // default +3 days
      }));

      setGeneratedTasks(formattedTasks);
    } catch (err: any) {
      console.error("AI Task Generation Failed:", err);
      setError(
        err.response?.data?.message || "Failed to generate tasks. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const saveTask = async (task: GeneratedTask & { tempId: number }) => {
    const id = generateUniqueId();

    const newTask: Todo = {
      id,
      name: task.name,
      description: task.description || "",
      user_id: user,
      isDone: task.isDone ?? false,
      category: task.category || "General",
      priority: task.priority || "medium",
      startDate: new Date(),
      endDate: new Date(task.endDate),
      goal_id: null,
      subgoal_id: subgoalId,
      goalName: null,
      subgoalName,
    };

    // Add to Zustand store
    addTodo(newTask, user);
    removeGeneratedTask(task.tempId);

    // Optional: Save to DB (implement this if you have the action)
    // await newTodoAction(newTask); // ← You may create this later

    console.log("Saved task:", id);
  };

  const removeGeneratedTask = (tempId: number) => {
    setGeneratedTasks((prev) => prev.filter((t) => t.tempId !== tempId));
  };

  const editTask = (tempId: number, updates: Partial<GeneratedTask>) => {
    setGeneratedTasks((prev) =>
      prev.map((t) => (t.tempId === tempId ? { ...t, ...updates } : t))
    );
  };

  const handleClose = () => {
    setIsOpen(false);
    setGeneratedTasks([]);
    setError(null);
    reset();
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12 group-hover:scale-110" />
        <span className="whitespace-nowrap font-semibold">Generate Tasks with AI</span>
      </button>

      {/* Dialog */}
      <BaseDialog
        isOpen={isOpen}
        setisOpen={handleClose}
        title=""
        description=""
        contentClassName="w-full max-w-[60vw] lg:max-w-lg"
      >
        <div className="max-h-[80vh] overflow-y-auto px-1">
          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-3xl font-bold flex items-center justify-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500">
              <Sparkles className="text-purple-500" size={32} />
              AI Task Generator
            </h2>
            <p className="text-gray-500 mt-2">
              AI will break <strong>"{subgoalName}"</strong> into actionable tasks.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between shadow-sm">
              <span className="flex items-center gap-2">
                <X className="w-4 h-4" />
                <span>{error}</span>
              </span>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 1: Input Form */}
          {!generatedTasks.length ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Input
                  placeholder="e.g., 5 hours/week, tools used, dependencies..."
                  {...register("name")}
                  disabled={isGenerating}
                  className="h-12 px-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Describe the task..."
                  {...register("description")}
                  disabled={isGenerating}
                  className="h-12 px-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                />
              </div>
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 hover:opacity-90 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Tasks with AI
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : null}

          {/* Step 2: Display Generated Tasks */}
          {generatedTasks.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Sparkles className="text-purple-500" />
                  Generated Tasks
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGeneratedTasks([])}
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  <X className="w-3 h-3 mr-1" />
                  Start Over
                </Button>
              </div>

              <div className="space-y-4">content
                {generatedTasks.map((task) => (
                  <GeneratedTaskCard
                    key={task.tempId}
                    task={task}
                    onEdit={editTask}
                    onRemove={removeGeneratedTask}
                    onSave={(saved) => saveTask(saved)}
                  />
                ))}
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </BaseDialog>
    </>
  );
};

export default GenerateTasksWithAIDialog;