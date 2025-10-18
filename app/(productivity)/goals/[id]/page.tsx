"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGoal } from "@/features/goals/utils/GoalStore";
import { useSubgoal } from "@/features/subGoals/subgoalStore";
import { useTodo } from "@/features/todo/todostore";
import { getaallsubgoal, toggleGoal } from "@/features/goals/actions/goalaction";
import type { Goal } from "@/features/goals/types/goalSchema";
import type { Subgoal } from "@/features/subGoals/subGoalschema";
import { ChevronLeft, CalendarDays, Pencil, PlusCircle } from "lucide-react";
import LoadingGoal from "@/features/goals/singlegoal/LoadingGoal";
import NewTaskButton from "@/features/todo/components/NewTodoButton";
import EnhancedInsightsDashboard from "@/features/goals/detail-view/analytics/InsightsDashboard";

// New refined components
import { 
  GoalViewTabs, 
  FocusModeToggle, 
  MomentumTracker, 
  TaskFilterBar 
} from "@/features/goals/detail-view";
import type { FocusMode, TaskFilters } from "@/features/goals/types";

// Custom hooks
import { useGoalMetrics, useTaskFiltering } from "@/features/goals/utils";

// Existing components
import MilestonesSection from "@/features/goals/detail-view/overview/MilestonesSection";
import TasksKanban from "@/features/goals/detail-view/board/TasksKanban";
import AttachmentsSection from "@/features/goals/detail-view/activity/AttachmentsSection";
import NotesSection from "@/features/goals/detail-view/activity/NotesSection";
import GoalSettingsCard from "@/features/goals/detail-view/shared/GoalSettingsCard";
import OverallProgressCard from "@/features/goals/detail-view/overview/OverallProgressCard";
import TeamMembersCard from "@/features/goals/detail-view/activity/TeamMembersCard";

// Enhanced components
import EnhancedTimeline from "@/features/goals/detail-view/overview/EnhancedTimeline";
import SmartInsightsPanel from "@/features/goals/detail-view/overview/SmartInsightsPanel";
// New: Real AI insights powered by /api/content/generate/goal
import AIInsightsCard from "@/features/goals/ai/components/AIInsightsCard";

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

const GoalDetailPage = () => {
  const params = useParams();
  const goalId = Number(params?.id);
  const { allGoals, updateGoalStatus } = useGoal();
  const { subgoals, setSubgoals } = useSubgoal();
  const [singleGoal, setSingleGoal] = useState<Goal | null>(null);

  const [notes] = useState(() => [
    { id: 1, user: "System", text: "Goal viewed", ago: "just now" },
  ]);

  const goalSubgoals = useMemo(
    () => subgoals.filter((sg): sg is Subgoal => sg.goal_id === goalId).map((sg) => ({ ...sg, description: sg.description || "" })),
    [subgoals, goalId]
  );
const { todos:t } = useTodo();

  const goalTodos = t.filter((td) => td.goal_id == goalId);

  // New state management
  const [focusMode, setFocusMode] = useState<FocusMode>("all");
  const [taskFilters, setTaskFilters] = useState<TaskFilters>({
    subgoalIds: [],
    priorities: [],
    deadlineRange: "all",
  });

  // Use custom hooks for better organization
  const { momentumMetrics, focusCounts } = useGoalMetrics(goalTodos, goalId);
  const { filteredTasks, filteredBacklog, filteredInProgress, filteredDone } = useTaskFiltering(
    goalTodos, 
    focusMode, 
    taskFilters
  );

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

  if (!singleGoal) return <LoadingGoal />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 max-w-7xl">
        <div className="space-y-6 lg:space-y-8">
          {/* Header Section */}
          <div className="bg-white/80 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-200/80 hover:shadow-md transition-all duration-300">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <Link 
                  href="/goals" 
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 transition-all duration-200 mt-1 group" 
                  aria-label="Back to Goals"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </Link>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 leading-tight">{singleGoal.name}</h1>
                  <p className="text-slate-600 text-base lg:text-lg leading-relaxed max-w-4xl">{singleGoal.description || "No description provided."}</p>
                  
                  {/* Goal Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 lg:gap-6 mt-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      <span>Due: {formatDate(singleGoal.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        singleGoal.status === 'Completed' ? 'bg-emerald-500' :
                        singleGoal.status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-400'
                      }`} />
                      <span className="capitalize">{singleGoal.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{overallProgress}%</span>
                      <span>complete</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 xl:flex-col xl:items-stretch xl:w-48">
                <button className="flex-1 xl:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-sm group">
                  <Pencil className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> 
                  Edit Goal
                </button>
                <button className="flex-1 xl:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-sm group">
                  <PlusCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> 
                  Add Milestone
                </button>
                <NewTaskButton goal_id={goalId}>
                  <button className="flex-1 xl:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 text-sm group">
                    <PlusCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> 
                    Add Task
                  </button>
                </NewTaskButton>
              </div>
            </div>
          </div>

          {/* Tabbed Interface */}
          <GoalViewTabs>
            {{
              overview: (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="xl:col-span-2 space-y-6">
                    <OverallProgressCard
                      overallProgress={overallProgress}
                      endDate={singleGoal.endDate}
                      completedCount={completedCount}
                      totalMilestones={totalMilestones}
                      formatDate={formatDate}
                    />
                    
                    {/* Enhanced Timeline */}
                    <EnhancedTimeline 
                      goal={singleGoal}
                      subgoals={goalSubgoals}
                      todos={goalTodos}
                    />

                    {/* Milestones */}
                    <MilestonesSection
                      subgoals={goalSubgoals}
                      goalTodos={goalTodos}
                      goalId={goalId}
                      goalName={singleGoal?.name}
                    />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <MomentumTracker {...momentumMetrics} />
                    
                    {/* Smart Insights Panel */}
                  

                    {/* Real AI Insights */}
                    <AIInsightsCard goalId={goalId} goalName={singleGoal.name} />
                    
                    <GoalSettingsCard />
                  </div>
                </div>
              ),

              board: (
                <div className="space-y-6">
                  {/* Focus Mode & Filters */}
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <FocusModeToggle
                        value={focusMode}
                        onChange={setFocusMode}
                        counts={focusCounts}
                      />
                    </div>
                  </div>

                  <TaskFilterBar
                    subgoals={goalSubgoals}
                    filters={taskFilters}
                    onChange={setTaskFilters}
                  />

                  {/* Kanban Board */}
                  <TasksKanban
                    backlog={filteredBacklog}
                    inProgress={filteredInProgress}
                    done={filteredDone}
                  />

                  {/* AI Insights in Board View */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2">
                      {/* Placeholder for quick stats */}
                      <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-slate-500">Showing:</span>
                            <span className="ml-2 font-semibold text-slate-900">
                              {filteredTasks.length} of {goalTodos.length} tasks
                            </span>
                          </div>
                          <div className="h-4 w-px bg-slate-200" />
                          <div>
                            <span className="text-slate-500">Completed:</span>
                            <span className="ml-2 font-semibold text-emerald-600">
                              {filteredDone.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ),

              analytics: (
                <div className="space-y-6">
                  {/* Enhanced Insights Dashboard with AI-Powered Analytics */}
                  <EnhancedInsightsDashboard 
                    goals={[singleGoal].filter(Boolean) as Goal[]}
                    subgoals={goalSubgoals}
                    todos={goalTodos}
                  />
                </div>
              ),

              activity: (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-6">
                    <NotesSection notes={notes} />
                    <AttachmentsSection />
                  </div>
                  <div className="space-y-6">
                    <TeamMembersCard />
                    <GoalSettingsCard />
                  </div>
                </div>
              ),
            }}
          </GoalViewTabs>
        </div>
      </div>
    </div>
  );
};

export default GoalDetailPage;
