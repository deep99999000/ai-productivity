"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HabitForm from "./HabitForm";
import HabitList from "./HabitList";
import HabitQuickStats from "./HabitQuickStats";
import { useHabit } from "@/features/habits/HabitStore";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const todayISO = () => new Date().toISOString().slice(0, 10);
const dayIndex = (d: Date) => d.getDay(); // 0 = Sun

function isDueToday(h: any) {
  const freq = h.frequency ?? "daily";
  if (freq === "daily") return true;
  if (freq === "weekly" || freq === "custom") {
    const idx = dayIndex(new Date());
    return (h.days ?? [1, 2, 3, 4, 5]).includes(idx);
  }
  return true;
}

function computeCompletionRate(habits: any[], checkins: Record<string, Record<string, boolean>>): number {
  const due = habits.filter(isDueToday);
  if (!due.length) return 0;
  const iso = todayISO();
  const done = due.filter((h) => checkins[String(h.id)]?.[iso]).length;
  return Math.round((done / due.length) * 100);
}

function computeBestStreak(habits: any[], checkins: Record<string, Record<string, boolean>>): number {
  const daysToLook = 30;
  const today = new Date();
  let best = 0;
  for (const h of habits) {
    let streak = 0;
    for (let i = 0; i < daysToLook; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      if (checkins[String(h.id)]?.[iso]) streak += 1; else break;
    }
    best = Math.max(best, streak);
  }
  return best;
}

export default function HabitsDashboard() {
  const { habits, checkins } = useHabit();

  const stats = useMemo(() => {
    const iso = todayISO();
    const due = habits.filter(isDueToday);
    const completed = due.filter((h) => checkins[String(h.id)]?.[iso]);
    
    return {
      totalHabits: habits.length,
      completedToday: completed.length,
      bestStreak: computeBestStreak(habits as any, checkins),
      completionRate: due.length > 0 ? Math.round((completed.length / due.length) * 100) : 0,
    };
  }, [habits, checkins]);

  // Build weekly chart data (last 7 days)
  const weeklyData = useMemo(() => {
    const today = new Date();
    const data = [];
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const dayName = weekdays[(d.getDay() + 6) % 7]; // Convert to Mon=0
      const total = habits.reduce((acc, h) => acc + (checkins[String(h.id)]?.[iso] ? 1 : 0), 0);
      
      data.push({
        day: dayName,
        checkins: total,
      });
    }
    return data;
  }, [habits, checkins]);

  // Build monthly completion rate data (last 4 weeks)
  const monthlyData = useMemo(() => {
    const today = new Date();
    const data = [];
    
    for (let week = 3; week >= 0; week--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (week * 7) - 6);
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() - (week * 7));
      
      let totalCheckins = 0;
      let totalPossible = 0;
      
      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + d);
        const iso = currentDate.toISOString().slice(0, 10);
        
        habits.forEach(h => {
          totalPossible++;
          if (checkins[String(h.id)]?.[iso]) totalCheckins++;
        });
      }
      
      const rate = totalPossible > 0 ? Math.round((totalCheckins / totalPossible) * 100) : 0;
      data.push({
        week: `Week ${4 - week}`,
        rate,
      });
    }
    return data;
  }, [habits, checkins]);

  // Habit frequency distribution
  const frequencyData = useMemo(() => {
    const counts = { daily: 0, weekly: 0, custom: 0 };
    habits.forEach(h => {
      const freq = (h as any).frequency || 'daily';
      if (freq in counts) counts[freq as keyof typeof counts]++;
    });
    
    return [
      { name: 'Daily', value: counts.daily, color: '#3b82f6' },
      { name: 'Weekly', value: counts.weekly, color: '#10b981' },
      { name: 'Custom', value: counts.custom, color: '#f59e0b' },
    ].filter(item => item.value > 0);
  }, [habits]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <div className="container mx-auto px-6 md:px-8 py-6 md:py-8 max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent leading-tight">
              Habit Tracker
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Build better habits with smooth check-ins and clean insights.</p>
          </div>
          <HabitForm trigger={<Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5">New Habit</Button>} />
        </motion.header>

        {/* Quick Stats */}
        <HabitQuickStats
          totalHabits={stats.totalHabits}
          completedToday={stats.completedToday}
          bestStreak={stats.bestStreak}
          completionRate={stats.completionRate}
        />

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Progress Area Chart */}
          <Card className="bg-white/80 backdrop-blur border-slate-200/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-900 dark:text-slate-100">Weekly Progress</CardTitle>
              <CardDescription>Daily check-ins over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      tickLine={false} 
                      axisLine={false}
                      className="text-xs text-slate-500"
                    />
                    <YAxis 
                      allowDecimals={false} 
                      tickLine={false} 
                      axisLine={false}
                      className="text-xs text-slate-500"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="checkins" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fill="url(#colorCheckins)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Completion Rate Bar Chart */}
          <Card className="bg-white/80 backdrop-blur border-slate-200/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-900 dark:text-slate-100">Completion Trends</CardTitle>
              <CardDescription>Weekly completion rates over the last month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <XAxis 
                      dataKey="week" 
                      tickLine={false} 
                      axisLine={false}
                      className="text-xs text-slate-500"
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false}
                      className="text-xs text-slate-500"
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value) => [`${value}%`, 'Completion Rate']}
                    />
                    <Bar 
                      dataKey="rate" 
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Habits List */}
        <div className="space-y-6">
          <HabitList />
        </div>
      </div>
    </div>
  );
}
