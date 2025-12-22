"use client";

import React from "react";
import CountUp from "react-countup";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area } from "recharts";
import { BarChart3, Rocket, Award, Users, MessageSquare, Battery, Focus } from "lucide-react";
import CustomTooltip from "./CustomTooltip";
import { ChartGradients, CHART_COLORS } from "./ChartGradients";
import { ChartCard } from "./ChartCard";

interface PerformanceTabProps {
  analytics: any;
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({ analytics }) => {
  return (
    <div className="space-y-8 mt-6">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Performance Metrics</h2>
            <p className="text-sm text-slate-600">Detailed analysis of your productivity performance</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Velocity & Throughput" icon={<Rocket className="w-5 h-5" />} subtitle="Task completion rate over time">
            <div className="space-y-6">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analytics.velocityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
          <ChartCard title="Quality Score" icon={<Award className="w-5 h-5" />} subtitle="Work quality and satisfaction metrics">
            <div className="space-y-6">
              {/* Keep the radial quality card for now as-is in parent if needed */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm font-bold text-green-600">8.4/10</div>
                  <div className="text-xs text-slate-600">Satisfaction</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3">
                  <div className="text-sm font-bold text-indigo-600">92%</div>
                  <div className="text-xs text-slate-600">Accuracy</div>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Collaboration Analysis</h2>
            <p className="text-sm text-slate-600">Team interaction and collaboration effectiveness</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Collaboration Effectiveness" icon={<Users className="w-5 h-5" />} subtitle="Team vs individual performance">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[
                { type: 'Solo Work', efficiency: 88, satisfaction: 82 },
                { type: 'Pair Work', efficiency: 92, satisfaction: 88 },
                { type: 'Team Work', efficiency: 75, satisfaction: 75 },
                { type: 'Meetings', efficiency: 45, satisfaction: 52 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="type" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="efficiency" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Efficiency %" />
                <Bar dataKey="satisfaction" fill="#10b981" radius={[4, 4, 0, 0]} name="Satisfaction %" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Communication Flow" icon={<MessageSquare className="w-5 h-5" />} subtitle="Response times and interaction quality">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">2.3h</div>
                <div className="text-sm text-slate-600">Avg Response</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">94%</div>
                <div className="text-sm text-slate-600">Response Rate</div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <Battery className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Habits & Optimization</h2>
            <p className="text-sm text-slate-600">Performance drivers and improvement opportunities</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Energy Patterns" icon={<Battery className="w-5 h-5" />} subtitle="Peak productivity hours">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={analytics.energyPatterns.hourlyPatterns.slice(6, 22)}>
                <ChartGradients />
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#666" fontSize={12} tickFormatter={(hour) => `${hour}:00`} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="completions" stroke="#f59e0b" fill={CHART_COLORS.gradients.orange} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Focus Time Analysis" icon={<Focus className="w-5 h-5" />} subtitle="Deep work patterns">
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
        </div>
      </div>
    </div>
  );
};

export default PerformanceTab;
