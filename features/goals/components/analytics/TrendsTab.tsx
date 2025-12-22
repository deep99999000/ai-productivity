"use client";

import React from "react";
import CountUp from "react-countup";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from "recharts";
import { BarChart2, Gauge, Focus, Battery } from "lucide-react";
import { ChartCard } from "./ChartCard";
import CustomTooltip from "./CustomTooltip";
import { ChartGradients } from "./ChartGradients";

interface TrendsTabProps {
  analytics: any;
}

const TrendsTab: React.FC<TrendsTabProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Velocity Comparison" icon={<BarChart2 className="w-5 h-5" />} subtitle="Current vs previous periods">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={[analytics.velocityTrends]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="current" fill="#6366f1" radius={[4, 4, 0, 0]} name="Current" />
              <Bar dataKey="previous" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Previous" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Productivity Heatmap" icon={<Gauge className="w-5 h-5" />} subtitle="Daily productivity intensity">
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1 text-xs text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="font-medium text-gray-600">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {analytics.productivityHeatmap.map((day: any, index: number) => (
                <div key={index} className={`aspect-square rounded-sm ${day.intensity === 0 ? 'bg-gray-100' : day.intensity <= 0.25 ? 'bg-green-100' : day.intensity <= 0.5 ? 'bg-green-200' : day.intensity <= 0.75 ? 'bg-green-300' : 'bg-green-400'}`} title={`${day.date}: ${day.completions} tasks`} />
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-gray-100 rounded-sm" />
                <div className="w-3 h-3 bg-green-100 rounded-sm" />
                <div className="w-3 h-3 bg-green-200 rounded-sm" />
                <div className="w-3 h-3 bg-green-300 rounded-sm" />
                <div className="w-3 h-3 bg-green-400 rounded-sm" />
              </div>
              <span>More</span>
            </div>
          </div>
        </ChartCard>
        <ChartCard title="Focus Time Analysis" icon={<Focus className="w-5 h-5" />} subtitle="Deep work patterns" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                <CountUp end={analytics.focusTimeAnalysis.averageFocusTime} duration={1.5} decimals={1} />h
              </div>
              <div className="text-sm text-gray-600">Average Focus Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                <CountUp end={analytics.focusTimeAnalysis.longestSession} duration={1.5} decimals={1} />h
              </div>
              <div className="text-sm text-gray-600">Longest Session</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                <CountUp end={analytics.focusTimeAnalysis.totalFocusTime} duration={1.5} decimals={1} />h
              </div>
              <div className="text-sm text-gray-600">Total Focus Time</div>
            </div>
          </div>
        </ChartCard>
        <ChartCard title="Energy Patterns" icon={<Battery className="w-5 h-5" />} subtitle="Peak productivity hours" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={analytics.energyPatterns.hourlyPatterns.slice(6, 22)}>
              <ChartGradients />
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" stroke="#666" fontSize={12} tickFormatter={(hour) => `${hour}:00`} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="completions" stroke="#f59e0b" fill="url(#orangeGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default TrendsTab;
