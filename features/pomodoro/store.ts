import { create } from "zustand";
import { PomodoroTask, PomodoroSession } from "./schema";

export type TimerStatus = "idle" | "running" | "paused" | "completed";
export type TimerMode = "timer" | "stopwatch";

interface PomodoroStore {
  tasks: PomodoroTask[];
  sessions: PomodoroSession[];
  selectedTask: PomodoroTask | null;
  timerSeconds: number;
  timerStatus: TimerStatus;
  timerMode: TimerMode;
  startTime: number | null; // Timestamp when timer started/resumed
  isFullScreen: boolean;
  
  // Task actions
  setTasks: (tasks: PomodoroTask[]) => void;
  addTask: (task: PomodoroTask) => void;
  updateTask: (id: number, updates: Partial<PomodoroTask>) => void;
  deleteTask: (id: number) => void;
  selectTask: (task: PomodoroTask | null) => void;
  
  // Session actions
  setSessions: (sessions: PomodoroSession[]) => void;
  addSession: (session: PomodoroSession) => void;
  updateSession: (id: number, updates: Partial<PomodoroSession>) => void;
  deleteSession: (id: number) => void;
  
  // Timer actions
  setTimerSeconds: (seconds: number) => void;
  setTimerStatus: (status: TimerStatus) => void;
  setTimerMode: (mode: TimerMode) => void;
  setIsFullScreen: (isFullScreen: boolean) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;
}

export const usePomodoro = create<PomodoroStore>((set, get) => ({
  tasks: [],
  sessions: [],
  selectedTask: null,
  timerSeconds: 600, // 10 minutes default
  timerStatus: "idle",
  timerMode: "timer",
  startTime: null,
  isFullScreen: false,
  
  // Task actions
  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task],
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    ),
    selectedTask: state.selectedTask?.id === id 
      ? { ...state.selectedTask, ...updates } 
      : state.selectedTask,
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id),
    selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
  })),
  
  selectTask: (task) => set({ 
    selectedTask: task,
    timerSeconds: task?.duration || 600,
    timerStatus: "idle",
    isFullScreen: false,
    timerMode: "timer",
    startTime: null,
  }),
  
  // Session actions
  setSessions: (sessions) => set({ sessions }),
  
  addSession: (session) => set((state) => ({
    sessions: [...state.sessions, session],
  })),

  updateSession: (id, updates) => set((state) => ({
    sessions: state.sessions.map((session) =>
      session.id === id ? { ...session, ...updates } : session
    ),
  })),

  deleteSession: (id) => set((state) => ({
    sessions: state.sessions.filter((session) => session.id !== id),
  })),
  
  // Timer actions
  setTimerSeconds: (seconds) => set({ timerSeconds: seconds }),
  
  setTimerStatus: (status) => set({ timerStatus: status }),

  setTimerMode: (mode) => set({ 
    timerMode: mode, 
    timerSeconds: mode === "stopwatch" ? 0 : (get().selectedTask?.duration || 600),
    timerStatus: "idle",
    startTime: null
  }),
  
  setIsFullScreen: (isFullScreen) => set({ isFullScreen }),
  
  startTimer: () => set((state) => {
    const now = Date.now();
    let startTime;
    if (state.timerMode === "timer") {
        // For timer, startTime represents the target end time
        startTime = now + state.timerSeconds * 1000;
    } else {
        // For stopwatch, startTime represents the actual start time (adjusted for existing duration)
        startTime = now - state.timerSeconds * 1000;
    }
    return { timerStatus: "running", startTime };
  }),
  
  pauseTimer: () => set({ timerStatus: "paused", startTime: null }),
  
  resetTimer: () => set((state) => ({
    timerSeconds: state.timerMode === "stopwatch" ? 0 : (state.selectedTask?.duration || 600),
    timerStatus: "idle",
    startTime: null,
  })),
  
  tickTimer: () => set((state) => {
    if (state.timerStatus !== "running" || !state.startTime) return {};
    
    const now = Date.now();
    if (state.timerMode === "stopwatch") {
        const seconds = Math.floor((now - state.startTime) / 1000);
        return { timerSeconds: seconds };
    } else {
        const seconds = Math.ceil((state.startTime - now) / 1000);
        if (seconds <= 0) {
            return { timerSeconds: 0, timerStatus: "completed", startTime: null };
        }
        return { timerSeconds: seconds };
    }
  }),
}));

