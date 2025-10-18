"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Brain, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Lightbulb,
  BarChart3,
  Zap,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import AIInsightsDialog from './AIInsightsDialog';
import type { AIInsightResponse } from '@/features/goals/types/ai-insights';

interface AIInsightsOverviewProps {
  goalId: number;
  goal: any;
  subgoals?: any[];
  todos?: any[];
  className?: string;
  compact?: boolean;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'optimization': return <Target className="w-3 h-3" />;
    case 'risk': return <AlertTriangle className="w-3 h-3" />;
    case 'opportunity': return <TrendingUp className="w-3 h-3" />;
    case 'automation': return <Zap className="w-3 h-3" />;
    default: return <Lightbulb className="w-3 h-3" />;
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};

const AIInsightsOverview: React.FC<AIInsightsOverviewProps> = ({
  goalId,
  goal,
  subgoals = [],
  todos = [],
  className = "",
  compact = false
}) => {
  const [insights, setInsights] = useState<AIInsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const fetchInsights = async () => {
    if (!goal) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/goals/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          subgoals,
          todos
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }
      
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      setError('Failed to load AI insights');
      console.error('AI insights error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [goalId, goal?.id]);

  const topRecommendations = insights?.recommendations
    ?.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.impact as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.impact as keyof typeof priorityOrder] || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.confidence - a.confidence;
    })
    ?.slice(0, compact ? 2 : 3) || [];

  if (compact) {
    return (
      <Card className={`border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 group ${className}`}
            onClick={() => setShowDialog(true)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600 group-hover:scale-105 transition-transform" />
              <span className="font-medium text-slate-900 text-sm group-hover:text-purple-700 transition-colors">AI Analysis</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                fetchInsights();
              }}
              disabled={isLoading}
              className="h-6 w-6 p-0"
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
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ) : insights ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Success Rate</span>
                <Badge variant="outline" className="text-xs">
                  {insights.completionProbability}%
                </Badge>
              </div>
              
              {insights.riskFactors.length > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-600">{insights.riskFactors.length} risk(s)</span>
                </div>
              )}

              {topRecommendations.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-slate-600 font-medium">Top Recommendations:</span>
                  {topRecommendations.map((rec, index) => (
                    <div key={rec.id} className="flex items-center gap-2 text-xs">
                      {getTypeIcon(rec.type)}
                      <span className="text-slate-700 truncate">{rec.title}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-center pt-1 border-t border-slate-200">
                <span className="text-xs text-slate-500 group-hover:text-purple-600 transition-colors">
                  Click for details
                </span>
              </div>
            </div>
          ) : error ? (
            <p className="text-xs text-red-600">{error}</p>
          ) : (
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                fetchInsights();
              }} 
              variant="ghost" 
              className="text-xs w-full"
            >
              Generate Insights
            </Button>
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
  }

  return (
    <Card className={`border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 group ${className}`}
          onClick={() => setShowDialog(true)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 group-hover:scale-105 transition-transform" />
            <span className="text-lg group-hover:text-purple-700 transition-colors">AI Goal Analysis</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fetchInsights();
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-600 text-sm mb-2">{error}</p>
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                fetchInsights();
              }} 
              variant="outline"
            >
              Retry
            </Button>
          </div>
        ) : insights ? (
          <>
            {/* Success Probability */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">Completion Probability</span>
                <Badge variant="outline">{insights.completionProbability}%</Badge>
              </div>
              <Progress value={insights.completionProbability} className="h-2" />
              <p className="text-xs text-slate-600">
                Estimated completion: {new Date(insights.estimatedCompletionDate).toLocaleDateString()}
              </p>
            </div>

            {/* Quick Preview Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-sm font-bold text-green-600">{insights.recommendations.length}</div>
                <div className="text-xs text-green-700">Recommendations</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-sm font-bold text-blue-600">{insights.suggestionImprovements.length}</div>
                <div className="text-xs text-blue-700">Quick Wins</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <div className="text-sm font-bold text-red-600">{insights.riskFactors.length}</div>
                <div className="text-xs text-red-700">Risks</div>
              </div>
            </div>

            {/* Top Recommendation Preview */}
            {topRecommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-500" />
                  Top Recommendation
                </h4>
                <div className="p-3 border border-slate-200 rounded-lg bg-white hover:border-indigo-300 transition-colors">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{getTypeIcon(topRecommendations[0].type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{topRecommendations[0].title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-xs ${getImpactColor(topRecommendations[0].impact)}`}>
                          {topRecommendations[0].impact}
                        </Badge>
                        <span className="text-xs text-slate-500">{topRecommendations[0].confidence}% confidence</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Click to expand indicator */}
            <div className="text-center py-2 border-t border-slate-200">
              <p className="text-xs text-slate-500 group-hover:text-purple-600 transition-colors">
                💡 Click to view detailed analysis
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-3">No insights available</p>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                fetchInsights();
              }} 
              variant="outline"
            >
              Generate AI Analysis
            </Button>
          </div>
        )}
      </CardContent>

 
    </Card>
  );
};

export default AIInsightsOverview;
