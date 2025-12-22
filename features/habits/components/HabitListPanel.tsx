"use client";

import { Plus, MoreHorizontal, Grid2X2, List, ChevronDown, X } from "lucide-react";
import { Habit } from "../schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import WeekDaySelector from "./list/WeekDaySelector";
import HabitListItem from "./list/HabitListItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HabitListPanelProps {
  habits: Habit[];
  selectedHabit: Habit | null;
  selectedDate: Date;
  dateFilter: Date | null;
  viewMode: "grid" | "list";
  onHabitSelect: (habit: Habit) => void;
  onDateSelect: (date: Date) => void;
  onDateFilterClear: () => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onAddHabit: () => void;
}

export default function HabitListPanel({
  habits,
  selectedHabit,
  selectedDate,
  dateFilter,
  viewMode,
  onHabitSelect,
  onDateSelect,
  onDateFilterClear,
  onViewModeChange,
  onAddHabit,
}: HabitListPanelProps) {
  
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">Habits</h1>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem>All Habits</DropdownMenuItem>
                <DropdownMenuItem>Active Habits</DropdownMenuItem>
                <DropdownMenuItem>Archived</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onAddHabit}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Week Day Selector */}
      <div className="px-6 py-4 border-b border-gray-50">
        <WeekDaySelector
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            habits={habits}
        />
      </div>

      {/* Date Filter Tag */}
      {dateFilter && (
        <div className="px-6 py-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-600 shadow-sm">
              <span>📅</span>
              <span>{format(dateFilter, "MMM d")}</span>
              <button
                onClick={onDateFilterClear}
                className="ml-0.5 hover:text-blue-800 text-blue-400"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
        </div>
      )}

      {/* Habit List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {habits.length > 0 ? (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-2 gap-3"
                  : "flex flex-col gap-2"
              )}
            >
              {habits.map((habit) => (
                <HabitListItem
                  key={habit.id}
                  habit={habit}
                  isSelected={selectedHabit?.id === habit.id}
                  onSelect={onHabitSelect}
                  viewMode={viewMode}
                  selectedDate={selectedDate}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
              <p className="text-sm font-medium text-gray-900">
                No habits yet!
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Add a new habit to start your journey.
              </p>
              <Button
                size="sm"
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={onAddHabit}
              >
                Add Habit
              </Button>
            </div>
          )}
      </div>
    </div>
  );
}
