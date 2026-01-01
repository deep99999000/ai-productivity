"use client";

import { useState } from "react";
import { Plus, Target, CheckCircle2, Clock, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/features/projects/store";
import CreateMilestoneDialog from "./CreateMilestoneDialog";
import MilestoneCard from "./MilestoneCard";
import { motion } from "framer-motion";

interface MilestonesSectionProps {
  projectId: number;
  userId: string;
}

export default function MilestonesSection({ projectId, userId }: MilestonesSectionProps) {
  const { milestones } = useProject();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const projectMilestones = milestones.filter(m => m.project_id === projectId);
  
  // Calculate statistics
  const totalMilestones = projectMilestones.length;
  const completedMilestones = projectMilestones.filter(m => m.status === "completed").length;
  const inProgressMilestones = projectMilestones.filter(m => m.status === "in_progress").length;
  const blockedMilestones = projectMilestones.filter(m => m.status === "blocked").length;
  const pendingApproval = projectMilestones.filter(m => m.status === "pending_approval").length;

  const stats = [
    { label: "Total", value: totalMilestones, icon: Target, color: "bg-zinc-900", textColor: "text-white" },
    { label: "Completed", value: completedMilestones, icon: CheckCircle2, color: "bg-emerald-600", textColor: "text-white" },
    { label: "In Progress", value: inProgressMilestones, icon: Clock, color: "bg-blue-600", textColor: "text-white" },
    { label: "Blocked", value: blockedMilestones, icon: AlertCircle, color: "bg-rose-600", textColor: "text-white" },
    { label: "Pending", value: pendingApproval, icon: Calendar, color: "bg-amber-500", textColor: "text-white" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Milestones</h2>
          <p className="text-zinc-500 mt-1">
            Organize tasks into milestone containers
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-zinc-900 hover:bg-zinc-800 text-white h-10"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="bg-white rounded-xl border border-zinc-200/80 p-4 hover:border-zinc-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500">{stat.label}</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Milestones List */}
      {projectMilestones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-12 text-center">
          <div className="w-16 h-16 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
            No milestones yet
          </h3>
          <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
            Create your first milestone to organize tasks
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Milestone
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {projectMilestones
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .map((milestone) => (
              <MilestoneCard key={milestone.id} milestone={milestone} userId={userId} projectId={projectId} />
            ))}
        </div>
      )}

      {/* Create Milestone Dialog */}
      <CreateMilestoneDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectId={projectId}
        userId={userId}
      />
    </div>
  );
}
