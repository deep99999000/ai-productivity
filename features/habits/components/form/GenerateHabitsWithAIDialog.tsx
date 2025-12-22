"use client";

import React from "react";
import BaseDialog from "@/components/BaseDialog";
import { Sparkles, Trash2, Check, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generateUniqueId } from "@/lib/generateUniqueId";
import useUser from "@/store/useUser";
import { useHabit } from "@/features/habits/store";
import axios from "axios";
import { API } from "@/lib/actions/getbackendurl";
import { motion } from "framer-motion";
import { newhabitaction } from "@/features/habits/actions";

// Only need a name now
export type GeneratedHabit = {
  name: string;
  emoji?: string;
  tempId?: number;
};

const MAX_NAME_LEN = 40;

const GenerateHabitsWithAIDialog: React.FC = () => {
  const { user } = useUser();
  const { addHabit } = useHabit();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [generatedHabits, setGeneratedHabits] = React.useState<GeneratedHabit[]>([]);

  const { register, handleSubmit, reset } = useForm<{ theme: string }>({
    defaultValues: { theme: "" },
  });

  const onSubmit = async (data: { theme: string }) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedHabits([]);

    try {
      const response = await axios.post(`${API}/api/content/generate`, {
        name: data.theme,
        type: "habits",
      });

      const habits = response.data;
      if (!Array.isArray(habits)) throw new Error("Invalid AI response");

      const formatted: GeneratedHabit[] = habits.map((h: any) => ({
        name: (h?.name || "Untitled").slice(0, MAX_NAME_LEN).trim(),
        emoji: (h?.emoji || "✅").trim(),
        tempId: generateUniqueId(),
      }));

      setGeneratedHabits(formatted);
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.error || "Failed to generate habits. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveHabit = async(habit: GeneratedHabit) => {
    const id = generateUniqueId();
    addHabit({
      id,
      user_id: user,
      name: habit.name,
      description: null,
      emoji: habit.emoji || "✅",
      createdAt: new Date(),
      checkInDays: [],
      highestStreak: 0,
    });
   await newhabitaction({
      id,
      user_id: user,
      name: habit.name,
      description: null,
      emoji: habit.emoji || "✅",
      createdAt: new Date(),
      checkInDays: [],
      highestStreak: 0,
    });
  };

  const removeGeneratedHabit = (tempId: number) => {
    setGeneratedHabits((prev) => prev.filter((g) => g.tempId !== tempId));
  };

  const editHabit = (tempId: number, field: 'name' | 'emoji', value: string) => {
    setGeneratedHabits((prev) =>
      prev.map((g) => 
        g.tempId === tempId 
          ? { ...g, [field]: field === 'name' ? value.slice(0, MAX_NAME_LEN) : value.slice(0, 4) } 
          : g
      )
    );
  };

  const close = () => {
    setIsOpen(false);
    setGeneratedHabits([]);
    setError(null);
    reset();
  };

  return (
    <>
      {/* Trigger Button (match goal generator style) */}
      <button
        type="button"
        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12 group-hover:scale-110" />
        <span className="whitespace-nowrap font-semibold">Generate Habits with AI</span>
      </button>

      <BaseDialog
        isOpen={isOpen}
        setisOpen={close}
        title=""
        description=""
        contentClassName="w-full max-w-[60vw] lg:max-w-lg"
      >
        <div className="max-h-[80vh] overflow-y-auto px-1">
          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-3xl font-bold flex items-center justify-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500">
              <Sparkles className="text-purple-500" size={32} />
              AI Habit Generator
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Enter a theme (e.g. Morning routine, Deep work, Fitness) and AI will suggest short habit names.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between shadow-sm">
              <span className="flex items-center gap-2">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-600 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Theme</label>
              <Input
                placeholder="Improve sleep, Focus, Fitness, Learning..."
                {...register("theme", { required: true })}
              />
            </div>
            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {isGenerating ? "Generating..." : "Generate Habits"}
            </Button>
          </form>

          {/* Suggestions */}
          {generatedHabits.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                AI Suggestions
              </h3>
              <div className="grid gap-3">
                {generatedHabits.map((h) => (
                  <Card key={h.tempId} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow transition-shadow duration-200">
                    <div className="flex flex-col gap-3">
                      {/* Header with emoji and name */}
                      <div className="flex items-center gap-3">
                        <input
                          className="w-10 h-10 text-xl text-center bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-purple-300 focus:border-transparent outline-none transition-colors"
                          value={h.emoji || ""}
                          maxLength={4}
                          onChange={(e) => editHabit(h.tempId!, 'emoji', e.target.value)}
                          placeholder="✅"
                          aria-label="Emoji"
                        />
                        <input
                          className="flex-1 font-semibold text-sm md:text-base bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
                          value={h.name}
                          onChange={(e) => editHabit(h.tempId!, 'name', e.target.value)}
                          placeholder="Habit name..."
                        />
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => removeGeneratedHabit(h.tempId!)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Save Button */}
                      <Button
                        type="button"
                        size="sm"
                        className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500 hover:shadow-[0_0_15px_2px_rgba(147,51,234,0.2)] transition-all duration-300 text-white text-xs font-medium"
                        onClick={() => saveHabit(h)}
                      >
                        <Check className="w-3 h-3 mr-1.5" /> Save Habit
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </BaseDialog>
    </>
  );
};

export default GenerateHabitsWithAIDialog;
