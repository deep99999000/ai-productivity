// components/GenerateGoalsWithAIDialog.tsx
import { Button } from "@/components/ui/button";
import BaseDialog from "@/components/BaseDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Sparkles, FileText, X, Edit, Trash2, Plus, Calendar } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { generateUniqueId } from "@/lib/generateUniqueId";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card"; // Make sure this exists
import { NewGoal } from "@/features/goals/types/goalSchema"; // Ensure this imports $inferInsert
import GeneratedGoalCard from "./GeneratedGoalCard";
import useUser from "@/store/useUser";
import { useGoal } from "@/features/goals/store/GoalStore";
import { newGoalsAction } from "@/features/goals/actions/goalaction";
import { API } from "@/lib/actions/getbackendurl";

// Type for AI-generated goal (frontend only)
export type GeneratedGoal = {
  name: string;
  description?: string;
  endDate: string; // ISO string
  category?: string;
};

const GenerateGoalsWithAIDialog = () => {
  const { user } = useUser();
  const { addGoal } = useGoal(); // Zustand store for goals
  const [isOpen, setIsOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [generatedGoals, setGeneratedGoals] = React.useState<
    (GeneratedGoal & { tempId: number })[]
  >([]);

  const { register, handleSubmit, reset } = useForm<{
    theme: string;
    context?: string;
    description?: string;
  }>({
    defaultValues: { theme: "", context: "", description: "" },
  });

  const onSubmit = async (data: { theme: string; context?: string; description?: string }) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedGoals([]);

    try {
      const response = await axios.post<{ content: GeneratedGoal[] }>(
        `${API}/api/content/generate`,
        {
          name: data.theme,
          description: data.description,
          type: "goals",
        }
      );
      console.log(response);
      const goals = response.data;

      if (!Array.isArray(goals)) {
        throw new Error("Invalid response: expected array of goals");
      }
      const formattedGoals = goals.map((goal) => ({
        ...goal,
        tempId: generateUniqueId(),
        endDate: goal.endDate || new Date(Date.now() + 90 * 86400000).toISOString(), // default +90 days
        category: goal.category || "General",
      }));

      setGeneratedGoals(formattedGoals);
     // Save to DB if needed
    } catch (err: any) {
      console.error("AI Goal Generation Failed:", err);
      setError(
        err.response?.data?.message || "Failed to generate goals. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const saveGoal = async (goal: GeneratedGoal & { tempId: number }) => {
    const id = generateUniqueId();

    const newGoal: NewGoal = {
      id,
      name: goal.name,
      description: goal.description,
      user_id: user,
      status: "Not Started",
      category: goal.category || "General",
      endDate: new Date(goal.endDate),
    };

    // Save to Zustand
    addGoal(newGoal);
     newGoalsAction(newGoal); 
    // Optional: Save to DB later with action like `newGoalAction(newGoal)`
    console.log("Saved goal:", id);
  };

  const removeGeneratedGoal = (tempId: number) => {
    setGeneratedGoals((prev) => prev.filter((g) => g.tempId !== tempId));
  };

  const editGoal = (tempId: number, updates: Partial<GeneratedGoal>) => {
    setGeneratedGoals((prev) =>
      prev.map((g) => (g.tempId === tempId ? { ...g, ...updates } : g))
    );
  };

  const handleClose = () => {
    setIsOpen(false);
    setGeneratedGoals([]);
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
        <span className="whitespace-nowrap font-semibold">Generate Goals with AI</span>
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
              AI Goal Generator
            </h2>
            <p className="text-gray-500 mt-2">
              Describe your focus area, and AI will suggest meaningful long-term goals.
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
          {!generatedGoals.length ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  Focus Area or Theme
                </Label>
                <Input
                  placeholder="e.g., Career growth, Fitness, Learn AI"
                  {...register("theme", { required: true })}
                  disabled={isGenerating}
                  className="h-12 px-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Additional Context (Optional)
                </Label>
                <Input
                  placeholder="Time available, experience level, tools..."
                  {...register("context")}
                  disabled={isGenerating}
                  className="h-12 px-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Description (Optional)
                </Label>
                <Input
                  placeholder="Describe your goal in detail..."
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
                      Generate Goals with AI
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : null}

          {/* Step 2: Display Generated Goals */}
          {generatedGoals.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Sparkles className="text-purple-500" />
                  Generated Goals
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGeneratedGoals([])}
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  <X className="w-3 h-3 mr-1" />
                  Start Over
                </Button>
              </div>

              <div className="space-y-4">
                {generatedGoals.map((goal) => (
                  <GeneratedGoalCard
                    key={goal.tempId}
                    goal={goal}
                    onEdit={editGoal}
                    onRemove={removeGeneratedGoal}
                    onSave={(saved) => saveGoal(saved)}
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

export default GenerateGoalsWithAIDialog;