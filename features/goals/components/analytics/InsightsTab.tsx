"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, AlertTriangle, Clock, Lightbulb, Target, Zap, ChevronRight } from "lucide-react";
import type { AIInsightResponse } from "../../types";

interface InsightsTabProps {
  aiInsights: AIInsightResponse | null;
  isLoadingAI: boolean;
  onRefresh: () => void;
  onSelectRecommendation: (rec: AIInsightResponse['recommendations'][0]) => void;
}

const InsightsTab: React.FC<InsightsTabProps> = ({ aiInsights, isLoadingAI, onRefresh, onSelectRecommendation }) => {
  return (
    <div className="space-y-8 mt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">AI-Powered Goal Analysis</h2>
            <p className="text-sm text-slate-600">Advanced insights and recommendations for your goal</p>
          </div>
        </div>
        <Button onClick={onRefresh} disabled={isLoadingAI} className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700">
          {isLoadingAI ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Refresh Analysis
            </>
          )}
        </Button>
      </div>

      {aiInsights ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-emerald-700">{aiInsights.completionProbability}%</div>
                <div className="text-sm text-emerald-600 font-medium">Completion Probability</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="text-lg font-bold text-blue-700">{new Date(aiInsights.estimatedCompletionDate).toLocaleDateString()}</div>
                <div className="text-sm text-blue-600 font-medium">Estimated Completion</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-700">{aiInsights.recommendations.length}</div>
                <div className="text-sm text-purple-600 font-medium">AI Recommendations</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {aiInsights.riskFactors.length > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700"><AlertTriangle className="w-5 h-5" />Risk Factors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiInsights.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-red-800">{risk}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {aiInsights.bottlenecks.length > 0 && (
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700"><Clock className="w-5 h-5" />Bottlenecks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiInsights.bottlenecks.map((bottleneck, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-amber-800">{bottleneck}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-purple-600" />AI Recommendations</CardTitle>
              <p className="text-sm text-slate-600">Personalized suggestions to improve your goal completion</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.recommendations.map((recommendation) => (
                  <Card key={recommendation.id} className="cursor-pointer transition-all duration-300 hover:shadow-md border-l-4 border-l-purple-500 hover:border-l-purple-600" onClick={() => onSelectRecommendation(recommendation)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${recommendation.type === 'optimization' ? 'bg-blue-100 text-blue-600' : recommendation.type === 'risk' ? 'bg-red-100 text-red-600' : recommendation.type === 'opportunity' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                          {recommendation.type === 'optimization' ? <Target className="w-5 h-5" /> : recommendation.type === 'risk' ? <AlertTriangle className="w-5 h-5" /> : recommendation.type === 'opportunity' ? <Lightbulb className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-slate-900">{recommendation.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={recommendation.impact === 'high' ? 'destructive' : recommendation.impact === 'medium' ? 'default' : 'secondary'}>
                                {recommendation.impact} impact
                              </Badge>
                              <Badge variant="outline">{recommendation.confidence}% confidence</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{recommendation.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>⏱️ {recommendation.estimatedTimeToImplement}</span>
                            <span>🔧 {recommendation.effort} effort</span>
                            {recommendation.actionable && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Actionable</Badge>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {aiInsights.suggestionImprovements.length > 0 && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700"><Zap className="w-5 h-5" />Quick Improvements</CardTitle>
                <p className="text-sm text-slate-600">Fast wins to boost your progress</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiInsights.suggestionImprovements.map((improvement, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm text-green-800">{improvement}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          {isLoadingAI ? (
            <div className="space-y-4">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
              <p className="text-lg font-medium text-slate-700">Analyzing your goal...</p>
              <p className="text-sm text-slate-500">AI is processing your data to generate insights</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Brain className="w-16 h-16 mx-auto text-slate-400" />
              <p className="text-lg font-medium text-slate-700">No AI insights yet</p>
              <p className="text-sm text-slate-500">Click "Refresh Analysis" to generate AI-powered insights for your goal</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InsightsTab;
