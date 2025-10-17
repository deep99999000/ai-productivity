# Goals Feature - Folder Structure

This document outlines the refined and organized folder structure for the Goals feature in the AI Productivity application.

## 📁 Directory Structure

```
features/goals/
├── 📂 actions/                    # Server actions and API calls
│   └── goalaction.ts              # Goal CRUD operations
├── 📂 ai/                         # AI-related components and functionality
│   ├── 📂 components/             # AI-specific UI components
│   │   ├── AICapabilitiesCard.tsx
│   │   ├── AIInsightsCard.tsx
│   │   ├── AIInsightsPanelPro.tsx
│   │   └── EnhancedAIInsightsPanel.tsx
│   └── GoalAISection.tsx          # Main AI section component
├── 📂 components/                 # All UI components
│   ├── 📂 detail-view/            # Goal detail page components
│   │   ├── 📂 activity/           # Activity tab components
│   │   │   ├── AttachmentsSection.tsx
│   │   │   ├── NotesSection.tsx
│   │   │   ├── TeamMembersCard.tsx
│   │   │   └── index.ts
│   │   ├── 📂 analytics/          # Analytics tab components
│   │   │   ├── AnalyticsCard.tsx
│   │   │   ├── AnalyticsCharts.tsx
│   │   │   └── index.ts
│   │   ├── 📂 board/              # Board/Kanban tab components
│   │   │   ├── FocusModeToggle.tsx
│   │   │   ├── TaskFilterBar.tsx
│   │   │   ├── TasksKanban.tsx
│   │   │   └── index.ts
│   │   ├── 📂 overview/           # Overview tab components
│   │   │   ├── MilestoneAccordionItem.tsx
│   │   │   ├── MilestonesSection.tsx
│   │   │   ├── MomentumTracker.tsx
│   │   │   ├── OverallProgressCard.tsx
│   │   │   ├── Timeline.tsx
│   │   │   └── index.ts
│   │   ├── 📂 shared/             # Shared components across tabs
│   │   │   ├── GoalSettingsCard.tsx
│   │   │   ├── MotivationFocusCard.tsx
│   │   │   └── index.ts
│   │   ├── 📂 tabs/               # Tab navigation components
│   │   │   ├── GoalViewTabs.tsx
│   │   │   └── index.ts
│   │   └── index.ts               # Main exports
│   ├── 📂 goal/                   # General goal components (list, card, etc.)
│   ├── 📂 singlegoal/             # Single goal components
│   ├── 📂 ui/                     # Pure UI components
│   │   ├── ProgressBar.tsx
│   │   └── index.ts
│   └── catstyle.tsx
├── 📂 config/                     # Configuration files
├── 📂 docs/                       # Documentation
│   ├── COMPONENT_TREE.md          # Component hierarchy
│   ├── IMPLEMENTATION_SUMMARY.md  # Implementation details
│   ├── QUICK_START.md             # Quick start guide
│   └── REFACTORING_GUIDE.md       # Refactoring guidelines
├── 📂 hooks/                      # Custom React hooks
│   ├── useGoalMetrics.ts          # Hook for goal metrics calculation
│   ├── useTaskFiltering.ts        # Hook for task filtering logic
│   └── index.ts
├── 📂 store/                      # State management
│   └── GoalStore.ts               # Zustand store for goals
├── 📂 types/                      # TypeScript type definitions
│   ├── detail-view.ts             # Types for detail view components
│   ├── goalSchema.ts              # Goal schema and types
│   └── index.ts
└── 📂 utils/                      # Utility functions
```

## 🎯 Design Principles

### 1. **Feature-Based Organization**
Each major feature (goals, subgoals, todos) has its own folder with complete separation of concerns.

### 2. **Component Hierarchy by Purpose**
Components are organized by their functional purpose rather than alphabetically:
- **detail-view/**: All components related to the goal detail page
- **tabs/**: Tab navigation and structure
- **overview/**: Overview tab specific components
- **board/**: Kanban board and task management
- **analytics/**: Charts and metrics
- **activity/**: Notes, attachments, team collaboration
- **shared/**: Components used across multiple tabs

### 3. **Clear Separation of Concerns**
- **actions/**: Server-side operations
- **store/**: Client-side state management
- **hooks/**: Reusable business logic
- **types/**: Type definitions
- **ui/**: Pure presentational components

### 4. **Easy Import Paths**
Each folder has an `index.ts` file for clean imports:
```typescript
import { GoalViewTabs, MomentumTracker } from '@/features/goals/components/detail-view';
import { useGoalMetrics } from '@/features/goals/hooks';
import type { FocusMode, TaskFilters } from '@/features/goals/types';
```

## 🔄 Migration Benefits

### Before (Problems)
- 25+ components in a single `detail/` folder
- Mixed responsibilities (AI, analytics, UI, business logic)
- Difficult to find related components
- No clear component hierarchy
- Documentation mixed with source code

### After (Solutions)
- ✅ Logical grouping by feature area
- ✅ Clear separation of UI and business logic
- ✅ Easy to locate and maintain components
- ✅ Reusable hooks for complex logic
- ✅ Clean import structure
- ✅ Scalable architecture

## 📝 Usage Examples

### Import Components
```typescript
// Import tab components
import { GoalViewTabs } from '@/features/goals/components/detail-view/tabs';

// Import overview components
import { 
  MomentumTracker, 
  OverallProgressCard 
} from '@/features/goals/components/detail-view/overview';

// Import business logic hooks
import { useGoalMetrics, useTaskFiltering } from '@/features/goals/hooks';
```

### Use Custom Hooks
```typescript
const { momentumMetrics, focusCounts, analyticsMetrics } = useGoalMetrics(goalTodos, goalId);
const { filteredTasks, filteredBacklog, filteredInProgress, filteredDone } = useTaskFiltering(
  goalTodos, 
  focusMode, 
  taskFilters
);
```

## 🚀 Future Enhancements

This structure supports easy addition of:
- New tab views (just add to `detail-view/`)
- New metrics (extend hooks)
- New AI features (add to `ai/`)
- New component types (create new folders)

The modular approach ensures that changes in one area don't affect others, making the codebase more maintainable and scalable.
