import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Target, Lightbulb, CheckCircle, Sparkles, BarChart3 } from "lucide-react";
import { typeConfig } from "../config";
import type { AISuggestion } from "../types";

interface InsightDetailDialogProps {
  insight: AISuggestion | null;
  onClose: () => void;
  onApply?: () => void;
}

export function InsightDetailDialog({
  insight,
  onClose,
  onApply,
}: InsightDetailDialogProps) {
  if (!insight) return null;

  const config = typeConfig[insight.type];

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

  const renderConfidenceBar = (score: number) => (
    <div className="w-full bg-slate-100 rounded-full h-1.5">
      <div
        className={`h-full rounded-full ${getConfidenceBg(score)}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );

  // ✅ Extract action steps from description
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
        if (action.length > 10 && 
            !action.toLowerCase().includes('indicating') &&
            !action.toLowerCase().includes('you\'ve') &&
            !action.toLowerCase().includes('building') &&
            action.split(' ').length > 2) {
          actions.push(action);
        }
      }
    });
    
    return actions.length > 0 ? actions : [
      "Review your current schedule",
      "Set daily reminders", 
      "Track progress for 7 days"
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

  // ✅ Render the parsed content
  const renderContent = (desc: string) => {
    const { mainContent, actionSteps } = parseDescription(desc);
    const extractedActions = actionSteps.length > 0 ? actionSteps : extractActionSteps(desc);

    return (
      <>
        {/* Main Content */}
        <div className="mb-6">
          {mainContent.map((paragraph, i) => (
            <p key={i} className="text-slate-600 leading-relaxed mb-3 last:mb-0 text-sm">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Action Steps */}
        {extractedActions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <h4 className="font-medium text-slate-700 text-sm">Recommended Actions</h4>
            </div>
            <div className="space-y-2">
              {extractedActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-emerald-600 text-xs font-medium">{i + 1}</span>
                  </div>
                  <span className="text-sm text-slate-600 leading-relaxed">{action}</span>
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
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-xl">
        {/* Clean Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200">
              <span className="text-xl">{config.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold text-slate-800 mb-2">
                {insight.title}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs px-2 py-1">
                  {config.label}
                </Badge>
                {insight.score !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="h-3 w-3 text-slate-400" />
                    <span className={`text-xs font-medium ${getConfidenceColor(insight.score)}`}>
                      {insight.score}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 max-h-[60vh] overflow-y-auto">
          {/* Parsed content */}
          {renderContent(insight.description)}

          {/* Tags */}
          {insight.tags && insight.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <h4 className="font-medium text-slate-700 text-sm">Related Topics</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {insight.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs px-2.5 py-1 rounded-md border-slate-200 bg-white text-slate-600"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Confidence Score */}
          {insight.score !== undefined && (
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-slate-600 font-medium">AI Confidence</span>
                <span className={`font-semibold ${getConfidenceColor(insight.score)}`}>
                  {insight.score}%
                </span>
              </div>
              {renderConfidenceBar(insight.score)}
            </div>
          )}

          {/* Metadata */}
          {insight.createdAt && (
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>Generated {insight.createdAt}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <Button
            className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl"
            onClick={() => {
              onApply?.();
              onClose();
            }}
          >
            Apply Suggestion
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 h-10 border-slate-200 hover:bg-slate-50 rounded-xl font-medium text-slate-700"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}