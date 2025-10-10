// features/todo/components/TaskQualityIndicator.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Clock, Target, Users, Zap } from "lucide-react";
import { GeneratedTask } from "./GenerateTasksWithAIDialog";

type TaskQualityProps = {
  tasks: (GeneratedTask & { tempId: number })[];
};

const TaskQualityIndicator: React.FC<TaskQualityProps> = ({ tasks }) => {
  const analyzeTaskQuality = () => {
    const analysis = {
      totalTasks: tasks.length,
      specificTasks: 0,
      withDeadlines: 0,
      prioritized: 0,
      detailed: 0,
      balanced: false,
      overallScore: 0,
    };

    tasks.forEach(task => {
      // Check specificity (length and actionable words)
      if (task.name.length > 10 && (task.name.includes('Create') || task.name.includes('Build') || task.name.includes('Research') || task.name.includes('Implement'))) {
        analysis.specificTasks++;
      }
      
      // Check deadlines
      if (task.endDate) {
        analysis.withDeadlines++;
      }
      
      // Check priority distribution
      if (task.priority && task.priority !== 'medium') {
        analysis.prioritized++;
      }
      
      // Check detailed descriptions
      if (task.description && task.description.length > 50) {
        analysis.detailed++;
      }
    });

    // Check priority balance
    const priorities = tasks.map(t => t.priority);
    const hasHigh = priorities.some(p => p === 'high');
    const hasLow = priorities.some(p => p === 'low');
    analysis.balanced = hasHigh && hasLow;

    // Calculate overall score (0-100)
    const specificScore = (analysis.specificTasks / analysis.totalTasks) * 25;
    const deadlineScore = (analysis.withDeadlines / analysis.totalTasks) * 25;
    const priorityScore = (analysis.prioritized / analysis.totalTasks) * 25;
    const detailScore = (analysis.detailed / analysis.totalTasks) * 20;
    const balanceScore = analysis.balanced ? 5 : 0;
    
    analysis.overallScore = Math.round(specificScore + deadlineScore + priorityScore + detailScore + balanceScore);

    return analysis;
  };

  const analysis = analyzeTaskQuality();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 border-green-300 bg-green-50";
    if (score >= 60) return "text-yellow-600 border-yellow-300 bg-yellow-50";
    return "text-red-600 border-red-300 bg-red-50";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  if (tasks.length === 0) return null;

  return (
    <Card className="mb-4 p-4 border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" />
          Task Quality Analysis
        </h4>
        <Badge 
          variant="outline" 
          className={`font-semibold ${getScoreColor(analysis.overallScore)}`}
        >
          {analysis.overallScore}% - {getScoreLabel(analysis.overallScore)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className={`w-4 h-4 ${analysis.specificTasks === analysis.totalTasks ? 'text-green-500' : 'text-gray-400'}`} />
          <div>
            <div className="text-xs font-medium text-gray-800">Specific</div>
            <div className="text-xs text-gray-600">{analysis.specificTasks}/{analysis.totalTasks}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${analysis.withDeadlines === analysis.totalTasks ? 'text-green-500' : 'text-gray-400'}`} />
          <div>
            <div className="text-xs font-medium text-gray-800">Deadlines</div>
            <div className="text-xs text-gray-600">{analysis.withDeadlines}/{analysis.totalTasks}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${analysis.prioritized > 0 ? 'text-green-500' : 'text-gray-400'}`} />
          <div>
            <div className="text-xs font-medium text-gray-800">Prioritized</div>
            <div className="text-xs text-gray-600">{analysis.prioritized}/{analysis.totalTasks}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AlertCircle className={`w-4 h-4 ${analysis.detailed === analysis.totalTasks ? 'text-green-500' : 'text-gray-400'}`} />
          <div>
            <div className="text-xs font-medium text-gray-800">Detailed</div>
            <div className="text-xs text-gray-600">{analysis.detailed}/{analysis.totalTasks}</div>
          </div>
        </div>
      </div>

      {analysis.overallScore < 70 && (
        <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-2">
          💡 Consider using the "Refine with AI" feature to improve task specificity and detail.
        </div>
      )}
    </Card>
  );
};

export default TaskQualityIndicator;
