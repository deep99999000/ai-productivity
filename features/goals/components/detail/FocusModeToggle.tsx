"use client";

import { useState } from "react";
import { Zap, Filter, Calendar, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FocusMode = "all" | "today" | "urgent" | "active";

interface FocusModeToggleProps {
  value: FocusMode;
  onChange: (mode: FocusMode) => void;
  counts: {
    all: number;
    today: number;
    urgent: number;
    active: number;
  };
}

export function FocusModeToggle({ value, onChange, counts }: FocusModeToggleProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/80 p-3 flex flex-wrap gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("all")}
        className={cn(
          "rounded-xl transition-all duration-200",
          value === "all"
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:text-white"
            : "hover:bg-slate-100"
        )}
      >
        <Filter className="w-4 h-4 mr-2" />
        All Tasks
        <span className="ml-2 px-1.5 py-0.5 rounded-md bg-white/20 text-xs font-medium">
          {counts.all}
        </span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("today")}
        className={cn(
          "rounded-xl transition-all duration-200",
          value === "today"
            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 hover:text-white"
            : "hover:bg-slate-100"
        )}
      >
        <Calendar className="w-4 h-4 mr-2" />
        Today
        <span className="ml-2 px-1.5 py-0.5 rounded-md bg-white/20 text-xs font-medium">
          {counts.today}
        </span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("urgent")}
        className={cn(
          "rounded-xl transition-all duration-200",
          value === "urgent"
            ? "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700 hover:text-white"
            : "hover:bg-slate-100"
        )}
      >
        <Flag className="w-4 h-4 mr-2" />
        Urgent
        <span className="ml-2 px-1.5 py-0.5 rounded-md bg-white/20 text-xs font-medium">
          {counts.urgent}
        </span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("active")}
        className={cn(
          "rounded-xl transition-all duration-200",
          value === "active"
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:text-white"
            : "hover:bg-slate-100"
        )}
      >
        <Zap className="w-4 h-4 mr-2" />
        In Progress
        <span className="ml-2 px-1.5 py-0.5 rounded-md bg-white/20 text-xs font-medium">
          {counts.active}
        </span>
      </Button>
    </div>
  );
}
