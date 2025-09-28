"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGoal } from "@/features/goals/GoalStore";
import { useSubgoal } from "@/features/subGoals/subgoalStore";
import { useTodo } from "@/features/todo/todostore";
import { getaallsubgoal, toggleGoal } from "@/features/goals/goalaction";
import type { Goal } from "@/features/goals/goalSchema";
import type { Subgoal } from "@/features/subGoals/subGoalschema";
import type { Todo } from "@/features/todo/todoSchema";
import { ChevronLeft, CalendarDays,Pencil, PlusCircle } from "lucide-react";
import LoadingGoal from "@/features/goals/components/singlegoal/LoadingGoal";

import Timeline from "@/features/goals/components/detail/Timeline";
import MilestonesSection from "@/features/goals/components/detail/MilestonesSection";
import TasksKanban from "@/features/goals/components/detail/TasksKanban";
import AttachmentsSection from "@/features/goals/components/detail/AttachmentsSection";
import NotesSection from "@/features/goals/components/detail/NotesSection";
import GoalSettingsCard from "@/features/goals/components/detail/GoalSettingsCard";
import OverallProgressCard from "@/features/goals/components/detail/OverallProgressCard";
import AIInsightsCard from "@/features/goals/components/detail/AIInsightsCard";
import TeamMembersCard from "@/features/goals/components/detail/TeamMembersCard";
import AnalyticsCard from "@/features/goals/components/detail/AnalyticsCard";
import MotivationFocusCard from "@/features/goals/components/detail/MotivationFocusCard";

// Utility formatters
const formatDate = (date?: string | Date | null) => {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
};

const subgoalStatusValue = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("completed")) return 1;
  if (s.includes("progress")) return 0.5;
  return 0;
};

const computeWeeklyVelocity = (todos: Todo[], goalId: number) => {
  const goalTodos = todos.filter((t) => t.goal_id === goalId && t.isDone);
  const now = new Date();
  const weeks: number[] = [0, 0, 0, 0];
  goalTodos.forEach((t) => {
    const ref = (t.endDate as Date) || (t.startDate as Date) || now;
    const diffWeeks = Math.floor((now.getTime() - new Date(ref).getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (diffWeeks >= 0 && diffWeeks < 4) {
      weeks[3 - diffWeeks] += 1;
    }
  });
  return weeks;
};

const GoalDetailPage = () => {
  const params = useParams();
  const goalId = Number(params?.id);
  const { allGoals, updateGoalStatus } = useGoal();
  const { subgoals, setSubgoals } = useSubgoal();
  const { todos } = useTodo();
  const [singleGoal, setSingleGoal] = useState<Goal | null>(null);

  const [notes] = useState(() => [
    { id: 1, user: "System", text: "Goal viewed", ago: "just now" },
  ]);

  const goalSubgoals = useMemo(
    () => subgoals.filter((sg): sg is Subgoal => sg.goal_id === goalId).map((sg) => ({ ...sg, description: sg.description || "" })),
    [subgoals, goalId]
  );
const { todos:t} = useTodo();

  const goalTodos = t

  const subgoalProgress = goalSubgoals.map((sg) => {
    const sgTodos = goalTodos.filter((t) => t.subgoal_id === sg.id);
    const done = sgTodos.filter((t) => t.isDone).length;
    const total = sgTodos.length;
    const percent = total > 0 ? (done / total) * 100 : subgoalStatusValue(sg.status) * 100;
    return { id: sg.id, percent, done, total };
  });

  const completedCount = subgoalProgress.filter((p) => p.percent === 100).length;
  const totalMilestones = goalSubgoals.length;
  const overallProgress = totalMilestones > 0 ? Math.round((subgoalProgress.reduce((a, b) => a + b.percent, 0) / (100 * totalMilestones)) * 100) : 0;

  useEffect(() => {
    const currentGoal = allGoals.find((g) => g.id === goalId) || null;
    setSingleGoal(currentGoal);
    if (subgoals.length === 0) {
      getaallsubgoal(goalId).then(setSubgoals);
    }
  }, [allGoals, goalId, subgoals.length, setSubgoals]);

  useEffect(() => {
    if (!singleGoal) return;
    let newStatus: Goal["status"];
    if (totalMilestones === 0) newStatus = "Not Started";
    else if (completedCount === totalMilestones) newStatus = "Completed";
    else newStatus = "In Progress";

    if (singleGoal.status !== newStatus) {
      updateGoalStatus(goalId, newStatus);
      toggleGoal(goalId, newStatus);
    }
  }, [totalMilestones, completedCount, singleGoal, goalId, updateGoalStatus]);

  const endDate = singleGoal?.endDate ? new Date(singleGoal.endDate) : null;
  const today = new Date();
  const scheduleInsight: { alert?: string; estimate?: string } = {};
  if (endDate) {
    const totalDuration = endDate.getTime() - today.getTime();
    const remainingDays = Math.max(0, Math.round(totalDuration / (1000 * 60 * 60 * 24)));
    if (overallProgress < 50 && remainingDays < 10) {
      scheduleInsight.alert = `Progress behind: ${overallProgress}% with ${remainingDays} days left.`;
    }
    scheduleInsight.estimate = `Estimated completion ${(overallProgress >= 100 ? "Completed" : endDate.toLocaleDateString())}`;
  }

  const backlog = goalTodos
  const inProgress = goalTodos.filter((t) => !t.isDone && t.startDate);
  const done = goalTodos.filter((t) => t.isDone);

  const weeklyVelocity = computeWeeklyVelocity(todos, goalId);

  if (!singleGoal) return <LoadingGoal />;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <main className="flex-1 p-6 md:p-8 main-gradient-bg">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex items-start gap-4">
              <Link href="/goals" className="text-gray-500 hover:text-indigo-600 transition-colors mt-1" aria-label="Back to Goals">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{singleGoal.name}</h1>
                <p className="text-gray-500 mt-1 max-w-2xl whitespace-pre-wrap">{singleGoal.description || "No description provided."}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 text-sm"><Pencil className="w-4 h-4 mr-2" /> Edit Goal</button>
              <button className="flex items-center bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 text-sm"><PlusCircle className="w-4 h-4 mr-2" /> Add Milestone</button>
              <button className="flex items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 text-sm"><PlusCircle className="w-4 h-4 mr-2" /> Add Task</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Milestones */}
              <MilestonesSection subgoals={goalSubgoals} goalTodos={goalTodos} goalId={goalId} />

              {/* Timeline */}
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
                <div className="flex items-center mb-4">
                  <CalendarDays className="text-indigo-500 mr-3 w-6 h-6" />
                  <h2 className="text-xl font-bold text-gray-900">Project Timeline / Roadmap</h2>
                </div>
                <Timeline subgoals={goalSubgoals} todos={goalTodos} />
              </div>

              {/* Tasks Kanban */}
              <TasksKanban backlog={backlog} inProgress={inProgress} done={done} />

              {/* Attachments */}
              <AttachmentsSection />

              {/* Notes */}
              <NotesSection notes={notes} />
            </div>

            <div className="space-y-8">
              <GoalSettingsCard />
              <OverallProgressCard overallProgress={overallProgress} endDate={singleGoal.endDate} completedCount={completedCount} totalMilestones={totalMilestones} formatDate={formatDate} />
              <AIInsightsCard alert={scheduleInsight.alert} estimate={scheduleInsight.estimate} />
              <TeamMembersCard />
              <AnalyticsCard weeklyVelocity={weeklyVelocity} />
              <MotivationFocusCard overallProgress={overallProgress} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GoalDetailPage;
