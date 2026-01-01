"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import type { Project } from "@/features/projects/schema";
import { TrendingUp, Target, Clock, Activity, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnalyticsSectionProps {
  projects: Project[];
  tasks?: any[];
  milestones?: any[];
}

const CHART_COLORS = {
  primary: "#18181b",
  secondary: "#3f3f46",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  purple: "#8b5cf6",
  pink: "#ec4899",
};

export default function AnalyticsSection({
  projects,
  tasks = [],
  milestones = [],
}: AnalyticsSectionProps) {
  console.log("AnalyticsSection - Projects:", projects?.length, "Tasks:", tasks?.length, "Milestones:", milestones?.length);

  // Show empty state if no projects
  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-xl bg-zinc-100 flex items-center justify-center mb-4">
          <BarChart className="h-8 w-8 text-zinc-400" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-900">
          No Analytics Data Available
        </h3>
        <p className="mt-2 text-zinc-500">
          Create some projects to see analytics and insights
        </p>
      </div>
    );
  }

  // Project Status Distribution
  const statusDistribution = useMemo(() => {
    const statuses = projects.reduce((acc, project) => {
      const status = project.status || "planning";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statuses).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [projects]);

  // Project Health Distribution
  const healthDistribution = useMemo(() => {
    const health = projects.reduce((acc, project) => {
      const h = project.health || "on_track";
      acc[h] = (acc[h] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: "On Track", value: health.on_track || 0, color: CHART_COLORS.success },
      { name: "At Risk", value: health.at_risk || 0, color: CHART_COLORS.warning },
      { name: "Critical", value: health.critical || 0, color: CHART_COLORS.danger },
      { name: "On Hold", value: health.on_hold || 0, color: CHART_COLORS.info },
    ];
  }, [projects]);

  // Project Progress Over Time
  const projectProgress = useMemo(() => {
    return projects.slice(0, 10).map((project) => ({
      name: project.name.length > 15 ? project.name.substring(0, 15) + "..." : project.name,
      progress: project.completion_percentage || 0,
      target: 100,
    }));
  }, [projects]);

  // Priority Distribution
  const priorityDistribution = useMemo(() => {
    const priorities = projects.reduce((acc, project) => {
      // Extract priority from tags if available, otherwise default to medium
      const tags = project.tags || [];
      const priorityTag = tags.find(tag => ['high', 'medium', 'low'].includes(tag.toLowerCase()));
      const priority = priorityTag?.toLowerCase() || "medium";
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: "High", value: priorities.high || 0, color: CHART_COLORS.danger },
      { name: "Medium", value: priorities.medium || 0, color: CHART_COLORS.warning },
      { name: "Low", value: priorities.low || 0, color: CHART_COLORS.info },
    ];
  }, [projects]);

  // Monthly Project Creation Trend
  const monthlyTrend = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    
    const trend = months.map((month, index) => {
      const projectsInMonth = projects.filter((p) => {
        if (!p.created_at) return false;
        const date = new Date(p.created_at);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      }).length;

      return {
        month,
        projects: projectsInMonth,
        completed: projects.filter((p) => {
          if (!p.created_at || p.status !== "completed") return false;
          const date = new Date(p.created_at);
          return date.getMonth() === index && date.getFullYear() === currentYear;
        }).length,
      };
    });

    return trend;
  }, [projects]);

  // Performance Metrics
  const performanceMetrics = useMemo(() => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter((p) => p.status === "completed").length;
    const activeProjects = projects.filter((p) => p.status === "active").length;
    const avgProgress = totalProjects > 0 
      ? projects.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / totalProjects 
      : 0;

    return [
      {
        metric: "Completion Rate",
        value: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
        fullMark: 100,
      },
      {
        metric: "Active Projects",
        value: Math.min((activeProjects / totalProjects) * 100, 100),
        fullMark: 100,
      },
      {
        metric: "Avg Progress",
        value: Math.round(avgProgress),
        fullMark: 100,
      },
      {
        metric: "On Track",
        value: healthDistribution[0].value > 0 
          ? (healthDistribution[0].value / totalProjects) * 100 
          : 0,
        fullMark: 100,
      },
    ];
  }, [projects, healthDistribution]);

  // Quick Stats Cards
  const quickStats = [
    {
      label: "Total Progress",
      value: `${Math.round(projects.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / Math.max(projects.length, 1))}%`,
      icon: TrendingUp,
      color: "text-white",
      bg: "bg-zinc-900",
    },
    {
      label: "Active Projects",
      value: projects.filter((p) => p.status === "active").length,
      icon: Activity,
      color: "text-white",
      bg: "bg-emerald-600",
    },
    {
      label: "Milestones",
      value: milestones.length,
      icon: Target,
      color: "text-zinc-600",
      bg: "bg-zinc-100",
    },
    {
      label: "Total Tasks",
      value: tasks.length,
      icon: Clock,
      color: "text-zinc-600",
      bg: "bg-zinc-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Stats with better visual hierarchy */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-4">Quick Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-300 hover:shadow-lg transition-all duration-300 cursor-pointer group p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-zinc-900">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Analytics Grid with better organization */}
      <div className="space-y-8">
        {/* Health & Status Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-zinc-900 rounded-full"></div>
            <h2 className="text-xl font-bold text-zinc-900">Health & Status</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Health Pie Chart */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-300 hover:shadow-lg transition-all duration-300">
              <div className="p-5 pb-4 border-b border-zinc-100">
                <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  Project Health Distribution
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Overall health status of your projects</p>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={healthDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {healthDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Project Status Distribution */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-300 hover:shadow-lg transition-all duration-300">
              <div className="p-5 pb-4 border-b border-zinc-100">
                <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-zinc-900"></div>
                  Status Overview
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Current state of all projects</p>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={statusDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#888" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }} 
                    />
                    <Bar dataKey="value" fill={CHART_COLORS.primary} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Progress & Performance Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-emerald-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-zinc-900">Progress & Performance</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Progress Bar Chart */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-300 hover:shadow-lg transition-all duration-300">
              <div className="p-5 pb-4 border-b border-zinc-100">
                <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  Individual Progress
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Completion status per project</p>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={projectProgress} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 100]} stroke="#888" style={{ fontSize: '11px' }} />
                    <YAxis dataKey="name" type="category" width={110} stroke="#888" style={{ fontSize: '11px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }} 
                    />
                    <Bar dataKey="progress" fill={CHART_COLORS.success} radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Radar Chart */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-300 hover:shadow-lg transition-all duration-300">
              <div className="p-5 pb-4 border-b border-zinc-100">
                <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-zinc-900"></div>
                  Performance Metrics
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Key performance indicators</p>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={performanceMetrics}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" stroke="#888" style={{ fontSize: '11px' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#888" style={{ fontSize: '10px' }} />
                    <Radar 
                      name="Performance" 
                      dataKey="value" 
                      stroke={CHART_COLORS.primary} 
                      fill={CHART_COLORS.primary} 
                      fillOpacity={0.6} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Trends Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-amber-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-zinc-900">Trends & Insights</h2>
          </div>
          
          {/* Monthly Trend Area Chart */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-300 hover:shadow-lg transition-all duration-300 mb-6">
            <div className="p-5 pb-4 border-b border-zinc-100">
              <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-zinc-900"></div>
                Project Timeline (2026)
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Monthly creation and completion trends</p>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="projects" 
                    stroke={CHART_COLORS.primary} 
                    fillOpacity={1} 
                    fill="url(#colorProjects)" 
                    name="Created"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stroke={CHART_COLORS.success} 
                    fillOpacity={1} 
                    fill="url(#colorCompleted)" 
                    name="Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Priority Distribution */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-300 hover:shadow-lg transition-all duration-300">
              <div className="p-5 pb-4 border-b border-zinc-100">
                <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                  Priority Breakdown
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Project distribution by priority level</p>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {priorityDistribution.map((item, index) => {
                    const total = priorityDistribution.reduce((sum, p) => sum + p.value, 0);
                    const percentage = total > 0 ? (item.value / total) * 100 : 0;
                    return (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full group-hover:scale-110 transition-transform" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-semibold text-zinc-900">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-xs font-medium">
                              {item.value}
                            </Badge>
                            <span className="text-sm font-bold text-zinc-900 min-w-[3rem] text-right">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-3 rounded-full transition-all duration-500 ease-out group-hover:opacity-80"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: item.color 
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-8 pt-6 border-t border-zinc-100">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center group hover:scale-105 transition-transform cursor-pointer">
                      <p className="text-3xl font-bold text-zinc-900">
                        {projects.length}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wide">Total</p>
                    </div>
                    <div className="text-center group hover:scale-105 transition-transform cursor-pointer">
                      <p className="text-3xl font-bold text-emerald-600">
                        {projects.filter(p => p.status === "completed").length}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wide">Done</p>
                    </div>
                    <div className="text-center group hover:scale-105 transition-transform cursor-pointer">
                      <p className="text-3xl font-bold text-zinc-600">
                        {projects.filter(p => p.status === "active").length}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wide">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-300 hover:shadow-lg transition-all duration-300">
              <div className="p-5 pb-4 border-b border-zinc-100">
                <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Key Insights
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Important highlights and recommendations</p>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {projects.length > 0 && (
                    <>
                      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 hover:border-emerald-200 transition-all duration-200 group">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-emerald-100 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-zinc-900 mb-1">
                              Overall Progress
                            </p>
                            <p className="text-xs text-zinc-500">
                              Averaging{" "}
                              <span className="font-bold text-emerald-600 text-sm">
                                {Math.round(projects.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / projects.length)}%
                              </span>{" "}
                              completion
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 hover:border-zinc-300 transition-all duration-200 group">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-zinc-200 group-hover:scale-110 transition-transform">
                            <Activity className="h-4 w-4 text-zinc-700" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-zinc-900 mb-1">
                              Active Workload
                            </p>
                            <p className="text-xs text-zinc-500">
                              <span className="font-bold text-zinc-700 text-sm">
                                {projects.filter(p => p.status === "active").length}
                              </span>{" "}
                              in progress
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 hover:border-zinc-300 transition-all duration-200 group">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-zinc-900 group-hover:scale-110 transition-transform">
                            <Target className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-zinc-900 mb-1">
                              Health Status
                            </p>
                            <p className="text-xs text-zinc-500">
                              <span className="font-bold text-emerald-600 text-sm">
                                {healthDistribution[0].value}
                              </span>{" "}
                              on track
                            </p>
                          </div>
                        </div>
                      </div>

                      {healthDistribution.find(h => h.name === "At Risk" && h.value > 0) && (
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 hover:border-amber-300 transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-amber-100 group-hover:scale-110 transition-transform">
                              <Clock className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-amber-900 mb-1">
                                Attention Needed
                              </p>
                              <p className="text-xs text-amber-700">
                                <span className="font-bold text-sm">{healthDistribution.find(h => h.name === "At Risk")?.value}</span> need attention
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
