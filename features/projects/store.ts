import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project, NewProject, Milestone, NewMilestone, Task, NewTask, ProjectMember, Comment, ChatMessage, Attachment, Document, Notification, SavedView } from "./schema";
import type { ProjectFilter, TaskFilter, ProjectAISuggestion, ProjectStatusType, ProjectHealthType, TaskStatusType, PriorityLevel } from "./types";

// Project Store
export type ProjectStore = {
  // Projects
  allProjects: Project[];
  selectedProject: Project | null;
  projectFilter: ProjectFilter;
  
  // Milestones
  milestones: Milestone[];
  selectedMilestone: Milestone | null;
  
  // Tasks
  tasks: Task[];
  selectedTask: Task | null;
  taskFilter: TaskFilter;
  
  // Team members
  projectMembers: ProjectMember[];
  
  // Comments
  comments: Comment[];
  
  // Chat messages
  chatMessages: ChatMessage[];
  
  // Attachments
  attachments: Attachment[];
  
  // Documents
  documents: Document[];
  
  // Notifications
  notifications: Notification[];
  unreadNotificationCount: number;
  
  // Saved views
  savedViews: SavedView[];
  activeSavedView: SavedView | null;
  
  // UI state
  viewMode: "list" | "board" | "gantt" | "calendar" | "analytics";
  sidebarOpen: boolean;
  selectedDate: Date;
  
  // AI Insights
  aiInsights: ProjectAISuggestion[];
  
  // Project CRUD operations
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: number) => void;
  selectProject: (project: Project | null) => void;
  setProjectFilter: (filter: ProjectFilter) => void;
  clearProjectFilter: () => void;
  
  // Milestone CRUD operations
  setMilestones: (milestones: Milestone[]) => void;
  addMilestone: (milestone: Milestone) => void;
  updateMilestone: (milestone: Milestone) => void;
  deleteMilestone: (id: number) => void;
  selectMilestone: (milestone: Milestone | null) => void;
  
  // Task CRUD operations
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: number) => void;
  selectTask: (task: Task | null) => void;
  setTaskFilter: (filter: TaskFilter) => void;
  clearTaskFilter: () => void;
  bulkUpdateTasks: (taskIds: number[], updates: Partial<Task>) => void;
  
  // Project members
  setProjectMembers: (members: ProjectMember[]) => void;
  addProjectMember: (member: ProjectMember) => void;
  updateProjectMember: (member: ProjectMember) => void;
  removeProjectMember: (id: number) => void;
  
  // Comments
  setComments: (comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  updateComment: (comment: Comment) => void;
  deleteComment: (id: number) => void;
  addReactionToComment: (commentId: number, emoji: string, userId: string) => void;
  
  // Chat messages
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  deleteChatMessage: (id: number) => void;
  addReactionToChatMessage: (messageId: number, emoji: string, userId: string) => void;
  
  // Attachments
  setAttachments: (attachments: Attachment[]) => void;
  addAttachment: (attachment: Attachment) => void;
  deleteAttachment: (id: number) => void;
  
  // Documents
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (document: Document) => void;
  deleteDocument: (id: number) => void;
  
  // Notifications
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: number) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  
  // Saved views
  setSavedViews: (views: SavedView[]) => void;
  addSavedView: (view: SavedView) => void;
  updateSavedView: (view: SavedView) => void;
  deleteSavedView: (id: number) => void;
  setActiveSavedView: (view: SavedView | null) => void;
  
  // UI state
  setViewMode: (mode: "list" | "board" | "gantt" | "calendar" | "analytics") => void;
  toggleSidebar: () => void;
  setSelectedDate: (date: Date) => void;
  
  // AI Insights
  setAIInsights: (insights: ProjectAISuggestion[]) => void;
  addAIInsight: (insight: ProjectAISuggestion) => void;
  clearAIInsights: () => void;
  
  // Utility functions
  getProjectById: (id: number) => Project | undefined;
  getMilestoneById: (id: number) => Milestone | undefined;
  getTaskById: (id: number) => Task | undefined;
  getTasksByMilestone: (milestoneId: number) => Task[];
  getMilestonesByProject: (projectId: number) => Milestone[];
  getFilteredProjects: () => Project[];
  getFilteredTasks: () => Task[];
};

const defaultProjectFilter: ProjectFilter = {
  status: undefined,
  health: undefined,
  owner: undefined,
  tags: undefined,
  dateRange: undefined,
  searchQuery: undefined,
};

const defaultTaskFilter: TaskFilter = {
  status: undefined,
  priority: undefined,
  assignee: undefined,
  milestone: undefined,
  isBlocked: undefined,
  isEscalated: undefined,
  slaBreached: undefined,
  dateRange: undefined,
  searchQuery: undefined,
};

// Zustand store creation (following Habit pattern)
export const useProject = create<ProjectStore>()(
  persist(
    (set, get) => ({
      // Initial state
      allProjects: [],
      selectedProject: null,
      projectFilter: defaultProjectFilter,
      
      milestones: [],
      selectedMilestone: null,
      
      tasks: [],
      selectedTask: null,
      taskFilter: defaultTaskFilter,
      
      projectMembers: [],
      comments: [],
      chatMessages: [],
      attachments: [],
      documents: [],
      
      notifications: [],
      unreadNotificationCount: 0,
      
      savedViews: [],
      activeSavedView: null,
      
      viewMode: "list",
      sidebarOpen: true,
      selectedDate: new Date(),
      
      aiInsights: [],
      
      // Project operations
      setProjects: (projects) => set({ allProjects: projects }),
      
      addProject: (project) =>
        set((state) => ({
          allProjects: [...state.allProjects, project],
        })),
      
      updateProject: (project) =>
        set((state) => ({
          allProjects: state.allProjects.map((p) =>
            p.id === project.id ? project : p
          ),
          selectedProject:
            state.selectedProject?.id === project.id
              ? project
              : state.selectedProject,
        })),
      
      deleteProject: (id) =>
        set((state) => ({
          allProjects: state.allProjects.filter((p) => p.id !== id),
          selectedProject:
            state.selectedProject?.id === id ? null : state.selectedProject,
        })),
      
      selectProject: (project) => set({ selectedProject: project }),
      
      setProjectFilter: (filter) => set({ projectFilter: filter }),
      
      clearProjectFilter: () => set({ projectFilter: defaultProjectFilter }),
      
      // Milestone operations
      setMilestones: (milestones) => set({ milestones }),
      
      addMilestone: (milestone) =>
        set((state) => ({
          milestones: [...state.milestones, milestone],
        })),
      
      updateMilestone: (milestone) =>
        set((state) => ({
          milestones: state.milestones.map((m) =>
            m.id === milestone.id ? milestone : m
          ),
          selectedMilestone:
            state.selectedMilestone?.id === milestone.id
              ? milestone
              : state.selectedMilestone,
        })),
      
      deleteMilestone: (id) =>
        set((state) => ({
          milestones: state.milestones.filter((m) => m.id !== id),
          selectedMilestone:
            state.selectedMilestone?.id === id ? null : state.selectedMilestone,
        })),
      
      selectMilestone: (milestone) => set({ selectedMilestone: milestone }),
      
      // Task operations
      setTasks: (tasks) => set({ tasks }),
      
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),
      
      updateTask: (task) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
          selectedTask:
            state.selectedTask?.id === task.id ? task : state.selectedTask,
        })),
      
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
        })),
      
      selectTask: (task) => set({ selectedTask: task }),
      
      setTaskFilter: (filter) => set({ taskFilter: filter }),
      
      clearTaskFilter: () => set({ taskFilter: defaultTaskFilter }),
      
      bulkUpdateTasks: (taskIds, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            taskIds.includes(t.id) ? { ...t, ...updates } : t
          ),
        })),
      
      // Project members
      setProjectMembers: (members) => set({ projectMembers: members }),
      
      addProjectMember: (member) =>
        set((state) => ({
          projectMembers: [...state.projectMembers, member],
        })),
      
      updateProjectMember: (member) =>
        set((state) => ({
          projectMembers: state.projectMembers.map((m) =>
            m.id === member.id ? member : m
          ),
        })),
      
      removeProjectMember: (id) =>
        set((state) => ({
          projectMembers: state.projectMembers.filter((m) => m.id !== id),
        })),
      
      // Comments
      setComments: (comments) => set({ comments }),
      
      addComment: (comment) =>
        set((state) => ({
          comments: [...state.comments, comment],
        })),
      
      updateComment: (comment) =>
        set((state) => ({
          comments: state.comments.map((c) =>
            c.id === comment.id ? comment : c
          ),
        })),
      
      deleteComment: (id) =>
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== id),
        })),
      
      addReactionToComment: (commentId, emoji, userId) =>
        set((state) => ({
          comments: state.comments.map((c) => {
            if (c.id === commentId) {
              const reactions = c.reactions || {};
              const emojiReactions = reactions[emoji] || [];
              if (!emojiReactions.includes(userId)) {
                return {
                  ...c,
                  reactions: {
                    ...reactions,
                    [emoji]: [...emojiReactions, userId],
                  },
                };
              }
            }
            return c;
          }),
        })),
      
      // Chat messages
      setChatMessages: (messages) => set({ chatMessages: messages }),
      
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
      
      deleteChatMessage: (id) =>
        set((state) => ({
          chatMessages: state.chatMessages.filter((m) => m.id !== id),
        })),
      
      addReactionToChatMessage: (messageId, emoji, userId) =>
        set((state) => ({
          chatMessages: state.chatMessages.map((m) => {
            if (m.id === messageId) {
              const reactions = m.reactions || {};
              const emojiReactions = reactions[emoji] || [];
              if (!emojiReactions.includes(userId)) {
                return {
                  ...m,
                  reactions: {
                    ...reactions,
                    [emoji]: [...emojiReactions, userId],
                  },
                };
              }
            }
            return m;
          }),
        })),
      
      // Attachments
      setAttachments: (attachments) => set({ attachments }),
      
      addAttachment: (attachment) =>
        set((state) => ({
          attachments: [...state.attachments, attachment],
        })),
      
      deleteAttachment: (id) =>
        set((state) => ({
          attachments: state.attachments.filter((a) => a.id !== id),
        })),
      
      // Documents
      setDocuments: (documents) => set({ documents }),
      
      addDocument: (document) =>
        set((state) => ({
          documents: [...state.documents, document],
        })),
      
      updateDocument: (document) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === document.id ? document : d
          ),
        })),
      
      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),
      
      // Notifications
      setNotifications: (notifications) =>
        set({
          notifications,
          unreadNotificationCount: notifications.filter((n) => !n.is_read).length,
        }),
      
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadNotificationCount: notification.is_read
            ? state.unreadNotificationCount
            : state.unreadNotificationCount + 1,
        })),
      
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, is_read: true, read_at: new Date() } : n
          ),
          unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1),
        })),
      
      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            is_read: true,
            read_at: new Date(),
          })),
          unreadNotificationCount: 0,
        })),
      
      clearNotifications: () =>
        set({ notifications: [], unreadNotificationCount: 0 }),
      
      // Saved views
      setSavedViews: (views) => set({ savedViews: views }),
      
      addSavedView: (view) =>
        set((state) => ({
          savedViews: [...state.savedViews, view],
        })),
      
      updateSavedView: (view) =>
        set((state) => ({
          savedViews: state.savedViews.map((v) => (v.id === view.id ? view : v)),
        })),
      
      deleteSavedView: (id) =>
        set((state) => ({
          savedViews: state.savedViews.filter((v) => v.id !== id),
        })),
      
      setActiveSavedView: (view) => set({ activeSavedView: view }),
      
      // UI state
      setViewMode: (mode) => set({ viewMode: mode }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSelectedDate: (date) => set({ selectedDate: date }),
      
      // AI Insights
      setAIInsights: (insights) => set({ aiInsights: insights }),
      
      addAIInsight: (insight) =>
        set((state) => ({
          aiInsights: [...state.aiInsights, insight],
        })),
      
      clearAIInsights: () => set({ aiInsights: [] }),
      
      // Utility functions
      getProjectById: (id) => {
        return get().allProjects.find((p) => p.id === id);
      },
      
      getMilestoneById: (id) => {
        return get().milestones.find((m) => m.id === id);
      },
      
      getTaskById: (id) => {
        return get().tasks.find((t) => t.id === id);
      },
      
      getTasksByMilestone: (milestoneId) => {
        return get().tasks.filter((t) => t.milestone_id === milestoneId);
      },
      
      getMilestonesByProject: (projectId) => {
        return get().milestones.filter((m) => m.project_id === projectId);
      },
      
      getFilteredProjects: () => {
        const { allProjects, projectFilter } = get();
        let filtered = [...allProjects];
        
        if (projectFilter.status && projectFilter.status.length > 0) {
          filtered = filtered.filter((p) => projectFilter.status!.includes(p.status as ProjectStatusType));
        }
        
        if (projectFilter.health && projectFilter.health.length > 0) {
          filtered = filtered.filter((p) => projectFilter.health!.includes(p.health as ProjectHealthType));
        }
        
        if (projectFilter.owner && projectFilter.owner.length > 0) {
          filtered = filtered.filter((p) => projectFilter.owner!.includes(p.owner_id));
        }
        
        if (projectFilter.tags && projectFilter.tags.length > 0) {
          filtered = filtered.filter((p) =>
            projectFilter.tags!.some((tag) => p.tags?.includes(tag))
          );
        }
        
        if (projectFilter.searchQuery) {
          const query = projectFilter.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(query) ||
              p.description?.toLowerCase().includes(query)
          );
        }
        
        return filtered;
      },
      
      getFilteredTasks: () => {
        const { tasks, taskFilter } = get();
        let filtered = [...tasks];
        
        if (taskFilter.status && taskFilter.status.length > 0) {
          filtered = filtered.filter((t) => taskFilter.status!.includes(t.status as TaskStatusType));
        }
        
        if (taskFilter.priority && taskFilter.priority.length > 0) {
          filtered = filtered.filter((t) =>
            t.priority && taskFilter.priority!.includes(t.priority as PriorityLevel)
          );
        }
        
        if (taskFilter.assignee && taskFilter.assignee.length > 0) {
          filtered = filtered.filter((t) =>
            t.assigned_to && taskFilter.assignee!.includes(t.assigned_to)
          );
        }
        
        if (taskFilter.milestone && taskFilter.milestone.length > 0) {
          filtered = filtered.filter((t) =>
            taskFilter.milestone!.includes(t.milestone_id)
          );
        }
        
        if (taskFilter.isBlocked !== undefined) {
          filtered = filtered.filter((t) => t.is_blocked === taskFilter.isBlocked);
        }
        
        if (taskFilter.isEscalated !== undefined) {
          filtered = filtered.filter((t) => t.is_escalated === taskFilter.isEscalated);
        }
        
        if (taskFilter.slaBreached !== undefined) {
          filtered = filtered.filter((t) => t.sla_breached === taskFilter.slaBreached);
        }
        
        if (taskFilter.searchQuery) {
          const query = taskFilter.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (t) =>
              t.title.toLowerCase().includes(query) ||
              t.description?.toLowerCase().includes(query)
          );
        }
        
        return filtered;
      },
    }),
    {
      name: "project-storage",
      partialize: (state) => ({
        allProjects: state.allProjects,
        milestones: state.milestones,
        tasks: state.tasks,
        viewMode: state.viewMode,
        sidebarOpen: state.sidebarOpen,
        projectFilter: state.projectFilter,
        taskFilter: state.taskFilter,
        savedViews: state.savedViews,
        aiInsights: state.aiInsights,
      }),
    }
  )
);
