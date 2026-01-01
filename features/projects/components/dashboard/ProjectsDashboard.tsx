"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Plus, 
  Grid2X2, 
  List, 
  BarChart3 as GanttIcon, 
  Calendar, 
  Search,
  SlidersHorizontal,
  Sparkles,
  FolderKanban,
  TrendingUp,
  Clock,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useProject } from "@/features/projects/store";
import { getAllProjectsForUser } from "@/features/projects/actions";
import type { Project } from "@/features/projects/schema";
import Loading from "@/components/Loading";
import ProjectCard from "./ProjectCard";
import ProjectList from "./ProjectList";
import ProjectStats from "./ProjectStats";
import AnalyticsSection from "./AnalyticsSection";
import CreateProjectDialog from "./CreateProjectDialog";
import { COLORS } from "@/features/projects/constants";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectsDashboardProps {
  user_id: string;
}

const VIEW_OPTIONS = [
  { value: "board", icon: Grid2X2, label: "Board" },
  { value: "list", icon: List, label: "List" },
  { value: "analytics", icon: TrendingUp, label: "Analytics" },
] as const;

const SORT_OPTIONS = [
  { value: "recent", label: "Recently Updated" },
  { value: "name", label: "Name" },
  { value: "progress", label: "Progress" },
  { value: "due", label: "Due Date" },
] as const;

export default function ProjectsDashboard({ user_id }: ProjectsDashboardProps) {
  const {
    allProjects,
    setProjects,
    viewMode,
    setViewMode,
    selectedProject,
    selectProject,
    tasks,
    milestones,
  } = useProject();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = (await getAllProjectsForUser(user_id)) as Project[];
        if (projects) {
          setProjects(projects);
          if (projects.length > 0 && !selectedProject) {
            selectProject(projects[0]);
          }
        }
      } catch (e) {
        setError("Failed to load projects.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user_id) {
      fetchProjects();
    } else {
      setIsLoading(false);
    }
  }, [user_id, setProjects, selectedProject, selectProject]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = [...allProjects];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "progress":
          return (b.completion_percentage || 0) - (a.completion_percentage || 0);
        case "due":
          if (!a.target_end_date) return 1;
          if (!b.target_end_date) return -1;
          return new Date(a.target_end_date).getTime() - new Date(b.target_end_date).getTime();
        default:
          return new Date(b.updated_at || b.created_at || new Date()).getTime() - 
                 new Date(a.updated_at || a.created_at || new Date()).getTime();
      }
    });
    
    return filtered;
  }, [allProjects, searchQuery, sortBy, filterStatus]);

  // Calculate quick stats
  const quickStats = useMemo(() => ({
    total: allProjects.length,
    active: allProjects.filter(p => p.status === "active").length,
    thisWeek: allProjects.filter(p => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return p.created_at && new Date(p.created_at) > weekAgo;
    }).length,
  }), [allProjects]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50/50">
        <Loading message="Loading projects..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50/50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-6">
            <FolderKanban className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">{error}</h2>
          <p className="text-zinc-500 mb-6">Please try again or contact support if the issue persists.</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-zinc-900 hover:bg-zinc-800 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/30">
      <div className="max-w-[1600px] mx-auto px-6 py-8 lg:px-8">
        {/* Header Section */}
        <header className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-zinc-900">
                  <FolderKanban className="w-5 h-5 text-white" />
                </div>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-medium">
                  {quickStats.active} Active
                </Badge>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900">
                Projects
              </h1>
              <p className="text-zinc-500 text-lg">
                Manage and track your project portfolio
              </p>
            </div>

            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10 transition-all duration-200 hover:shadow-xl hover:shadow-zinc-900/20 h-11 px-5"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="mb-8">
          <ProjectStats projects={allProjects} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-white border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400/20 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-11 px-4 border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 rounded-xl"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2 text-zinc-500" />
                  <span className="text-zinc-700">
                    {filterStatus === "all" ? "All Status" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-2 text-zinc-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuLabel className="text-zinc-500 font-medium">Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterStatus("all")} className="rounded-lg">
                  All Projects
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("active")} className="rounded-lg">
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("on_hold")} className="rounded-lg">
                  On Hold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("completed")} className="rounded-lg">
                  Completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-11 px-4 border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 rounded-xl"
                >
                  <Clock className="h-4 w-4 mr-2 text-zinc-500" />
                  <span className="text-zinc-700">
                    {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-2 text-zinc-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuLabel className="text-zinc-500 font-medium">Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SORT_OPTIONS.map(option => (
                  <DropdownMenuItem 
                    key={option.value} 
                    onClick={() => setSortBy(option.value)}
                    className="rounded-lg"
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Toggle */}
            <div className="flex items-center p-1 bg-white border border-zinc-200 rounded-xl">
              {VIEW_OPTIONS.map(({ value, icon: Icon, label }) => (
                <Button
                  key={value}
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode(value as typeof viewMode)}
                  className={`h-9 px-3 rounded-lg transition-all duration-200 ${
                    viewMode === value 
                      ? "bg-zinc-900 text-white shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                  }`}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {filteredProjects.length === 0 && allProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm"
            >
              <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center mb-6 shadow-sm">
                  <Sparkles className="w-10 h-10 text-zinc-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">
                  Create your first project
                </h3>
                <p className="text-zinc-500 text-center max-w-sm mb-8">
                  Get started by creating a project to organize your work, track milestones, and collaborate with your team.
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white h-11 px-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </motion.div>
          ) : filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm"
            >
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-16 h-16 rounded-xl bg-zinc-100 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                  No projects found
                </h3>
                <p className="text-zinc-500 text-center max-w-sm">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === "list" && <ProjectList projects={filteredProjects} />}
              
              {viewMode === "board" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ProjectCard project={project} />
                    </motion.div>
                  ))}
                </div>
              )}
              
              {viewMode === "analytics" && (
                <AnalyticsSection 
                  projects={filteredProjects} 
                  tasks={tasks}
                  milestones={milestones}
                />
              )}
              
              {viewMode === "gantt" && (
                <div className="bg-white rounded-2xl border border-zinc-200/80 p-12 text-center">
                  <div className="w-16 h-16 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                    <GanttIcon className="w-8 h-8 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                    Gantt Chart View
                  </h3>
                  <p className="text-zinc-500">
                    Timeline visualization coming soon
                  </p>
                </div>
              )}
              
              {viewMode === "calendar" && (
                <div className="bg-white rounded-2xl border border-zinc-200/80 p-12 text-center">
                  <div className="w-16 h-16 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                    Calendar View
                  </h3>
                  <p className="text-zinc-500">
                    Calendar visualization coming soon
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        {filteredProjects.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-400">
              Showing {filteredProjects.length} of {allProjects.length} projects
            </p>
          </div>
        )}
      </div>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        userId={user_id}
      />
    </div>
  );
}
