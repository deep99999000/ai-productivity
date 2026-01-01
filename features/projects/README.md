# 📊 Enterprise Project Management System

A comprehensive, enterprise-grade project tracking application built with Next.js, featuring a hierarchical **Project → Milestone → Task** structure. Designed for scalable collaboration, planning, and analytics.

---

## 🎯 Project Overview

This application provides a complete project management solution with:

- **Hierarchical Structure**: Projects contain Milestones, Milestones contain Tasks
- **Enterprise Features**: RBAC, approval workflows, SLA tracking, capacity planning
- **Real-time Collaboration**: Chat, comments, mentions, reactions
- **Advanced Analytics**: Gantt charts, burndown, velocity tracking, resource utilization
- **AI Insights**: Risk detection, bottleneck analysis, optimization suggestions

**Design Principles**:
- Color theme strictly follows the Habit page pattern (indigo/purple gradients)
- Store, actions, and schema architecture mirrors Habit page implementation
- Clean, modern UI with Tailwind CSS
- Type-safe with TypeScript throughout

---

## 🧩 Feature Implementation Status

### ✅ Core Architecture (COMPLETED)
- ✔ Database schema with 15+ tables
- ✔ Zustand store following Habit pattern
- ✔ Server actions with proper error handling
- ✔ Type definitions and interfaces
- ✔ Constants and configuration
- ✔ AI insights store
- ✔ Utility functions and analytics helpers

---

## 📋 Feature Checklist

### **Project Management**

#### Project Lifecycle Governance
- ☐ Create, read, update, delete projects
- ☐ Project status management (active, on_hold, completed, archived)
- ☐ Project health tracking (healthy, at_risk, critical)
- ☐ Soft delete with recovery
- ☐ Project favorites and pinning

#### Project Templates & Cloning
- ☐ Save project as template
- ☐ Create project from template
- ☐ Clone existing projects with all structure
- ☐ Template marketplace/library

#### Custom Project Fields
- ☐ Define custom field types (text, number, date, dropdown)
- ☐ Add custom fields to projects
- ☐ Filter and search by custom fields
- ☐ Custom field validation

#### Project Health Scoring
- ☐ Automated health score calculation
- ☐ Health indicators based on milestones/tasks
- ☐ Health score history tracking
- ☐ Health alerts and notifications

#### Project-level Permissions
- ☐ Role-based access control (Owner, Admin, Editor, Viewer)
- ☐ Granular permission settings
- ☐ Permission inheritance to milestones/tasks
- ☐ External collaborator access

---

### **Milestones (Task Containers)**

#### Milestone Management
- ☐ Create, update, delete milestones
- ☐ Milestone status tracking (not_started, in_progress, pending_approval, completed, blocked)
- ☐ Milestone descriptions and metadata
- ☐ Milestone reordering (drag & drop)

#### Milestone Ownership & Deadlines
- ☐ Assign milestone owners
- ☐ Set start and due dates
- ☐ Deadline warnings and alerts
- ☐ Automatic deadline notifications

#### Milestone Dependencies
- ☐ Define milestone dependencies
- ☐ Visual dependency mapping
- ☐ Dependency validation
- ☐ Cascade reschedule on dependency changes

#### Milestone Progress Roll-ups
- ☐ Automatic progress calculation from tasks
- ☐ Real-time progress updates
- ☐ Progress visualization (percentage, charts)
- ☐ Milestone completion detection

#### Approval-gated Milestones
- ☐ Mark milestones as requiring approval
- ☐ Approval workflow integration
- ☐ Approval chain support
- ☐ Approval notifications

---

### **Task Management (Hierarchy)**

#### Tasks Inside Milestones
- ☐ Create tasks within milestones
- ☐ Move tasks between milestones
- ☐ Task templates
- ☐ Quick task creation

#### Unlimited Task Nesting
- ☐ Create subtasks (unlimited levels)
- ☐ Parent-child task relationships
- ☐ Nested task visualization
- ☐ Collapse/expand task trees

#### Cross-milestone Task Linking
- ☐ Link tasks across different milestones
- ☐ Cross-milestone dependency tracking
- ☐ Visual cross-milestone connections
- ☐ Impact analysis across milestones

#### Task Dependency Mapping
- ☐ Define task dependencies (depends_on, blocks)
- ☐ Dependency graph visualization
- ☐ Circular dependency detection
- ☐ Dependency conflict resolution

#### Priority & Severity Levels
- ☐ Set task priority (low, medium, high, critical)
- ☐ Set task severity (minor, moderate, major, blocker)
- ☐ Priority-based sorting and filtering
- ☐ Severity-based escalation rules

#### Custom Workflows
- ☐ Define custom workflow stages
- ☐ Workflow stage transitions
- ☐ Workflow automation rules
- ☐ Workflow templates per project

#### SLA-based Task Tracking
- ☐ Set SLA due dates
- ☐ SLA breach detection
- ☐ SLA breach notifications
- ☐ SLA reporting and analytics

#### Blockers & Escalation Flags
- ☐ Mark tasks as blocked with reasons
- ☐ Escalate tasks to specific users
- ☐ Blocker resolution tracking
- ☐ Escalation notifications

---

### **Timeline, Scheduling & Capacity**

#### Gantt Chart View
- ☐ Project-level Gantt chart
- ☐ Milestone-level Gantt chart
- ☐ Task-level Gantt chart
- ☐ Interactive Gantt with drag & drop
- ☐ Zoom and pan controls
- ☐ Export Gantt to image/PDF

#### Critical Path Analysis
- ☐ Identify critical path tasks
- ☐ Highlight critical path in Gantt
- ☐ Critical path impact analysis
- ☐ Critical path optimization suggestions

#### Auto Rescheduling
- ☐ Suggest reschedule on delays
- ☐ Show impact of rescheduling
- ☐ Cascade reschedule dependencies
- ☐ Conflict detection and resolution

#### Resource Capacity Planning
- ☐ Track team member capacity (hours/week)
- ☐ Visualize capacity allocation
- ☐ Over-allocation warnings
- ☐ Capacity-based task assignment

#### Workload Forecasting
- ☐ Forecast workload by user
- ☐ Forecast workload by week/month
- ☐ Identify resource bottlenecks
- ☐ Workload balancing suggestions

#### Scenario Planning
- ☐ Create "what-if" scenarios
- ☐ Compare scenario outcomes
- ☐ Risk assessment per scenario
- ☐ Save and share scenarios

---

### **Team, Roles & Identity**

#### Organization-level User Management
- ☐ Create and manage organizations
- ☐ Invite users to organization
- ☐ Organization settings and branding
- ☐ Multi-organization support

#### Role-based Access Control (RBAC)
- ☐ Define roles (Owner, Admin, Editor, Viewer, External)
- ☐ Assign roles to project members
- ☐ Role-based UI rendering
- ☐ Role-based feature access

#### Approval Chains
- ☐ Create approval chains
- ☐ Sequential approval workflows
- ☐ Parallel approval options
- ☐ Approval history tracking

#### External Collaborator Access
- ☐ Invite external users by email
- ☐ Limited access for external users
- ☐ External access expiration
- ☐ External user activity tracking

#### Delegation Support
- ☐ Delegate tasks to other users
- ☐ Delegation notifications
- ☐ Track delegation chain
- ☐ Delegation approval workflows

---

### **Collaboration & Communication**

#### Real-time Project Chat
- ☐ Project-level chat rooms
- ☐ Real-time message delivery
- ☐ Chat history and search
- ☐ Unread message indicators

#### Milestone-level Chat
- ☐ Milestone-specific chat rooms
- ☐ Context-aware chat
- ☐ Chat notifications
- ☐ Chat archive

#### Task-level Threaded Comments
- ☐ Add comments to tasks
- ☐ Threaded comment replies
- ☐ Comment editing and deletion
- ☐ Comment history

#### Mentions (@user)
- ☐ @mention users in comments and chat
- ☐ Mention notifications
- ☐ Mention highlighting
- ☐ Mention autocomplete

#### Emoji Reactions
- ☐ Add emoji reactions to comments
- ☐ Add emoji reactions to chat messages
- ☐ Reaction counts and users
- ☐ Popular reactions shortcut

#### Rich Text Collaboration
- ☐ Rich text editor for comments
- ☐ Markdown support
- ☐ Code syntax highlighting
- ☐ Link previews

#### File Sharing in Chat
- ☐ Upload files in chat
- ☐ Image preview in chat
- ☐ File download links
- ☐ File size limits

---

### **Attachments & Knowledge**

#### File Attachments
- ☐ Attach files to tasks
- ☐ Attach files to milestones
- ☐ Attach files to projects
- ☐ Multiple file upload

#### Version History
- ☐ Track file versions
- ☐ Compare file versions
- ☐ Restore previous versions
- ☐ Version changelog

#### Shared Document Repository
- ☐ Project document library
- ☐ Organize documents in folders
- ☐ Document search
- ☐ Document tagging

#### Permission-based Access
- ☐ Set document permissions (public/private)
- ☐ Share documents with specific users
- ☐ Permission inheritance
- ☐ Access logs

---

### **Notifications**

#### Rule-based Notifications
- ☐ Define notification rules
- ☐ Custom notification triggers
- ☐ Notification channels (in-app, email, push)
- ☐ Notification preferences per user

#### Escalation Alerts
- ☐ Task escalation notifications
- ☐ Urgent notification flags
- ☐ Escalation resolution tracking
- ☐ Escalation analytics

#### SLA Breach Alerts
- ☐ Real-time SLA breach notifications
- ☐ Pre-breach warnings
- ☐ SLA breach reports
- ☐ SLA recovery tracking

#### Approval Notifications
- ☐ Approval request notifications
- ☐ Approval granted/denied notifications
- ☐ Approval reminder notifications
- ☐ Approval chain progress updates

#### Quiet Hours Support
- ☐ Set quiet hours per user
- ☐ Suppress notifications during quiet hours
- ☐ Queue notifications for later
- ☐ Emergency override for urgent notifications

---

### **Analytics & Reporting**

#### Project Dashboards
- ☐ Project overview dashboard
- ☐ Health score visualization
- ☐ Completion progress charts
- ☐ Timeline visualization

#### Milestone & Task Velocity Tracking
- ☐ Calculate velocity (tasks/week)
- ☐ Velocity trends over time
- ☐ Velocity by team member
- ☐ Velocity forecasting

#### Burn-down / Burn-up Charts
- ☐ Project burn-down chart
- ☐ Milestone burn-down chart
- ☐ Ideal vs actual tracking
- ☐ Completion date projection

#### Resource Utilization Insights
- ☐ Team member utilization charts
- ☐ Over/under-utilized resources
- ☐ Utilization trends
- ☐ Capacity vs allocation reports

#### Risk & Delay Indicators
- ☐ Risk score calculation
- ☐ Delay probability indicators
- ☐ Risk mitigation suggestions
- ☐ Historical risk tracking

#### Exportable Reports
- ☐ Export reports to PDF
- ☐ Export reports to Excel/CSV
- ☐ Scheduled report generation
- ☐ Custom report templates

---

### **Search, Filters & Views**

#### Global Search
- ☐ Search across all projects
- ☐ Search across all milestones
- ☐ Search across all tasks
- ☐ Search in comments and chat
- ☐ Search autocomplete
- ☐ Recent searches

#### Advanced Multi-filtering
- ☐ Filter by status, priority, assignee
- ☐ Filter by date ranges
- ☐ Filter by custom fields
- ☐ Combine multiple filters
- ☐ Filter presets

#### Saved Views
- ☐ Save custom filter combinations
- ☐ Name and describe saved views
- ☐ Set default view per user
- ☐ Share views with team
- ☐ View templates

#### Custom Field Filters
- ☐ Filter by custom field values
- ☐ Custom field filter operators
- ☐ Multi-value custom field filters
- ☐ Custom field quick filters

---

### **Productivity & UX**

#### Bulk Operations
- ☐ Select multiple tasks
- ☐ Bulk status update
- ☐ Bulk assignment
- ☐ Bulk priority change
- ☐ Bulk move to milestone
- ☐ Bulk delete

#### Keyboard Shortcuts
- ☐ Global keyboard shortcuts
- ☐ Context-specific shortcuts
- ☐ Keyboard shortcut help modal
- ☐ Customizable shortcuts
- ☐ Shortcut cheat sheet

#### Draft & Review Modes
- ☐ Save tasks as drafts
- ☐ Review mode for approvers
- ☐ Draft auto-save
- ☐ Draft-to-published workflow

#### Soft Delete & Recovery
- ☐ Soft delete projects/milestones/tasks
- ☐ Trash/recycling bin
- ☐ Restore deleted items
- ☐ Permanent delete after retention period

#### Activity Feeds
- ☐ Project activity feed
- ☐ User activity feed
- ☐ Real-time activity updates
- ☐ Activity filtering
- ☐ Activity export

#### Favorites & Pinning
- ☐ Favorite projects
- ☐ Pin important tasks
- ☐ Quick access to favorites
- ☐ Favorites dashboard

---

### **Administration**

#### Project-level Settings
- ☐ Configure project settings
- ☐ Workflow settings
- ☐ Notification settings
- ☐ Integration settings
- ☐ Export settings

#### Feature Flags
- ☐ Enable/disable features per project
- ☐ Beta feature access
- ☐ Feature rollout management
- ☐ Feature usage analytics

#### Usage Analytics
- ☐ Track feature usage
- ☐ User activity analytics
- ☐ Performance metrics
- ☐ Usage reports for admins

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **State Management**: Zustand (with persistence)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Date Handling**: date-fns
- **Charts**: Recharts (for analytics)
- **Rich Text**: TipTap Editor
- **File Upload**: UploadThing
- **AI**: Google Gemini API

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- pnpm
- PostgreSQL database

### Install Dependencies
```bash
pnpm install
```

### Environment Variables
Create a `.env` file with:
```env
DATABASE_URL=your_postgresql_url
NEXT_PUBLIC_API_LINK=http://localhost:3000
AUTH_SECRET=your_auth_secret
GOOGLE_GENAI_API_KEY=your_google_ai_key
UPLOADTHING_TOKEN=your_uploadthing_token
```

### Database Setup
```bash
# Generate migrations
pnpm drizzle-kit generate

# Push schema to database
pnpm drizzle-kit push
```

### Run Development Server
```bash
pnpm dev
```

---

## 🎨 Design System

### Color Theme (From Habit Page)

**Primary Colors:**
- Indigo-Purple gradient: `from-indigo-600 to-purple-600`
- Primary background: `bg-indigo-50`
- Primary text: `text-indigo-700`

**Status Colors:**
- Success: `from-green-500 to-emerald-600`
- Warning: `from-amber-500 to-orange-600`
- Danger: `from-rose-500 to-pink-600`
- Info: `from-indigo-500 to-purple-600`

**Surface Colors:**
- Card background: `bg-white/90`
- Hover: `hover:bg-white`
- Slate overlay: `bg-slate-50`

**Borders:**
- Default: `border-slate-200/60`
- Hover: `hover:border-slate-300/80`
- Focus: `ring-2 ring-indigo-300 ring-opacity-60`

### Typography
- Font: System font stack (optimized)
- Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

---

## 📁 Project Structure

```
features/projects/
├── schema.ts              # Database schema (15+ tables)
├── types.ts               # TypeScript type definitions
├── store.ts               # Zustand store (Habit pattern)
├── actions.ts             # Server actions (Habit pattern)
├── constants.ts           # Constants and configurations
├── aiInsightStore.ts      # AI insights store
├── utils/
│   └── analytics.ts       # Analytics utilities
└── components/
    ├── dashboard/         # Dashboard components
    ├── projects/          # Project management components
    ├── milestones/        # Milestone components
    ├── tasks/             # Task components
    ├── timeline/          # Gantt chart components
    ├── chat/              # Chat and collaboration
    ├── analytics/         # Analytics and reporting
    └── shared/            # Shared components
```

---

## 🚀 Usage

### Creating a Project
1. Navigate to Projects page
2. Click "New Project" button
3. Fill in project details (name, description, dates)
4. Set project status and health
5. Assign team members with roles

### Managing Milestones
1. Select a project
2. Create milestones as task containers
3. Set milestone owners and deadlines
4. Define milestone dependencies
5. Track milestone progress

### Task Management
1. Create tasks within milestones
2. Assign tasks to team members
3. Set priority and severity
4. Define task dependencies
5. Track task progress and completion

### Gantt Chart
- View project timeline visually
- Identify critical path
- Drag tasks to reschedule
- See dependency connections

### Analytics
- View project dashboards
- Track velocity and burndown
- Monitor resource utilization
- Generate exportable reports

---

## 🔐 Security & Permissions

- **RBAC**: Role-based access control at project level
- **Row-level Security**: Database-level permissions
- **External Collaborators**: Limited access with expiration
- **Audit Logs**: Track all user actions
- **Soft Deletes**: Data recovery support

---

## 🤝 Contributing

This is an enterprise project management system. Features are locked to the specification above.

---

## 📄 License

Proprietary - Enterprise Use Only

---

## 🎯 Roadmap

All features listed in the checklist above are planned for implementation. Priority is given to:

1. ✅ Core architecture (COMPLETED)
2. 🔄 Project, Milestone, Task CRUD (IN PROGRESS)
3. ⏳ Timeline and Gantt chart
4. ⏳ Team collaboration features
5. ⏳ Analytics and reporting
6. ⏳ Advanced features (AI insights, capacity planning)

---

## 📧 Support

For enterprise support and inquiries, please contact the development team.

---

**Built with ❤️ using Next.js, Tailwind CSS, and modern web technologies.**
