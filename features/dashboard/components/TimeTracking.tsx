"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { CalendarDays } from "lucide-react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function TimeTracking({
  options,
  daily,
  weekly,
  monthly,
}: {
  options: ApexOptions;
  daily: number[];
  weekly: number[];
  monthly: number[];
}) {
  return (
    <Card className="gap-4">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2"><CalendarDays className="w-5 h-5" /> Time Tracking</CardTitle>
        <CardDescription>Daily / Weekly</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="daily">
          <TabsList className="mb-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="m-0  text-black">
            <div className="overflow-visible">
              <ReactApexChart options={options} series={daily as any} type="donut" height={260} />
            </div>
          </TabsContent>
          <TabsContent value="weekly" className="m-0">
            <div className="overflow-visible">
              <ReactApexChart options={options} series={weekly as any} type="donut" height={260} />
            </div>
          </TabsContent>
          <TabsContent value="monthly" className="m-0">
            <div className="overflow-visible">
              <ReactApexChart options={options} series={monthly as any} type="donut" height={260} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
