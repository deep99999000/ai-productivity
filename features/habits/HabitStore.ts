import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Habit, NewHabit } from "@/features/habits/habitSchema";
import { formatISO, subDays } from "date-fns";

export type HabitStore = {
  allHabits: Habit[];

  setHabits: (newHabits: Habit[]) => void;
  addHabit: (newHabit: NewHabit) => void;
  deleteHabit: (id: number) => void;
  clearHabits: () => void;
  getHabitByIndex: (index: number) => Habit | undefined;
  editHabit: (updatedHabit: Habit) => void;
  updateHabit: (updatedHabit: Habit) => void;

  toggleCheckin: (id: number, date?: string) => void;
};

// ✅ today's date
const todayISO = () => formatISO(new Date(), { representation: "date" });

// ✅ streak calculator
function computeStreak(days: string[]): number {
  if (!days?.length) return 0;

  const set = new Set(days);
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const d = subDays(new Date(), i);
    const iso = formatISO(d, { representation: "date" });

    if (set.has(iso)) streak++;
    else break; // stop at first gap
  }
  return streak;
}

export const useHabit = create<HabitStore>()(
  persist(
    (set, get) => ({
      allHabits: [],

      setHabits: (newHabits) => set({ allHabits: newHabits }),

      addHabit: (newHabit) =>
        set((state) => {
          const tempHabit: Habit = {
            id: Math.floor(Math.random() * 1e9),
            user_id: (newHabit as any).user_id ?? 0,
            name: newHabit.name!,
            description: (newHabit as any).description ?? null,
            emoji: (newHabit as any).emoji ?? "✅",
            highestStreak: (newHabit as any).highestStreak ?? 0,
            checkInDays: (newHabit as any).checkInDays ?? [],
            createdAt: (newHabit as any).createdAt ?? new Date(),
          };
          return { allHabits: [tempHabit, ...state.allHabits] };
        }),

      deleteHabit: (id) =>
        set((state) => ({
          allHabits: state.allHabits.filter((h) => h.id !== id),
        })),

      clearHabits: () => set({ allHabits: [] }),

      getHabitByIndex: (index) => get().allHabits[index],

      editHabit: (updatedHabit) =>
        set((state) => ({
          allHabits: state.allHabits.map((h) =>
            h.id === updatedHabit.id ? { ...h, ...updatedHabit } : h
          ),
        })),

      updateHabit: (updatedHabit) =>
        set((state) => ({
          allHabits: state.allHabits.map((h) =>
            h.id === updatedHabit.id ? { ...h, ...updatedHabit } : h
          ),
        })),

      toggleCheckin: (id, date = todayISO()) =>
        set((state) => {
          return {
            allHabits: state.allHabits.map((h) => {
              if (h.id !== id) return h;

              const days = new Set(h.checkInDays ?? []);
              if (days.has(date)) {
                days.delete(date); // uncheck
              } else {
                days.add(date); // check
              }

              const dayArr = Array.from(days);
              const newStreak = computeStreak(dayArr);

              return {
                ...h,
                checkInDays: dayArr,
                highestStreak: Math.max(h.highestStreak ?? 0, newStreak),
              };
            }),
          };
        }),
    }),
    {
      name: "habits-store",
      partialize: (state) => ({
        allHabits: state.allHabits,
      }),
    }
  )
);
