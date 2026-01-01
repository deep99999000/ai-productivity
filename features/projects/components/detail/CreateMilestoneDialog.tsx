"use client";

import { useState } from "react";
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
import { useProject } from "@/features/projects/store";
import { createMilestoneAction } from "@/features/projects/actions";
import type { Milestone } from "@/features/projects/schema";
import { COLORS } from "@/features/projects/constants";
import toast from "react-hot-toast";

const createMilestoneSchema = z.object({
  name: z.string().min(1, "Milestone name is required"),
  description: z.string().optional(),
  emoji: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "pending_approval", "completed", "blocked"]),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
});

type CreateMilestoneFormData = z.infer<typeof createMilestoneSchema>;

interface CreateMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  userId: string;
}

export default function CreateMilestoneDialog({
  open,
  onOpenChange,
  projectId,
  userId,
}: CreateMilestoneDialogProps) {
  const { addMilestone, milestones } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateMilestoneFormData>({
    resolver: zodResolver(createMilestoneSchema),
    defaultValues: {
      name: "",
      description: "",
      emoji: "🎯",
      status: "not_started",
      start_date: "",
      due_date: "",
    },
  });

  const onSubmit = async (data: CreateMilestoneFormData) => {
    try {
      setIsSubmitting(true);

      const newMilestone = {
        project_id: projectId,
        owner_id: userId,
        name: data.name,
        description: data.description || null,
        emoji: data.emoji || "🎯",
        status: data.status,
        start_date: data.start_date ? new Date(data.start_date) : null,
        due_date: data.due_date ? new Date(data.due_date) : null,
        display_order: milestones.filter(m => m.project_id === projectId).length,
        total_tasks: 0,
        completed_tasks: 0,
        progress_percentage: 0,
      };

      const result = await createMilestoneAction(newMilestone as any);
      if (result) {
        addMilestone(result as Milestone);
        toast.success("Milestone created successfully");
        reset();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error creating milestone:", error);
      toast.error("Failed to create milestone");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className={COLORS.text.primary}>Create Milestone</DialogTitle>
          <DialogDescription className={COLORS.text.secondary}>
            Create a new milestone to organize tasks
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Emoji */}
            <div>
              <Label htmlFor="emoji">Emoji</Label>
              <Input
                id="emoji"
                {...register("emoji")}
                placeholder="🎯"
                className="text-2xl"
              />
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name">Milestone Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Phase 1: Foundation"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Milestone description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`${COLORS.primary.gradient} text-white`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Milestone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
