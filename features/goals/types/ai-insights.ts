export interface AIInsightResponse {
  completionProbability: number;
  estimatedCompletionDate: string;
  riskFactors: string[];
  bottlenecks: string[];
  suggestionImprovements: string[];
  recommendations: Array<{
    id: string;
    type: "optimization" | "risk" | "opportunity" | "automation";
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    effort: "quick" | "medium" | "complex";
    confidence: number;
    actionable: boolean;
    automatable?: boolean;
    estimatedTimeToImplement: string;
    relatedGoalIds: number[];
    createdAt: string;
  }>;
}

export interface AIRecommendation {
  id: string;
  type: "optimization" | "risk" | "opportunity" | "automation";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "quick" | "medium" | "complex";
  confidence: number;
  actionable: boolean;
  automatable?: boolean;
  estimatedTimeToImplement: string;
  relatedGoalIds: number[];
  createdAt: string;
}
