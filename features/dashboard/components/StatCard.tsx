"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatCard({
  title,
  value,
  icon: Icon,
  accent = "from-blue-50 to-indigo-50",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <Card className="border-slate-200/70 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-slate-50 gap-4 py-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br", accent)}>
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}
