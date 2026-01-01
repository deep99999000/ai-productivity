"use client";

import { useState } from "react";
import { Calendar, MoreHorizontal, Edit, Trash, ChevronDown, ChevronUp, Plus, MessageSquare, Target, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProject } from "@/features/projects/store";
import { deleteMilestoneAction } from "@/features/projects/actions";
import type { Milestone } from "@/features/projects/schema";
import toast from "react-hot-toast";
import CreateTaskDialog from "./CreateTaskDialog";
import TaskCard from "./TaskCard";
import EditMilestoneDialog from "./EditMilestoneDialog";
import MilestoneChatDialog from "./MilestoneChatDialog";
import { format, differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface MilestoneCardProps {
  milestone: Milestone;
  userId: string;
  projectId: number;
}

const MILESTONE_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  not_started: { label: "Not Started", color: "text-zinc-600", bg: "bg-zinc-100", dot: "bg-zinc-400" },
  in_progress: { label: "In Progress", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500" },
  pending_approval: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
  completed: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  blocked: { label: "Blocked", color: "text-rose-700", bg: "bg-rose-50", dot: "bg-rose-500" },
};

export default function MilestoneCard({ milestone, userId, projectId }: MilestoneCardProps) {
  const { tasks, deleteMilestone } = useProject();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);

  const statusConfig = MILESTONE_STATUS_CONFIG[milestone.status as keyof typeof MILESTONE_STATUS_CONFIG] || MILESTONE_STATUS_CONFIG.not_started;
  
  // Get tasks for this milestone
  const milestoneTasks = tasks.filter(t => t.milestone_id === milestone.id);
  const completedTasks = milestoneTasks.filter(t => t.status === "completed").length;
  const totalTasks = milestoneTasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const daysUntilDue = milestone.due_date ? differenceInDays(new Date(milestone.due_date), new Date()) : null;
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && milestone.status !== "completed";
  const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 3 && milestone.status !== "completed";

  const handleDelete = async () => {
    try {
      const loadingToast = toast.loading("Deleting milestone...");
      await deleteMilestoneAction(milestone.id, userId);
      deleteMilestone(milestone.id);
      toast.dismiss(loadingToast);
      toast.success("Milestone deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting milestone:", error);
      toast.error("Failed to delete milestone");
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Progress bar at top */}
      <div className="h-1 bg-zinc-100">
        <motion.div
          className="h-full bg-zinc-900"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Milestone Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-lg">
                {milestone.emoji || "🎯"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-zinc-900 truncate">
                  {milestone.name}
                </h3>
                {milestone.description && (
                  <p className="text-sm text-zinc-500 truncate">
                    {milestone.description}
                  </p>
                )}
              </div>
            </div>

            {/* Status and Dates */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className={`${statusConfig.bg} ${statusConfig.color} border-0 font-medium px-2.5 py-0.5 text-xs`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5`} />
                {statusConfig.label}
              </Badge>
              
              {milestone.due_date && (
                <div className={`flex items-center gap-1.5 text-xs font-medium ${
                  isOverdue ? "text-rose-600" : isDueSoon ? "text-amber-600" : "text-zinc-500"
                }`}>
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {isOverdue 
                      ? `${Math.abs(daysUntilDue!)}d overdue`
                      : format(new Date(milestone.due_date), "MMM d, yyyy")
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-600">
                      {completedTasks} of {totalTasks} tasks
                    </span>
                  </div>
                  <span className="text-sm font-bold text-zinc-900">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2 bg-zinc-100" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsChatDialogOpen(true)}
              title="Open Chat"
              className="h-8 w-8 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse" : "Expand"}
              className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:bg-zinc-100 rounded-lg">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)} className="rounded-lg">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Milestone
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="rounded-lg text-rose-600">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Milestone
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tasks List (Expandable) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-5 pt-5 border-t border-zinc-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-zinc-900">
                    Tasks ({milestoneTasks.length})
                  </h4>
                  <Button
                    size="sm"
                    onClick={() => setIsCreateTaskDialogOpen(true)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white h-8 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1.5" />
                    Add Task
                  </Button>
                </div>
                
                {milestoneTasks.length > 0 ? (
                  <div className="space-y-3">
                    {milestoneTasks.map((task) => (
                      <TaskCard key={task.id} task={task} userId={userId} projectId={projectId} />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center bg-zinc-50 rounded-xl">
                    <Target className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">No tasks yet</p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setIsCreateTaskDialogOpen(true)}
                      className="text-zinc-600 hover:text-zinc-900 mt-1"
                    >
                      Add your first task
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={isCreateTaskDialogOpen}
        onOpenChange={setIsCreateTaskDialogOpen}
        projectId={projectId}
        milestoneId={milestone.id}
        userId={userId}
      />

      {/* Edit Milestone Dialog */}
      <EditMilestoneDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        milestone={milestone}
      />

      {/* Milestone Chat Dialog */}
      <MilestoneChatDialog
        milestone={milestone}
        projectId={projectId}
        userId={userId}
        open={isChatDialogOpen}
        onOpenChange={setIsChatDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-900">Delete Milestone</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              Are you sure you want to delete "{milestone.name}"?
              {milestoneTasks.length > 0 && (
                <span className="block mt-2 text-rose-600 font-medium">
                  This will also delete {milestoneTasks.length} task{milestoneTasks.length > 1 ? 's' : ''}.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 rounded-xl">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
