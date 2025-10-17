"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, KanbanSquare, BarChart3, Activity } from "lucide-react";

interface GoalViewTabsProps {
  children: {
    overview: React.ReactNode;
    board: React.ReactNode;
    analytics: React.ReactNode;
    activity: React.ReactNode;
  };
}

export function GoalViewTabs({ children }: GoalViewTabsProps) {
  return (
    <Tabs defaultValue="board" className="w-full">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/80 p-2 mb-6">
        <TabsList className="grid w-full grid-cols-4 bg-transparent gap-2">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-xl transition-all duration-200"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="board"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-xl transition-all duration-200"
          >
            <KanbanSquare className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Board</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-xl transition-all duration-200"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-xl transition-all duration-200"
          >
            <Activity className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="mt-0">
        {children.overview}
      </TabsContent>
      <TabsContent value="board" className="mt-0">
        {children.board}
      </TabsContent>
      <TabsContent value="analytics" className="mt-0">
        {children.analytics}
      </TabsContent>
      <TabsContent value="activity" className="mt-0">
        {children.activity}
      </TabsContent>
    </Tabs>
  );
}
