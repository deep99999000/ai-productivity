"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Flame } from "lucide-react";

export type Habit = { id: string; name: string; done: boolean };

export default function HabitWeek({
  weekDays,
  habits,
  habitEmoji,
  habitWeek,
}: {
  weekDays: string[];
  habits: Habit[];
  habitEmoji: Record<string, string>;
  habitWeek: Record<string, boolean[]>;
}) {
  return (
    <Card className="gap-4">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2"><Flame className="w-5 h-5" /> Habit Tracker (Week)</CardTitle>
        <CardDescription>Weekly check-ins (view only)</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 overflow-x-auto">
        <div className="min-w-[520px]">
          <div className="grid" style={{ gridTemplateColumns: `160px repeat(7, minmax(0, 1fr))` }}>
            <div className="text-xs text-slate-500" />
            {weekDays.map((d) => (
              <div key={d} className="text-xs text-slate-500 text-center py-2">{d}</div>
            ))}
            {habits.map((h) => (
              <React.Fragment key={h.id}>
                <div className="py-2 pr-2 text-sm font-medium text-slate-700 truncate flex items-center gap-2">
                  <span className="text-base leading-none">{habitEmoji[h.id] || "•"}</span>
                  <span>{h.name}</span>
                </div>
                {weekDays.map((_, idx) => {
                  const on = habitWeek[h.id]?.[idx] ?? false;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "h-9 m-1 rounded-md border flex items-center justify-center select-none",
                        on ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
                      )}
                      aria-label={`${h.name} ${weekDays[idx]} ${on ? "done" : "not done"}`}
                      aria-disabled
                    >
                      {on ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4 text-slate-400" />}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
