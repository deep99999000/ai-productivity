"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, RefreshCw, Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { goalTypeConfig } from "./config";
import type { GoalAISuggestion } from "./types";
import { GoalInsightDetailDialog } from "./components/GoalInsightDetailDialog";
import { GoalInsightCard } from "./components/GoalInsightCard";
import axios from "axios";
import { API } from "@/lib/actions/getbackendurl";
import { useGoal } from "@/features/goals/utils/GoalStore";
import { useSubgoal } from "@/features/subGoals/subgoalStore";
import { useTodo } from "@/features/todo/todostore";

// Type guard
function isGoalAISuggestionArray(data: unknown): data is GoalAISuggestion[] {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as any).type === "string" &&
        typeof (item as any).title === "string" &&
        typeof (item as any).description === "string"
    )
  );
}

const fadeItem = { hidden: { opacity: 0, y: 4 }, visible: { opacity: 1, y: 0 } };

interface GoalAISectionProps {
  goalId?: number;
  goalName?: string;
}

export default function GoalAISection({ goalId, goalName }: GoalAISectionProps) {
  const [insights, setInsights] = useState<GoalAISuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<GoalAISuggestion["type"] | "all">("all");
  const [selectedInsight, setSelectedInsight] = useState<GoalAISuggestion | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { allGoals } = useGoal();
  const { subgoals } = useSubgoal();
  const { todos } = useTodo();

  // Get relevant data for the specific goal or all goals
  const relevantData = useMemo(() => {
    if (goalId) {
      // Get data for specific goal
      const goal = allGoals.find(g => g.id === goalId);
      const goalSubgoals = subgoals.filter(s => s.goal_id === goalId);
      const goalTodos = todos.filter(t => t.goal_id === goalId);
      
      return {
        goals: goal ? [goal] : [],
        subgoals: goalSubgoals,
        todos: goalTodos
      };
    } else {
      // Get all data
      return {
        goals: allGoals,
        subgoals: subgoals,
        todos: todos
      };
    }
  }, [goalId, allGoals, subgoals, todos]);

  const fetchInsights = useCallback(async () => {
    if (!relevantData.goals || relevantData.goals.length === 0) {
      setInsights([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        goals: relevantData.goals,
        subgoals: relevantData.subgoals,
        todos: relevantData.todos,
        context: {
          goalId,
          goalName,
          analysisType: goalId ? "specific_goal" : "all_goals"
        }
      };

      const res = await axios.post(`${API}/api/content/generate/goal`, requestData);
      const suggestions = res.data;

      if (isGoalAISuggestionArray(suggestions)) {
        const withDates = suggestions.map((s) => ({
          ...s,
          createdAt: new Date().toISOString().split("T")[0], // ✅ string in YYYY-MM-DD
        }));

        setInsights(withDates);
      } else {
        setInsights([]); // ← empty on invalid
      }
    } catch (err) {
      console.error("Failed to fetch AI insights:", err);
      setInsights([]); // ← empty on error
    } finally {
      setLoading(false);
    }
  }, [relevantData.goals, relevantData.subgoals, relevantData.todos, goalId, goalName]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const filteredInsights = useMemo(() => {
    return insights
      .filter((insight) => filter === "all" || insight.type === filter)
      .sort((a, b) => {
        // Sort by priority first, then by score
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return (b.score || 0) - (a.score || 0);
      });
  }, [insights, filter]);

  const insightsToShow = useMemo(
    () => (showAll ? filteredInsights : filteredInsights.slice(0, 3)),
    [filteredInsights, showAll]
  );

  // ✅ Show skeleton while loading (even on first load)
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-6 rounded" />
        </div>
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <h3 className="font-medium text-slate-800 text-sm">
            AI Insi
          </h3>
          {insights.length > 0 && (
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {insights.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-800 border border-slate-200 rounded-md hover:border-slate-300 transition-colors"
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
            >
              {filter === "all" ? "All" : goalTypeConfig[filter]?.label || filter}
              <ChevronDown className="h-3 w-3" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 min-w-[120px] max-h-40 overflow-y-auto">
                  <button
                    onClick={() => {
                      setFilter("all");
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 transition-colors ${
                      filter === "all" ? "bg-slate-100 font-medium" : ""
                    }`}
                  >
                    All
                  </button>
                  {Object.entries(goalTypeConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setFilter(key as GoalAISuggestion["type"]);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 transition-colors ${
                        filter === key ? "bg-slate-100 font-medium" : ""
                      }`}
                    >
                      <span className="mr-2">{config.icon}</span>
                      {config.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={fetchInsights}
            disabled={loading}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors rounded hover:bg-slate-100"
            aria-label="Refresh insights"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-2">
        <AnimatePresence>
          {insightsToShow.map((insight) => {
            const key = `${insight.type}-${insight.title}`;
            return (
              <GoalInsightCard
                key={key}
                suggestion={insight}
                pinned={false}
                onPin={() => {}}
                onSelect={() => setSelectedInsight(insight)}
                fadeItem={fadeItem}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Show More */}
      {!showAll && filteredInsights.length > 3 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors text-center border border-dashed border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50"
        >
          Show {filteredInsights.length - 3} more insights
        </button>
      )}

      {/* Empty State */}
      {filteredInsights.length === 0 && (
        <div className="py-6 text-center text-xs text-slate-400">
          <div className="mb-2">
            <Sparkles className="h-6 w-6 text-slate-300 mx-auto" />
          </div>
          <p className="mb-1">No insights available yet</p>
          <p>Add more goals and tasks to get AI insights</p>
        </div>
      )}

      <GoalInsightDetailDialog
        insight={selectedInsight}
        onClose={() => setSelectedInsight(null)}
      />
    </div>
  );
}
