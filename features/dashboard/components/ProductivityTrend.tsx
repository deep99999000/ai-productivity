"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { TrendingUp } from "lucide-react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ProductivityTrend({ options, series }: { options: ApexOptions; series: any }) {
  return (
    <Card className="gap-4">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Productivity Trend</CardTitle>
        <CardDescription>Tasks created vs completed</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ReactApexChart options={options} series={series as any} type="area" height={220} />
      </CardContent>
    </Card>
  );
}
