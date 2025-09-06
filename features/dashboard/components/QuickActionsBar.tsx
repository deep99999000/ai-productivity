"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NotebookPen, Plus, Smile, Timer as TimerIcon } from "lucide-react";

export default function QuickActionsBar({ onStartFocus, onLogMood }: { onStartFocus: () => void; onLogMood: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="backdrop-blur bg-white/80 border border-slate-200 shadow-lg rounded-full px-3 py-2 flex items-center gap-2">
        <Link href="/todos">
          <Button size="sm" className="rounded-full"><Plus className="w-4 h-4"/> New Task</Button>
        </Link>
        <Link href="/dashboard#journal">
          <Button size="sm" variant="secondary" className="rounded-full"><NotebookPen className="w-4 h-4"/> New Journal</Button>
        </Link>
        <Button size="sm" variant="outline" className="rounded-full" onClick={onStartFocus}><TimerIcon className="w-4 h-4"/> Start Focus</Button>
        <Button size="sm" variant="ghost" className="rounded-full" onClick={onLogMood}><Smile className="w-4 h-4"/> Log Mood</Button>
      </div>
    </div>
  );
}
