"use client";

import { useEffect } from "react";
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
import { updateMilestoneAction } from "@/features/projects/actions";
import type { Milestone } from "@/features/projects/schema";
import { COLORS } from "@/features/projects/constants";
import toast from "react-hot-toast";

const editMilestoneSchema = z.object({
  name: z.string().min(1, "Milestone name is required"),
  description: z.string().optional(),
  emoji: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "pending_approval", "completed", "blocked"]),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
});

type EditMilestoneFormData = z.infer<typeof editMilestoneSchema>;

interface EditMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: Milestone;
}

export default function EditMilestoneDialog({
  open,
  onOpenChange,
  milestone,
}: EditMilestoneDialogProps) {
  const { updateMilestone } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditMilestoneFormData>({
    resolver: zodResolver(editMilestoneSchema),
    defaultValues: {
      name: milestone.name,
      description: milestone.description || "",
      emoji: milestone.emoji || "🎯",
      status: milestone.status as any,
      start_date: milestone.start_date ? new Date(milestone.start_date).toISOString().split('T')[0] : "",
      due_date: milestone.due_date ? new Date(milestone.due_date).toISOString().split('T')[0] : "",
    },
  });

  // Update form when milestone changes
  useEffect(() => {
    if (open) {
      reset({
        name: milestone.name,
        description: milestone.description || "",
        emoji: milestone.emoji || "🎯",
        status: milestone.status as any,
        start_date: milestone.start_date ? new Date(milestone.start_date).toISOString().split('T')[0] : "",
        due_date: milestone.due_date ? new Date(milestone.due_date).toISOString().split('T')[0] : "",
      });
    }
  }, [milestone, open, reset]);

  const onSubmit = async (data: EditMilestoneFormData) => {
    try {
      setIsSubmitting(true);

      const updatedMilestone = {
        ...milestone,
        name: data.name,
        description: data.description || null,
        emoji: data.emoji || "🎯",
        status: data.status,
        start_date: data.start_date ? new Date(data.start_date) : null,
        due_date: data.due_date ? new Date(data.due_date) : null,
        completed_at: data.status === "completed" && milestone.status !== "completed" ? new Date() : milestone.completed_at,
      };

      const result = await updateMilestoneAction(updatedMilestone as Milestone);
      if (result) {
        updateMilestone(result as Milestone);
        toast.success("Milestone updated successfully");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error updating milestone:", error);
      toast.error("Failed to update milestone");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className={COLORS.text.primary}>Edit Milestone</DialogTitle>
          <DialogDescription className={COLORS.text.secondary}>
            Update milestone details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Milestone Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Launch Phase 1"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Emoji */}
            <div>
              <Label htmlFor="emoji">Emoji</Label>
              <Input
                id="emoji"
                {...register("emoji")}
                placeholder="🎯"
                maxLength={8}
              />
            </div>

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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`${COLORS.primary.gradient} text-white`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Milestone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
