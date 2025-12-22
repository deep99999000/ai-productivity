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
  Clock,
  CheckCircle2,
  ArrowRight,
  Zap,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIInsightsDialog from '../detail/AIInsightsDialog';
import type { AIInsightResponse } from '@/features/goals/types';
import { useGoalAIInsight } from '@/features/goals/aiInsightStore';

interface SmartAIInsightsCardProps {
  goalId: number;
  goal: any;
  subgoals: any[];
  todos: any[];
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'optimization': return <Target className="w-4 h-4" />;
    case 'risk': return <AlertTriangle className="w-4 h-4" />;
    case 'opportunity': return <TrendingUp className="w-4 h-4" />;
    case 'automation': return <Zap className="w-4 h-4" />;
    default: return <Lightbulb className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'optimization': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'risk': return 'bg-red-100 text-red-700 border-red-200';
    case 'opportunity': return 'bg-green-100 text-green-700 border-green-200';
    case 'automation': return 'bg-purple-100 text-purple-700 border-purple-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'high': return 'text-red-600';
    case 'medium': return 'text-orange-600';
    case 'low': return 'text-green-600';
    default: return 'text-slate-600';
  }
};

const SmartAIInsightsCard: React.FC<SmartAIInsightsCardProps> = ({
  goalId,
  goal,
  subgoals,
  todos
}) => {
  const [error, setError] = useState<string | null>(null);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  
  const { 
    insightsCache, 
    loading: isLoading, 
    setInsights, 
    setLoading, 
    shouldFetch, 
    getInsights, 
    clearCache 
  } = useGoalAIInsight();

  const insights = getInsights(goalId);

  const fetchInsights = async (force = false) => {
    if (!goal) return;
    
    // Check if we need to fetch
    if (!force && !shouldFetch(goalId)) {
      console.log(`[Goal AI] Using cached insights for goal ${goalId}`);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`[Goal AI] Fetching fresh insights for goal ${goalId}`);
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
        throw new Error(`Failed to fetch insights: ${response.status}`);
      }
      
      const data = await response.json();
      setInsights(goalId, data);
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      setError(error instanceof Error ? error.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [goalId, goal, subgoals.length, todos.length]);

  const topRecommendations = insights?.recommendations
    ?.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.impact as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.impact as keyof typeof priorityOrder] || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.confidence - a.confidence;
    })
    ?.slice(0, showAllRecommendations ? undefined : 3) || [];

  return (
    <Card className="border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group" 
          onClick={() => setShowDialog(true)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                AI Smart Insights
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Click to view detailed analysis
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              clearCache(goalId);
              fetchInsights(true);
            }}
            disabled={isLoading}
            className="h-8 px-3"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          // Loading State
          <div className="space-y-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </div>
        ) : error ? (
          // Error State
          <div className="text-center py-6">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 text-sm mb-3">{error}</p>
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                fetchInsights();
              }} 
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : insights ? (
          // Success State with Preview
          <>
            {/* Completion Probability */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  Completion Forecast
                </h4>
                <Badge variant="outline" className="text-xs">
                  {insights.completionProbability}% likely
                </Badge>
              </div>
              <Progress 
                value={insights.completionProbability} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-slate-600">
                <span>Current trajectory</span>
                <span>Est. completion: {new Date(insights.estimatedCompletionDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Quick Preview Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{insights.recommendations.length}</div>
                <div className="text-xs text-blue-700">Recommendations</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{insights.suggestionImprovements.length}</div>
                <div className="text-xs text-green-700">Quick Wins</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">{insights.riskFactors.length}</div>
                <div className="text-xs text-red-700">Risk Factors</div>
              </div>
            </div>

            {/* Top Recommendation Preview */}
            {topRecommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-500" />
                  Top Recommendation
                </h4>
                
                <div className="p-3 border border-slate-200 rounded-lg bg-white hover:border-indigo-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(topRecommendations[0].type)}`}>
                      {getTypeIcon(topRecommendations[0].type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-slate-900 text-sm leading-tight">
                        {topRecommendations[0].title}
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-2">
                        {topRecommendations[0].description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`text-xs ${getImpactColor(topRecommendations[0].impact)}`}>
                          {topRecommendations[0].impact}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {topRecommendations[0].confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {insights.recommendations.length > 1 && (
                  <div className="text-center">
                    <p className="text-xs text-slate-500">
                      +{insights.recommendations.length - 1} more recommendations • Click to view all
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Click indicator */}
            <div className="text-center py-2 border-t border-slate-200">
              <p className="text-xs text-slate-500 group-hover:text-indigo-600 transition-colors">
                💡 Click anywhere to view detailed analysis
              </p>
            </div>
          </>
        ) : (
          // Empty State
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-3">No insights available</p>
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                fetchInsights();
              }} 
              variant="outline"
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

export default SmartAIInsightsCard;
