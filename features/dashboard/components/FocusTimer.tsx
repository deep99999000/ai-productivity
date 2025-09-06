"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pause, Play, Square, Timer as TimerIcon } from "lucide-react";

export default function FocusTimer({
  mm,
  ss,
  running,
  onStart,
  onPause,
  onReset,
}: {
  mm: string;
  ss: string;
  running: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}) {
  return (
    <Card className="gap-4">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2"><TimerIcon className="w-5 h-5" /> Focus Timer</CardTitle>
        <CardDescription>Pomodoro style sessions</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-center">
          <div className="text-5xl font-mono tabular-nums tracking-wider text-slate-900">{mm}:{ss}</div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-4">
          {!running ? (
            <Button onClick={onStart} className="gap-2">
              <Play className="w-4 h-4" /> Start
            </Button>
          ) : (
            <Button variant="secondary" onClick={onPause} className="gap-2">
              <Pause className="w-4 h-4" /> Pause
            </Button>
          )}
          <Button variant="outline" onClick={onReset} className="gap-2">
            <Square className="w-4 h-4" /> Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
