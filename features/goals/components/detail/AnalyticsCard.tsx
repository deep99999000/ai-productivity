"use client";
import { Activity } from "lucide-react";

interface AnalyticsCardProps {
  weeklyVelocity: number[];
}

const AnalyticsCard = ({ weeklyVelocity }: AnalyticsCardProps) => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
    <div className="flex items-center mb-4">
      <Activity className="text-indigo-500 mr-3 w-6 h-6" />
      <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
    </div>
    <p className="text-sm font-medium text-gray-600 mb-2">Weekly Velocity (completed tasks)</p>
    <div className="h-24 bg-gray-50/50 rounded-lg p-2 flex items-end space-x-2">
      {weeklyVelocity.map((v, i) => {
        const max = Math.max(1, ...weeklyVelocity);
        const height = (v / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col justify-end" title={`Week ${i + 1}: ${v} tasks`}>
            <div className="w-full rounded-t-sm bg-gradient-to-t from-blue-300 to-blue-500" style={{ height: `${height}%` }} />
          </div>
        );
      })}
    </div>
  </div>
);

export default AnalyticsCard;
