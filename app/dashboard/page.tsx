"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { ApexOptions } from "apexcharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ListTodo, CheckCircle2, Target, Flame, BookText, Brain } from "lucide-react";
import { useTodo } from "@/features/todo/todostore";
import { useGoal } from "@/features/goals/GoalStore";

// Extracted dashboard components
import StatCard from "@/features/dashboard/components/StatCard";
import MoodTracker from "@/features/dashboard/components/MoodTracker";
import TimeTracking from "@/features/dashboard/components/TimeTracking";
import ProductivityTrend from "@/features/dashboard/components/ProductivityTrend";
import HabitWeek from "@/features/dashboard/components/HabitWeek";
import GoalRadials from "@/features/dashboard/components/GoalRadials";
import NextTaskCard from "@/features/dashboard/components/NextTaskCard";
import HabitsToday from "@/features/dashboard/components/HabitsToday";
import FocusTimer from "@/features/dashboard/components/FocusTimer";
import JournalInsights from "@/features/dashboard/components/JournalInsights";
import JournalList from "@/features/dashboard/components/JournalList";
import QuickActionsBar from "@/features/dashboard/components/QuickActionsBar";

// ---- Helper Data ----
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const tips = [
  "Batch similar tasks to reduce context switching.",
  "Use the 2‑minute rule: if it takes <2 minutes, do it now.",
  "Plan tomorrow the night before—clarity beats motivation.",
  "Protect your deep work with calendar blocks.",
  "Start small: consistency beats intensity.",
];

// Add emojis for habits (used in weekly tracker labels)
const habitEmoji: Record<string, string> = {
  water: "💧",
  workout: "💪",
  read: "📚",
  meditate: "🧘",
  sleep: "😴",
};

export default function DashboardPage() {
  const { todos } = useTodo();
  const { allGoals } = useGoal();

  const totalTodos = todos?.length ?? 0;
  const completedTodos = todos?.filter((t: any) => t.isDone)?.length ?? 0;
  const progressPct = totalTodos ? Math.round((completedTodos / totalTodos) * 100) : 0;
  const activeGoals = allGoals?.filter((g: any) => g.status !== "Completed")?.length ?? 0;

  // Ensure AI Tip rotator state exists
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTipIndex((i) => (i + 1) % tips.length), 6000);
    return () => clearInterval(id);
  }, []);

  // Focus timer (simple Pomodoro style)
  const DEFAULT_SECONDS = 25 * 60;
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SECONDS);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [running]);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  // Mood tracker state
  const [moodHistory, setMoodHistory] = useState<{ day: string; mood: number }[]>([
    { day: "Mon", mood: 3 },
    { day: "Tue", mood: 4 },
    { day: "Wed", mood: 2 },
    { day: "Thu", mood: 4 },
    { day: "Fri", mood: 5 },
    { day: "Sat", mood: 3 },
    { day: "Sun", mood: 4 },
  ]);
  const addMood = (val: number) => {
    const day = weekDays[moodHistory.length % 7];
    setMoodHistory((h) => (h.length >= 7 ? [...h.slice(1), { day, mood: val }] : [...h, { day, mood: val }]));
  };

  // Simple Habits (done/undone)
  const [habits, setHabits] = useState(
    [
      { id: "water", name: "Drink Water", done: true },
      { id: "workout", name: "Workout", done: false },
      { id: "read", name: "Read 20m", done: true },
      { id: "meditate", name: "Meditate", done: false },
      { id: "sleep", name: "Sleep by 11", done: false },
    ] as { id: string; name: string; done: boolean }[]
  );
  const toggleHabit = (id: string) => setHabits((hs) => hs.map((h) => (h.id === id ? { ...h, done: !h.done } : h)));

  // Add simple week-wise habit completion state (Mon..Sun)
  const [habitWeek, setHabitWeek] = useState<Record<string, boolean[]>>({
    water: [true, false, true, true, false, false, true],
    workout: [false, false, true, false, true, false, false],
    read: [true, true, true, true, false, true, false],
    meditate: [false, true, false, true, false, true, false],
    sleep: [false, false, false, true, true, false, true],
  });
  const toggleHabitDay = (hid: string, dayIdx: number) =>
    setHabitWeek((w) => ({ ...w, [hid]: (w[hid] || Array(7).fill(false)).map((v, i) => (i === dayIdx ? !v : v)) }));

  // ---- Charts config ----
  const baseAnimation = { animations: { enabled: true, easing: "easeinout", speed: 600 } } as ApexOptions;

  // Format hours to `Xh Ym`
  const formatHM = (hours: number) => {
    const totalMin = Math.round((hours ?? 0) * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}h ${m}m`;
  };

  // Shared Apex theme (toolbar off, light tooltip, subtle grid)
  const apexTheme: ApexOptions = {
    chart: { toolbar: { show: false }, animations: { enabled: true } },
    grid: { strokeDashArray: 4 },
    tooltip: { theme: "light" },
  };

  const weeklyTasksOptions: ApexOptions = {
    chart: { type: "area", toolbar: { show: false }, sparkline: { enabled: false } },
    stroke: { curve: "smooth", width: 3 },
    dataLabels: { enabled: false },
    grid: { strokeDashArray: 4 },
    colors: ["#2563eb", "#10b981"],
    xaxis: { categories: weekDays, labels: { style: { colors: "#64748b" } } },
    yaxis: { labels: { style: { colors: "#64748b" } } },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    tooltip: { theme: "light" },
    ...baseAnimation,
  };
  const weeklyTasksSeries = [
    { name: "Created", data: [6, 4, 7, 5, 6, 3, 4] },
    { name: "Completed", data: [3, 2, 5, 4, 5, 2, 3] },
  ];

  const moodOptions: ApexOptions = {
    chart: { type: "area", toolbar: { show: false } },
    stroke: { curve: "smooth", width: 3 },
    dataLabels: { enabled: false },
    colors: ["#8b5cf6"],
    xaxis: { categories: moodHistory.map((m) => m.day) },
    yaxis: { min: 1, max: 5, tickAmount: 4 },
    grid: { strokeDashArray: 4 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
    ...baseAnimation,
  };
  const moodSeries = [{ name: "Mood", data: moodHistory.map((m) => m.mood) }];

  // Time tracking datasets
  const timeSeries = [6, 2, 7, 3]; // daily example hours
  const timeWeeklySeries = [30, 10, 40, 20];
  const timeMonthlySeries = [120, 40, 160, 60];

  const timeOptions: ApexOptions = {
    ...apexTheme,
    chart: { type: "donut", offsetY: 16 },
    labels: ["Work", "Study", "Rest", "Leisure"],
    colors: ["#3b82f6", "#22c55e", "#94a3b8", "#f59e0b"],
    grid: { padding: { top: 8, bottom: 8, left: 8, right: 8 } },
    legend: {
      position: "bottom",
      formatter: (seriesName: string, opts?: any) => {
        const val = opts?.w?.globals?.series?.[opts.seriesIndex] ?? 0;
        return `${seriesName} — ${formatHM(val)}`;
      },
      labels: { colors: "#0f172a" },
    },
    dataLabels: {
      enabled: true,
      formatter: (_val: number, opts?: any) => {
        const label = opts?.w?.globals?.labels?.[opts.seriesIndex] ?? "";
        return String(label);
      },
      style: { fontSize: "11px", fontWeight: 600, colors: ["#0f172a"] },
      dropShadow: { enabled: false },
    },
    tooltip: { y: { formatter: (val: number) => formatHM(val) } },
    plotOptions: {
      pie: {
        dataLabels: { offset: 30, minAngleToShowLabel: 18 },
        donut: {
          size: "74%",
          labels: {
            show: true,
            name: { show: false },
            value: { show: true },
            total: {
              show: true,
              showAlways: true,
              label: "Total Time",
              fontSize: "14px",
              fontWeight: 600,
              color: "#0f172a",
              formatter: (w: any) => {
                const sum = (w?.globals?.seriesTotals || []).reduce((a: number, b: number) => a + b, 0);
                return formatHM(sum);
              },
            },
          },
        },
      },
    },
    responsive: [
      { breakpoint: 1024, options: { plotOptions: { pie: { dataLabels: { offset: 26 } } }, dataLabels: { style: { fontSize: "10px" } } } },
      { breakpoint: 640, options: { chart: { offsetY: 8 }, plotOptions: { pie: { dataLabels: { offset: 20 } } }, dataLabels: { style: { fontSize: "9px" } } } },
    ],
    ...baseAnimation,
  };

  const goalRadials = useMemo(() => {
    const toProgress = (status?: string): number => {
      const s = (status || "").toLowerCase();
      if (s.includes("complete")) return 100;
      if (s.includes("progress")) return 60;
      if (s.includes("not") && s.includes("start")) return 0;
      return 30;
    };
    const palette = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];
    return (allGoals || []).slice(0, 3).map((g: any, idx: number) => ({
      name: g?.name || `Goal ${idx + 1}`,
      value: toProgress(g?.status),
      color: palette[idx % palette.length],
    }));
  }, [allGoals]);

  const radialBase: ApexOptions = {
    chart: { type: "radialBar", sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        hollow: { size: "58%" },
        track: { background: "#e2e8f0" },
        dataLabels: {
          name: { show: false },
          value: { offsetY: 6, fontSize: "16px" },
        },
      },
    },
    stroke: { lineCap: "round" },
    ...baseAnimation,
  };

  // Habit Heatmap (weekly check-ins)
  const habitHeatmapOptions: ApexOptions = {
    chart: { type: "heatmap", toolbar: { show: false } },
    dataLabels: { enabled: false },
    grid: { strokeDashArray: 4 },
    plotOptions: {
      heatmap: {
        radius: 4,
        shadeIntensity: 0.3,
        colorScale: {
          ranges: [
            { from: 0, to: 0, color: "#e2e8f0", name: "0" },
            { from: 1, to: 1, color: "#93c5fd", name: "1" },
            { from: 2, to: 2, color: "#60a5fa", name: "2" },
            { from: 3, to: 3, color: "#3b82f6", name: "3" },
            { from: 4, to: 7, color: "#2563eb", name: "4+" },
          ],
        },
      },
    },
    xaxis: { labels: { style: { colors: "#64748b" } } },
    yaxis: { labels: { style: { colors: "#64748b" } } },
    tooltip: { theme: "light" },
    ...baseAnimation,
  };

  // Generate a simple 4-week heatmap for the 7 days
  const habitHeatmapSeries = useMemo(
    () => {
      const weeks = ["W1", "W2", "W3", "W4"];
      // Example: counts of completed habits each day per week (0-5)
      const sample: number[][] = [
        [1, 2, 3, 2], // Mon
        [0, 1, 2, 3], // Tue
        [2, 3, 1, 2], // Wed
        [1, 2, 2, 3], // Thu
        [3, 4, 2, 4], // Fri
        [2, 1, 0, 2], // Sat
        [1, 2, 1, 2], // Sun
      ];
      return weekDays.map((day, idx) => ({
        name: day,
        data: weeks.map((w, j) => ({ x: w, y: sample[idx]?.[j] ?? 0 })),
      }));
    },
    []
  );

  // --- Projects Select + milestone chart ---
  const projects = useMemo(
    () => [
      { id: "portfolio", name: "Personal Website", progress: 72, milestones: [10, 35, 55, 72], color: "#2563eb" },
      { id: "fitness", name: "Fitness Plan", progress: 45, milestones: [5, 18, 33, 45], color: "#10b981" },
      { id: "rust", name: "Learning Rust", progress: 28, milestones: [3, 10, 22, 28], color: "#f59e0b" },
    ],
    []
  );
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "portfolio");
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || projects[0],
    [projects, selectedProjectId]
  );
  const milestoneOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "line", toolbar: { show: false } },
      stroke: { curve: "smooth", width: 3 },
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 4 },
      colors: [selectedProject?.color || "#2563eb"],
      xaxis: { categories: ["M1", "M2", "M3", "Now"] },
      ...baseAnimation,
    }),
    [selectedProject]
  );
  const milestoneSeries = useMemo(
    () => [{ name: selectedProject?.name || "Progress", data: selectedProject?.milestones || [] }],
    [selectedProject]
  );

  // Compute "today" todos first
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  const parsePossibleDate = (val: any): Date | null => {
    if (!val) return null;
    try {
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };
  const today = new Date();
  const todaysTodos = useMemo(() => {
    const list = (todos || []).filter((t: any) => !t?.isDone);
    const todayList = list.filter((t: any) => {
      const due = parsePossibleDate(t?.dueDate || t?.due || t?.deadline || t?.date);
      return due ? isSameDay(due, today) : false;
    });
    // If nothing explicitly due today, show top 5 open
    return (todayList.length ? todayList : list).slice(0, 5);
  }, [todos]);

  const nextTask = todaysTodos[0] ?? null;

  const fadeIn = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as any },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto max-w-7xl px-6 md:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent leading-tight">
                Productivity Dashboard
              </h1>
              <p className="text-slate-600 mt-2">A unified view of your tasks, goals, habits, mood and time.</p>
            </div>
            <Badge className="bg-blue-600 text-white px-3 py-1 rounded-lg shadow">Beta</Badge>
          </div>

          {/* AI Tip as clean quote card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card className="border-slate-200/80">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide">AI Productivity Tip</p>
                    <blockquote className="mt-1 text-sm md:text-base leading-relaxed text-slate-800 italic border-l-2 border-blue-600 pl-3">
                      “{tips[tipIndex]}”
                    </blockquote>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-6">
          <motion.div {...fadeIn}><StatCard title="Total Tasks" value={totalTodos} icon={ListTodo} /></motion.div>
          <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.05 }}>
            <StatCard title="Completed" value={completedTodos} icon={CheckCircle2} accent="from-green-50 to-emerald-50" />
          </motion.div>
          <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }}>
            <Card className="border-slate-200/70 shadow-sm bg-gradient-to-br from-white to-slate-50 gap-4 py-5">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-slate-600">Progress</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                  <Progress value={progressPct} className="h-2" />
                  <span className="text-sm font-semibold text-slate-700 w-10 text-right">{progressPct}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.15 }}>
            <StatCard title="Habit Streak" value={`7 days`} icon={Flame} accent="from-orange-50 to-amber-50" />
          </motion.div>
          <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.2 }}>
            <StatCard title="Active Goals" value={activeGoals} icon={Target} accent="from-purple-50 to-violet-50" />
          </motion.div>
          <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.25 }}>
            <StatCard title="Journal Entries" value={12} icon={BookText} accent="from-pink-50 to-rose-50" />
          </motion.div>
        </div>

        {/* Main 2-column layout: Left (charts) | Right (quick insights) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Left: charts, goals, habit week grid, mood+time together */}
          <div className="xl:col-span-2 space-y-5">
            {/* Mood Tracking + Time Tracking together (moved to top) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Mood Tracking */}
              <motion.div {...fadeIn}>
                <MoodTracker moodHistory={moodHistory} addMood={addMood} options={moodOptions} series={moodSeries as any} />
              </motion.div>

              {/* Time Tracking */}
              <motion.div {...fadeIn}>
                <TimeTracking options={timeOptions} daily={timeSeries} weekly={timeWeeklySeries} monthly={timeMonthlySeries} />
              </motion.div>
            </div>

            {/* Productivity Trend (reintroduced, compact) */}
            <motion.div {...fadeIn}>
              <ProductivityTrend options={weeklyTasksOptions} series={weeklyTasksSeries as any} />
            </motion.div>

            {/* Habit Week (now view-only with emojis) */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <HabitWeek weekDays={weekDays} habits={habits} habitEmoji={habitEmoji} habitWeek={habitWeek} />
            </motion.div>

            {/* Goal Progress moved to bottom */}
            <motion.div {...fadeIn}>
              <GoalRadials radials={goalRadials} radialBase={radialBase} />
            </motion.div>
          </div>

          {/* Right: quick insights stack */}
          <div className="space-y-5">
            {/* Next Task FIRST */}
            <motion.div {...fadeIn}>
              <NextTaskCard nextTask={nextTask} onFocus={() => setRunning(true)} />
            </motion.div>

            {/* Habits Today */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <HabitsToday habits={habits} toggleHabit={toggleHabit} />
            </motion.div>

            {/* Focus Timer */}
            <motion.div {...fadeIn}>
              <FocusTimer
                mm={mm}
                ss={ss}
                running={running}
                onStart={() => setRunning(true)}
                onPause={() => setRunning(false)}
                onReset={() => {
                  setRunning(false);
                  setSecondsLeft(DEFAULT_SECONDS);
                }}
              />
            </motion.div>

            {/* Journal Insights */}
            <motion.div {...fadeIn}>
              <JournalInsights />
            </motion.div>

            {/* Last 5 Journal Entries */}
            <motion.div {...fadeIn}>
              <JournalList />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <QuickActionsBar onStartFocus={() => setRunning(true)} onLogMood={() => addMood(4)} />
    </div>
  );
}