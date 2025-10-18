"use client";
import GoalAISection from "@/features/goals/ai/GoalAISection";

interface AIInsightsCardProps {
  goalId?: number;
  goalName?: string;
}

const AIInsightsCard = ({ goalId, goalName }: AIInsightsCardProps) => (
  <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-200/80">
    {/* <GoalAISection goalId={goalId} goalName={goalName} /> */}
  </div>
);

export default AIInsightsCard;
