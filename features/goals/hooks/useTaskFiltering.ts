import { useMemo } from 'react';
import type { Todo } from '@/features/todo/schema';
import type { TaskFilters } from '../types';

export const useTaskFiltering = (
  goalTodos: Todo[],
  focusMode: "all" | "today" | "urgent" | "active",
  taskFilters: TaskFilters
) => {
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

  return {
    filteredTasks,
    filteredBacklog,
    filteredInProgress,
    filteredDone,
  };
};
