# 🎨 Goal Details Page - Component Tree Visualization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         /goals/[id] - Main Page                              │
│                         (GoalDetailPage Component)                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │
        ┌─────────────────────────────┴─────────────────────────────┐
        │                                                             │
┌───────▼──────────────────┐                          ┌──────────────▼─────────┐
│   HEADER SECTION         │                          │   CONTENT SECTION      │
│  ┌──────────────────┐   │                          │                        │
│  │ Breadcrumb       │   │                          │  ┌──────────────────┐ │
│  │ (← Back to Goals)│   │                          │  │  GoalViewTabs    │ │
│  └──────────────────┘   │                          │  │  ┌────┬────┬────┤ │
│  ┌──────────────────┐   │                          │  │  │1│2│3│4││ │
│  │ Goal Title       │   │                          │  │  └─┬──┴──┬─┴────┤ │
│  │ Description      │   │                          │  └────┼─────┼──────┘ │
│  │ Meta Info        │   │                          │       │     │        │
│  └──────────────────┘   │                          │       │     │        │
│  ┌──────────────────┐   │                          └───────┼─────┼────────┘
│  │ Action Buttons   │   │                                  │     │
│  │ • Edit Goal      │   │                                  │     │
│  │ • Add Milestone  │   │          ┌───────────────────────┘     │
│  │ • Add Task       │   │          │                             │
│  └──────────────────┘   │          │        ┌────────────────────┘
└─────────────────────────┘          │        │
                                     │        │
     ┌───────────────────────────────┼────────┼───────────────────────────────┐
     │                               │        │                               │
     │  TAB 1: OVERVIEW             │        │  TAB 2: BOARD                 │
     │  ┌─────────────────────┐     │        │  ┌─────────────────────┐     │
     │  │ 2-Column Layout     │     │        │  │ Single Column       │     │
     │  ├──────────┬──────────┤     │        │  ├─────────────────────┤     │
     │  │ LEFT COL │ SIDEBAR  │     │        │  │ FocusModeToggle     │     │
     │  │          │          │     │        │  │ [All│Today│Urgent]  │     │
     │  │ Progress │ Momentum │     │        │  ├─────────────────────┤     │
     │  │ Timeline │ AI Panel │     │        │  │ TaskFilterBar       │     │
     │  │ Mileston │ Settings │     │        │  │ [Milestone▼Priority▼]│    │
     │  │          │          │     │        │  ├─────────────────────┤     │
     │  └──────────┴──────────┘     │        │  │ TasksKanban         │     │
     │                               │        │  │ ┌─────┬──────┬────┐│     │
     │                               │        │  │ │Back │InProg│Done││     │
     │                               │        │  │ │log  │      │    ││     │
     │                               │        │  │ └─────┴──────┴────┘│     │
     │                               │        │  └─────────────────────┘     │
     └───────────────────────────────┘        └─────────────────────────────┘
                                     │        │
     ┌───────────────────────────────┘        └───────────────────────────────┐
     │                                                                         │
     │  TAB 3: ANALYTICS                      TAB 4: ACTIVITY                 │
     │  ┌─────────────────────┐               ┌─────────────────────┐         │
     │  │ 2x2 Grid            │               │ 2-Column Layout     │         │
     │  ├──────────┬──────────┤               ├──────────┬──────────┤         │
     │  │ Velocity │ Burn-up  │               │ LEFT COL │ SIDEBAR  │         │
     │  │ Chart    │ Progress │               │          │          │         │
     │  ├──────────┼──────────┤               │ Notes    │ Team     │         │
     │  │ Scope    │ Workload │               │ Attachm. │ Settings │         │
     │  │ Mgmt     │ Distrib. │               │          │          │         │
     │  └──────────┴──────────┘               └──────────┴──────────┘         │
     │  ┌─────────────────────┐                                               │
     │  │ Progress + Momentum │                                               │
     │  └─────────────────────┘                                               │
     └─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Hierarchy (Detailed)

```
GoalDetailPage (app/(productivity)/goals/[id]/page.tsx)
│
├── Header Section
│   ├── Link (Breadcrumb "← Back to Goals")
│   ├── h1 (Goal Title)
│   ├── p (Goal Description)
│   ├── Meta Info (Due Date, Status, Progress %)
│   └── Action Buttons
│       ├── Edit Goal Button
│       ├── Add Milestone Button
│       └── Add Task Button (NewTaskButton wrapper)
│
└── GoalViewTabs (features/goals/components/detail/GoalViewTabs.tsx)
    │
    ├── TabsList (4 triggers)
    │   ├── Overview Trigger (LayoutDashboard icon)
    │   ├── Board Trigger (KanbanSquare icon) ← DEFAULT
    │   ├── Analytics Trigger (BarChart3 icon)
    │   └── Activity Trigger (Activity icon)
    │
    ├── TabsContent: Overview
    │   └── Grid (1 xl:3 cols)
    │       ├── Left (xl:col-span-2)
    │       │   ├── OverallProgressCard
    │       │   │   ├── Progress % (large number)
    │       │   │   ├── ProgressBar (gradient)
    │       │   │   └── Meta (Est. completion, milestones)
    │       │   ├── Timeline
    │       │   │   ├── CalendarDays icon + title
    │       │   │   └── Timeline component (milestone dots)
    │       │   └── MilestonesSection
    │       │       ├── Flag icon + title + count
    │       │       ├── GenerateSubgoalWithAIDialog button
    │       │       └── MilestoneAccordionItem[] (list)
    │       └── Sidebar (xl:col-span-1)
    │           ├── MomentumTracker ✨ NEW
    │           │   ├── Flame icon + title
    │           │   ├── Stats Grid (2x2)
    │           │   │   ├── Day Streak (orange)
    │           │   │   ├── Done Today (emerald)
    │           │   │   ├── This Week (blue)
    │           │   │   └── Days Active (purple)
    │           │   └── Recent Wins (last 3 tasks)
    │           ├── GoalAISection (wrapped in card)
    │           │   └── AI insights list
    │           └── GoalSettingsCard
    │               └── Settings options
    │
    ├── TabsContent: Board ← DEFAULT VIEW
    │   ├── FocusModeToggle ✨ NEW
    │   │   ├── All Tasks Button (badge: count)
    │   │   ├── Today Button (badge: count)
    │   │   ├── Urgent Button (badge: count)
    │   │   └── In Progress Button (badge: count)
    │   ├── TaskFilterBar ✨ NEW
    │   │   ├── Milestone DropdownMenu
    │   │   │   └── CheckboxItem[] (subgoal list)
    │   │   ├── Priority DropdownMenu
    │   │   │   └── CheckboxItem[] (high/medium/low)
    │   │   ├── Deadline DropdownMenu
    │   │   │   └── CheckboxItem[] (today/week/overdue)
    │   │   └── Clear Filters Button (if active)
    │   ├── TasksKanban (enhanced with filtered data)
    │   │   ├── Column: Backlog
    │   │   │   ├── Title + count badge
    │   │   │   └── TaskCard[] (filtered backlog)
    │   │   ├── Column: In Progress
    │   │   │   ├── Title + count badge
    │   │   │   └── TaskCard[] (filtered inProgress)
    │   │   └── Column: Done
    │   │       ├── Title + count badge
    │   │       └── TaskCard[] (filtered done)
    │   └── Quick Stats Footer
    │       ├── "Showing: X of Y tasks"
    │       └── "Completed: Z"
    │
    ├── TabsContent: Analytics
    │   ├── AnalyticsCharts ✨ NEW
    │   │   ├── Grid (1 lg:2 cols)
    │   │   │   ├── Velocity Chart Card
    │   │   │   │   ├── TrendingUp icon + title
    │   │   │   │   ├── Avg/week metric
    │   │   │   │   └── Bar chart (4 weeks)
    │   │   │   ├── Burn-up Chart Card
    │   │   │   │   ├── CheckCircle2 icon + title
    │   │   │   │   ├── Progress % metric
    │   │   │   │   └── Progress bars (completed/remaining)
    │   │   │   ├── Scope Management Card
    │   │   │   │   ├── AlertTriangle icon (if creep detected)
    │   │   │   │   ├── Added This Week stat
    │   │   │   │   ├── Completed This Week stat
    │   │   │   │   └── Warning message (if scope creep)
    │   │   │   └── Workload Distribution Card
    │   │   │       ├── Target icon + title
    │   │   │       └── Stat rows (total/completed/in progress)
    │   │   └── Grid (1 xl:2 cols)
    │   │       ├── OverallProgressCard (reused)
    │   │       └── MomentumTracker (reused)
    │
    └── TabsContent: Activity
        └── Grid (1 xl:3 cols)
            ├── Left (xl:col-span-2)
            │   ├── NotesSection
            │   │   ├── FileText icon + title + count
            │   │   ├── Add Note Section (textarea + button)
            │   │   └── Notes List (placeholder data)
            │   └── AttachmentsSection
            │       ├── FileText icon + title + count
            │       ├── UploadButton (uploadthing)
            │       └── Attachments List (from store)
            └── Sidebar (xl:col-span-1)
                ├── TeamMembersCard
                │   ├── Users icon + title
                │   └── "Solo Goal" placeholder
                └── GoalSettingsCard (reused)
```

---

## 🎨 State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Interactions                            │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Component State                              │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │ focusMode       │  │ taskFilters      │  │ aiInsights        │  │
│  │ [useState]      │  │ [useState]       │  │ [useState]        │  │
│  └─────────────────┘  └──────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Computed Values (useMemo)                       │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │ filteredTasks   │  │ momentumMetrics  │  │ analyticsMetrics  │  │
│  │ (apply filters) │  │ (streak, wins)   │  │ (velocity, scope) │  │
│  └─────────────────┘  └──────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Zustand Stores                               │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │ useGoal()       │  │ useSubgoal()     │  │ useTodo()         │  │
│  │ (allGoals)      │  │ (subgoals)       │  │ (todos)           │  │
│  └─────────────────┘  └──────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Server Actions (Persistence)                    │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │ toggleGoal()    │  │ updateTodoStatus │  │ getaallsubgoal()  │  │
│  │ (Drizzle ORM)   │  │ (Drizzle ORM)    │  │ (Drizzle ORM)     │  │
│  └─────────────────┘  └──────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL Database                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │ goaltable       │  │ subgoaltable     │  │ todoTable         │  │
│  └─────────────────┘  └──────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Breakpoints

```
┌──────────────────────────────────────────────────────────────────────┐
│ Mobile (<640px)                                                       │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Header (stacked)                                                  │ │
│ │ ┌──────────────────────────────────────────────────────────────┐ │ │
│ │ │ ← Back                                                        │ │ │
│ │ │ Goal Title                                                    │ │ │
│ │ │ Description                                                   │ │ │
│ │ │ [Edit] [Add Milestone] [Add Task]                            │ │ │
│ │ └──────────────────────────────────────────────────────────────┘ │ │
│ │                                                                   │ │
│ │ Tabs (icons only)                                                │ │
│ │ [📊][📋][📈][🔔]                                                    │ │
│ │                                                                   │ │
│ │ Content (single column, stacked)                                 │ │
│ │ ┌──────────────────────────────────────────────────────────────┐ │ │
│ │ │ Component 1                                                   │ │ │
│ │ ├──────────────────────────────────────────────────────────────┤ │ │
│ │ │ Component 2                                                   │ │ │
│ │ ├──────────────────────────────────────────────────────────────┤ │ │
│ │ │ Component 3                                                   │ │ │
│ │ └──────────────────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ Tablet (640px - 1024px)                                               │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Header (horizontal)                                               │ │
│ │ ┌────────────────────────────────┬─────────────────────────────┐ │ │
│ │ │ ← Back | Title & Description   │ [Edit][Add][Task]           │ │ │
│ │ └────────────────────────────────┴─────────────────────────────┘ │ │
│ │                                                                   │ │
│ │ Tabs (with labels)                                                │ │
│ │ [📊 Overview][📋 Board][📈 Analytics][🔔 Activity]                  │ │
│ │                                                                   │ │
│ │ Content (2-column grid for some views)                           │ │
│ │ ┌──────────────────────────┬──────────────────────────────────┐ │ │
│ │ │ Left Column (60%)        │ Right Column (40%)               │ │ │
│ │ │                          │                                  │ │ │
│ │ │ Main Content             │ Sidebar                          │ │ │
│ │ │                          │                                  │ │ │
│ │ └──────────────────────────┴──────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ Desktop (>1024px)                                                     │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Header (full width, horizontal)                                   │ │
│ │ ┌────────────────────────────────┬─────────────────────────────┐ │ │
│ │ │ ← Back | Title & Description   │ [Edit][Add Milestone][Task] │ │ │
│ │ └────────────────────────────────┴─────────────────────────────┘ │ │
│ │                                                                   │ │
│ │ Tabs (full labels)                                                │ │
│ │ [📊 Overview][📋 Board][📈 Analytics][🔔 Activity]                  │ │
│ │                                                                   │ │
│ │ Content (3-column grid: 2+1)                                      │ │
│ │ ┌──────────────────────────────────┬────────────────────────────┐ │ │
│ │ │ Main Content (66%)               │ Sidebar (33%)              │ │ │
│ │ │                                  │                            │ │ │
│ │ │ Primary Components               │ Secondary Components       │ │ │
│ │ │ (Kanban, Timeline, etc.)         │ (Momentum, AI, Settings)   │ │ │
│ │ │                                  │                            │ │ │
│ │ └──────────────────────────────────┴────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🎬 User Journey Flow

```
User lands on /goals/[id]
      │
      ▼
┌─────────────────┐
│ Page Loads      │
│ • Fetch goal    │
│ • Fetch subgoals│
│ • Fetch todos   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Default: BOARD Tab      │
│ • Kanban visible        │
│ • All tasks shown       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ User clicks "Today"     │
│ • focusMode = "today"   │
│ • filteredTasks recomp  │
│ • Kanban updates        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ User applies filters    │
│ • Select milestone      │
│ • Select priority       │
│ • filteredTasks recomp  │
│ • Kanban updates        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ User drags task         │
│ • Optimistic update     │
│ • updateTodoStatus()    │
│ • Persist to DB         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ User switches to        │
│ ANALYTICS Tab           │
│ • Charts render         │
│ • Metrics computed      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ User views OVERVIEW     │
│ • Timeline visible      │
│ • Milestones visible    │
│ • AI insights visible   │
└─────────────────────────┘
```

---

**🎨 Visual Guide Complete!**

This diagram provides a complete visual reference for understanding the new goal details page architecture.
