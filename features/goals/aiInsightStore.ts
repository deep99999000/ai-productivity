import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AIInsightResponse } from "./types";

interface GoalAIInsightState {
  insightsCache: Record<number, { data: AIInsightResponse; date: string }>;
  loading: boolean;
  setInsights: (goalId: number, insights: AIInsightResponse) => void;
  setLoading: (loading: boolean) => void;
  shouldFetch: (goalId: number) => boolean;
  getInsights: (goalId: number) => AIInsightResponse | null;
  clearCache: (goalId?: number) => void;
}

export const useGoalAIInsight = create<GoalAIInsightState>()(
  persist(
    (set, get) => ({
      insightsCache: {},
      loading: false,

      setInsights: (goalId, insights) => 
        set((state) => ({ 
          insightsCache: {
            ...state.insightsCache,
            [goalId]: {
              data: insights,
              date: new Date().toISOString().split("T")[0]
            }
          }
        })),

      setLoading: (loading) => set({ loading }),

      shouldFetch: (goalId) => {
        const { insightsCache } = get();
        const cached = insightsCache[goalId];
        if (!cached) return true;
        
        const today = new Date().toISOString().split("T")[0];
        return cached.date !== today;
      },

      getInsights: (goalId) => {
        const { insightsCache } = get();
        return insightsCache[goalId]?.data || null;
      },

      clearCache: (goalId) => {
        if (goalId !== undefined) {
          set((state) => {
            const newCache = { ...state.insightsCache };
            delete newCache[goalId];
            return { insightsCache: newCache };
          });
        } else {
          set({ insightsCache: {} });
        }
      },
    }),
    {
      name: "goal-ai-insights",
    }
  )
);
