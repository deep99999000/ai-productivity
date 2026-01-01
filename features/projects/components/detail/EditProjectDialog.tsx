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
import { updateProjectAction } from "@/features/projects/actions";
import type { Project } from "@/features/projects/schema";
import toast from "react-hot-toast";

const editProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  emoji: z.string().optional(),
  status: z.enum(["active", "on_hold", "completed", "archived"]),
  health: z.enum(["healthy", "at_risk", "critical"]),
  start_date: z.string().optional(),
  target_end_date: z.string().optional(),
  tags: z.string().optional(),
});

type EditProjectFormData = z.infer<typeof editProjectSchema>;

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export default function EditProjectDialog({
  open,
  onOpenChange,
  project,
}: EditProjectDialogProps) {
  const { updateProject } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description || "",
      emoji: project.emoji || "📁",
      status: project.status as any,
      health: project.health as any,
      start_date: project.start_date
        ? new Date(project.start_date).toISOString().split("T")[0]
        : "",
      target_end_date: project.target_end_date
        ? new Date(project.target_end_date).toISOString().split("T")[0]
        : "",
      tags: project.tags?.join(", ") || "",
    },
  });

  const onSubmit = async (data: EditProjectFormData) => {
    try {
      setIsSubmitting(true);

      const updatedProject: Project = {
        ...project,
        name: data.name,
        description: data.description || null,
        emoji: data.emoji || "📁",
        status: data.status,
        health: data.health,
        start_date: data.start_date ? new Date(data.start_date) : null,
        target_end_date: data.target_end_date ? new Date(data.target_end_date) : null,
        tags: data.tags
          ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
          : [],
        updated_at: new Date(),
      };

      const result = await updateProjectAction(updatedProject);
      if (result) {
        updateProject(result as Project);
        toast.success("Project updated successfully");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-900">Edit Project</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Update your project details below
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
                placeholder="📁"
                className="text-2xl"
              />
            </div>

            {/* Name */}
            <div className="md:col-span-1">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="My Project"
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
              placeholder="Project description..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Health */}
            <div>
              <Label htmlFor="health">Health</Label>
              <Select
                value={watch("health")}
                onValueChange={(value) => setValue("health", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
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

            {/* Target End Date */}
            <div>
              <Label htmlFor="target_end_date">Target End Date</Label>
              <Input
                id="target_end_date"
                type="date"
                {...register("target_end_date")}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...register("tags")}
              placeholder="design, development, urgent"
            />
          </div>

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
              {isSubmitting ? "Updating..." : "Update Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
