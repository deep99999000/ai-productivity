"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Users, Target, Calendar, ArrowUpRight, Zap, AlertCircle } from "lucide-react";
import type { Project } from "@/features/projects/schema";
import { PROJECT_STATUS_OPTIONS, PROJECT_HEALTH_OPTIONS } from "@/features/projects/constants";
import { format, differenceInDays } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  project: Project;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  on_hold: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  completed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  archived: { bg: "bg-zinc-100", text: "text-zinc-600", dot: "bg-zinc-400" },
};

const HEALTH_STYLES: Record<string, { bg: string; text: string; icon: typeof Zap }> = {
  healthy: { bg: "bg-emerald-50", text: "text-emerald-600", icon: Zap },
  at_risk: { bg: "bg-amber-50", text: "text-amber-600", icon: AlertCircle },
  critical: { bg: "bg-rose-50", text: "text-rose-600", icon: AlertCircle },
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const statusConfig = PROJECT_STATUS_OPTIONS.find((s) => s.value === project.status);
  const healthConfig = PROJECT_HEALTH_OPTIONS.find((h) => h.value === project.health);
  
  const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES.active;
  const healthStyle = HEALTH_STYLES[project.health || "healthy"] || HEALTH_STYLES.healthy;
  const HealthIcon = healthStyle.icon;
  
  // Calculate days until due
  const daysUntilDue = project.target_end_date 
    ? differenceInDays(new Date(project.target_end_date), new Date())
    : null;
  
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7;

  const handleCardClick = () => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={handleCardClick}
      className="group cursor-pointer"
    >
      <div className="relative bg-white rounded-2xl border border-zinc-200/80 overflow-hidden hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-900/5 transition-all duration-300">
        {/* Progress indicator line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-100">
          <motion.div
            className="h-full bg-zinc-900"
            initial={{ width: 0 }}
            animate={{ width: `${project.completion_percentage || 0}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          />
        </div>

        <div className="p-6 pt-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Emoji/Icon */}
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center text-xl group-hover:bg-zinc-900 group-hover:scale-105 transition-all duration-300">
                <span className="group-hover:grayscale group-hover:brightness-200 transition-all duration-300">
                  {project.emoji || "📁"}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-zinc-900 truncate group-hover:text-zinc-700 transition-colors">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-zinc-500 mt-0.5 line-clamp-1">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-zinc-100 transition-all duration-200 rounded-lg"
                >
                  <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem className="rounded-lg">View Details</DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg">Edit Project</DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg">Clone Project</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-lg text-rose-600">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 mb-5">
            <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0 font-medium px-2.5 py-0.5 text-xs`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} mr-1.5`} />
              {statusConfig?.label || project.status}
            </Badge>
            
            {project.health && project.health !== "healthy" && (
              <Badge className={`${healthStyle.bg} ${healthStyle.text} border-0 font-medium px-2.5 py-0.5 text-xs`}>
                <HealthIcon className="w-3 h-3 mr-1" />
                {healthConfig?.label || project.health}
              </Badge>
            )}
          </div>

          {/* Progress */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-500">Progress</span>
              <span className="text-sm font-bold text-zinc-900">
                {project.completion_percentage || 0}%
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-zinc-700 to-zinc-900 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${project.completion_percentage || 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Meta Information */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            <div className="flex items-center gap-4">
              {/* Team indicator */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Users className="w-3.5 h-3.5" />
                <span>0</span>
              </div>
              
              {/* Milestones */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Target className="w-3.5 h-3.5" />
                <span>0</span>
              </div>
            </div>

            {/* Due date */}
            {project.target_end_date && (
              <div className={`flex items-center gap-1.5 text-xs font-medium ${
                isOverdue ? "text-rose-600" : isDueSoon ? "text-amber-600" : "text-zinc-500"
              }`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {isOverdue 
                    ? `${Math.abs(daysUntilDue!)}d overdue`
                    : isDueSoon
                    ? `${daysUntilDue}d left`
                    : format(new Date(project.target_end_date), "MMM d")
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Hover arrow indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <ArrowUpRight className="w-4 h-4 text-zinc-400" />
        </div>
      </div>
    </motion.div>
  );
}
