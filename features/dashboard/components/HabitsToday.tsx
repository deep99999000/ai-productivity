"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Flame } from "lucide-react";

export type Habit = { id: string; name: string; done: boolean };

export default function HabitsToday({ habits, toggleHabit }: { habits: Habit[]; toggleHabit: (id: string) => void }) {
  return (
    <Card className="gap-4">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2"><Flame className="w-5 h-5" /> Habits Today</CardTitle>
        <CardDescription>Tap to mark done</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-3">
          {habits.map((h) => (
            <li key={h.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleHabit(h.id)}
                  className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-50"
                  aria-label={`Toggle ${h.name}`}
                >
                  {h.done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <p className={cn("text-sm font-medium", h.done ? "text-slate-500 line-through" : "text-slate-800")}>{h.name}</p>
              </div>
              {h.done && <Badge className="bg-emerald-100 text-emerald-700" variant="secondary">Done</Badge>}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
