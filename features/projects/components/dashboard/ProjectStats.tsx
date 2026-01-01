"use client";

import type { Project } from "@/features/projects/schema";
import { TrendingUp, AlertTriangle, CheckCircle2, FolderOpen, Activity, Target } from "lucide-react";
import { motion } from "framer-motion";

interface ProjectStatsProps {
  projects: Project[];
}

export default function ProjectStats({ projects }: ProjectStatsProps) {
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const atRiskProjects = projects.filter(
    (p) => p.health === "at_risk" || p.health === "critical"
  ).length;
  
  // Calculate average progress
  const avgProgress = totalProjects > 0 
    ? Math.round(projects.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / totalProjects)
    : 0;

  const stats = [
    {
      label: "Total Projects",
      value: totalProjects,
      icon: FolderOpen,
      description: "All projects",
      accent: "bg-zinc-900",
      iconColor: "text-white",
    },
    {
      label: "Active",
      value: activeProjects,
      icon: Activity,
      description: "In progress",
      accent: "bg-emerald-600",
      iconColor: "text-white",
    },
    {
      label: "Completed",
      value: completedProjects,
      icon: CheckCircle2,
      description: "Finished",
      accent: "bg-blue-600",
      iconColor: "text-white",
    },
    {
      label: "At Risk",
      value: atRiskProjects,
      icon: AlertTriangle,
      description: "Needs attention",
      accent: "bg-amber-500",
      iconColor: "text-white",
    },
    {
      label: "Avg. Progress",
      value: `${avgProgress}%`,
      icon: Target,
      description: "Portfolio health",
      accent: "bg-violet-600",
      iconColor: "text-white",
      isPercentage: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="group relative bg-white rounded-2xl border border-zinc-200/80 p-5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/5 transition-all duration-300"
        >
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.accent} mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
          </div>
          
          {/* Content */}
          <div>
            <p className="text-sm font-medium text-zinc-500 mb-1">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-zinc-900 tracking-tight">
              {stat.value}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {stat.description}
            </p>
          </div>
          
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-zinc-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </motion.div>
      ))}
    </div>
  );
}
