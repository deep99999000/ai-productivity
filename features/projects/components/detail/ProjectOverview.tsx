"use client";

import { TrendingUp, Target, CheckCircle2, Clock, AlertTriangle, Calendar, Flag, FileText, Tag } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/features/projects/store";
import type { Project } from "@/features/projects/schema";
import ActivityFeed from "./ActivityFeed";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface ProjectOverviewProps {
  project: Project;
}

export default function ProjectOverview({ project }: ProjectOverviewProps) {
  const { milestones, tasks } = useProject();

  // Calculate statistics
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === "completed").length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const blockedTasks = tasks.filter(t => t.is_blocked).length;
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || t.status === "completed") return false;
    return new Date(t.due_date) < new Date();
  }).length;
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;

  const taskStats = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: CheckCircle2,
      color: "bg-zinc-900",
      textColor: "text-white",
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      color: "bg-emerald-600",
      textColor: "text-white",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      color: "bg-blue-600",
      textColor: "text-white",
    },
    {
      title: "Blocked",
      value: blockedTasks,
      icon: AlertTriangle,
      color: "bg-rose-600",
      textColor: "text-white",
    },
    {
      title: "Overdue",
      value: overdueTasks,
      icon: Clock,
      color: "bg-amber-500",
      textColor: "text-white",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Task Analytics - Keep as user likes */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {taskStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="bg-white rounded-xl border border-zinc-200/80 p-4 hover:border-zinc-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500">{stat.title}</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Info - Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Overview Card */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900">Progress Overview</h3>
                <Badge className="bg-zinc-100 text-zinc-700 border-0">
                  {project.completion_percentage || 0}% Complete
                </Badge>
              </div>
            </div>
            <div className="p-5 space-y-5">
              {/* Overall Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-600">Project Completion</span>
                  <span className="text-sm font-semibold text-zinc-900">{project.completion_percentage || 0}%</span>
                </div>
                <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${project.completion_percentage || 0}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-zinc-900 rounded-full"
                  />
                </div>
              </div>

              {/* Milestones Progress */}
              {totalMilestones > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-zinc-500" />
                      <span className="text-sm text-zinc-600">Milestones</span>
                    </div>
                    <span className="text-sm font-semibold text-zinc-900">
                      {completedMilestones}/{totalMilestones}
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(completedMilestones / totalMilestones) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* Tasks Progress */}
              {totalTasks > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-zinc-500" />
                      <span className="text-sm text-zinc-600">Tasks</span>
                    </div>
                    <span className="text-sm font-semibold text-zinc-900">
                      {completedTasks}/{totalTasks}
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h3 className="font-semibold text-zinc-900">Project Details</h3>
            </div>
            <div className="p-5">
              {/* Description */}
              {project.description && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Description</span>
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}

              {/* Date & Health Grid */}
              <div className="grid grid-cols-2 gap-4">
                {project.start_date && (
                  <div className="p-3 bg-zinc-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-xs text-zinc-500">Start Date</span>
                    </div>
                    <p className="text-sm font-medium text-zinc-900">
                      {format(new Date(project.start_date), "MMM d, yyyy")}
                    </p>
                  </div>
                )}

                {project.target_end_date && (
                  <div className="p-3 bg-zinc-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Flag className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-xs text-zinc-500">Target End</span>
                    </div>
                    <p className="text-sm font-medium text-zinc-900">
                      {format(new Date(project.target_end_date), "MMM d, yyyy")}
                    </p>
                  </div>
                )}

                <div className="p-3 bg-zinc-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="text-xs text-zinc-500">Health Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900">{project.health_score || 100}%</span>
                    <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${(project.health_score || 100) >= 70 ? 'bg-emerald-500' : (project.health_score || 100) >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${project.health_score || 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {project.tags && project.tags.length > 0 && (
                  <div className="p-3 bg-zinc-50 rounded-xl col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-xs text-zinc-500">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <Badge key={tag} className="bg-zinc-200 text-zinc-700 border-0 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed projectId={project.id} />
        </div>
      </div>
    </div>
  );
}
