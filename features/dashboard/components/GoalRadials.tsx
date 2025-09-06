"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { Target } from "lucide-react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type GoalRadial = { name: string; value: number; color: string };

export default function GoalRadials({ radials, radialBase }: { radials: GoalRadial[]; radialBase: ApexOptions }) {
  return (
    <Card className="gap-4">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Goal Progress</CardTitle>
        <CardDescription>Keep momentum on what matters</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-3">
          {radials.map((g) => (
            <div key={g.name} className="text-center">
              <ReactApexChart
                options={{ ...radialBase, colors: [g.color] }}
                series={[g.value] as any}
                type="radialBar"
                height={140}
              />
              <p className="text-xs text-slate-600 truncate">{g.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
