import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Habit, NewHabit } from "@/features/habits/utils/habitSchema";
import { formatISO, subDays } from "date-fns";

// Zustand store type definition
export type HabitStore = {
  allHabits: Habit[];

  // CRUD operations
  setHabits: (newHabits: Habit[]) => void;   // replace all habits
  addHabit: (newHabit: NewHabit) => void;    // add a new habit
  deleteHabit: (id: number) => void;         // delete by id
  clearHabits: () => void;                   // clear all habits
  getHabitByIndex: (index: number) => Habit | undefined; // get habit by index
  editHabit: (updatedHabit: Habit) => void;  // update habit partially
  updateHabit: (updatedHabit: Habit) => void; // update habit fully

  // Check-in toggling
  toggleCheckin: (id: number, date?: string) => void;
};

// helper function to get today's date in ISO format
const todayISO = () => formatISO(new Date(), { representation: "date" });

// compute streak from array of check-in dates
function computeStreak(days: string[]): number {
  if (!days?.length) return 0;

  const set = new Set(days);
  let streak = 0;

  // check past 365 days
  for (let i = 0; i < 365; i++) {
    const d = subDays(new Date(), i);
    const iso = formatISO(d, { representation: "date" });

    if (set.has(iso)) streak++;
    else break; // stop at first missing day
  }
  return streak;
}

// Zustand store creation
export const useHabit = create<HabitStore>()(
  persist(
    (set, get) => ({
      // initial state
      allHabits: [],

      // replace all habits
      setHabits: (newHabits) => set({ allHabits: newHabits }),

      // add new habit to the top
      addHabit: (newHabit) =>
        set((state) => {
          const tempHabit: Habit = {
            id: newHabit.id,
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

      // delete habit by id
      deleteHabit: (id) =>
        set((state) => ({
          allHabits: state.allHabits.filter((h) => h.id !== id),
        })),

      // clear all habits
      clearHabits: () => set({ allHabits: [] }),

      // get habit by index
      getHabitByIndex: (index) => get().allHabits[index],

      // edit/update habit partially
      editHabit: (updatedHabit) =>
        set((state) => ({
          allHabits: state.allHabits.map((h) =>
            h.id === updatedHabit.id ? { ...h, ...updatedHabit } : h
          ),
        })),

      // update habit fully
      updateHabit: (updatedHabit) =>
        set((state) => ({
          allHabits: state.allHabits.map((h) =>
            h.id === updatedHabit.id ? { ...h, ...updatedHabit } : h
          ),
        })),

      // toggle check-in for a habit on a specific date
      toggleCheckin: (id, date = todayISO()) =>
        set((state) => {
          return {
            allHabits: state.allHabits.map((h) => {
              if (h.id !== id) return h;

              // create a set of check-in dates
              const days = new Set(h.checkInDays ?? []);
              
              if (days.has(date)) {
                days.delete(date); // remove check-in
              } else {
                days.add(date); // add check-in
              }

              const dayArr = Array.from(days); // convert set back to array
              const newStreak = computeStreak(dayArr); // recalc streak

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
      name: "habits-store", // localStorage key
      partialize: (state) => ({
        allHabits: state.allHabits, // only persist habits
      }),
    }
  )
);
