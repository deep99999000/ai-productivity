import { Button } from "@/components/ui/button";
import { Flag, Sparkles } from "lucide-react";
import { MilestoneCard } from "@/features/subGoals/components/MilestoneCard";
import { useDialog } from "@/hooks/usedialog";
import NewSubGoalDialog from "@/features/subGoals/components/Newsubgoal";
import GenerateSubgoalWithAIDialog from "@/features/subGoals/components/GenerateSubgoalWithAIDialog";
import type { Subgoal } from "@/features/subGoals/subGoalschema";
interface MilestoneSectionProps {
  goalId: number;
  goalSubgoals: Subgoal[];
}

const MilestoneSection = ({ goalId, goalSubgoals }: MilestoneSectionProps) => {
  const { open, isOpen, close } = useDialog();

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          <h2 className="text-3xl font-bold text-slate-900">Milestones</h2>
          <span className="text-slate-500 text-lg">
            ({goalSubgoals.length} total)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <GenerateSubgoalWithAIDialog goalId={goalId} />
          <Button
            onClick={open}
            variant="outline"
            className="group border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2 font-medium px-6 py-6 text-slate-700 rounded-xl"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </span>
            Add New Milestone
          </Button>
        </div>
      </div>

      {/* Milestone List */}
      {goalSubgoals.length > 0 ? (
        <div className="space-y-5">
          {goalSubgoals.map((subgoal, index) => (
            <MilestoneCard
              key={index}
              id={subgoal.id}
              title={subgoal.name}
              description={subgoal.description || ""}
              status={subgoal.status}
              hrefBase={`/subgoals`}
              className="hover:shadow-lg transition-shadow duration-200"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Flag className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700">No milestones yet</h3>
          <p className="text-slate-500 mt-1">
            Click &quot;Add New Milestone&quot; to get started.
          </p>
        </div>
      )}

      {/* Dialog */}
      <NewSubGoalDialog isOpen={isOpen} setIsOpen={close} goal_id={String(goalId)} />
    </div>
  );
};

export default MilestoneSection;
