"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, RefreshCw, Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { typeConfig } from "../../utils/config";
import type { AISuggestion } from "../../types";
import { InsightDetailDialog } from "./InsightDetailDialog";
import { InsightCard } from "./InsightCard";
import axios from "axios";
import { API } from "@/lib/actions/getbackendurl";
import { useHabit } from "@/features/habits/store";
import { useHabitAIInsight } from "@/features/habits/aiInsightStore";

// Type guard
function isAISuggestionArray(data: unknown): data is AISuggestion[] {
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

export default function HabitAISection() {
  const [filter, setFilter] = useState<AISuggestion["type"] | "all">("all");
  const [selectedInsight, setSelectedInsight] = useState<AISuggestion | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { allHabits } = useHabit();
  const { insights, loading, setInsights, setLoading, shouldFetch, clearCache } = useHabitAIInsight();

  const fetchInsights = useCallback(async (force = false) => {
    if (!allHabits || allHabits.length === 0) {
      setInsights([]);
      setLoading(false);
      return;
    }

    // Check if we need to fetch
    if (!force && !shouldFetch()) {
      console.log("[Habit AI] Using cached insights");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("[Habit AI] Fetching fresh insights");
      const res = await axios.post(`/api/content/generate/habit`, {
        habits: allHabits,
      });

      const suggestions = res.data;

      if (isAISuggestionArray(suggestions)) {
        const withDates = suggestions.map((s) => ({
          ...s,
          createdAt: new Date().toISOString().split("T")[0],
        }));

        setInsights(withDates);
      } else {
        setInsights([]);
      }
    } catch (err) {
      console.warn("AI insights unavailable:", err instanceof Error ? err.message : "Unknown error");
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, [allHabits, shouldFetch, setInsights, setLoading]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const filteredInsights = useMemo(() => {
    return insights
      .filter((insight) => filter === "all" || insight.type === filter)
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [insights, filter]);

  const insightsToShow = useMemo(
    () => (showAll ? filteredInsights : filteredInsights.slice(0, 4)),
    [filteredInsights, showAll]
  );

  const handleRefresh = () => {
    clearCache();
    fetchInsights(true);
  };

  // ✅ Show skeleton while loading (even on first load)
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-6 rounded" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <h3 className="font-medium text-slate-800">AI Insights</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
            >
              {filter === "all" ? "All" : typeConfig[filter]?.label || filter}
              <ChevronDown className="h-3 w-3" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 min-w-[120px]">
                  <button
                    onClick={() => {
                      setFilter("all");
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors ${
                      filter === "all" ? "bg-slate-100 font-medium" : ""
                    }`}
                  >
                    All
                  </button>
                  {Object.entries(typeConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setFilter(key as AISuggestion["type"]);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors ${
                        filter === key ? "bg-slate-100 font-medium" : ""
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Refresh insights"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
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
              <InsightCard
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
      {!showAll && filteredInsights.length > 4 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          Show {filteredInsights.length - 4} more
        </button>
      )}

      {/* Empty State */}
      {filteredInsights.length === 0 && !loading && (
        <div className="py-8 text-center text-sm text-slate-400">
          {allHabits.length === 0 
            ? "Add habits to get AI insights"
            : "No AI insights available"}
        </div>
      )}

      <InsightDetailDialog
        insight={selectedInsight}
        onClose={() => setSelectedInsight(null)}
      />
    </div>
  );
}