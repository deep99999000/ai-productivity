"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Habit } from "../schema";
import { cn } from "@/lib/utils";
import HabitDetails from "./list/HabitDetails";
import HabitAISection from "./analytics/HabitAISection";

interface HabitOverviewPanelProps {
  selectedHabit: Habit | null;
}

export default function HabitOverviewPanel({ 
  selectedHabit
}: HabitOverviewPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "insights">("overview");

  if (!selectedHabit) {
    return (
      <div className="h-full flex items-center justify-center bg-white text-gray-400">
        Select a habit to view details
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tab Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              activeTab === "overview"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
              activeTab === "insights"
                ? "bg-indigo-50 text-indigo-900"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <Sparkles className="w-4 h-4" />
            AI Insights
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "overview" ? (
          <HabitDetails habit={selectedHabit} />
        ) : (
          <div className="px-6 py-6">
            <HabitAISection />
          </div>
        )}
      </div>
    </div>
  );
}
