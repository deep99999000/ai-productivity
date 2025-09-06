"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { Smile } from "lucide-react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type MoodPoint = { day: string; mood: number };

export default function MoodTracker({
  moodHistory,
  addMood,
  options,
  series,
}: {
  moodHistory: MoodPoint[];
  addMood: (val: number) => void;
  options: ApexOptions;
  series: any;
}) {
  return (
    <Card className="gap-4">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2"><Smile className="w-5 h-5" /> Mood Tracking</CardTitle>
        <CardDescription>Daily sentiment</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              {[
                { v: 1, label: "Very Low", emoji: "😞" },
                { v: 2, label: "Low", emoji: "🙁" },
                { v: 3, label: "Neutral", emoji: "😐" },
                { v: 4, label: "Good", emoji: "🙂" },
                { v: 5, label: "Great", emoji: "😄" },
              ].map((m) => (
                <Tooltip key={m.v}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-10 h-10"
                      onClick={() => addMood(m.v)}
                      aria-label={`Log mood ${m.label}`}
                    >
                      <span className="text-lg leading-none">{m.emoji}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{m.label}</TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
          <ReactApexChart options={options} series={series as any} type="area" height={220} />
        </div>
      </CardContent>
    </Card>
  );
}
