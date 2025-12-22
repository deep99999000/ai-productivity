 import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Todo, NewTodo } from "@/features/todo/schema";

// 📦 Todo store state interface
interface TodoState {
  todos: Todo[];
  setTodos: (newTodos: Todo[]) => void;
  addTodo: (newTodo: NewTodo, user_id: string) => void;
  updateTodo: (updatedTodo: Todo) => void;
  deleteTodo: (id: number) => void;
  deleteTodosBySubgoal: (subgoalId: number) => void;
  toggleTodo: (id: number) => void;
}

// 🗂 Global todo store with persistence
export const useTodo = create<TodoState>()(
  persist(
    (set) => ({
      // 📊 Initial state
      todos: [],

      // 📝 Set all todos
      setTodos: (newTodos) => set({ todos: newTodos }),

      // ➕ Add new todo
      addTodo: (newTodo, user_id) =>
        set((state) => {
          const fullTodo = {
            ...newTodo,
            id: Math.floor(Math.random() * 1000000),
            user_id,
          } as Todo;
          return { todos: [fullTodo, ...state.todos] };
        }),

      // ✏️ Update existing todo
      updateTodo: (updatedTodo) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === updatedTodo.id ? updatedTodo : todo
          ),
        })),

      // 🗑️ Delete todo by ID
      deleteTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),

      // 🗑️ Delete all todos for a subgoal
      deleteTodosBySubgoal: (subgoalId) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.subgoal_id !== subgoalId),
        })),

      // ✅ Toggle todo completion status
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
          ),
        })),
    }),
    {
      name: "todo-store", // localStorage key
    }
  )
);        