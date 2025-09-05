// components/GenerateSubgoalWithAIDialog.tsx
import { Button } from "@/components/ui/button";
import BaseDialog from "@/components/BaseDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Sparkles, FileText, X, Edit, Trash2, Plus, Calendar } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { generateUniqueId } from "@/lib/generateUniqueId";
import { newSubGoalsAction } from "@/features/goals/goalaction"; // Ensure this exists
 // Correct import
import useUser from "@/store/useUser";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Subgoal, NewSubgoal } from "@/features/subGoals/subGoalschema"; // Adjust path if needed
import GeneratedSubgoalCard from "./GeneratedSubgoalCard";
import { useSubgoal } from "@/features/subGoals/subgoalStore";

export type GeneratedSubgoal = {
  name: string;
  description?: string;
  endDate: string;
  status: string; // e.g., "not_started", "in_progress", "completed"
  isdone: boolean;
};

const GenerateSubgoalWithAIDialog = ({ goalId }: { goalId: number }) => {
  const { user } = useUser();
  const { addSubgoal } = useSubgoal(); // Using your Zustand store
  const [isOpen, setIsOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [generatedSubgoals, setGeneratedSubgoals] = React.useState<
    (GeneratedSubgoal & { tempId: number })[] // Use `tempId` for frontend only
  >([]);

  const { register, handleSubmit, reset } = useForm<{
    name: string;
    description?: string;
  }>({
    defaultValues: { name: "", description: "" },
  });
  useEffect(() => {
    console.log("goal",goalId);
  }, [])
  

  const onSubmit = async (data: { name: string; description?: string }) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedSubgoals([]);

    try {
      const response = await axios.post<{ content: GeneratedSubgoal[] }>(
        "http://localhost:3000/api/content/generate",
        {
          name: data.name,
          description: data.description,
          type: "subgoals"
        }
      );
console.log("AI Response:", response.data);

      const subgoals = response.data;

      if (!Array.isArray(subgoals)) {
        throw new Error("Invalid response: expected array of subgoals");
      }

      const formattedSubgoals = subgoals.map((subgoal) => ({
        ...subgoal,
        tempId: generateUniqueId(), // frontend-only ID
        status: subgoal.status || "not_started",
        isdone: subgoal.isdone || false,
        endDate: subgoal.endDate || new Date(Date.now() + 7 * 86400000).toISOString(), // default +1 week
      }));
      console.log(formattedSubgoals);
      setGeneratedSubgoals(formattedSubgoals);
    } catch (err: any) {
      console.error("AI Subgoal Generation Failed:", err);
      setError(
        err.response?.data?.message || "Failed to generate subgoals. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const saveSubgoal = async (
    subgoal: GeneratedSubgoal & { tempId: number }
  ) => {
    const id = generateUniqueId()
    // Convert to database-ready NewSubgoal
    const newSubgoal: NewSubgoal = {
      id,
      name: subgoal.name,
      description: subgoal.description,
      status: subgoal.status,
      isdone: subgoal.isdone,
      goal_id: goalId,
      user_id: user,
      endDate: new Date(subgoal.endDate),
    };
    console.log("Saving subgoal:", newSubgoal);
    // Add to Zustand store
    addSubgoal(newSubgoal, user, goalId, id);

    removeGeneratedSubgoal(subgoal.tempId);

    //Save to database
    await newSubGoalsAction(newSubgoal);
    console.log("Saved subgoal:", id);
  };

  const removeGeneratedSubgoal = (tempId: number) => {
    setGeneratedSubgoals((prev) => prev.filter((sg) => sg.tempId !== tempId));
  };

  const editSubgoal = (tempId: number, updates: Partial<GeneratedSubgoal>) => {
    setGeneratedSubgoals((prev) =>
      prev.map((sg) => (sg.tempId === tempId ? { ...sg, ...updates } : sg))
    );
  };

  const handleClose = () => {
    setIsOpen(false);
    setGeneratedSubgoals([]);
    setError(null);
    reset();
  };

  return (
    <>
      <button
        type="button"
        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12 group-hover:scale-110" />
        <span className="whitespace-nowrap font-semibold">Generate Subgoals with AI</span>
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
              AI Subgoal Generator
            </h2>
            <p className="text-gray-500 mt-2">
              Describe the focus area, and AI will break it into actionable subgoals.
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
          {!generatedSubgoals.length ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Input
                  placeholder="e.g., Master React hooks"
                  {...register("name", { required: true })}
                  disabled={isGenerating}
                  className="h-12 px-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Describe the subgoal..."
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
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : null}

          {/* Step 2: Display Generated Subgoals */}
          {generatedSubgoals.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Sparkles className="text-purple-500" />
                  Generated Subgoals
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGeneratedSubgoals([])}
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  <X className="w-3 h-3 mr-1" />
                  Start Over
                </Button>
              </div>

              <div className="space-y-4">
                {generatedSubgoals.map((subgoal) => (
                  <GeneratedSubgoalCard
                    key={subgoal.tempId}
                    subgoal={subgoal}
                    onEdit={editSubgoal}
                    onRemove={removeGeneratedSubgoal}
                    onSave={(saved) => saveSubgoal(saved)}
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

export default GenerateSubgoalWithAIDialog;