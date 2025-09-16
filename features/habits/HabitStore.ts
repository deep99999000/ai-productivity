import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Habit, NewHabit } from "@/features/habits/habitSchema";

// date-fns utilities
import { formatISO, subDays } from "date-fns";

export type HabitStore = {
  habits: Habit[];
  allHabits: Habit[];
  filter: "all" | "active" | "archived" | "completed";
  checkins: Record<string, Record<string, boolean>>;

  setHabits: (newHabits: Habit[]) => void;
  addHabit: (newHabit: NewHabit) => void;
  deleteHabit: (id: number) => void;
  clearHabits: () => void;
  getHabitByIndex: (index: number) => Habit | undefined;
  editHabit: (updatedHabit: Habit) => void;
  updateHabit: (updatedHabit: Habit) => void;

  setCheckins: (checkins: HabitStore["checkins"]) => void;
  toggleCheckin: (id: number, dateISO?: string) => void;
};

// ✅ Get today's date in YYYY-MM-DD format
const todayISO = () => formatISO(new Date(), { representation: "date" });

// ✅ Compute streak by checking consecutive past days
function computeStreak(map: Record<string, boolean>): number {
  if (!map) return 0;
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    // go backwards day by day
    const day = subDays(new Date(), i);
    
    const iso = formatISO(day, { representation: "date" });
    console.log("checking", iso, map[iso]);

    if (map[iso]) streak++;
    else break; // stop streak if gap found
  }

  return streak;
}

export const useHabit = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      allHabits: [],
      filter: "all",
      checkins: {},

      setHabits: (newHabits) => set({ habits: newHabits, allHabits: newHabits }),

      addHabit: (newHabit) =>
        set((state) => {
          const tempHabit: Habit = {
            id: Math.floor(Math.random() * 1e9),
            user_id: (newHabit as any).user_id ?? 0,
            name: newHabit.name!,
            description: (newHabit as any).description ?? null,
            emoji: (newHabit as any).emoji ?? "✅",
            frequency: (newHabit as any).frequency ?? "daily",
            highestStreak: (newHabit as any).highestStreak ?? 0,
            createdAt: (newHabit as any).createdAt ?? new Date(),
          };
          const next = [tempHabit, ...state.habits];
          return { habits: next, allHabits: next };
        }),

      deleteHabit: (id) =>
        set((state) => {
          const next = state.habits.filter((habit) => habit.id !== id);
          return { habits: next, allHabits: next };
        }),

      clearHabits: () => set({ habits: [], allHabits: [] }),

      getHabitByIndex: (index) => get().habits[index],

      editHabit: (updatedHabit) =>
        set((state) => {
          const next = state.habits.map((habit) =>
            habit.id === updatedHabit.id ? { ...habit, ...updatedHabit } : habit
          );
          return { habits: next, allHabits: next };
        }),

      updateHabit: (updatedHabit) =>
        set((state) => {
          const next = state.habits.map((habit) =>
            habit.id === updatedHabit.id ? { ...habit, ...updatedHabit } : habit
          );
          return { habits: next, allHabits: next };
        }),

      setCheckins: (checkins) => set({ checkins }),

      toggleCheckin: (id, date = todayISO()) =>
        set((state) => {
          const habitId = String(id);
          const byHabit = state.checkins[habitId] ?? {};
          const nextVal = !byHabit[date];
          const updatedHabitCheckins = { ...byHabit, [date]: nextVal };

          // ✅ update streak if checked today
          let updatedHabits = state.habits;
          if (nextVal) {
            const newStreak = computeStreak(updatedHabitCheckins);
            updatedHabits = state.habits.map((h) =>
              h.id === id
                ? { ...h, highestStreak: Math.max(h.highestStreak ?? 0, newStreak) }
                : h
            );
          }

          return {
            checkins: {
              ...state.checkins,
              [habitId]: updatedHabitCheckins,
            },
            habits: updatedHabits,
            allHabits: updatedHabits,
          };
        }),
    }),
    {
      name: "habits-store",
      partialize: (state) => ({
        habits: state.habits,
        allHabits: state.allHabits,
        filter: state.filter,
        checkins: state.checkins,
      }),
    }
  )
);
