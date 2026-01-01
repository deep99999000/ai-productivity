import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProjectAISuggestion } from "./types";

// AI Insights Store (following Habit aiInsightStore pattern)
export type AIInsightStore = {
  insights: ProjectAISuggestion[];
  isLoading: boolean;
  lastGenerated: Date | null;

  setInsights: (insights: ProjectAISuggestion[]) => void;
  addInsight: (insight: ProjectAISuggestion) => void;
  removeInsight: (index: number) => void;
  clearInsights: () => void;
  setLoading: (loading: boolean) => void;
  setLastGenerated: (date: Date) => void;
};

export const useProjectAIInsights = create<AIInsightStore>()(
  persist(
    (set) => ({
      insights: [],
      isLoading: false,
      lastGenerated: null,

      setInsights: (insights) =>
        set({
          insights,
          lastGenerated: new Date(),
          isLoading: false,
        }),

      addInsight: (insight) =>
        set((state) => ({
          insights: [...state.insights, insight],
        })),

      removeInsight: (index) =>
        set((state) => ({
          insights: state.insights.filter((_, i) => i !== index),
        })),

      clearInsights: () =>
        set({
          insights: [],
          lastGenerated: null,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      setLastGenerated: (date) => set({ lastGenerated: date }),
    }),
    {
      name: "project-ai-insights-storage",
    }
  )
);
