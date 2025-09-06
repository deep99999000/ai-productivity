"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function JournalInsights() {
  return (
    <Card id="journal" className="gap-4">
      <CardHeader className="pb-0">
        <CardTitle>Journal Insights</CardTitle>
        <CardDescription>Today’s reflection summary</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">Mood: Positive</Badge>
          <p className="text-sm text-slate-700">
            Focused deep work in the morning, energy dipped after lunch. Quick walk restored clarity. Key win: shipped feature MVP.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
