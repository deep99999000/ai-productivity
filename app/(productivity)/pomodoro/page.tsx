"use client";

import { useEffect, useState } from "react";
import { usePomodoro } from "@/features/pomodoro/store";
import { 
  getPomodoroTasks, 
  getPomodoroSessions, 
  createPomodoroTask,
  updatePomodoroTask,
  createPomodoroSession,
  deletePomodoroSession,
  updatePomodoroSession,
} from "@/features/pomodoro/actions";
import { getAllUserHabits } from "@/features/habits/actions";
import { getAllUserGoals } from "@/features/goals/actions";
import useUser from "@/store/useUser";
import { PomodoroTask, PomodoroSession, CreatePomodoroTaskInput, CreatePomodoroSessionInput } from "@/features/pomodoro/schema";
import TaskListPanel from "@/features/pomodoro/components/TaskListPanel";
import OverviewPanel from "@/features/pomodoro/components/OverviewPanel";
import TimerView from "@/features/pomodoro/components/TimerView";
import TimelinePanel from "@/features/pomodoro/components/TimelinePanel";
import TaskDialog from "@/features/pomodoro/components/TaskDialog";
import TimerSettingsDialog from "@/features/pomodoro/components/TimerSettingsDialog";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

export default function PomodoroPage() {
  const { 
    tasks, 
    sessions, 
    isFullScreen,
    selectedTask,
    timerSeconds,
    setTasks, 
    setSessions, 
    selectTask,
    setIsFullScreen,
    setTimerSeconds,
    addTask,
    updateTask,
    addSession,
    deleteSession,
    updateSession,
  } = usePomodoro();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [habits, setHabits] = useState<Array<{ id: number; name: string }>>([]);
  const [goals, setGoals] = useState<Array<{ id: number; goal: string }>>([]);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setIsLoading(true);
      const [tasksData, sessionsData, habitsData, goalsData] = await Promise.all([
        getPomodoroTasks(user),
        getPomodoroSessions(user),
        getAllUserHabits(user),
        getAllUserGoals(user),
      ]);

      setTasks(tasksData);
      setSessions(sessionsData);
      setHabits(habitsData || []);
      setGoals((goalsData || []).map(g => ({ id: g.id, goal: g.name })));
      setIsLoading(false);
    };

    loadData();
  }, [user, setTasks, setSessions]);

  const handleTaskClick = (task: PomodoroTask) => {
    selectTask(task);
  };

  const handleTaskPlay = (task: PomodoroTask) => {
    selectTask(task);
    setIsFullScreen(true);
  };

  const handleStartFocus = () => {
    if (selectedTask) {
      setIsFullScreen(true);
    } else if (tasks.length > 0) {
      selectTask(tasks[0]);
      setIsFullScreen(true);
    }
  };

  const handleAddTask = () => {
    setTaskDialogOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<PomodoroTask>) => {
    if (!user) return;

    const taskInput: CreatePomodoroTaskInput = {
      userId: user,
      name: taskData.name || "",
      category: taskData.category,
      color: taskData.color || "#8B5CF6",
      emoji: taskData.emoji,
      duration: taskData.duration || 600,
      habitId: taskData.habitId || null,
      goalId: taskData.goalId || null,
      isActive: true,
    };

    const result = await createPomodoroTask(user, taskInput);
    if (result) {
      addTask(result);
    }
  };

  const handleSaveTimerSettings = (duration: number) => {
    setTimerSeconds(duration);
    if (selectedTask) {
      updateTask(selectedTask.id, { duration });
      updatePomodoroTask(user!, selectedTask.id, { duration });
    }
  };

  const handleAddSession = async (sessionData: Omit<CreatePomodoroSessionInput, 'userId'>) => {
    if (!user) return;
    
    const newSession = await createPomodoroSession(user, {
        ...sessionData,
        userId: user,
    });

    if (newSession) {
        addSession(newSession);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!user) return;
    const success = await deletePomodoroSession(user, sessionId);
    if (success) {
        deleteSession(sessionId);
    }
  };

  const handleUpdateSession = async (sessionId: number, updates: Partial<PomodoroSession>) => {
    if (!user) return;
    const updatedSession = await updatePomodoroSession(user, sessionId, updates);
    if (updatedSession) {
        updateSession(sessionId, updates);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (isFullScreen && selectedTask) {
    return (
      <>
        <ResizablePanelGroup direction="horizontal" className="h-screen">
          {/* Left Panel - Timer */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <TimerView
              onBack={() => setIsFullScreen(false)}
              onOpenSettings={() => setSettingsDialogOpen(true)}
              onSessionComplete={handleAddSession}
            />
          </ResizablePanel>

          <ResizableHandle className="w-px bg-gray-200 hover:bg-blue-400 transition-colors" />

          {/* Right Panel - Timeline */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <TimelinePanel task={selectedTask} />
          </ResizablePanel>
        </ResizablePanelGroup>

        <TimerSettingsDialog
          open={settingsDialogOpen}
          onOpenChange={setSettingsDialogOpen}
          currentDuration={timerSeconds}
          onSave={handleSaveTimerSettings}
        />
      </>
    );
  }

  return (
    <>
      <ResizablePanelGroup direction="horizontal" className="h-screen">
        {/* Left Panel - Task List */}
        <ResizablePanel defaultSize={45} minSize={30}>
          <TaskListPanel
            tasks={tasks}
            selectedTask={selectedTask}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onTaskSelect={handleTaskClick}
            onTaskPlay={handleTaskPlay}
            onAddTask={handleAddTask}
            onStartFocus={handleStartFocus}
          />
        </ResizablePanel>

        <ResizableHandle className="w-px bg-gray-200 hover:bg-blue-400 transition-colors" />

        {/* Right Panel - Overview */}
        <ResizablePanel defaultSize={55} minSize={35}>
          <OverviewPanel 
            sessions={sessions} 
            tasks={tasks} 
            selectedTask={selectedTask}
            onAddSession={handleAddSession}
            onDeleteSession={handleDeleteSession}
            onUpdateSession={handleUpdateSession}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSave={handleSaveTask}
        habits={habits}
        goals={goals}
      />
    </>
  );
}
