"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  LayoutGrid,
  Target,
  CheckSquare,
  Users,
  MessageSquare,
  Paperclip,
  BarChart3,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProject } from "@/features/projects/store";
import { getProjectById, getMilestonesByProject, getTasksByProject } from "@/features/projects/actions";
import type { Project } from "@/features/projects/schema";
import Loading from "@/components/Loading";
import ProjectHeader from "./ProjectHeader";
import ProjectOverview from "./ProjectOverview";
import MilestonesSection from "./MilestonesSection";
import TasksSection from "./TasksSection";
import TeamSection from "./TeamSection";
import AnalyticsSection from "../dashboard/AnalyticsSection";
import ProjectChatSection from "./ProjectChatSection";
import AttachmentsSection from "./AttachmentsSection";
import { motion } from "framer-motion";

interface ProjectDetailProps {
  projectId: number;
  userId: string;
}

const TABS = [
  { value: "overview", label: "Overview", icon: LayoutGrid },
  { value: "milestones", label: "Milestones", icon: Target },
  { value: "tasks", label: "Tasks", icon: CheckSquare },
  { value: "team", label: "Team", icon: Users },
  { value: "chat", label: "Chat", icon: MessageSquare },
  { value: "attachments", label: "Files", icon: Paperclip },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function ProjectDetail({ projectId, userId }: ProjectDetailProps) {
  const router = useRouter();
  const { 
    selectedProject, 
    selectProject,
    setMilestones,
    setTasks,
    milestones,
    tasks,
  } = useProject();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch project
        const project = await getProjectById(projectId);
        if (!project) {
          setError("Project not found");
          return;
        }
        
        selectProject(project as Project);
        
        // Fetch milestones
        const milestones = await getMilestonesByProject(projectId);
        if (milestones) {
          setMilestones(milestones as any);
        }
        
        // Fetch tasks
        const tasks = await getTasksByProject(projectId);
        if (tasks) {
          setTasks(tasks as any);
        }
        
      } catch (e) {
        console.error("Error fetching project data:", e);
        setError("Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, selectProject, setMilestones, setTasks]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
          <p className="text-zinc-500 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedProject) {
    return (
      <div className="min-h-screen bg-zinc-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">{error || "Project not found"}</h2>
          <p className="text-zinc-500 mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <Button
            onClick={() => router.push("/projects")}
            className="bg-zinc-900 hover:bg-zinc-800 text-white"
          >
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/30">
      <div className="max-w-[1400px] mx-auto px-6 py-8 lg:px-8">
        {/* Back Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="ghost"
            className="mb-6 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 -ml-2 group transition-all duration-200"
            onClick={() => router.push("/projects")}
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Projects
          </Button>
        </motion.div>

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
        >
          <ProjectHeader project={selectedProject} userId={userId} />
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tab List */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-1.5 overflow-x-auto">
              <TabsList className="inline-flex w-full min-w-max lg:w-full bg-transparent gap-1">
                {TABS.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger 
                    key={value}
                    value={value}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-500 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:text-zinc-900 hover:bg-zinc-50 data-[state=active]:hover:bg-zinc-800"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              <TabsContent value="overview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProjectOverview project={selectedProject} />
                </motion.div>
              </TabsContent>

              <TabsContent value="milestones" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MilestonesSection projectId={projectId} userId={userId} />
                </motion.div>
              </TabsContent>

              <TabsContent value="tasks" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TasksSection projectId={projectId} userId={userId} />
                </motion.div>
              </TabsContent>

              <TabsContent value="team" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TeamSection projectId={projectId} userId={userId} />
                </motion.div>
              </TabsContent>

              <TabsContent value="chat" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProjectChatSection project={selectedProject} userId={userId} />
                </motion.div>
              </TabsContent>

              <TabsContent value="attachments" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <AttachmentsSection projectId={projectId} userId={userId} />
                </motion.div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnalyticsSection 
                    projects={selectedProject ? [selectedProject] : []} 
                    tasks={tasks}
                    milestones={milestones}
                  />
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
