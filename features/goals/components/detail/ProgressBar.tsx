"use client";
import { cn } from "@/lib/utils";

export const ProgressBar = ({ value, className }: { value: number; className?: string }) => (
  <div className={cn("w-full h-2 rounded-full bg-gray-200 overflow-hidden", className)}>
    <div
      className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 transition-all duration-700"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

export default ProgressBar;
