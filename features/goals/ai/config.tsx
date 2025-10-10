import type { GoalAISuggestion } from "./types";

export const goalTypeConfig: Record<GoalAISuggestion["type"], { label: string; color: string; icon: string }> = {
  progress: {
    label: "Progress",
    color: "text-blue-600",
    icon: "📈"
  },
  timeline: {
    label: "Timeline", 
    color: "text-purple-600",
    icon: "⏰"
  },
  optimization: {
    label: "Optimization",
    color: "text-green-600",
    icon: "⚡"
  },
  motivation: {
    label: "Motivation",
    color: "text-red-600",
    icon: "💪"
  },
  prioritization: {
    label: "Prioritization",
    color: "text-orange-600",
    icon: "🎯"
  },
  strategy: {
    label: "Strategy",
    color: "text-indigo-600",
    icon: "♟️"
  },
  collaboration: {
    label: "Collaboration",
    color: "text-teal-600",
    icon: "👥"
  },
  resources: {
    label: "Resources",
    color: "text-cyan-600",
    icon: "📚"
  },
  efficiency: {
    label: "Efficiency",
    color: "text-pink-600",
    icon: "⏱️"
  },
  learning: {
    label: "Learning",
    color: "text-gray-600",
    icon: "🧠"
  },
  analytics: {
    label: "Analytics",
    color: "text-yellow-600",
    icon: "📊"
  },
  planning: {
    label: "Planning",
    color: "text-purple-400",
    icon: "📋"
  },
  risk: {
    label: "Risk Management",
    color: "text-red-400",
    icon: "⚠️"
  },
  execution: {
    label: "Execution",
    color: "text-emerald-600",
    icon: "🚀"
  }
};
