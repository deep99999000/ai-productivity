// features/todo/components/SmartSuggestions.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Lightbulb, Clock, Target, TrendingUp, CheckCircle } from "lucide-react";
import axios from "axios";
import { API } from "@/lib/actions/getbackendurl";

type SmartSuggestion = {
  type: "efficiency" | "priority" | "dependency" | "resource" | "timeline";
  title: string;
  description: string;
  actionable: boolean;
  priority: "low" | "medium" | "high";
};

type SmartSuggestionsProps = {
  subgoalName: string;
  goalId?: number;
  existingTasks?: any[];
};

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  subgoalName,
  goalId,
  existingTasks = [],
}) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "efficiency": return <TrendingUp className="w-4 h-4" />;
      case "priority": return <Target className="w-4 h-4" />;
      case "dependency": return <CheckCircle className="w-4 h-4" />;
      case "resource": return <Lightbulb className="w-4 h-4" />;
      case "timeline": return <Clock className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case "efficiency": return "text-green-600 border-green-300 bg-green-50";
      case "priority": return "text-red-600 border-red-300 bg-red-50";
      case "dependency": return "text-blue-600 border-blue-300 bg-blue-50";
      case "resource": return "text-purple-600 border-purple-300 bg-purple-50";
      case "timeline": return "text-orange-600 border-orange-300 bg-orange-50";
      default: return "text-gray-600 border-gray-300 bg-gray-50";
    }
  };

  const generateSmartSuggestions = async () => {
    setIsLoading(true);
    try {
      // This would call a specialized AI endpoint for suggestions
      const mockSuggestions: SmartSuggestion[] = [
        {
          type: "priority",
          title: "Start with Research Phase",
          description: `For "${subgoalName}", begin with comprehensive research to understand requirements and avoid rework later.`,
          actionable: true,
          priority: "high",
        },
        {
          type: "efficiency",
          title: "Use Time-Boxing Technique",
          description: "Allocate specific time blocks (e.g., 2-hour focused sessions) to maintain momentum and prevent scope creep.",
          actionable: true,
          priority: "medium",
        },
        {
          type: "dependency",
          title: "Identify Prerequisites",
          description: "Map out dependencies between tasks to ensure logical sequencing and avoid bottlenecks.",
          actionable: true,
          priority: "medium",
        },
        {
          type: "resource",
          title: "Recommended Tools & Resources",
          description: "Consider using project management tools, documentation templates, and relevant learning materials.",
          actionable: false,
          priority: "low",
        },
        {
          type: "timeline",
          title: "Set Milestone Checkpoints",
          description: "Create weekly checkpoints to review progress and adjust timeline if needed.",
          actionable: true,
          priority: "medium",
        },
      ];

      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible && suggestions.length === 0) {
      generateSmartSuggestions();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="text-blue-600 border-blue-300 hover:bg-blue-50 text-sm"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Show Tips
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-blue-500" />
          Quick Tips
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="text-xs text-gray-500 hover:text-gray-700 h-6 px-2"
        >
          Hide
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
          Loading tips...
        </div>
      ) : (
        <div className="space-y-2">
          {suggestions.slice(0, 3).map((suggestion, index) => (
            <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 mt-0.5">
                  {getSuggestionIcon(suggestion.type)}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-sm text-gray-800 mb-1">
                    {suggestion.title}
                  </h5>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSuggestions;
