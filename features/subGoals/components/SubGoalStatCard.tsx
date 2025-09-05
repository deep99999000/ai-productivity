// @/components/StatCard.tsx
import React from "react";
import { cn } from "@/lib/utils";

export const SubGoalStatCard= ({
  title,
  value,
  icon,
  iconBgColor = "bg-blue-100",
  textColor = "text-blue-600",
}:{
  title: string;
  value: React.ReactNode; // Allow JSX like <ShowDate />
  icon: React.ReactNode;
  iconBgColor?: string; // e.g., "bg-blue-100"
  textColor?: string;   // e.g., "text-blue-600" — renamed from `Color` (avoid capital)
}) => {
  return (
    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", iconBgColor)}>
          <span className={cn("w-5 h-5", textColor)}>{icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-base font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
};