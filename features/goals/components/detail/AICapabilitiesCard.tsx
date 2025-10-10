// features/goals/components/detail/AICapabilitiesCard.tsx
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Target, CheckSquare, Lightbulb, Zap } from "lucide-react";

interface AICapabilitiesCardProps {
  goalId: number;
  subgoalCount: number;
  taskCount: number;
}

const AICapabilitiesCard: React.FC<AICapabilitiesCardProps> = ({ 
  goalId, 
  subgoalCount, 
  taskCount 
}) => {
  const features = [
    {
      icon: <Target className="w-5 h-5 text-blue-500" />,
      title: "Smart Milestones",
      description: "AI generates progressive subgoals with realistic timelines",
      status: subgoalCount > 0 ? "active" : "available",
      color: "blue"
    },
    {
      icon: <CheckSquare className="w-5 h-5 text-green-500" />,
      title: "Intelligent Tasks",
      description: "Break down milestones into actionable, prioritized tasks",
      status: taskCount > 0 ? "active" : "available", 
      color: "green"
    },
    {
      icon: <Lightbulb className="w-5 h-5 text-purple-500" />,
      title: "Smart Refinement",
      description: "Improve and optimize suggestions with natural feedback",
      status: "available",
      color: "purple"
    },
    {
      icon: <Zap className="w-5 h-5 text-orange-500" />,
      title: "Quality Analysis",
      description: "Real-time evaluation of milestone and task quality",
      status: "available",
      color: "orange"
    }
  ];

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
    }
    return <Badge variant="outline" className="border-gray-300 text-gray-600">Available</Badge>;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 border-blue-200/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">AI-Powered Productivity</h3>
          <p className="text-sm text-gray-600">Smart assistance for goal achievement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="bg-white/70 p-4 rounded-lg border border-gray-200/50">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {feature.icon}
                <h4 className="font-semibold text-gray-800 text-sm">{feature.title}</h4>
              </div>
              {getStatusBadge(feature.status)}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">Next Level AI</div>
            <div className="text-xs">
              Our AI learns from your patterns and preferences to provide increasingly personalized and effective suggestions for achieving your goals.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AICapabilitiesCard;
