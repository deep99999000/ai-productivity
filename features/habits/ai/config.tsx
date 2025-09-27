import type { AISuggestion } from "./types";

export const typeConfig: Record<AISuggestion["type"], { label: string; color: string; icon: string }> = {
  motivation: {
    label: "Motivation",
    color: "text-blue-600",
    icon: "💪"
  },
  optimization: {
    label: "Optimization", 
    color: "text-green-600",
    icon: "⚡"
  },
  health: {
    label: "Health",
    color: "text-red-600", 
    icon: "❤️"
  },
  social: {
    label: "Social",
    color: "text-purple-600",
    icon: "👥"
  },
  analytics: {
    label: "Analytics",
    color: "text-orange-600",
    icon: "📊"
  },
  focus: {
    label: "Focus",
    color: "text-indigo-600",
    icon: "🎯"
  },
  efficiency: {
    label: "Efficiency",
    color: "text-teal-600",
    icon: "⏱️"
  },
  learning: {
    label: "Learning",
    color: "text-cyan-600",
    icon: "📘"
  },
  creativity: {
    label: "Creativity",
    color: "text-pink-600",
    icon: "🎨"
  },
  resilience: {
    label: "Resilience",
    color: "text-gray-600",
    icon: "🛡️"
  },
  wellness: {
    label: "Wellness",
    color: "text-red-400",
    icon: "🧘‍♂️"
  },
  strategy: {
    label: "Strategy",
    color: "text-yellow-600",
    icon: "♟️"
  },
  leadership: {
    label: "Leadership",
    color: "text-purple-400",
    icon: "👑"
  }
};
