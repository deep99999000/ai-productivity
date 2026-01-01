"use client";

import { useState } from "react";
import { Star, MoreHorizontal, Edit, Trash, Archive, Copy, Calendar, Target, Activity, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProject } from "@/features/projects/store";
import { updateProjectAction, deleteProjectAction } from "@/features/projects/actions";
import type { Project } from "@/features/projects/schema";
import EditProjectDialog from "./EditProjectDialog";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { format, differenceInDays } from "date-fns";
import { motion } from "framer-motion";

interface ProjectHeaderProps {
  project: Project;
  userId: string;
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

export default function ProjectHeader({ project, userId }: ProjectHeaderProps) {
  const router = useRouter();
  const { updateProject, deleteProject } = useProject();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(project.is_favorite || false);

  const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES.active;
  const healthStyle = HEALTH_STYLES[project.health || "healthy"] || HEALTH_STYLES.healthy;
  const HealthIcon = healthStyle.icon;

  const daysUntilDue = project.target_end_date 
    ? differenceInDays(new Date(project.target_end_date), new Date())
    : null;
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

  const toggleFavorite = async () => {
    try {
      const updatedProject = {
        ...project,
        is_favorite: !isFavorite,
      };
      
      const result = await updateProjectAction(updatedProject);
      if (result) {
        setIsFavorite(!isFavorite);
        updateProject(result as Project);
        toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
      }
    } catch (error) {
      toast.error("Failed to update favorite status");
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      try {
        await deleteProjectAction(project.id, userId);
        deleteProject(project.id);
        toast.success("Project deleted successfully");
        router.push("/projects");
      } catch (error) {
        toast.error("Failed to delete project");
      }
    }
  };

  const handleArchive = async () => {
    try {
      const updatedProject = {
        ...project,
        is_archived: true,
        status: "archived" as const,
      };
      
      const result = await updateProjectAction(updatedProject);
      if (result) {
        updateProject(result as Project);
        toast.success("Project archived successfully");
        router.push("/projects");
      }
    } catch (error) {
      toast.error("Failed to archive project");
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden">
        {/* Progress bar at top */}
        <div className="h-1 bg-zinc-100">
          <motion.div
            className="h-full bg-zinc-900"
            initial={{ width: 0 }}
            animate={{ width: `${project.completion_percentage || 0}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left side - Project info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-4">
                {/* Emoji */}
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-3xl">
                  {project.emoji || "📁"}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title and favorite */}
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 tracking-tight truncate">
                      {project.name}
                    </h1>
                    <button
                      onClick={toggleFavorite}
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        isFavorite 
                          ? "text-amber-500 bg-amber-50" 
                          : "text-zinc-300 hover:text-amber-500 hover:bg-amber-50"
                      }`}
                    >
                      <Star className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-zinc-500 mb-4 max-w-2xl">
                      {project.description}
                    </p>
                  )}

                  {/* Status badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0 font-medium px-3 py-1`}>
                      <span className={`w-2 h-2 rounded-full ${statusStyle.dot} mr-2`} />
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                    </Badge>
                    
                    {project.health && (
                      <Badge className={`${healthStyle.bg} ${healthStyle.text} border-0 font-medium px-3 py-1`}>
                        <HealthIcon className="w-3.5 h-3.5 mr-1.5" />
                        {project.health.charAt(0).toUpperCase() + project.health.slice(1).replace('_', ' ')}
                      </Badge>
                    )}

                    {project.tags && project.tags.length > 0 && (
                      <>
                        {project.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="border-zinc-200 text-zinc-600 font-normal">
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Badge variant="outline" className="border-zinc-200 text-zinc-500 font-normal">
                            +{project.tags.length - 3}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 lg:flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(true)}
                className="border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem className="rounded-lg" onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg">
                    <Copy className="h-4 w-4 mr-2" />
                    Clone Project
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-lg" onClick={handleArchive}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Project
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg text-rose-600" onClick={handleDelete}>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Meta stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-100">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Progress</p>
                <p className="text-lg font-bold text-zinc-900">{project.completion_percentage || 0}%</p>
              </div>
            </div>

            {/* Start Date */}
            {project.start_date && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-zinc-600" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium">Started</p>
                  <p className="text-sm font-semibold text-zinc-900">
                    {format(new Date(project.start_date), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            )}

            {/* Due Date */}
            {project.target_end_date && (
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isOverdue ? "bg-rose-100" : "bg-zinc-100"
                }`}>
                  <Target className={`w-5 h-5 ${isOverdue ? "text-rose-600" : "text-zinc-600"}`} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium">Due Date</p>
                  <p className={`text-sm font-semibold ${isOverdue ? "text-rose-600" : "text-zinc-900"}`}>
                    {format(new Date(project.target_end_date), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            )}

            {/* Health Score */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Health</p>
                <p className="text-lg font-bold text-zinc-900">{project.health_score || 100}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProjectDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        project={project}
      />
    </>
  );
}
