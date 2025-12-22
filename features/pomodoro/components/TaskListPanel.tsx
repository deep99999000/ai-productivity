"use client";

import { Play, Plus, MoreHorizontal } from "lucide-react";
import { PomodoroTask } from "../schema";
import { cn } from "@/lib/utils";

interface TaskListPanelProps {
  tasks: PomodoroTask[];
  selectedTask: PomodoroTask | null;
  activeTab: "active" | "archived";
  onTabChange: (tab: "active" | "archived") => void;
  onTaskSelect: (task: PomodoroTask) => void;
  onTaskPlay: (task: PomodoroTask) => void;
  onAddTask: () => void;
  onStartFocus: () => void;
}

export default function TaskListPanel({
  tasks,
  selectedTask,
  activeTab,
  onTabChange,
  onTaskSelect,
  onTaskPlay,
  onAddTask,
  onStartFocus,
}: TaskListPanelProps) {
  const filteredTasks = tasks.filter((task) =>
    activeTab === "active" ? task.isActive : !task.isActive
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">Pomodoro</h1>
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => onTabChange("active")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === "active"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Active
            </button>
            <button
              onClick={() => onTabChange("archived")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === "archived"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Archived
            </button>
          </div>
          <button
            onClick={onAddTask}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onTaskSelect(task)}
            className={cn(
              "flex items-center gap-4 px-6 py-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50",
              selectedTask?.id === task.id && "bg-blue-50"
            )}
          >
            {/* Emoji Icon */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: `${task.color}20` }}
            >
              {task.emoji || "⏱️"}
            </div>

            {/* Task Name */}
            <span className="flex-1 text-sm font-medium text-gray-900 truncate">
              {task.name}
            </span>

            {/* Duration */}
            <span className="text-sm text-gray-400 flex-shrink-0">
              {formatDuration(task.duration)}
            </span>

            {/* Play Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTaskPlay(task);
              }}
              className="w-6 h-6 flex items-center justify-center flex-shrink-0"
            >
              <Play className="w-4 h-4 text-blue-500 fill-blue-500" />
            </button>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            No {activeTab} tasks
          </div>
        )}
      </div>

      {/* Bottom Focus Bar */}
      <div className="border-t border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Focus</p>
              <p className="text-xl font-semibold text-gray-900">
                {selectedTask ? formatDuration(selectedTask.duration).replace("m", ":00") : "10:00"}
              </p>
            </div>
          </div>
          <button
            onClick={onStartFocus}
            className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors"
          >
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
