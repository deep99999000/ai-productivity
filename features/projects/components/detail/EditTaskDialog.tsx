"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useProject } from "@/features/projects/store";
import { updateTaskAction, getProjectMembers } from "@/features/projects/actions";
import type { Task } from "@/features/projects/schema";
import toast from "react-hot-toast";

const editTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  milestone_id: z.number(),
  status: z.enum(["todo", "in_progress", "in_review", "blocked", "completed", "cancelled"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  assigned_to: z.string().optional(),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  estimated_hours: z.number().optional(),
  is_blocked: z.boolean(),
  blocker_reason: z.string().optional(),
});

type EditTaskFormData = z.infer<typeof editTaskSchema>;

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  projectId: number;
}

export default function EditTaskDialog({
  open,
  onOpenChange,
  task,
  projectId,
}: EditTaskDialogProps) {
  const { updateTask, milestones } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const projectMilestones = milestones.filter(m => m.project_id === projectId);

  // Fetch team members when dialog opens
  useEffect(() => {
    const fetchMembers = async () => {
      if (open && projectId) {
        const members = await getProjectMembers(projectId);
        if (members) {
          setTeamMembers(members);
        }
      }
    };
    fetchMembers();
  }, [open, projectId]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
      milestone_id: task.milestone_id,
      status: task.status as any,
      priority: task.priority as any,
      assigned_to: task.assigned_to || "",
      start_date: task.start_date ? new Date(task.start_date).toISOString().split('T')[0] : "",
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "",
      estimated_hours: task.estimated_hours || undefined,
      is_blocked: task.is_blocked || false,
      blocker_reason: task.blocker_reason || "",
    },
  });

  // Update form when task changes
  useEffect(() => {
    if (open) {
      reset({
        title: task.title,
        description: task.description || "",
        milestone_id: task.milestone_id,
        status: task.status as any,
        priority: task.priority as any,
        assigned_to: task.assigned_to || "",
        start_date: task.start_date ? new Date(task.start_date).toISOString().split('T')[0] : "",
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "",
        estimated_hours: task.estimated_hours || undefined,
        is_blocked: task.is_blocked || false,
        blocker_reason: task.blocker_reason || "",
      });
    }
  }, [task, open, reset]);

  const onSubmit = async (data: EditTaskFormData) => {
    try {
      setIsSubmitting(true);

      const updatedTask = {
        ...task,
        title: data.title,
        description: data.description || null,
        milestone_id: data.milestone_id,
        status: data.status,
        priority: data.priority,
        assigned_to: data.assigned_to || null,
        start_date: data.start_date ? new Date(data.start_date) : null,
        due_date: data.due_date ? new Date(data.due_date) : null,
        estimated_hours: data.estimated_hours || null,
        is_blocked: data.is_blocked,
        blocker_reason: data.blocker_reason || null,
        completed_at: data.status === "completed" && task.status !== "completed" ? new Date() : task.completed_at,
      };

      const result = await updateTaskAction(updatedTask as Task);
      if (result) {
        updateTask(result as Task);
        toast.success("Task updated successfully");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBlocked = watch("is_blocked");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-900">Edit Task</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Update task details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Milestone Selection */}
          <div>
            <Label htmlFor="milestone_id">Milestone *</Label>
            <Select
              value={watch("milestone_id")?.toString()}
              onValueChange={(value) => setValue("milestone_id", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select milestone" />
              </SelectTrigger>
              <SelectContent>
                {projectMilestones.map((milestone) => (
                  <SelectItem key={milestone.id} value={milestone.id.toString()}>
                    {milestone.emoji} {milestone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.milestone_id && (
              <p className="text-sm text-red-500 mt-1">{errors.milestone_id.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Implement user authentication"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Task description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={watch("priority")}
                onValueChange={(value) => setValue("priority", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assigned To */}
            <div>
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Select
                value={watch("assigned_to") || "unassigned"}
                onValueChange={(value) => setValue("assigned_to", value === "unassigned" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      <div className="flex items-center gap-2">
                        <span>{member.user_name || member.user_email || member.user_id}</span>
                        {member.role === "owner" && <span>👑</span>}
                        {member.role === "admin" && <span>⚡</span>}
                        {member.role === "editor" && <span>✏️</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Hours */}
            <div>
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                {...register("estimated_hours", { valueAsNumber: true })}
                placeholder="8"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                {...register("start_date")}
              />
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                {...register("due_date")}
              />
            </div>
          </div>

          {/* Is Blocked */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_blocked"
              checked={isBlocked}
              onCheckedChange={(checked) => setValue("is_blocked", checked as boolean)}
            />
            <Label
              htmlFor="is_blocked"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Task is blocked
            </Label>
          </div>

          {/* Blocker Reason */}
          {isBlocked && (
            <div>
              <Label htmlFor="blocker_reason">Blocker Reason</Label>
              <Textarea
                id="blocker_reason"
                {...register("blocker_reason")}
                placeholder="Describe why this task is blocked..."
                rows={2}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
