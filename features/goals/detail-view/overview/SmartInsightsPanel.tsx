"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
  const [aiData, setAiData] = useState<{
    completionProbability?: number;
    estimatedCompletionDate?: Date;
    riskFactors?: string[];
    bottlenecks?: string[];
    suggestionImprovements?: string[];
    recommendations?: SmartRecommendation[];
  }>({});

  const insights = useMemo(() => {
    const goalTodos = todos.filter(t => t.goal_id === goal.id);
    const goalSubgoals = subgoals.filter(s => s.goal_id === goal.id);
    
    return GoalIntelligenceEngine.analyzeGoalHealth(goal, goalSubgoals, goalTodos);
  }, [goal, subgoals, todos]);

  const recommendations = useMemo(() => {
    const localRecs = GoalIntelligenceEngine.generateSmartRecommendations([goal], subgoals, todos);
    // Merge AI recs (if present) placing AI ones first by confidence
    const aiRecs = (aiData.recommendations || []).map(r => ({
      ...r,
      createdAt: r.createdAt ? new Date(r.createdAt) as unknown as Date : new Date()
    })) as SmartRecommendation[];
    const combined = [...aiRecs, ...localRecs];
    return combined.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
  }, [goal, subgoals, todos, aiData.recommendations]);

  const fetchAI = async () => {
    try {
      const res = await fetch("/api/goals/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, subgoals, todos })
      });
      if (!res.ok) throw new Error("Failed to fetch AI insights");
      const data = await res.json();
      setAiData({
        completionProbability: data.completionProbability,
        estimatedCompletionDate: data.estimatedCompletionDate ? new Date(data.estimatedCompletionDate) : undefined,
        riskFactors: data.riskFactors || [],
        bottlenecks: data.bottlenecks || [],
        suggestionImprovements: data.suggestionImprovements || [],
        recommendations: (data.recommendations || []).map((r: any) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          description: r.description,
          impact: r.impact,
          effort: r.effort,
          confidence: r.confidence,
          actionable: r.actionable,
          automatable: r.automatable,
          estimatedTimeToImplement: r.estimatedTimeToImplement,
          relatedGoalIds: r.relatedGoalIds || [goal.id],
          createdAt: r.createdAt ? new Date(r.createdAt) as unknown as Date : new Date(),
        }))
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal.id]);

  const refreshInsights = async () => {
    setIsRefreshing(true);
    await fetchAI();
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

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const toggleRecommendation = (id: string) => {
    setExpandedRecommendation(expandedRecommendation === id ? null : id);
  };

  const computedCompletionProbability = aiData.completionProbability ?? insights.completionProbability;
  const computedEstimatedDate = aiData.estimatedCompletionDate ?? insights.estimatedCompletionDate;
  const risks = (aiData.riskFactors?.length ? aiData.riskFactors : insights.riskFactors) || [];
  const bottlenecks = (aiData.bottlenecks?.length ? aiData.bottlenecks : insights.bottlenecks) || [];
  const improvements = (aiData.suggestionImprovements?.length ? aiData.suggestionImprovements : insights.suggestionImprovements) || [];

  return (
    <Card className="overflow-hidden border border-slate-200/60 shadow-xl bg-white/80 backdrop-blur-sm">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-30"></div>
              <div className="relative p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                Smart Insights
              </h3>
              <p className="text-slate-600 text-sm mt-0.5">AI-powered goal analysis and recommendations</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshInsights}
            disabled={isRefreshing}
            className="h-10 px-4 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Predictive Insights */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-indigo-600" />
            <h4 className="text-lg font-semibold text-slate-900">Predictive Analysis</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Completion Probability */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-700">Completion Probability</p>
                  <p className="text-xs text-slate-500">Based on current velocity</p>
                </div>
                <div className={`text-3xl font-black tracking-tight ${getProbabilityColor(computedCompletionProbability)}`}>
                  {Math.round(computedCompletionProbability)}%
                </div>
              </div>
              <div className="relative w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    computedCompletionProbability >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-600' :
                    computedCompletionProbability >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                    'bg-gradient-to-r from-red-500 to-rose-600'
                  }`}
                  style={{ width: `${computedCompletionProbability}%` }}
                />
              </div>
            </div>

            {/* Estimated Completion */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-slate-200">
                  <Clock className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Estimated Completion</p>
                  <p className="text-xs text-slate-500">Projected finish date</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-slate-900">
                  {computedEstimatedDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: computedEstimatedDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                  })}
                </div>
                <p className="text-xs text-slate-500">
                  {Math.ceil((computedEstimatedDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                </p>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          {risks.length > 0 && (
            <div className="p-6 rounded-2xl border border-red-200/60 bg-gradient-to-br from-red-50/50 to-rose-50/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h5 className="font-semibold text-red-900">Risk Factors</h5>
                  <p className="text-xs text-red-700">Issues requiring attention</p>
                </div>
              </div>
              <div className="space-y-2">
                {risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/80 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                    <span className="text-sm text-red-800 leading-relaxed">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottlenecks */}
          {bottlenecks.length > 0 && (
            <div className="p-6 rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/50 to-yellow-50/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h5 className="font-semibold text-amber-900">Bottlenecks</h5>
                  <p className="text-xs text-amber-700">Blocking progress</p>
                </div>
              </div>
              <div className="space-y-2">
                {bottlenecks.map((bottleneck, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/80 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    <span className="text-sm text-amber-800 leading-relaxed">{bottleneck}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Smart Recommendations */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-900">Recommendations</h4>
              <p className="text-xs text-slate-500">AI-generated suggestions</p>
            </div>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-green-50/30 border border-emerald-200/60">
              <div className="p-4 rounded-full bg-emerald-100 w-fit mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h5 className="text-lg font-semibold text-emerald-900 mb-2">All Systems Optimal</h5>
              <p className="text-sm text-emerald-700">Your goal is progressing well with no critical issues detected.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.slice(0, 3).map((recommendation, index) => {
                const isExpanded = expandedRecommendation === recommendation.id;
                const shortDesc = truncateDescription(recommendation.description);
                const showReadMore = recommendation.description.length > 120;
                
                return (
                  <div 
                    key={recommendation.id} 
                    className="group p-6 rounded-2xl border border-slate-200/60 bg-white hover:border-slate-300/60 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        recommendation.impact === 'high' ? 'bg-red-100 text-red-600' :
                        recommendation.impact === 'medium' ? 'bg-amber-100 text-amber-600' :
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {getRecommendationIcon(recommendation)}
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-3">
                            <h5 className="text-lg font-semibold text-slate-900 leading-tight">{recommendation.title}</h5>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={`${getEffortColor(recommendation.effort)} text-xs font-medium`}>
                                {recommendation.effort}
                              </Badge>
                              <Badge variant="outline" className="text-xs font-medium border-slate-300 text-slate-600">
                                {recommendation.confidence}% confidence
                              </Badge>
                              <Badge 
                                className={`text-xs font-medium ${
                                  recommendation.impact === 'high' ? 'bg-red-100 text-red-700' :
                                  recommendation.impact === 'medium' ? 'bg-amber-100 text-amber-700' :
                                  'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {recommendation.impact} impact
                              </Badge>
                            </div>
                          </div>
                          
                          {recommendation.actionable && (
                            <Button 
                              size="sm" 
                              className="bg-slate-900 hover:bg-slate-800 text-white border-0 shadow-sm"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Apply
                            </Button>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <p className="text-slate-700 leading-relaxed">
                            {isExpanded ? recommendation.description : shortDesc}
                          </p>
                          
                          {showReadMore && (
                            <button
                              onClick={() => toggleRecommendation(recommendation.id)}
                              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors flex items-center gap-1"
                            >
                              {isExpanded ? 'Show less' : 'Read more'}
                              <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-6 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {recommendation.estimatedTimeToImplement}
                          </span>
                          {recommendation.automatable && (
                            <span className="flex items-center gap-1 text-indigo-600">
                              <Zap className="w-3 h-3" />
                              Automatable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {recommendations.length > 3 && (
                <Button 
                  variant="outline" 
                  className="w-full h-12 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                >
                  View All {recommendations.length} Recommendations
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Improvement Suggestions */}
        {improvements.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-900">Quick Wins</h4>
                <p className="text-xs text-slate-500">Easy improvements to implement</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {improvements.map((suggestion, index) => (
                <div key={index} className="group flex items-start gap-4 p-4 rounded-xl border border-blue-200/60 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 hover:border-blue-300/60 transition-all duration-200">
                  <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-blue-900 leading-relaxed font-medium">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SmartInsightsPanel;
