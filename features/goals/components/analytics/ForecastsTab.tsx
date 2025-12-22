"use client";

import React from "react";
import CountUp from "react-countup";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from "recharts";
import { Compass, BarChart2, ArrowDown, ArrowUp, Brain } from "lucide-react";
import { ChartCard } from "./ChartCard";
import CustomTooltip from "./CustomTooltip";

interface ForecastsTabProps {
  analytics: any;
}

const ForecastsTab: React.FC<ForecastsTabProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Completion Forecast" icon={<Compass className="w-5 h-5" />} subtitle="Predicted goal completion timeline">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={analytics.completionForecast.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2} name="Actual Progress" dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} />
              <Line type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Forecast" dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Goal Performance Comparison" icon={<BarChart2 className="w-5 h-5" />} subtitle="Current vs historical performance">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={analytics.goalComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="metric" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="current" fill="#6366f1" radius={[4, 4, 0, 0]} name="Current Goal" />
              <Bar dataKey="average" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Average" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Performance Predictions" icon={<Brain className="w-5 h-5" />} subtitle="AI-powered insights and forecasts" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">{analytics.completionForecast.estimatedCompletionDate ? new Date(analytics.completionForecast.estimatedCompletionDate).toLocaleDateString() : 'TBD'}</div>
              <div className="text-sm text-gray-600">Estimated Completion</div>
              <Badge variant={analytics.completionForecast.confidence >= 70 ? 'default' : 'destructive'}>
                {analytics.completionForecast.confidence}% confidence
              </Badge>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">
                <CountUp end={analytics.velocityTrends.projected || 0} duration={1.5} />
              </div>
              <div className="text-sm text-gray-600">Projected Weekly Velocity</div>
              <div className="flex items-center justify-center gap-1 text-sm">
                {analytics.velocityChange > 0 ? <ArrowUp className="w-3 h-3 text-green-600" /> : <ArrowDown className="w-3 h-3 text-red-600" />}
                <span className={analytics.velocityChange > 0 ? 'text-green-600' : 'text-red-600'}>{Math.abs(analytics.velocityChange)}%</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-600">{analytics.timeToGoal ? `${analytics.timeToGoal}d` : '∞'}</div>
              <div className="text-sm text-gray-600">Days to Goal</div>
              <Badge variant={analytics.timeToGoal && analytics.timeToGoal < 30 ? 'destructive' : 'outline'}>
                {analytics.timeToGoal && analytics.timeToGoal < 0 ? 'Overdue' : 'On Track'}
              </Badge>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default ForecastsTab;
