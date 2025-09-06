"use client";
import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useHabit } from "@/features/habits/HabitStore";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function HabitHeatmap() {
  const { habits, checkins } = useHabit();

  const data = useMemo(() => {
    const today = new Date();
    const arr = [] as { day: string; value: number }[];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const total = habits.reduce((acc, h) => acc + (checkins[String(h.id)]?.[iso] ? 1 : 0), 0);
      arr.push({ day: weekdays[(d.getDay() + 6) % 7], value: total });
    }
    return arr;
  }, [habits, checkins]);

  return (
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle>Weekly Progress</CardTitle>
        <CardDescription>Check-ins over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Bar dataKey="value" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
