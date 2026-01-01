"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProjectAction } from "@/features/projects/actions";
import { Loader2 } from "lucide-react";
import { useProject } from "@/features/projects/store";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export default function CreateProjectDialog({
  open,
  onOpenChange,
  userId,
}: CreateProjectDialogProps) {
  const { addProject } = useProject();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    emoji: "📁",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newProject = await createProjectAction({
        name: formData.name,
        description: formData.description,
        emoji: formData.emoji,
        owner_id: userId,
        status: "active",
        health: "healthy",
        is_template: false,
        is_favorite: false,
        is_archived: false,
        health_score: 100,
        completion_percentage: 0,
      });

      if (newProject) {
        addProject(newProject);
        setFormData({ name: "", description: "", emoji: "📁" });
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-zinc-900">Create New Project</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Start a new project to track milestones and tasks
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Emoji Picker */}
            <div className="space-y-2">
              <Label htmlFor="emoji" className="text-zinc-700">Project Icon</Label>
              <Input
                id="emoji"
                value={formData.emoji}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                placeholder="📁"
                maxLength={2}
                className="text-2xl text-center w-20 rounded-xl border-zinc-200"
              />
            </div>

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-700">
                Project Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Website Redesign"
                required
                className="rounded-xl border-zinc-200"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-zinc-700">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your project goals and objectives..."
                rows={4}
                className="rounded-xl border-zinc-200"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
