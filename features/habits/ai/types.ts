export type AISuggestion = {
  type:
    | "motivation"
    | "optimization"
    | "health"
    | "social"
    | "analytics"
    | "focus"
    | "efficiency"
    | "learning"
    | "creativity"
    | "resilience"
    | "wellness"
    | "strategy"
    | "leadership";
  title: string;
  description: string;
  score?: number;
  actionable?: boolean;
  createdAt?: string; // YYYY-MM-DD
  tags?: string[];
};