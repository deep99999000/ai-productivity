// features/subGoals/components/SmartSubgoalSuggestions.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Lightbulb, Clock, Target, TrendingUp, Zap, Calendar } from "lucide-react";

const SmartSubgoalSuggestions: React.FC = () => {
  const suggestions = [
    {
      icon: <Target className="w-4 h-4" />,
      title: "SMART Criteria",
      description: "Make subgoals Specific, Measurable, Achievable, Relevant, Time-bound",
      example: "Complete 3 React tutorials → Build a todo app using React hooks by March 15",
      color: "blue"
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      title: "Progressive Milestones",
      description: "Create building blocks that lead logically to your main goal",
      example: "Research → Plan → Build → Test → Deploy",
      color: "green"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: "Realistic Timeframes",
      description: "Set achievable deadlines considering complexity and dependencies",
      example: "Learning: 2-4 weeks, Building: 4-8 weeks, Complex projects: 2-6 months",
      color: "purple"
    },
    {
      icon: <Zap className="w-4 h-4" />,
      title: "Clear Deliverables",
      description: "Define concrete outcomes that signal completion",
      example: "Have working app → Deploy to production with 100+ users",
      color: "orange"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 border-blue-200 text-blue-800",
      green: "bg-green-50 border-green-200 text-green-800", 
      purple: "bg-purple-50 border-purple-200 text-purple-800",
      orange: "bg-orange-50 border-orange-200 text-orange-800"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-yellow-600" />
        <h4 className="font-semibold text-gray-800">Smart Subgoal Tips</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className={`p-3 rounded-lg border ${getColorClasses(suggestion.color)}`}>
            <div className="flex items-start gap-2 mb-2">
              {suggestion.icon}
              <div className="flex-1">
                <div className="font-medium text-sm mb-1">{suggestion.title}</div>
                <div className="text-xs text-gray-600 mb-2">{suggestion.description}</div>
                <div className="text-xs bg-white/70 rounded px-2 py-1 border">
                  <span className="font-medium">Example:</span> {suggestion.example}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">Pro Tip:</div>
            <div className="text-xs">
              Think of subgoals as checkpoints on your journey. Each one should bring you measurably closer to your main objective and build upon the previous milestone.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SmartSubgoalSuggestions;
