import { create } from 'zustand'
import { TodoSchema } from '@/features/todo/todoSchema'

interface TodoState {
  todos: TodoSchema[]
  setTodos: (newTodos: TodoSchema[]) => void
  addTodo: (todo: TodoSchema) => void
  updateTodo: (updatedTodo: TodoSchema) => void
  deleteTodo: (id: number) => void
  toggleTodo: (id: number) => void
}

export const useTodo = create<TodoState>((set) => ({
  todos: [],

  setTodos: (newTodos) => set({ todos: newTodos }),

  addTodo: (todo) =>
    set((state) => ({ todos: [todo, ...state.todos] })),

  updateTodo: (updatedTodo) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === updatedTodo.id ? updatedTodo : todo
      ),
    })),

  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),

  toggleTodo: (id) => 
    set((state) => ({
      todos:state.todos.map((todo) => todo.id === id ? {...todo,isDone:!todo.isDone}:todo)
    }))
    
}))
