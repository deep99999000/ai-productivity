"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Target,
  Zap,
  ArrowRight,
  RefreshCw,
  Plus
} from "lucide-react";
import { GoalIntelligenceEngine, type SmartRecommendation } from "@/features/goals/ai/smartRecommendations";
import type { Goal } from "@/features/goals/types/goalSchema";
import type { Subgoal } from "@/features/subGoals/subGoalschema";
import type { Todo } from "@/features/todo/todoSchema";

interface SmartInsightsPanelProps {
  goal: Goal;
  subgoals: Subgoal[];
  todos: Todo[];
}

const SmartInsightsPanel: React.FC<SmartInsightsPanelProps> = ({ goal, subgoals, todos }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const insights = useMemo(() => {
    const goalTodos = todos.filter(t => t.goal_id === goal.id);
    const goalSubgoals = subgoals.filter(s => s.goal_id === goal.id);
    
    return GoalIntelligenceEngine.analyzeGoalHealth(goal, goalSubgoals, goalTodos);
  }, [goal, subgoals, todos]);

  const recommendations = useMemo(() => {
    return GoalIntelligenceEngine.generateSmartRecommendations([goal], subgoals, todos);
  }, [goal, subgoals, todos]);

  const refreshInsights = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const getRecommendationIcon = (recommendation: SmartRecommendation) => {
    switch (recommendation.type) {
      case 'optimization':
        return <Zap className="w-5 h-5" />;
      case 'risk':
        return <AlertTriangle className="w-5 h-5" />;
      case 'opportunity':
        return <TrendingUp className="w-5 h-5" />;
      case 'automation':
        return <Brain className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getRecommendationColor = (recommendation: SmartRecommendation) => {
    switch (recommendation.impact) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getEffortColor = (effort: SmartRecommendation['effort']) => {
    switch (effort) {
      case 'quick':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'complex':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">Smart Insights</h3>
            <p className="text-sm text-gray-600">AI-powered goal analysis and recommendations</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshInsights}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Predictive Insights */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Predictive Analysis
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Completion Probability */}
          <div className="p-4 border rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Completion Probability</span>
              <span className={`text-2xl font-bold ${getProbabilityColor(insights.completionProbability)}`}>
                {Math.round(insights.completionProbability)}%
              </span>
            </div>
            <div className="w-full bg-white rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${insights.completionProbability}%` }}
              />
            </div>
          </div>

          {/* Estimated Completion */}
          <div className="p-4 border rounded-xl bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Estimated Completion</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {insights.estimatedCompletionDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        {insights.riskFactors.length > 0 && (
          <div className="p-4 border border-red-200 rounded-xl bg-red-50">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-800">Risk Factors</span>
            </div>
            <ul className="space-y-1">
              {insights.riskFactors.map((risk, index) => (
                <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bottlenecks */}
        {insights.bottlenecks.length > 0 && (
          <div className="p-4 border border-yellow-200 rounded-xl bg-yellow-50">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Identified Bottlenecks</span>
            </div>
            <ul className="space-y-1">
              {insights.bottlenecks.map((bottleneck, index) => (
                <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                  {bottleneck}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Smart Recommendations */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          Smart Recommendations
        </h4>

        {recommendations.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">No recommendations at this time.</p>
            <p className="text-xs">Your goal is on track!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((recommendation) => (
              <div 
                key={recommendation.id} 
                className={`p-4 border-2 rounded-xl transition-all hover:shadow-md ${getRecommendationColor(recommendation)}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    recommendation.impact === 'high' ? 'bg-red-100 text-red-600' :
                    recommendation.impact === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {getRecommendationIcon(recommendation)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-semibold text-gray-900">{recommendation.title}</h5>
                      <Badge className={getEffortColor(recommendation.effort)}>
                        {recommendation.effort}
                      </Badge>
                      <Badge variant="outline">
                        {recommendation.confidence}% confidence
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700">{recommendation.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Impact: {recommendation.impact}</span>
                        <span>•</span>
                        <span>Time: {recommendation.estimatedTimeToImplement}</span>
                      </div>
                      
                      {recommendation.actionable && (
                        <Button size="sm" variant="outline">
                          <Plus className="w-3 h-3 mr-1" />
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {recommendations.length > 3 && (
              <Button variant="outline" className="w-full">
                View All {recommendations.length} Recommendations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Improvement Suggestions */}
      {insights.suggestionImprovements.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Quick Improvements
          </h4>
          
          <div className="space-y-2">
            {insights.suggestionImprovements.map((suggestion, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-blue-800">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default SmartInsightsPanel;
