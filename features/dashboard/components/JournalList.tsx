"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function JournalList() {
  return (
    <Card className="gap-4">
      <CardHeader className="pb-0">
        <CardTitle>Last 5 Journal Entries</CardTitle>
        <CardDescription>Compact preview</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <li key={i} className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">Reflection #{i}</p>
                <p className="text-xs text-slate-500 line-clamp-1">Noted key learnings and a quick gratitude line.</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700" variant="secondary">Calm</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
