"use client";
import { useSubgoal } from "@/features/subGoals/subgoalStore";
import ProgressBar from "../../ui/ProgressBar";

interface OverallProgressCardProps {
  overallProgress: number;
  endDate: string | Date | null | undefined;
  completedCount: number;
  totalMilestones: number;
  formatDate: (d?: string | Date | null) => string;
}

const OverallProgressCard = ({ overallProgress, endDate, completedCount, totalMilestones, formatDate }: OverallProgressCardProps) => {
 
  return(
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80 relative overflow-hidden">
    <div className="relative z-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Overall Progress</h3>
        <p className="text-3xl font-bold text-indigo-600">{overallProgress}%</p>
      </div>
      <ProgressBar value={overallProgress} className="mb-4" />
      <div className="text-sm text-gray-500 flex justify-between">
        <span>Est. Completion: {formatDate(endDate as any)}</span>
        <span><span className="font-semibold text-gray-700">{completedCount}</span> / {totalMilestones} milestones</span>
      </div>
    </div>
  </div>
)};

export default OverallProgressCard;
