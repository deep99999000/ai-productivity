import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Goal, NewGoal } from "@/features/goals/schema";

// 📦 Goal store type definition
export type GoalStore = {
  allGoals: Goal[];
  setGoal: (newGoals: Goal[]) => void;
  addGoal: (newGoal: NewGoal) => void;
  deleteGoal: (id: number) => void;
  clearGoals: () => void;
  getGoalByIndex: (index: number) => Goal | undefined;
  updateGoalStatus: (goalId: number, status: Goal["status"]) => void;
  editGoal: (updatedGoal: Goal) => void;
};

// 🗂 Global goal store with persistence
export const useGoal = create<GoalStore>()(
  persist(
    (set, get) => ({
      // 📊 Initial state
      allGoals: [],

      // 📝 Set all goals
      setGoal: (newGoals) => set({ allGoals: newGoals }),

      // ➕ Add new goal
      addGoal: (newGoal) =>
        set((state) => {
          const tempGoal: Goal = {
            ...newGoal,
            description: newGoal.description ?? null,
            category: newGoal.category ?? null,
            endDate: newGoal.endDate ?? null,
            status: newGoal.status ?? "not_started",
          };
          return {
            allGoals: [tempGoal, ...state.allGoals],
          };
        }),

      // 🗑️ Delete goal by ID
      deleteGoal: (id) =>
        set((state) => ({
          allGoals: state.allGoals.filter((goal) => goal.id !== id),
        })),

      // 🧹 Clear all goals
      clearGoals: () => set({ allGoals: [] }),

      // 🔍 Get goal by index
      getGoalByIndex: (index) => get().allGoals[index],

      // 🔄 Update goal status
      updateGoalStatus: (goalId, status) =>
        set((state) => ({
          allGoals: state.allGoals.map((goal) =>
            goal.id === goalId ? { ...goal, status } : goal
          ),
        })),

      // ✏️ Edit existing goal
      editGoal: (updatedGoal) =>
        set((state) => ({
          allGoals: state.allGoals.map((goal) =>
            goal.id === updatedGoal.id ? { ...goal, ...updatedGoal } : goal
          ),
        })),
    }),
    {
      name: "goals-store",
    }
  )
);