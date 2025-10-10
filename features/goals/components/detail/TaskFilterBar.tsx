"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Subgoal } from "@/features/subGoals/subGoalschema";

export type TaskFilters = {
  subgoalIds: number[];
  priorities: string[];
  deadlineRange: "all" | "today" | "week" | "overdue";
};

interface TaskFilterBarProps {
  subgoals: Subgoal[];
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

export function TaskFilterBar({ subgoals, filters, onChange }: TaskFilterBarProps) {
  const activeFiltersCount =
    filters.subgoalIds.length +
    filters.priorities.length +
    (filters.deadlineRange !== "all" ? 1 : 0);

  const clearFilters = () => {
    onChange({
      subgoalIds: [],
      priorities: [],
      deadlineRange: "all",
    });
  };

  const toggleSubgoal = (id: number) => {
    const current = filters.subgoalIds;
    onChange({
      ...filters,
      subgoalIds: current.includes(id)
        ? current.filter((i) => i !== id)
        : [...current, id],
    });
  };

  const togglePriority = (priority: string) => {
    const current = filters.priorities;
    onChange({
      ...filters,
      priorities: current.includes(priority)
        ? current.filter((p) => p !== priority)
        : [...current, priority],
    });
  };

  const setDeadlineRange = (range: TaskFilters["deadlineRange"]) => {
    onChange({ ...filters, deadlineRange: range });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/80 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Filters:</span>
        </div>

        {/* Subgoal Filter */}
        {subgoals.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl h-8">
                Milestone
                {filters.subgoalIds.length > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-600">
                    {filters.subgoalIds.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Filter by Milestone</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {subgoals.map((sg) => (
                <DropdownMenuCheckboxItem
                  key={sg.id}
                  checked={filters.subgoalIds.includes(sg.id)}
                  onCheckedChange={() => toggleSubgoal(sg.id)}
                >
                  {sg.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Priority Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-xl h-8">
              Priority
              {filters.priorities.length > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-600">
                  {filters.priorities.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.priorities.includes("high")}
              onCheckedChange={() => togglePriority("high")}
            >
              High
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.priorities.includes("medium")}
              onCheckedChange={() => togglePriority("medium")}
            >
              Medium
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.priorities.includes("low")}
              onCheckedChange={() => togglePriority("low")}
            >
              Low
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Deadline Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-xl h-8">
              Deadline
              {filters.deadlineRange !== "all" && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-600">
                  1
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuLabel>Filter by Deadline</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.deadlineRange === "all"}
              onCheckedChange={() => setDeadlineRange("all")}
            >
              All
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.deadlineRange === "today"}
              onCheckedChange={() => setDeadlineRange("today")}
            >
              Today
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.deadlineRange === "week"}
              onCheckedChange={() => setDeadlineRange("week")}
            >
              This Week
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.deadlineRange === "overdue"}
              onCheckedChange={() => setDeadlineRange("overdue")}
            >
              Overdue
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="rounded-xl h-8 text-slate-500 hover:text-slate-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear {activeFiltersCount}
          </Button>
        )}
      </div>
    </div>
  );
}
