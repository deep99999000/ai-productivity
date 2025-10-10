// features/subGoals/components/SubgoalQualityIndicator.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Clock, Target, Users, Zap, Calendar } from "lucide-react";
import { GeneratedSubgoal } from "./GenerateSubgoalWithAIDialog";

type SubgoalQualityProps = {
  subgoals: (GeneratedSubgoal & { tempId: number })[];
};

const SubgoalQualityIndicator: React.FC<SubgoalQualityProps> = ({ subgoals }) => {
  const analyzeSubgoalQuality = () => {
    const analysis = {
      totalSubgoals: subgoals.length,
      specificSubgoals: 0,
      withDeadlines: 0,
      wellDescribed: 0,
      progressive: false,
      overallScore: 0,
    };

    subgoals.forEach((subgoal, index) => {
      // Check specificity (length and actionable words)
      const specificWords = ['implement', 'create', 'build', 'design', 'develop', 'complete', 'achieve', 'establish', 'launch', 'deploy'];
      const hasSpecificWords = specificWords.some(word => 
        subgoal.name.toLowerCase().includes(word) || 
        (subgoal.description && subgoal.description.toLowerCase().includes(word))
      );
      
      if (hasSpecificWords && subgoal.name.length > 10) {
        analysis.specificSubgoals++;
      }

      // Check if has deadline
      if (subgoal.endDate) {
        analysis.withDeadlines++;
      }

      // Check description quality
      if (subgoal.description && subgoal.description.length > 50) {
        analysis.wellDescribed++;
      }
    });

    // Check if subgoals are progressive (dates increase)
    const dates = subgoals
      .filter(s => s.endDate)
      .map(s => new Date(s.endDate))
      .sort((a, b) => a.getTime() - b.getTime());
    
    analysis.progressive = dates.length > 1 && 
      dates.every((date, i) => i === 0 || date >= dates[i - 1]);

    // Calculate overall score
    const specificityScore = (analysis.specificSubgoals / analysis.totalSubgoals) * 25;
    const deadlineScore = (analysis.withDeadlines / analysis.totalSubgoals) * 25;
    const descriptionScore = (analysis.wellDescribed / analysis.totalSubgoals) * 25;
    const progressiveScore = analysis.progressive ? 25 : 0;
    
    analysis.overallScore = Math.round(specificityScore + deadlineScore + descriptionScore + progressiveScore);

    return analysis;
  };

  const analysis = analyzeSubgoalQuality();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50/50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" />
          Subgoal Quality Analysis
        </h4>
        <Badge className={`${getScoreBadgeColor(analysis.overallScore)} font-bold`}>
          {analysis.overallScore}% Quality
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-500" />
          <div>
            <div className="font-medium text-gray-700">Specific</div>
            <div className="text-gray-600">{analysis.specificSubgoals}/{analysis.totalSubgoals}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-green-500" />
          <div>
            <div className="font-medium text-gray-700">Deadlines</div>
            <div className="text-gray-600">{analysis.withDeadlines}/{analysis.totalSubgoals}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-500" />
          <div>
            <div className="font-medium text-gray-700">Detailed</div>
            <div className="text-gray-600">{analysis.wellDescribed}/{analysis.totalSubgoals}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {analysis.progressive ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <div>
            <div className="font-medium text-gray-700">Progressive</div>
            <div className="text-gray-600">{analysis.progressive ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>

      {analysis.overallScore < 70 && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <div className="font-medium mb-1">Suggestions for improvement:</div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                {analysis.specificSubgoals < analysis.totalSubgoals && (
                  <li>Make subgoals more specific and actionable</li>
                )}
                {analysis.withDeadlines < analysis.totalSubgoals && (
                  <li>Add realistic deadlines to all subgoals</li>
                )}
                {analysis.wellDescribed < analysis.totalSubgoals && (
                  <li>Provide more detailed descriptions with clear deliverables</li>
                )}
                {!analysis.progressive && (
                  <li>Ensure subgoals are logically sequenced and progressive</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SubgoalQualityIndicator;
