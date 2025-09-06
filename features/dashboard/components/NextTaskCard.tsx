"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlarmClock } from "lucide-react";

export default function NextTaskCard({ nextTask, onFocus }: { nextTask: any; onFocus: () => void }) {
  return (
    <Card className="gap-4">
      <CardHeader className="pb-0">
        <CardTitle>Next Task</CardTitle>
        <CardDescription>Priority for today</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {nextTask ? (
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <p className="font-medium text-slate-900">{nextTask.name}</p>
            {nextTask.description && (
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{nextTask.description}</p>
            )}
            <div className="flex items-center gap-2 mt-3">
              {nextTask.priority && (
                <Badge variant="outline" className="text-xs capitalize">{nextTask.priority}</Badge>
              )}
              {nextTask.category && (
                <Badge className="bg-slate-100 text-slate-700" variant="secondary">{nextTask.category}</Badge>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Link href="/todos"><Button size="sm">Open Tasks</Button></Link>
              <Button size="sm" variant="secondary" onClick={onFocus} className="gap-1"><AlarmClock className="w-4 h-4"/> Focus</Button>
            </div>
          </div>
        ) : (
          <p className="text-slate-500">All clear. Plan your next move.</p>
        )}
      </CardContent>
    </Card>
  );
}
