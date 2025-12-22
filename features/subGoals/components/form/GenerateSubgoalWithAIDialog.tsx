// components/GenerateSubgoalWithAIDialog.tsx
import { Button } from "@/components/ui/button";
import BaseDialog from "@/components/BaseDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Sparkles, FileText, X, Edit, Trash2, Plus, Calendar, Brain, Target, TrendingUp, Zap } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { generateUniqueId } from "@/lib/generateUniqueId";
import { newSubGoalsAction } from "@/features/goals/actions"; // Ensure this exists
 // Correct import
import useUser from "@/store/useUser";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Subgoal, NewSubgoal } from "@/features/subGoals/schema"; // Adjust path if needed
import GeneratedSubgoalCard from "./GeneratedSubgoalCard";
import SubgoalQualityIndicator from "../analytics/SubgoalQualityIndicator";
import SmartSubgoalSuggestions from "../analytics/SmartSubgoalSuggestions";
import { useSubgoal } from "@/features/subGoals/store";
import { API } from "@/lib/actions/getbackendurl";

export type GeneratedSubgoal = {
  name: string;
  description?: string;
  endDate: string;
  status: string; // e.g., "not_started", "in_progress", "completed"
  isdone: boolean;
};

const GenerateSubgoalWithAIDialog = ({ goalId, goalName }: { goalId: number; goalName?: string }) => {
  const { user } = useUser();
  const { addSubgoal } = useSubgoal(); // Using your Zustand store
  const [isOpen, setIsOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isRefining, setIsRefining] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [generatedSubgoals, setGeneratedSubgoals] = React.useState<
    (GeneratedSubgoal & { tempId: number })[] // Use `tempId` for frontend only
  >([]);
  const [refinementFeedback, setRefinementFeedback] = React.useState("");

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
      // Enhanced context for better AI suggestions
      const enhancedContext = {
        name: data.name,
        description: data.description || `Break down "${data.name}" into specific, achievable milestones`,
        type: "subgoals",
        context: {
          goalId,
          hasTimeConstraints: true,
          priorityFocus: "progression",
          detailLevel: "comprehensive"
        }
      };

      const response = await axios.post<GeneratedSubgoal[]>(
        `${API}/api/content/generate`,
        enhancedContext
      );
      console.log("AI Response:", response.data);

      const subgoals = response.data;

      if (!Array.isArray(subgoals)) {
        throw new Error("Invalid response: expected array of subgoals");
      }

      const formattedSubgoals = subgoals.map((subgoal, index) => ({
        ...subgoal,
        tempId: generateUniqueId(), // frontend-only ID
        status: subgoal.status || "not_started",
        isdone: subgoal.isdone || false,
        endDate: subgoal.endDate || new Date(Date.now() + (index + 1) * 14 * 86400000).toISOString().split('T')[0], // Stagger by 2 weeks
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

  const refineGeneratedSubgoals = async () => {
    if (!refinementFeedback.trim()) {
      setError("Please provide feedback for subgoal refinement");
      return;
    }

    setIsRefining(true);
    setError(null);

    try {
      const response = await axios.post<(GeneratedSubgoal & { tempId: number })[]>(
        `${API}/api/content/refine/subgoals`,
        {
          subgoals: generatedSubgoals,
          feedback: refinementFeedback,
          context: {
            goalId,
            preferences: "User wants refined, more specific subgoals",
            constraints: "Consider logical progression and realistic timeframes"
          }
        }
      );

      const refinedSubgoals = response.data;

      if (!Array.isArray(refinedSubgoals)) {
        throw new Error("Invalid response: expected array of refined subgoals");
      }

      // Ensure all refined subgoals have proper formatting
      const formattedRefinedSubgoals = refinedSubgoals.map((subgoal) => ({
        ...subgoal,
        endDate: subgoal.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      }));

      setGeneratedSubgoals(formattedRefinedSubgoals);
      setRefinementFeedback("");
    } catch (err: any) {
      console.error("AI Subgoal Refinement Failed:", err);
      setError(
        err.response?.data?.message || "Failed to refine subgoals. Please try again."
      );
    } finally {
      setIsRefining(false);
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
    setRefinementFeedback("");
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
        <span className="whitespace-nowrap font-semibold">Generate Milestones with AI</span>
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
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Milestone Generator</h2>
                <p className="text-sm text-gray-600">For: <span className="font-semibold text-blue-700">{goalName || "Your Goal"}</span></p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Let AI break down your goal into achievable milestones with smart timelines and clear deliverables.
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
            <div className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    What aspect of "{goalName}" would you like to break down?
                  </Label>
                  <Input
                    placeholder={`e.g., Learning phase of ${goalName || 'your goal'}`}
                    {...register("name", { required: true })}
                    disabled={isGenerating}
                    className="h-12 px-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Additional context (optional)
                  </Label>
                  <Input
                    placeholder="Any specific requirements or constraints..."
                    {...register("description")}
                    disabled={isGenerating}
                    className="h-12 px-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>
                
                {/* Quick Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-1">💡 Pro tip:</div>
                      <div className="text-xs">
                        The more specific you are, the better AI can create targeted milestones. For example: "User authentication system" vs "Backend work"
                      </div>
                    </div>
                  </div>
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
                        Generating milestones...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Smart Milestones
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          ) : null}

          {/* Step 2: Display Generated Subgoals */}
          {generatedSubgoals.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Target className="text-blue-500" />
                  Your Smart Milestones ({generatedSubgoals.length})
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

              {/* Refinement Feedback Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Want to improve these milestones?</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={refinementFeedback}
                    onChange={(e) => setRefinementFeedback(e.target.value)}
                    placeholder="e.g., 'make more specific', 'shorter timeframes', 'focus on learning first'..."
                    className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-md focus:border-blue-500 outline-none bg-white"
                    disabled={isRefining}
                  />
                  <Button
                    onClick={refineGeneratedSubgoals}
                    disabled={isRefining || !refinementFeedback.trim()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isRefining ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Refine"
                    )}
                  </Button>
                </div>
              </div>

              {/* Quality Indicator - Less prominent */}
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  View Quality Analysis
                </summary>
                <div className="mt-2">
                  <SubgoalQualityIndicator subgoals={generatedSubgoals} />
                </div>
              </details>

              <div className="flex justify-end pt-4">
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