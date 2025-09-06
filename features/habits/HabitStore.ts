import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Habit, NewHabit } from "@/features/habits/habitSchema";

export type HabitFilter = "all" | "active" | "archived" | "completed";

export type HabitState = {
  habits: Habit[];
  filter: HabitFilter;
  setHabits: (h: Habit[]) => void;
  addHabit: (h: NewHabit) => void;
  editHabit: (h: Habit) => void;
  updateHabit: (h: Habit) => void; // alias
  deleteHabit: (id: number) => void;
  setFilter: (f: HabitFilter) => void;
  toggleCheckin: (id: number, dateISO?: string) => void;
  checkins: Record<string, Record<string, boolean>>; // habitId -> { yyyy-mm-dd: true }
  setCheckins: (c: HabitState["checkins"]) => void;
};

const todayISO = () => new Date().toISOString().slice(0,10);

export const useHabit = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      filter: "all",
      checkins: {},

      setHabits: (h) => set({ habits: h }),

      addHabit: (h) => set((s) => {
        const full: Habit = {
          id: Math.floor(Math.random() * 1e9),
          user_id: (h as any).user_id ?? 0,
          name: h.name!,
          description: h.description ?? null,
          emoji: (h as any).emoji ?? "✅",
          frequency: (h as any).frequency ?? "daily",
          days: (h as any).days ?? null,
          isArchived: false,
          createdAt: (h as any).createdAt ?? new Date(),
        } as unknown as Habit;
        return { habits: [full, ...s.habits] };
      }),

      editHabit: (h) => set((s) => ({
        habits: s.habits.map((x) => (x.id === h.id ? { ...x, ...h } : x)),
      })),

      updateHabit: (h) => set((s) => ({
        habits: s.habits.map((x) => (x.id === h.id ? { ...x, ...h } : x)),
      })),

      deleteHabit: (id) => set((s) => ({ habits: s.habits.filter((x) => x.id !== id) })),

      setFilter: (f) => set({ filter: f }),

      setCheckins: (c) => set({ checkins: c }),

      toggleCheckin: (id, date = todayISO()) => set((s) => {
        const hid = String(id);
        const byHabit = s.checkins[hid] ?? {};
        const nextVal = !byHabit[date];
        return {
          checkins: {
            ...s.checkins,
            [hid]: { ...byHabit, [date]: nextVal },
          },
        };
      }),
    }),
    { name: "habit-store" }
  )
);
