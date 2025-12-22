import { useMemo } from 'react';
import type { Todo } from '@/features/todo/schema';
import type { MomentumMetrics, AnalyticsMetrics, FocusCounts } from '../types';

// 🎣 Custom hook to compute goal metrics
export const useGoalMetrics = (goalTodos: Todo[], goalId: number) => {
  // 📈 Compute momentum metrics
  const momentumMetrics = useMemo((): MomentumMetrics => {
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

  // 🔍 Focus mode counts
  const focusCounts = useMemo((): FocusCounts => {
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

  // 📊 Analytics metrics
  const analyticsMetrics = useMemo((): AnalyticsMetrics => {
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

    // 📈 Compute weekly velocity
    const weeklyVelocity = computeWeeklyVelocity(goalTodos, goalId);

    return {
      completedTasks: completed,
      totalTasks: total,
      weeklyVelocity,
      addedThisWeek,
      completedThisWeek,
    };
  }, [goalTodos, goalId]);

  return {
    momentumMetrics,
    focusCounts,
    analyticsMetrics,
  };
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
