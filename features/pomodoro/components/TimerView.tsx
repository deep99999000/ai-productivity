"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, MoreHorizontal, Play, Pause, Square } from "lucide-react";
import { usePomodoro } from "../store";
import { cn } from "@/lib/utils";

interface TimerViewProps {
  onBack: () => void;
  onOpenSettings: () => void;
  onSessionComplete: (sessionData: any) => void;
}

export default function TimerView({ onBack, onOpenSettings, onSessionComplete }: TimerViewProps) {
  const {
    selectedTask,
    timerSeconds,
    timerStatus,
    timerMode,
    startTime: storeStartTime,
    setTimerMode,
    setTimerSeconds,
    startTimer,
    pauseTimer,
    tickTimer,
    setTimerStatus,
  } = usePomodoro();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer Interval Logic
  useEffect(() => {
    if (timerStatus === "running") {
      intervalRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerStatus, tickTimer]);

  // Handle Timer Completion
  useEffect(() => {
    if (timerStatus === "completed" && timerMode === "timer") {
      const endTime = new Date();
      // Use storeStartTime if available, otherwise fallback to calculated start time
      const startTime = storeStartTime ? new Date(storeStartTime) : new Date(endTime.getTime() - (selectedTask?.duration || 600) * 1000);
      
      onSessionComplete({
        taskId: selectedTask?.id,
        startTime,
        endTime,
        duration: selectedTask?.duration || 600,
        completed: true,
        type: "focus"
      });
    }
  }, [timerStatus, timerMode, selectedTask, onSessionComplete, storeStartTime]);

  const handleStop = () => {
    const endTime = new Date();
    // Calculate duration based on elapsed time if possible, or current timer value for stopwatch
    let duration = 0;
    let startTime = new Date();

    if (timerMode === "stopwatch") {
        duration = timerSeconds;
        startTime = new Date(endTime.getTime() - duration * 1000);
    } else {
        // For timer, if stopped early, calculate how much time passed
        const totalDuration = selectedTask?.duration || 600;
        duration = totalDuration - timerSeconds;
        startTime = new Date(endTime.getTime() - duration * 1000);
    }
      
    if (duration > 0) {
        onSessionComplete({
            taskId: selectedTask?.id,
            startTime,
            endTime,
            duration,
            completed: true,
            type: "focus"
        });
    }
    
    setTimerStatus("idle");
    setTimerSeconds(timerMode === "stopwatch" ? 0 : (selectedTask?.duration || 600));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handleTimeClick = () => {
    if (timerStatus === "running") {
        pauseTimer();
    }
    if (timerMode === "timer") {
      setIsEditing(true);
      setEditValue(Math.floor(timerSeconds / 60).toString());
    }
  };

  const handleTimeBlur = () => {
    setIsEditing(false);
    const mins = parseInt(editValue);
    if (!isNaN(mins) && mins >= 0) {
      setTimerSeconds(mins * 60);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTimeBlur();
    }
  };

  // Calculate progress for the circular timer
  const totalDuration = selectedTask?.duration || 600;
  const progress = timerMode === "stopwatch" 
    ? 100 
    : (timerSeconds / totalDuration) * 100;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </button>

        {/* Mode Tabs */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button 
            onClick={() => setTimerMode("timer")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              timerMode === "timer" 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Pomo
          </button>
          <button 
            onClick={() => setTimerMode("stopwatch")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              timerMode === "stopwatch" 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Stopwatch
          </button>
        </div>

        <button 
          onClick={onOpenSettings}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Task Breadcrumb */}
      <div className="px-6 py-3">
        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <span>{selectedTask?.name || "Focus"}</span>
          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
        </button>
      </div>

      {/* Timer Circle */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative">
          <svg className="w-72 h-72 -rotate-90" viewBox="0 0 320 320">
            {/* Background Circle */}
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="#E5E7EB"
              strokeWidth="6"
              fill="none"
            />
            {/* Progress Circle */}
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="#3B82F6"
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Timer Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isEditing ? (
              <div className="flex items-center">
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleTimeBlur}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="text-6xl font-light text-gray-900 tracking-tight w-32 text-center border-b-2 border-blue-500 focus:outline-none"
                />
                <span className="text-2xl text-gray-400 ml-2">min</span>
              </div>
            ) : (
              <span 
                onClick={handleTimeClick}
                className={cn(
                  "text-6xl font-light text-gray-900 tracking-tight cursor-pointer hover:text-blue-600 transition-colors",
                  timerStatus === "running" && "cursor-default hover:text-gray-900"
                )}
              >
                {formatTime(timerSeconds)}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-12 flex items-center gap-4">
          <button
            onClick={timerStatus === "running" ? pauseTimer : startTimer}
            className={cn(
              "px-12 py-4 rounded-full font-medium text-lg transition-all shadow-lg hover:shadow-xl",
              timerStatus === "running"
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-blue-500 text-white hover:bg-blue-600"
            )}
          >
            {timerStatus === "running" ? (
              <span className="flex items-center gap-2">
                <Pause className="w-5 h-5" />
                Pause
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5 fill-current ml-0.5" />
                Start
              </span>
            )}
          </button>

          {(timerStatus === "paused" || (timerStatus === "running" && timerMode === "stopwatch")) && (
            <button
              onClick={handleStop}
              className="p-4 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          )}
        </div>

        {/* Completed Message */}
        {timerStatus === "completed" && (
          <div className="mt-6 text-center">
            <p className="text-green-600 font-medium">Session Complete! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}
