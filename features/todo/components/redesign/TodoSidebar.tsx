"use client";

import {
  Calendar,
  CalendarDays,
  Inbox,
  LayoutGrid,
  ListTodo,
  Tag,
  Clock,
  Save,
  Target
} from "lucide-react";
import { FilterType } from "./TodoMain";
import { Todo } from "@/features/todo/schema";
import { Goal } from "@/features/goals/schema";
import { cn } from "@/lib/utils";
import { isToday, isFuture } from "date-fns";

interface TodoSidebarProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  selectedGoalId: number | null;
  setSelectedGoalId: (id: number | null) => void;
  todos: Todo[];
  goals: Goal[];
}

export default function TodoSidebar({ filter, setFilter, selectedGoalId, setSelectedGoalId, todos, goals }: TodoSidebarProps) {
  const counts = {
    all: todos.length,
    today: todos.filter((t) => t.startDate && isToday(new Date(t.startDate))).length,
    upcoming: todos.filter((t) => t.startDate && isFuture(new Date(t.startDate))).length,
    inbox: todos.filter((t) => !t.startDate).length, // Assuming inbox means no date or specifically inbox
    summary: 0, // Placeholder
  };

  const navItems = [
    { id: "all", label: "All", icon: LayoutGrid, count: counts.all },
    { id: "today", label: "Today", icon: Calendar, count: counts.today },
    { id: "upcoming", label: "Next 7 Days", icon: CalendarDays, count: counts.upcoming },
    { id: "inbox", label: "Inbox", icon: Inbox, count: counts.inbox },
    { id: "summary", label: "Summary", icon: ListTodo, count: counts.summary },
  ];

  // Extract unique tags and lists (categories)
  const lists = Array.from(new Set(todos.map((t) => t.category).filter(Boolean)));
  const tags = Array.from(new Set(todos.flatMap((t) => t.tags || []).filter(Boolean)));

  return (
    <div className="h-full flex flex-col py-4 bg-white overflow-y-auto">
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Filters</span>
        </div>
        <nav className="space-y-0.5 mt-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                  setFilter(item.id as FilterType);
                  setSelectedGoalId(null);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                filter === item.id
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-4 h-4", filter === item.id ? "text-gray-900" : "text-gray-500")} />
                <span>{item.label}</span>
              </div>
              {item.count > 0 && (
                <span className="text-xs text-gray-400">{item.count}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {goals.length > 0 && (
        <div className="px-4 mb-6 border-t border-gray-100 pt-5">
          <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-500">
            <Target className="w-4 h-4" />
            <span>Goals</span>
          </div>
          <div className="mt-1 space-y-0.5">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => {
                    setFilter("goal");
                    setSelectedGoalId(goal.id);
                }}
                className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                    filter === "goal" && selectedGoalId === goal.id
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <span className={cn("w-2 h-2 rounded-full", filter === "goal" && selectedGoalId === goal.id ? "bg-gray-900" : "bg-gray-300")} />
                <span className="truncate">{goal.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {lists.length > 0 && (
        <div className="px-4 mb-6 border-t border-gray-100 pt-5">
          <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-500">
            <Save className="w-4 h-4" />
            <span>Lists</span>
          </div>
          <div className="mt-1 space-y-0.5">
            {lists.map((list) => (
              <button
                key={list}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50"
              >
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                <span>{list}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="px-4 border-t border-gray-100 pt-5">
          <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-500">
            <Tag className="w-4 h-4" />
            <span>Tags</span>
          </div>
          <div className="mt-1 space-y-0.5">
            {tags.map((tag) => (
              <button
                key={tag}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50"
              >
                <Tag className="w-3 h-3 text-gray-400" />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
