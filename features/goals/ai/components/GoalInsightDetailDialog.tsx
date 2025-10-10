import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Target, Lightbulb, CheckCircle, Sparkles, BarChart3, Clock, Flag } from "lucide-react";
import { goalTypeConfig } from "../config";
import type { GoalAISuggestion } from "../types";

interface GoalInsightDetailDialogProps {
  insight: GoalAISuggestion | null;
  onClose: () => void;
  onApply?: () => void;
}

export function GoalInsightDetailDialog({
  insight,
  onClose,
  onApply,
}: GoalInsightDetailDialogProps) {
  if (!insight) return null;

  const config = goalTypeConfig[insight.type];

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 70) return "text-amber-500";
    return "text-slate-500";
  };

  const getConfidenceBg = (score: number) => {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 70) return "bg-amber-400";
    return "bg-slate-400";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-50 text-red-800 border-red-300 hover:bg-red-100";
      case "medium": return "bg-yellow-50 text-yellow-800 border-yellow-300 hover:bg-yellow-100";
      case "low": return "bg-green-50 text-green-800 border-green-300 hover:bg-green-100";
      default: return "bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100";
    }
  };

  const renderConfidenceBar = (score: number) => (
    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${getConfidenceBg(score)}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );

  // ✅ Extract action steps from description with better filtering
  const extractActionSteps = (description: string): string[] => {
    const actions: string[] = [];
    
    // Split by lines and look for action-oriented patterns
    const lines = description.split('\n');
    
    lines.forEach(line => {
      const cleanLine = line.trim();
      
      // Match bullet points, numbered lists, or imperative sentences
      if (
        /^(•|\-|\*|\d+\.)\s+.+/.test(cleanLine) || // Bullet points
        /^[A-Z][^.!?]*\.$/.test(cleanLine) || // Complete sentences
        /^[A-Z].*[.!?]$/.test(cleanLine) // Sentences with punctuation
      ) {
        // Clean the line and check if it sounds like an action
        const action = cleanLine
          .replace(/^(•|\-|\*|\d+\.)\s*/, '') // Remove bullets
          .trim();
        
        // Filter out very short lines or non-action items
        if (action.length > 15 && 
            !action.toLowerCase().includes('indicating') &&
            !action.toLowerCase().includes('you\'ve') &&
            !action.toLowerCase().includes('building') &&
            action.split(' ').length > 3) {
          actions.push(action);
        }
      }
    });
    
    return actions.length > 0 ? actions : [
      "Review your current progress and identify bottlenecks",
      "Set specific, measurable milestones with clear deadlines", 
      "Allocate dedicated time blocks for focused work on this goal",
      "Track daily progress and adjust your approach based on results"
    ];
  };

  // ✅ Clean text by removing starting asterisks and handle newlines
  const cleanText = (text: string) => {
    return text.replace(/^\*\s*/gm, '').trim();
  };

  // ✅ Split description into main content and action steps
  const parseDescription = (desc: string) => {
    const cleanedDesc = cleanText(desc);
    const lines = cleanedDesc.split('\n').filter(line => line.trim() !== '');
    
    const mainContent: string[] = [];
    const actionSteps: string[] = [];
    let foundActionSection = false;

    lines.forEach(line => {
      const cleanLine = line.trim();
      
      // Detect action steps section (bullet points or imperative sentences)
      if (/^(•|\-|\*|\d+\.)\s+.+/.test(cleanLine) || 
          (/^[A-Z].*[.!?]$/.test(cleanLine) && cleanLine.split(' ').length <= 15)) {
        foundActionSection = true;
        const action = cleanLine.replace(/^(•|\-|\*|\d+\.)\s*/, '').trim();
        if (action.length > 0) {
          actionSteps.push(action);
        }
      } else if (foundActionSection && cleanLine.length > 0) {
        // Continue adding to action steps if we're in that section
        actionSteps.push(cleanLine);
      } else if (cleanLine.length > 0) {
        mainContent.push(cleanLine);
      }
    });

    return { mainContent, actionSteps };
  };

  // ✅ Render the parsed content with better typography
  const renderContent = (desc: string) => {
    const { mainContent, actionSteps } = parseDescription(desc);
    const extractedActions = actionSteps.length > 0 ? actionSteps : extractActionSteps(desc);

    return (
      <>
        {/* Main Content with better typography */}
        <div className="mb-6">
          {mainContent.map((paragraph, i) => (
            <p key={i} className="text-slate-700 leading-relaxed mb-4 last:mb-0 text-base">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Action Steps with enhanced design */}
        {extractedActions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg">Action Steps</h4>
            </div>
            <div className="space-y-3">
              {extractedActions.map((action, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <span className="text-white text-sm font-bold">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-800 leading-relaxed font-medium">{action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <Dialog open={!!insight} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-xl max-h-[90vh] flex flex-col">
        {/* Enhanced Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center border border-indigo-100 shadow-sm">
              <span className="text-2xl">{config.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-slate-900 mb-3 leading-tight">
                {insight.title}
              </DialogTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 font-medium">
                  {config.icon} {config.label}
                </Badge>
                {insight.priority && (
                  <Badge variant="outline" className={`text-sm px-3 py-1.5 font-medium border-2 ${getPriorityColor(insight.priority)}`}>
                    <Flag className="h-3 w-3 mr-1.5" />
                    {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)} Priority
                  </Badge>
                )}
                {insight.score !== undefined && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                    <BarChart3 className="h-4 w-4 text-slate-500" />
                    <span className={`text-sm font-semibold ${getConfidenceColor(insight.score)}`}>
                      {insight.score}% Confidence
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Estimated Time Banner */}
            {insight.estimatedTimeToComplete && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-blue-900 mb-1">Time Investment</h4>
                    <p className="text-blue-700 font-medium">{insight.estimatedTimeToComplete}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Key Insight Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Key Insight</h3>
              </div>
              {renderContent(insight.description)}
            </div>

            {/* Tags Section */}
            {insight.tags && insight.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-slate-600" />
                  <h4 className="font-semibold text-slate-800">Related Areas</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {insight.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="text-sm px-3 py-1.5 rounded-lg border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence Score */}
            {insight.score !== undefined && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-base mb-3">
                  <span className="text-slate-700 font-semibold">AI Confidence Level</span>
                  <span className={`font-bold text-lg ${getConfidenceColor(insight.score)}`}>
                    {insight.score}%
                  </span>
                </div>
                {renderConfidenceBar(insight.score)}
                <p className="text-sm text-slate-600 mt-2">
                  {insight.score >= 90 ? "High confidence - highly recommended action" :
                   insight.score >= 70 ? "Good confidence - likely beneficial" :
                   "Moderate confidence - consider your specific situation"}
                </p>
              </div>
            )}

            {/* Metadata */}
            {insight.createdAt && (
              <div className="pt-4 border-t border-slate-200 flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                <span>Generated on {new Date(insight.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <Button
              className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => {
                onApply?.();
                onClose();
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Apply This Insight
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 h-12 border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 transition-all duration-200"
            >
              Maybe Later
            </Button>
          </div>
          <p className="text-xs text-slate-500 text-center mt-3">
            💡 Tip: Most insights can be implemented in small daily steps
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
