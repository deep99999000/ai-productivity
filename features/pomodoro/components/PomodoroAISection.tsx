"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, RefreshCw, Loader2, ChevronDown, X, TrendingUp, Lightbulb, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { usePomodoro } from "@/features/pomodoro/store";
import useUser from "@/store/useUser";
import { usePomodoroAIInsight } from "@/features/pomodoro/aiInsightStore";

interface AISuggestion {
  type: string;
  title: string;
  description: string;
  score?: number;
  actionable?: boolean;
  tags?: string[];
  createdAt?: string;
}

const typeConfig: Record<string, { label: string; color: string; emoji: string }> = {
  productivity: { label: "Productivity", color: "blue", emoji: "🚀" },
  focus: { label: "Focus", color: "purple", emoji: "🎯" },
  timeManagement: { label: "Time Management", color: "green", emoji: "⏰" },
  breakManagement: { label: "Break Management", color: "yellow", emoji: "☕" },
  taskPlanning: { label: "Task Planning", color: "orange", emoji: "📋" },
  efficiency: { label: "Efficiency", color: "cyan", emoji: "⚡" },
  analytics: { label: "Analytics", color: "pink", emoji: "📊" },
  motivation: { label: "Motivation", color: "red", emoji: "💪" },
  energy: { label: "Energy", color: "amber", emoji: "🔋" },
  balance: { label: "Balance", color: "teal", emoji: "⚖️" },
  consistency: { label: "Consistency", color: "indigo", emoji: "📈" },
  optimization: { label: "Optimization", color: "violet", emoji: "🔧" },
};

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

export default function PomodoroAISection() {
  const [filter, setFilter] = useState<string>("all");
  const [selectedInsight, setSelectedInsight] = useState<AISuggestion | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { tasks, sessions } = usePomodoro();
  const { user } = useUser();
  const { insights, loading, setInsights, setLoading, shouldFetch, clearCache } = usePomodoroAIInsight();

  const fetchInsights = useCallback(async (force = false) => {
    if (!user) {
      setInsights([]);
      setLoading(false);
      return;
    }

    // Check if we need to fetch
    if (!force && !shouldFetch()) {
      console.log("[Pomodoro AI] Using cached insights");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("[Pomodoro AI] Fetching fresh insights");
      const res = await axios.post(`/api/content/generate/pomodoro`, {
        userId: user,
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
  }, [user, shouldFetch, setInsights, setLoading]);

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
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 min-w-[140px] max-h-64 overflow-y-auto">
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
                        setFilter(key);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors ${
                        filter === key ? "bg-slate-100 font-medium" : ""
                      }`}
                    >
                      {config.emoji} {config.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => {
              clearCache();
              fetchInsights(true);
            }}
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
          {insightsToShow.map((insight, idx) => {
            const key = `${insight.type}-${insight.title}-${idx}`;
            const config = typeConfig[insight.type] || { label: insight.type, color: "gray", emoji: "💡" };
            
            return (
              <motion.div
                key={key}
                variants={fadeItem}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="bg-white border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors cursor-pointer"
                onClick={() => setSelectedInsight(insight)}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{config.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-slate-900">{insight.title}</h4>
                      {insight.actionable && (
                        <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                          Actionable
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {insight.description.split('\n')[0]}
                    </p>
                    {insight.tags && insight.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {insight.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
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
          {!user 
            ? "Sign in to get AI insights"
            : "Complete some pomodoro sessions to get AI insights"}
        </div>
      )}

      {/* Detail Dialog */}
      {selectedInsight && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" 
          onClick={() => setSelectedInsight(null)}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-indigo-100">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <span className="text-3xl">{typeConfig[selectedInsight.type]?.emoji || "💡"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-xl text-slate-900">{selectedInsight.title}</h3>
                    {selectedInsight.actionable && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        Actionable
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-indigo-600 font-medium">
                      {typeConfig[selectedInsight.type]?.label || selectedInsight.type}
                    </span>
                    {selectedInsight.score && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-500">Score: {selectedInsight.score}/100</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Description */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-indigo-500" />
                    <h4 className="font-medium text-slate-900">Insight</h4>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    {selectedInsight.description.split('\n').map((line, i) => {
                      if (line.trim().startsWith('•')) {
                        return (
                          <div key={i} className="flex items-start gap-2 ml-4 mb-2">
                            <span className="text-indigo-500 mt-1">•</span>
                            <p className="text-slate-700 flex-1">{line.replace('•', '').trim()}</p>
                          </div>
                        );
                      }
                      return line.trim() ? (
                        <p key={i} className="text-slate-700 mb-3">{line}</p>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Tags */}
                {selectedInsight.tags && selectedInsight.tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-indigo-500" />
                      <h4 className="font-medium text-slate-900">Related Topics</h4>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedInsight.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-sm rounded-lg border border-indigo-100 font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date */}
                {selectedInsight.createdAt && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      Generated on {new Date(selectedInsight.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Mark as Applied
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
