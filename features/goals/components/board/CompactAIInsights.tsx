"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Brain, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  BarChart3,
  ChevronRight
} from 'lucide-react';
import AIInsightsDialog from '../detail/AIInsightsDialog';
import type { AIInsightResponse } from '@/features/goals/types';

interface CompactAIInsightsProps {
  goalId: number;
  goal: any;
  subgoals: any[];
  todos: any[];
  onExpand?: () => void;
}

const CompactAIInsights: React.FC<CompactAIInsightsProps> = ({
  goalId,
  goal,
  subgoals,
  todos,
  onExpand
}) => {
  const [insights, setInsights] = useState<AIInsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const fetchInsights = async () => {
    if (!goal) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/goals/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, subgoals, todos })
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [goalId]);

  const topRecommendation = insights?.recommendations?.[0];
  const highRisks = insights?.riskFactors?.length || 0;

  return (
    <Card className="border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
          onClick={() => setShowDialog(true)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-slate-900 text-sm group-hover:text-purple-700 transition-colors">AI Insights</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fetchInsights();
            }}
            disabled={isLoading}
            className="h-7 w-7 p-0"
          >
            {isLoading ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ) : insights ? (
          <div className="space-y-3">
            {/* Completion Probability */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-slate-600">Completion</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {insights.completionProbability}%
              </Badge>
            </div>

            {/* Top Recommendation */}
            {topRecommendation && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3 text-indigo-500" />
                  <span className="text-xs text-slate-600">Top Priority</span>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 group-hover:bg-indigo-50 transition-colors">
                  <p className="text-xs text-slate-800 font-medium leading-tight">
                    {topRecommendation.title}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        topRecommendation.impact === 'high' ? 'text-red-600' :
                        topRecommendation.impact === 'medium' ? 'text-orange-600' : 'text-green-600'
                      }`}
                    >
                      {topRecommendation.impact}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {topRecommendation.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Alert */}
            {highRisks > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-600">Risks Detected</span>
                </div>
                <Badge variant="destructive" className="text-xs">
                  {highRisks}
                </Badge>
              </div>
            )}

            {/* Click to expand indicator */}
            <div className="text-center pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500 group-hover:text-indigo-600 transition-colors">
                Click for detailed analysis
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                fetchInsights();
              }} 
              variant="ghost" 
              className="text-xs"
            >
              Generate Insights
            </Button>
          </div>
        )}
      </CardContent>

      {/* AI Insights Dialog */}
      <AIInsightsDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        insights={insights}
        goalName={goal?.name || 'Goal'}
        isLoading={isLoading}
      />
    </Card>
  );
};

export default CompactAIInsights;
