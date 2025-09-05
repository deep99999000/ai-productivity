import { Calendar, TrendingUp, Sparkles } from "lucide-react";
import { ShowDate } from "@/components/ShowDate";
import { SubGoalStatCard } from "@/features/subGoals/components/SubGoalStatCard";

interface GoalStatsProps {
  endDate?: string | null | Date;
  status: string;
  completedCount: number;
  totalMilestones: number;
}

const SingleGoalStats = ({ endDate, status, completedCount, totalMilestones }: GoalStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <SubGoalStatCard
        title="Target Date"
        value={endDate ? <ShowDate date={endDate} /> : "Not set"}
        icon={<Calendar className="w-5 h-5" />}
        iconBgColor="bg-blue-100"
        textColor="text-blue-600"
      />
      <SubGoalStatCard
        title="Status"
        value={status}
        icon={<TrendingUp className="w-5 h-5" />}
        iconBgColor="bg-purple-100"
        textColor="text-purple-600"
      />
      <SubGoalStatCard
        title="Completion"
        value={`${completedCount} / ${totalMilestones} milestones`}
        icon={<Sparkles className="w-5 h-5" />}
        iconBgColor="bg-green-100"
        textColor="text-green-600"
      />
    </div>
  );
};

export default SingleGoalStats;
