"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartCard } from "./ChartCard";
import { Calendar as CalendarIcon, PieChart as PieIcon, Users, AlertTriangle, Map } from "lucide-react";

interface PatternsTabProps {
  analytics: any;
}

const PatternsTab: React.FC<PatternsTabProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard title="Daily Productivity" icon={<CalendarIcon className="w-5 h-5" />} subtitle="Average completion by weekday">
          <div className="space-y-3">
            {analytics.productivityPatterns.map((day: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{day.day.slice(0, 3)}</span>
                <div className="flex items-center gap-2 flex-1 ml-4">
                  <Progress value={(day.completions / Math.max(...analytics.productivityPatterns.map((p: any) => p.completions), 1)) * 100} className="flex-1 h-2" />
                  <span className="text-sm text-gray-600 w-8">{day.completions}</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Category Focus" icon={<PieIcon className="w-5 h-5" />} subtitle="Time allocation across categories">
          <div className="space-y-3">
            {analytics.categoryPerformance.slice(0, 5).map((category: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{category.completionRate}%</span>
                    <Badge variant="outline" className="text-xs">{category.total}</Badge>
                  </div>
                </div>
                <Progress value={category.completionRate} className="h-2" />
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Collaboration Index" icon={<Users className="w-5 h-5" />} subtitle="Team interaction patterns">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{analytics.collaborationMetrics.sharedGoalsCount}</div>
                <div className="text-xs text-gray-600">Shared Goals</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{analytics.collaborationMetrics.collaborationRate}%</div>
                <div className="text-xs text-gray-600">Collaboration Rate</div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Team Tasks</span>
                <span className="font-medium">{analytics.collaborationMetrics.collaborativeTasks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Individual Tasks</span>
                <span className="font-medium">{analytics.totalTodos - analytics.collaborationMetrics.collaborativeTasks}</span>
              </div>
              <Progress value={analytics.collaborationMetrics.teamEfficiency} className="h-2 mt-2" />
              <div className="text-xs text-gray-500 text-center">Team Efficiency: {Math.round(analytics.collaborationMetrics.teamEfficiency)}%</div>
            </div>
          </div>
        </ChartCard>
        <ChartCard title="Risk Assessment" icon={<AlertTriangle className="w-5 h-5" />} subtitle="Goal completion risk factors" className="xl:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className={`text-4xl font-bold ${analytics.riskAssessment.riskLevel === 'high' ? 'text-red-600' : analytics.riskAssessment.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>{analytics.riskAssessment.score}</div>
                <div className="text-sm text-gray-600">Risk Score</div>
              </div>
              <div className="flex-1 ml-8">
                <Progress value={analytics.riskAssessment.score} className="h-3" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
            {analytics.riskAssessment.riskFactors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Risk Factors:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {analytics.riskAssessment.riskFactors.map((factor: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600 p-2 bg-red-50 rounded">
                      <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                      {factor}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ChartCard>
        <ChartCard title="Milestone Analysis" icon={<Map className="w-5 h-5" />} subtitle="Subgoal completion tracking">
          <div className="space-y-3">
            {analytics.milestoneAnalysis.milestones.slice(0, 4).map((milestone: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{milestone.name}</span>
                  <Badge variant={milestone.status === 'completed' ? 'default' : 'outline'} className="text-xs">{milestone.progress}%</Badge>
                </div>
                <Progress value={milestone.progress} className="h-2" />
              </div>
            ))}
            <div className="pt-2 text-center">
              <div className="text-lg font-bold text-indigo-600">{analytics.milestoneAnalysis.completedMilestones} / {analytics.milestoneAnalysis.totalMilestones}</div>
              <div className="text-xs text-gray-600">Milestones Completed</div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default PatternsTab;
