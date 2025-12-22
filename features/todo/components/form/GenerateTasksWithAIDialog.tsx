// components/GenerateTasksWithAIDialog.tsx
import { Button } from "@/components/ui/button";
import BaseDialog from "@/components/BaseDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, FileText, X, Edit, Trash2, Plus, Calendar } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { generateUniqueId } from "@/lib/generateUniqueId";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useTodo } from "@/features/todo/store";
import { NewTodo, type Todo } from "@/features/todo/schema";
import GeneratedTaskCard from "./GeneratedTaskCard";
import SmartSuggestions from "../analytics/SmartSuggestions";
import TaskQualityIndicator from "../analytics/TaskQualityIndicator";
import useUser from "@/store/useUser";
import { newtodoaction } from "@/features/todo/actions";
import { API } from "@/lib/actions/getbackendurl";

// Type for AI-generated task (frontend only)
export type GeneratedTask = {
  name: string;
  description?: string;
  startDate?: string; // ISO string
  endDate: string; // ISO string
  priority?: "low" | "medium" | "high";
  category?: string;
  isDone?: boolean;
};

const GenerateTasksWithAIDialog = ({
  subgoalId,
  subgoalName,
  goalId,
}: {
  subgoalId: number;
  subgoalName: string;
  goalId?: number;
}) => {
  const { user } = useUser();
  const { addTodo } = useTodo();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isRefining, setIsRefining] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [generatedTasks, setGeneratedTasks] = React.useState<
    (GeneratedTask & { tempId: number })[]
  >([]);
  const [refinementFeedback, setRefinementFeedback] = React.useState("");

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
      // Enhanced context for better AI suggestions
      const enhancedContext = {
        name: data.name || `Tasks for "${subgoalName}"`,
        description: data.description || `Break down "${subgoalName}" into specific, actionable tasks`,
        type: "task",
        context: {
          subgoalName,
          goalId,
          hasTimeConstraints: true,
          priorityFocus: "completion",
          detailLevel: "comprehensive"
        }
      };

      const response = await axios.post<GeneratedTask[]>(
        `${API}/api/content/generate`,
        enhancedContext
      );
      console.log("AI Response:", response.data);
      
      const tasks = response.data;

      if (!Array.isArray(tasks)) {
        throw new Error("Invalid response: expected array of tasks");
      }

      const formattedTasks = tasks.map((task, index) => ({
        ...task,
        tempId: generateUniqueId(),
        priority: task.priority || (index < 2 ? "high" : index < 4 ? "medium" : "low"),
        isDone: task.isDone || false,
        category: task.category || "General",
        startDate: task.startDate || new Date().toISOString().split('T')[0],
        endDate: task.endDate || new Date(Date.now() + (index + 1) * 2 * 86400000).toISOString().split('T')[0],
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

  const refineGeneratedTasks = async () => {
    if (!refinementFeedback.trim()) {
      setError("Please provide feedback for task refinement");
      return;
    }

    setIsRefining(true);
    setError(null);

    try {
      const response = await axios.post<(GeneratedTask & { tempId: number })[]>(
        `${API}/api/content/refine`,
        {
          tasks: generatedTasks,
          feedback: refinementFeedback,
          context: {
            subgoalName,
            goalId,
            preferences: "User wants refined, more specific tasks",
            constraints: "Consider time management and practical implementation"
          }
        }
      );

      const refinedTasks = response.data;

      if (!Array.isArray(refinedTasks)) {
        throw new Error("Invalid response: expected array of refined tasks");
      }

      // Ensure all refined tasks have proper formatting
      const formattedRefinedTasks = refinedTasks.map((task) => ({
        ...task,
        startDate: task.startDate || new Date().toISOString().split('T')[0],
        endDate: task.endDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        isDone: false,
        category: task.category || "General",
        priority: task.priority || "medium",
      }));

      setGeneratedTasks(formattedRefinedTasks);
      setRefinementFeedback("");
    } catch (err: any) {
      console.error("AI Task Refinement Failed:", err);
      setError(
        err.response?.data?.message || "Failed to refine tasks. Please try again."
      );
    } finally {
      setIsRefining(false);
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
      startDate: task.startDate ? new Date(task.startDate) : new Date(),
      endDate: new Date(task.endDate),
      goal_id: goalId || null,
      subgoal_id: subgoalId,
      goalName: null,
      subgoalName,
      tags: [],
    };

    // Add to Zustand store
    addTodo(newTask, user);
    removeGeneratedTask(task.tempId);

    // Save to database
    await newtodoaction({ ...newTask, user_id: user });

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
    setRefinementFeedback("");
    reset();
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles className="w-4 h-4" />
        <span>Generate Tasks</span>
      </button>

      {/* Dialog */}
      <BaseDialog
        isOpen={isOpen}
        setisOpen={handleClose}
        title=""
        description=""
        contentClassName="w-full max-w-2xl"
      >
        <div className="max-h-[85vh] overflow-y-auto p-1">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Sparkles className="text-blue-500" size={24} />
              Generate Tasks
            </h2>
            <p className="text-gray-600 mt-2">
              Break down <strong>"{subgoalName}"</strong> into actionable tasks
            </p>
          </div>

          {/* Smart Suggestions */}
          {!generatedTasks.length && (
            <SmartSuggestions 
              subgoalName={subgoalName}
              goalId={goalId}
              existingTasks={generatedTasks}
            />
          )}

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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Additional Context (Optional)
                </Label>
                <Input
                  placeholder="e.g., time constraints, specific tools, dependencies..."
                  {...register("name")}
                  disabled={isGenerating}
                  className="h-11 px-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Tasks
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : null}

          {/* Step 2: Display Generated Tasks */}
          {generatedTasks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Generated Tasks ({generatedTasks.length})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGeneratedTasks([])}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>

              {/* Simple Refinement */}
              {generatedTasks.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={refinementFeedback}
                      onChange={(e) => setRefinementFeedback(e.target.value)}
                      placeholder="Need changes? e.g., 'make more specific', 'add time estimates'..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 outline-none"
                      disabled={isRefining}
                    />
                    <Button
                      onClick={refineGeneratedTasks}
                      disabled={isRefining || !refinementFeedback.trim()}
                      size="sm"
                      variant="outline"
                      className="px-3"
                    >
                      {isRefining ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Improve"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
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

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-100"
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