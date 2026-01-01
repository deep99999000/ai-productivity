"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash, User, Calendar, Flag, Ban, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { updateTaskAction, deleteTaskAction } from "@/features/projects/actions";
import type { Task } from "@/features/projects/schema";
import toast from "react-hot-toast";
import EditTaskDialog from "./EditTaskDialog";
import { format, differenceInDays } from "date-fns";
import { motion } from "framer-motion";

interface TaskCardProps {
  task: Task;
  userId: string;
  projectId?: number;
}

const TASK_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  todo: { label: "To Do", color: "text-zinc-600", bg: "bg-zinc-100", dot: "bg-zinc-400" },
  in_progress: { label: "In Progress", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500" },
  in_review: { label: "In Review", color: "text-violet-700", bg: "bg-violet-50", dot: "bg-violet-500" },
  blocked: { label: "Blocked", color: "text-rose-700", bg: "bg-rose-50", dot: "bg-rose-500" },
  completed: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", color: "text-zinc-500", bg: "bg-zinc-100", dot: "bg-zinc-400" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "text-zinc-600", bg: "bg-zinc-100" },
  medium: { label: "Medium", color: "text-blue-700", bg: "bg-blue-50" },
  high: { label: "High", color: "text-amber-700", bg: "bg-amber-50" },
  critical: { label: "Critical", color: "text-rose-700", bg: "bg-rose-50" },
};

export default function TaskCard({ task, userId, projectId }: TaskCardProps) {
  const { updateTask, deleteTask } = useProject();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const statusConfig = TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG] || TASK_STATUS_CONFIG.todo;
  const priorityConfig = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;

  const daysUntilDue = task.due_date ? differenceInDays(new Date(task.due_date), new Date()) : null;
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && task.status !== "completed";
  const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 2 && task.status !== "completed";
  const isCompleted = task.status === "completed";

  const toggleComplete = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      const newStatus = task.status === "completed" ? "todo" : "completed";
      const updatedTask = {
        ...task,
        status: newStatus,
        completed_at: newStatus === "completed" ? new Date() : null,
      };

      const result = await updateTaskAction(updatedTask as Task);
      if (result) {
        updateTask(result as Task);
        toast.success(newStatus === "completed" ? "Task completed!" : "Task reopened");
      }
    } catch (error) {
      toast.error("Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      const loadingToast = toast.loading("Deleting task...");
      await deleteTaskAction(task.id, userId);
      deleteTask(task.id);
      toast.dismiss(loadingToast);
      toast.success("Task deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`group relative bg-white rounded-xl border border-zinc-200/80 hover:border-zinc-300 hover:shadow-md transition-all duration-200 ${
        isCompleted ? "opacity-60" : ""
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="pt-0.5">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={toggleComplete}
              disabled={isUpdating}
              className="h-5 w-5 rounded-md border-zinc-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
            />
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className={`text-sm font-medium text-zinc-900 ${isCompleted ? "line-through text-zinc-500" : ""}`}>
              {task.title}
            </h4>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Status Badge */}
              <Badge className={`${statusConfig.bg} ${statusConfig.color} border-0 text-xs font-medium px-2 py-0.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5`} />
                {statusConfig.label}
              </Badge>

              {/* Priority Badge */}
              {task.priority !== "medium" && (
                <Badge className={`${priorityConfig.bg} ${priorityConfig.color} border-0 text-xs font-medium px-2 py-0.5`}>
                  <Flag className="h-2.5 w-2.5 mr-1" />
                  {priorityConfig.label}
                </Badge>
              )}

              {/* Blocked Badge */}
              {task.is_blocked && (
                <Badge className="bg-rose-50 text-rose-700 border-0 text-xs font-medium px-2 py-0.5">
                  <Ban className="h-2.5 w-2.5 mr-1" />
                  Blocked
                </Badge>
              )}

              {/* Assignee */}
              {task.assigned_to && (
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <User className="h-3 w-3" />
                  <span>{task.assigned_to}</span>
                </div>
              )}

              {/* Due Date */}
              {task.due_date && (
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  isOverdue ? "text-rose-600" : isDueSoon ? "text-amber-600" : "text-zinc-500"
                }`}>
                  <Calendar className="h-3 w-3" />
                  <span>
                    {isOverdue 
                      ? `${Math.abs(daysUntilDue!)}d overdue`
                      : format(new Date(task.due_date), "MMM d")
                    }
                  </span>
                </div>
              )}

              {/* Estimated Hours */}
              {task.estimated_hours && (
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <Clock className="h-3 w-3" />
                  <span>{task.estimated_hours}h</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-zinc-100 transition-all rounded-lg"
              >
                <MoreHorizontal className="h-4 w-4 text-zinc-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)} className="rounded-lg">
                <Edit className="h-4 w-4 mr-2" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="rounded-lg text-rose-600">
                <Trash className="h-4 w-4 mr-2" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Edit Dialog */}
      {projectId && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={task}
          projectId={projectId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-900">Delete Task</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
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
    </motion.div>
  );
}
