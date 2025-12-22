import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AISuggestion } from "./types";

interface HabitAIInsightState {
  insights: AISuggestion[];
  lastFetchDate: string | null;
  loading: boolean;
  setInsights: (insights: AISuggestion[]) => void;
  setLoading: (loading: boolean) => void;
  shouldFetch: () => boolean;
  clearCache: () => void;
}

export const useHabitAIInsight = create<HabitAIInsightState>()(
  persist(
    (set, get) => ({
      insights: [],
      lastFetchDate: null,
      loading: false,

      setInsights: (insights) => 
        set({ 
          insights, 
          lastFetchDate: new Date().toISOString().split("T")[0] 
        }),

      setLoading: (loading) => set({ loading }),

      shouldFetch: () => {
        const { lastFetchDate } = get();
        const today = new Date().toISOString().split("T")[0];
        return lastFetchDate !== today;
      },

      clearCache: () => set({ insights: [], lastFetchDate: null }),
    }),
    {
      name: "habit-ai-insights",
    }
  )
);
