"use client";

import type { Project } from "@/features/projects/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROJECT_STATUS_OPTIONS, PROJECT_HEALTH_OPTIONS } from "@/features/projects/constants";
import { MoreHorizontal, Star, Calendar, ChevronRight, AlertCircle, Zap } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ProjectListProps {
  projects: Project[];
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  on_hold: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  completed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  archived: { bg: "bg-zinc-100", text: "text-zinc-600", dot: "bg-zinc-400" },
};

export default function ProjectList({ projects }: ProjectListProps) {
  const router = useRouter();

  const handleProjectClick = (projectId: number) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-zinc-50/80 border-b border-zinc-200/80">
        <div className="col-span-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Project
        </div>
        <div className="col-span-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center hidden md:block">
          Status
        </div>
        <div className="col-span-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center hidden lg:block">
          Progress
        </div>
        <div className="col-span-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center hidden lg:block">
          Due Date
        </div>
        <div className="col-span-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">
          
        </div>
      </div>

      {/* Project Rows */}
      <div className="divide-y divide-zinc-100">
        {projects.map((project, index) => {
          const statusConfig = PROJECT_STATUS_OPTIONS.find((s) => s.value === project.status);
          const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES.active;
          
          const daysUntilDue = project.target_end_date 
            ? differenceInDays(new Date(project.target_end_date), new Date())
            : null;
          const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
          const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7;

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              onClick={() => handleProjectClick(project.id)}
              className="group grid grid-cols-12 gap-4 px-6 py-4 hover:bg-zinc-50/80 cursor-pointer transition-colors duration-150"
            >
              {/* Project Info */}
              <div className="col-span-5 flex items-center gap-4 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-lg group-hover:bg-zinc-900 transition-all duration-200">
                  <span className="group-hover:grayscale group-hover:brightness-200 transition-all duration-200">
                    {project.emoji || "📁"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-zinc-900 truncate group-hover:text-zinc-700 transition-colors">
                      {project.name}
                    </h3>
                    {project.is_favorite && (
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-current flex-shrink-0" />
                    )}
                  </div>
                  {project.description && (
                    <p className="text-sm text-zinc-500 truncate mt-0.5">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="col-span-2 hidden md:flex items-center justify-center">
                <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0 font-medium px-2.5 py-0.5 text-xs`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} mr-1.5`} />
                  {statusConfig?.label || project.status}
                </Badge>
              </div>

              {/* Progress */}
              <div className="col-span-2 hidden lg:flex items-center justify-center gap-3">
                <div className="w-24 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-zinc-900 rounded-full transition-all duration-300"
                    style={{ width: `${project.completion_percentage || 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-zinc-900 w-10">
                  {project.completion_percentage || 0}%
                </span>
              </div>

              {/* Due Date */}
              <div className="col-span-2 hidden lg:flex items-center justify-center">
                {project.target_end_date ? (
                  <div className={`flex items-center gap-1.5 text-sm ${
                    isOverdue ? "text-rose-600 font-medium" : isDueSoon ? "text-amber-600" : "text-zinc-500"
                  }`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {isOverdue 
                        ? `${Math.abs(daysUntilDue!)}d overdue`
                        : format(new Date(project.target_end_date), "MMM d, yyyy")
                      }
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-zinc-400">—</span>
                )}
              </div>

              {/* Actions */}
              <div className="col-span-1 flex items-center justify-end gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-zinc-100 transition-all rounded-lg"
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
                
                <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all duration-200" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
