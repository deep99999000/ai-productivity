"use client";
import { Activity } from "lucide-react";

interface AnalyticsCardProps {
  weeklyVelocity: number[];
}

const AnalyticsCard = ({ weeklyVelocity }: AnalyticsCardProps) => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
    <div className="flex items-center mb-4">
      <Activity className="text-indigo-500 mr-3 w-6 h-6" />
      <h3 className="text-lg font-bold text-slate-900">Analytics</h3>
    </div>
    
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-600 mb-3">Weekly Task Completion</p>
        <div className="h-20 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-3 flex items-end space-x-2">
          {weeklyVelocity.map((v, i) => {
            const max = Math.max(1, ...weeklyVelocity);
            const height = (v / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col justify-end items-center group" title={`Week ${i + 1}: ${v} tasks`}>
                <div 
                  className="w-full rounded-t-lg bg-gradient-to-t from-indigo-400 to-blue-500 transition-all duration-200 group-hover:from-indigo-500 group-hover:to-blue-600 min-h-[4px]" 
                  style={{ height: `${Math.max(10, height)}%` }} 
                />
                <span className="text-xs text-slate-500 mt-1 font-medium">{v}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>4 weeks ago</span>
          <span>This week</span>
        </div>
      </div>
      
      <div className="pt-3 border-t border-slate-200/60">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-slate-500 mb-1">Total Tasks</p>
            <p className="text-lg font-bold text-slate-800">{weeklyVelocity.reduce((a, b) => a + b, 0)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Avg/Week</p>
            <p className="text-lg font-bold text-slate-800">{Math.round(weeklyVelocity.reduce((a, b) => a + b, 0) / 4)}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AnalyticsCard;
