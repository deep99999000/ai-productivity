"use client";

import React from "react";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ScatterChart, Scatter } from "recharts";
import { Battery, Activity, Layers, TrendingUp, CloudSun, Target, CheckCircle2, Rocket, Focus } from "lucide-react";
import { mockAnalyticsData } from "@/features/goals/utils/mockData";
import { ChartCard } from "./ChartCard";
import CustomTooltip from "./CustomTooltip";
import { ChartGradients } from "./ChartGradients";
import { EnhancedMetricCard } from "./MetricCard";

interface OverviewTabProps {
  analytics: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ analytics }) => {
  const fadeIn = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  };

  return (
    <div className="space-y-8 mt-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <motion.div {...fadeIn}>
          <Card className="border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-slate-50 py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-medium text-slate-600">Completion Rate</CardTitle>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-slate-900">
                <CountUp end={analytics.completionRate} duration={1.5} decimals={1} />%
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.05 }}>
          <Card className="border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-slate-50 py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-medium text-slate-600">Current Streak</CardTitle>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                {/* icon injected above */}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-slate-900">
                <CountUp end={analytics.currentStreak} duration={1.5} /> days
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }}>
          <Card className="border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-slate-50 py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-medium text-slate-600">Weekly Velocity</CardTitle>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-slate-900">
                <CountUp end={analytics.velocityThisWeek} duration={1.5} /> tasks
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.15 }}>
          <Card className="border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-slate-50 py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-sm font-medium text-slate-600">Tasks Progress</CardTitle>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-50" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-slate-900">
                <CountUp end={analytics.completedTodos} duration={1.5} /> / {analytics.totalTodos}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Overview cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Performance Overview</h2>
            <p className="text-sm text-slate-600">Key metrics and current status at a glance</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <EnhancedMetricCard title="Completion Rate" value={analytics.completionRate} suffix="%" change={analytics.velocityChange} changeType={analytics.velocityChange > 0 ? 'positive' : 'negative'} icon={CheckCircle2} iconColor="from-indigo-500 to-purple-600" subtitle="vs last period" delay={0.1} decimals={1} />
          <EnhancedMetricCard title="Current Streak" value={analytics.currentStreak} suffix=" days" icon={Focus} iconColor="from-orange-500 to-amber-600" subtitle={`Best: ${analytics.longestStreak} days`} delay={0.2} />
          <EnhancedMetricCard title="Weekly Velocity" value={analytics.velocityThisWeek} suffix=" tasks" icon={Rocket} iconColor="from-blue-500 to-indigo-600" subtitle="On track" delay={0.3} badge="Active" badgeVariant="default" />
          <EnhancedMetricCard title="Focus Quality" value={75} suffix="%" icon={Focus} iconColor="from-emerald-500 to-green-600" subtitle="Deep work sessions" delay={0.4} />
        </div>
      </div>

      {/* Time & Energy Patterns */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Battery className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Time & Energy Patterns</h2>
            <p className="text-sm text-slate-600">Understanding your productivity rhythms</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="24-Hour Productivity Map" icon={<Battery className="w-5 h-5" />} subtitle="Your peak performance hours" className="lg:col-span-2">
            <div className="grid grid-cols-12 gap-2">
              {Array.from({ length: 24 }, (_, hour) => {
                const data = mockAnalyticsData.hourlyProductivity[hour];
                const intensity = data.efficiency / 100;
                return (
                  <motion.div key={hour} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: hour * 0.02, duration: 0.3 }} className={`aspect-square rounded-lg text-xs flex items-center justify-center text-white font-semibold shadow-sm transition-all duration-200 hover:scale-110 cursor-pointer ${intensity > 0.8 ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-200' : intensity > 0.6 ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-emerald-100' : intensity > 0.4 ? 'bg-gradient-to-br from-yellow-400 to-orange-400 shadow-yellow-100' : intensity > 0.2 ? 'bg-gradient-to-br from-orange-400 to-red-400 shadow-orange-100' : 'bg-gradient-to-br from-red-400 to-red-500 shadow-red-100'}`} title={`${hour}:00 - ${data.completions} tasks, ${data.efficiency}% efficiency`}>
                    {hour}
                  </motion.div>
                );
              })}
            </div>
          </ChartCard>
          <ChartCard title="Weekly Wellness" icon={<Activity className="w-5 h-5" />} subtitle="Mood & energy tracking">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={mockAnalyticsData.weeklyPatterns}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="day" fontSize={10} />
                <PolarRadiusAxis domain={[0, 10]} fontSize={8} angle={90} tickCount={5} />
                <Radar name="Mood" dataKey="mood" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Energy" dataKey="energyLevel" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Task Intelligence */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Task Intelligence</h2>
            <p className="text-sm text-slate-600">Smart insights into your work patterns</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Priority Flow" icon={<TrendingUp className="w-5 h-5" />} subtitle="How priorities evolve over time">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={mockAnalyticsData.priorityTrends}>
                <ChartGradients />
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="urgent" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} />
                <Area type="monotone" dataKey="high" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.8} />
                <Area type="monotone" dataKey="medium" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.8} />
                <Area type="monotone" dataKey="low" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Category Performance" icon={<Layers className="w-5 h-5" />} subtitle="Difficulty vs satisfaction analysis">
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart data={mockAnalyticsData.categoryAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="difficulty" name="Difficulty" stroke="#666" fontSize={12} domain={[0, 10]} />
                <YAxis dataKey="satisfaction" name="Satisfaction" stroke="#666" fontSize={12} domain={[0, 10]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Scatter dataKey="completions" fill="#6366f1" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
