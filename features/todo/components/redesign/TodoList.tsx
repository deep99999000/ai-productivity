"use client";

import { Todo } from "@/features/todo/schema";
import { FilterType } from "./TodoMain";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format, isToday, isPast, isFuture, addDays } from "date-fns";
import { Calendar as CalendarIcon, Flag, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useTodo } from "@/features/todo/store";
import { updateTodosStatus } from "@/features/todo/actions";
import useUser from "@/store/useUser";

interface TodoListProps {
  todos: Todo[];
  filter: FilterType;
  selectedGoalId: number | null;
  selectedGoalName?: string;
  search: string;
  setSearch: (search: string) => void;
  selectedTodoId: number | null;
  setSelectedTodoId: (id: number | null) => void;
  onAddTodo: () => void;
}

export default function TodoList({
  todos,
  filter,
  selectedGoalId,
  selectedGoalName,
  search,
  setSearch,
  selectedTodoId,
  setSelectedTodoId,
  onAddTodo,
}: TodoListProps) {
  const { toggleTodo } = useTodo();
  const { user } = useUser();

  const filteredTodos = todos.filter((todo) => {
    // Search filter
    if (search && !todo.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Category/Date filter
    const todoDate = todo.startDate ? new Date(todo.startDate) : null;
    const today = new Date();

    if (filter === "today") {
      return todoDate && isToday(todoDate);
    } else if (filter === "upcoming") {
      return todoDate && isFuture(todoDate) && todoDate <= addDays(today, 7);
    } else if (filter === "inbox") {
      return !todoDate; // Assuming inbox has no date
    } else if (filter === "all") {
      return true;
    } else if (filter === "goal" && selectedGoalId) {
        return todo.goal_id === selectedGoalId;
    }
    return true;
  });

  // Grouping logic (Overdue, Today, etc.)
  // For simplicity, let's just list them for now, or group by date if "upcoming".
  // The screenshot shows "Overdue" and "Today".

  const overdueTodos = filteredTodos.filter(
    (t) => t.startDate && isPast(new Date(t.startDate)) && !isToday(new Date(t.startDate)) && !t.isDone
  );
  
  const currentTodos = filteredTodos.filter(
    (t) => !overdueTodos.includes(t)
  );

  const handleToggle = async (e: React.MouseEvent, todo: Todo) => {
    e.stopPropagation();
    toggleTodo(todo.id);
    if (user) {
      await updateTodosStatus(user, todo.id, !todo.isDone);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900 capitalize">
            {filter === "upcoming" ? "Next 7 Days" : filter === "goal" ? selectedGoalName : filter}
          </h1>
          <span className="text-sm text-gray-400 font-medium">{filteredTodos.length}</span>
        </div>
        <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 pl-8 pr-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 w-44 transition-[width] focus:w-64"
                />
            </div>
        </div>
      </div>

      {/* Add Task Input */}
      <div className="px-6 py-3">
        <button
          onClick={onAddTodo}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors text-left"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">
            Add task to "{filter === "goal" ? selectedGoalName : filter}"
          </span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
        {overdueTodos.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-red-500">Overdue</h3>
              <span className="text-xs text-gray-400">{overdueTodos.length}</span>
            </div>
            <div className="space-y-1">
              {overdueTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  selected={selectedTodoId === todo.id}
                  onClick={() => setSelectedTodoId(todo.id)}
                  onToggle={(e) => handleToggle(e, todo)}
                />
              ))}
            </div>
          </div>
        )}

        <div>
           {overdueTodos.length > 0 && <h3 className="text-sm font-medium text-gray-900 mb-2 capitalize">{filter}</h3>}
          <div className="space-y-1">
            {currentTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                selected={selectedTodoId === todo.id}
                onClick={() => setSelectedTodoId(todo.id)}
                onToggle={(e) => handleToggle(e, todo)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TodoItem({
  todo,
  selected,
  onClick,
  onToggle,
}: {
  todo: Todo;
  selected: boolean;
  onClick: () => void;
  onToggle: (e: React.MouseEvent) => void;
}) {
  const priority = String(todo.priority || "").toLowerCase();

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer border border-transparent transition-all",
        selected ? "bg-blue-50 border-blue-100" : "hover:bg-gray-50 hover:border-gray-200"
      )}
    >
      <div className="flex-shrink-0 pt-0.5" onClick={onToggle}>
        <Checkbox
          checked={todo.isDone || false}
          className={cn(
            "w-5 h-5 rounded-full border-2 transition-colors data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500",
            priority === "high" ? "border-red-400" : "border-gray-300"
          )}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm text-gray-900 truncate", todo.isDone && "line-through text-gray-400")}>
          {todo.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
            {todo.category && <span className="text-xs text-gray-400">{todo.category}</span>}
            {todo.startDate && (
                <span className={cn("text-xs flex items-center gap-1", isPast(new Date(todo.startDate)) && !isToday(new Date(todo.startDate)) ? "text-red-500" : "text-gray-400")}>
                    <CalendarIcon className="w-3 h-3" />
                    {format(new Date(todo.startDate), "MMM d")}
                </span>
            )}
        </div>
      </div>

      {priority === "high" && (
          <Flag className="w-4 h-4 text-red-500 fill-red-500/10" />
      )}
    </div>
  );
}
