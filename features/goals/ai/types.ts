export type GoalAISuggestion = {
  type:
    | "progress"
    | "timeline"
    | "optimization"
    | "motivation"
    | "prioritization"
    | "strategy"
    | "collaboration"
    | "resources"
    | "efficiency"
    | "learning"
    | "analytics"
    | "planning"
    | "risk"
    | "execution";
  title: string;
  description: string;
  score?: number;
  actionable?: boolean;
  createdAt?: string; // YYYY-MM-DD
  tags?: string[];
  priority?: "low" | "medium" | "high";
  relatedGoalId?: number;
  relatedSubgoalId?: number;
  estimatedTimeToComplete?: string;
};
