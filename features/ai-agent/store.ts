import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useHabit } from "@/features/habits/store";
import { useTodo } from "@/features/todo/store";
import type { Habit } from "@/features/habits/schema";
import type { Todo } from "@/features/todo/schema";

// Message types
export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "progress";
  content: string;
  timestamp: Date;
}

// Chat session state
export interface AgentChatState {
  messages: AgentMessage[];
  isLoading: boolean;
  currentStage: string;
  sessionId: string;
  
  // Actions
  addMessage: (message: Omit<AgentMessage, "id" | "timestamp">) => void;
  setLoading: (loading: boolean) => void;
  setCurrentStage: (stage: string) => void;
  clearMessages: () => void;
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const useAgentChat = create<AgentChatState>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      currentStage: "",
      sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: generateId(),
              timestamp: new Date(),
            },
          ],
        })),

      setLoading: (loading) => set({ isLoading: loading }),
      setCurrentStage: (stage) => set({ currentStage: stage }),

      clearMessages: () =>
        set({
          messages: [],
          sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        }),
    }),
    {
      name: "ai-agent-chat-store",
      partialize: (state) => ({
        messages: state.messages.slice(-50), // Keep last 50 messages
        sessionId: state.sessionId,
      }),
    }
  )
);

// Helper functions that use existing Zustand stores directly
export const agentStoreHelpers = {
  // Get all habits from existing store
  getAllHabits: (): Habit[] => {
    return useHabit.getState().allHabits;
  },

  // Get all todos from existing store
  getAllTodos: (): Todo[] => {
    return useTodo.getState().todos;
  },

  // Search habits by name/description
  searchHabitsByName: (name: string): Habit[] => {
    const habits = useHabit.getState().allHabits;
    const lowerName = name.toLowerCase();
    return habits.filter(
      (h) =>
        h.name.toLowerCase().includes(lowerName) ||
        (h.description?.toLowerCase().includes(lowerName) ?? false)
    );
  },

  // Search todos by name/description
  searchTodosByName: (name: string): Todo[] => {
    const todos = useTodo.getState().todos;
    const lowerName = name.toLowerCase();
    return todos.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerName) ||
        (t.description?.toLowerCase().includes(lowerName) ?? false)
    );
  },

  // Get todos for today
  searchTodosToday: (): Todo[] => {
    const todos = useTodo.getState().todos;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return todos.filter((t) => {
      if (!t.endDate && !t.startDate) return false;
      const date = t.endDate ?? t.startDate;
      if (!date) return false;
      const taskDate = new Date(date);
      return taskDate >= today && taskDate < tomorrow;
    });
  },

  // Get completed todos
  getCompletedTodos: (): Todo[] => {
    const todos = useTodo.getState().todos;
    return todos.filter((t) => t.isDone === true);
  },

  // Get pending todos
  getPendingTodos: (): Todo[] => {
    const todos = useTodo.getState().todos;
    return todos.filter((t) => t.isDone !== true);
  },

  // Get habits by minimum streak
  getHabitsByStreak: (minStreak: number): Habit[] => {
    const habits = useHabit.getState().allHabits;
    return habits.filter((h) => (h.highestStreak ?? 0) >= minStreak);
  },

  // Toggle todo completion (uses existing store)
  toggleTodo: (id: number): void => {
    useTodo.getState().toggleTodo(id);
  },

  // Add new todo (uses existing store)
  addTodo: (todo: any, userId: string): void => {
    useTodo.getState().addTodo(todo, userId);
  },

  // Delete todo (uses existing store)
  deleteTodo: (id: number): void => {
    useTodo.getState().deleteTodo(id);
  },

  // Add new habit (uses existing store)
  addHabit: (habit: any): void => {
    useHabit.getState().addHabit(habit);
  },

  // Delete habit (uses existing store)
  deleteHabit: (id: number): void => {
    useHabit.getState().deleteHabit(id);
  },

  // Toggle habit check-in (uses existing store)
  toggleHabitCheckin: (id: number, date?: string): void => {
    useHabit.getState().toggleCheckin(id, date);
  },
};
