"use client";

import { useState } from "react";
import { Brain, Plus, Sparkles, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GoalAISuggestion } from "@/features/goals/ai/types";
import { goalTypeConfig } from "@/features/goals/ai/config";

interface EnhancedAIInsightsPanelProps {
  insights: GoalAISuggestion[];
  onCreateTaskFromInsight: (insight: GoalAISuggestion) => void;
  onRefreshInsights: () => void;
  loading?: boolean;
}

export function EnhancedAIInsightsPanel({
  insights,
  onCreateTaskFromInsight,
  onRefreshInsights,
  loading = false,
}: EnhancedAIInsightsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sort insights by priority and actionability
  const sortedInsights = [...insights].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority || "low"];
    const bPriority = priorityOrder[b.priority || "low"];
    
    if (aPriority !== bPriority) return bPriority - aPriority;
    if (a.actionable && !b.actionable) return -1;
    if (!a.actionable && b.actionable) return 1;
    return 0;
  });

  const actionableInsights = sortedInsights.filter((i) => i.actionable);
  const riskInsights = sortedInsights.filter((i) => i.type === "risk" || i.priority === "high");

  return (
    <Card className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 border-indigo-200/60 p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">AI Insights</h3>
            <p className="text-xs text-slate-500">
              {actionableInsights.length} actionable • {riskInsights.length} alerts
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRefreshInsights}
          disabled={loading}
          className="rounded-xl"
        >
          <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Risk Alerts */}
      {riskInsights.length > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/60 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-semibold text-red-700 uppercase">
              Attention Required
            </span>
          </div>
          <div className="space-y-1">
            {riskInsights.slice(0, 2).map((insight, i) => (
              <div key={i} className="text-xs text-slate-700 bg-white/50 rounded-lg p-2">
                {insight.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedInsights.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No insights yet. Keep working on your goal!</p>
          </div>
        ) : (
          sortedInsights.map((insight, i) => {
            const config = goalTypeConfig[insight.type];
            const isExpanded = expandedId === `${i}`;

            return (
              <div
                key={i}
                className="bg-white/70 backdrop-blur rounded-xl border border-slate-200/60 p-3 hover:border-indigo-300 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">
                        {insight.title}
                      </h4>
                      {insight.priority && (
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[10px] ${
                            insight.priority === "high"
                              ? "border-red-300 text-red-700 bg-red-50"
                              : insight.priority === "medium"
                                ? "border-orange-300 text-orange-700 bg-orange-50"
                                : "border-slate-300 text-slate-600 bg-slate-50"
                          }`}
                        >
                          {insight.priority}
                        </Badge>
                      )}
                    </div>

                    <p
                      className={`text-xs text-slate-600 mb-2 ${
                        isExpanded ? "" : "line-clamp-2"
                      }`}
                    >
                      {insight.description}
                    </p>

                    {insight.description.length > 100 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : `${i}`)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mb-2"
                      >
                        {isExpanded ? "Show less" : "Read more"}
                      </button>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        {insight.estimatedTimeToComplete && (
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3" />
                            {insight.estimatedTimeToComplete}
                          </span>
                        )}
                        {insight.score && (
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                            Confidence: {insight.score}%
                          </span>
                        )}
                      </div>

                      {insight.actionable && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onCreateTaskFromInsight(insight)}
                          className="h-7 rounded-lg text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Create Task
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
