"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGoal } from "@/features/goals/GoalStore";
import { useSubgoal } from "@/features/subGoals/subgoalStore";
import { useTodo } from "@/features/todo/todostore";
import { getaallsubgoal, toggleGoal } from "@/features/goals/goalaction";
import type { Goal } from "@/features/goals/goalSchema";
import type { Subgoal } from "@/features/subGoals/subGoalschema";
import type { Todo } from "@/features/todo/todoSchema";
import { ChevronLeft, CalendarDays, Pencil, PlusCircle } from "lucide-react";
import LoadingGoal from "@/features/goals/components/singlegoal/LoadingGoal";
import NewTaskButton from "@/features/todo/components/NewTodoButton";

// New refined components
import { GoalViewTabs } from "@/features/goals/components/detail/GoalViewTabs";
import { FocusModeToggle, type FocusMode } from "@/features/goals/components/detail/FocusModeToggle";
import { MomentumTracker } from "@/features/goals/components/detail/MomentumTracker";
import { AnalyticsCharts } from "@/features/goals/components/detail/AnalyticsCharts";
import { TaskFilterBar, type TaskFilters } from "@/features/goals/components/detail/TaskFilterBar";
import { EnhancedAIInsightsPanel } from "@/features/goals/components/detail/EnhancedAIInsightsPanel";

// Existing components
import Timeline from "@/features/goals/components/detail/Timeline";
import MilestonesSection from "@/features/goals/components/detail/MilestonesSection";
import TasksKanban from "@/features/goals/components/detail/TasksKanban";
import AttachmentsSection from "@/features/goals/components/detail/AttachmentsSection";
import NotesSection from "@/features/goals/components/detail/NotesSection";
import GoalSettingsCard from "@/features/goals/components/detail/GoalSettingsCard";
import OverallProgressCard from "@/features/goals/components/detail/OverallProgressCard";
import TeamMembersCard from "@/features/goals/components/detail/TeamMembersCard";
import GoalAISection from "@/features/goals/ai/GoalAISection";

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

  const goalTodos = t.filter((td) => td.goal_id == goalId);

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

  const backlog = goalTodos.filter((t) => !t.isDone && !t.startDate);
  const inProgress = goalTodos.filter((t) => !t.isDone && t.startDate);
  const done = goalTodos.filter((t) => t.isDone);

  const weeklyVelocity = computeWeeklyVelocity(todos, goalId);

  // New state management
  const [focusMode, setFocusMode] = useState<FocusMode>("all");
  const [taskFilters, setTaskFilters] = useState<TaskFilters>({
    subgoalIds: [],
    priorities: [],
    deadlineRange: "all",
  });
  const [aiInsights, setAiInsights] = useState<any[]>([]);

  // Compute momentum metrics
  const momentumMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const completedToday = goalTodos.filter(
      (t) => t.isDone && t.endDate && new Date(t.endDate) >= today
    ).length;

    const completedThisWeek = goalTodos.filter(
      (t) => t.isDone && t.endDate && new Date(t.endDate) >= weekAgo
    ).length;

    const recentWins = goalTodos
      .filter((t) => t.isDone && t.endDate && new Date(t.endDate) >= weekAgo)
      .slice(0, 3)
      .map((t) => t.name);

    return {
      streak: 5, // TODO: Calculate actual streak
      tasksCompletedToday: completedToday,
      tasksCompletedThisWeek: completedThisWeek,
      daysActive: 12, // TODO: Calculate from actual activity
      recentWins,
    };
  }, [goalTodos]);

  // Filter tasks based on focus mode and filters
  const filteredTasks = useMemo(() => {
    let filtered = [...goalTodos];

    // Apply focus mode
    if (focusMode === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter((t) => {
        if (!t.endDate) return false;
        const taskDate = new Date(t.endDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      });
    } else if (focusMode === "urgent") {
      filtered = filtered.filter((t) => t.priority === "high" && !t.isDone);
    } else if (focusMode === "active") {
      filtered = filtered.filter((t) => !t.isDone && t.startDate);
    }

    // Apply advanced filters
    if (taskFilters.subgoalIds.length > 0) {
      filtered = filtered.filter((t) => taskFilters.subgoalIds.includes(t.subgoal_id || 0));
    }

    if (taskFilters.priorities.length > 0) {
      filtered = filtered.filter((t) => taskFilters.priorities.includes(t.priority || ""));
    }

    if (taskFilters.deadlineRange !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((t) => {
        if (!t.endDate) return false;
        const taskDate = new Date(t.endDate);

        if (taskFilters.deadlineRange === "today") {
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime();
        } else if (taskFilters.deadlineRange === "week") {
          const weekFromNow = new Date(today);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          return taskDate >= today && taskDate <= weekFromNow;
        } else if (taskFilters.deadlineRange === "overdue") {
          return taskDate < today && !t.isDone;
        }
        return true;
      });
    }

    return filtered;
  }, [goalTodos, focusMode, taskFilters]);

  const filteredBacklog = filteredTasks.filter((t) => !t.isDone && !t.startDate);
  const filteredInProgress = filteredTasks.filter((t) => !t.isDone && t.startDate);
  const filteredDone = filteredTasks.filter((t) => t.isDone);

  // Focus mode counts
  const focusCounts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      all: goalTodos.length,
      today: goalTodos.filter((t) => {
        if (!t.endDate) return false;
        const taskDate = new Date(t.endDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      }).length,
      urgent: goalTodos.filter((t) => t.priority === "high" && !t.isDone).length,
      active: goalTodos.filter((t) => !t.isDone && t.startDate).length,
    };
  }, [goalTodos]);

  // Analytics metrics
  const analyticsMetrics = useMemo(() => {
    const completed = goalTodos.filter((t) => t.isDone).length;
    const total = goalTodos.length;

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const addedThisWeek = goalTodos.filter(
      (t) => new Date(t.startDate || "") >= weekAgo
    ).length;

    const completedThisWeek = goalTodos.filter(
      (t) => t.isDone && t.endDate && new Date(t.endDate) >= weekAgo
    ).length;

    return {
      completedTasks: completed,
      totalTasks: total,
      weeklyVelocity,
      addedThisWeek,
      completedThisWeek,
    };
  }, [goalTodos, weeklyVelocity]);

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
                    
                    {/* Timeline */}
                    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
                      <div className="flex items-center mb-6">
                        <CalendarDays className="text-indigo-500 mr-3 w-6 h-6" />
                        <h2 className="text-xl font-bold text-slate-900">Project Timeline</h2>
                      </div>
                      <Timeline subgoals={goalSubgoals} todos={goalTodos} />
                    </div>

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
                    
                    <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-200/80">
                      <GoalAISection goalId={goalId} goalName={singleGoal?.name} />
                    </div>
                    
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
                  <AnalyticsCharts {...analyticsMetrics} />
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <OverallProgressCard
                      overallProgress={overallProgress}
                      endDate={singleGoal.endDate}
                      completedCount={completedCount}
                      totalMilestones={totalMilestones}
                      formatDate={formatDate}
                    />
                    <MomentumTracker {...momentumMetrics} />
                  </div>
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
