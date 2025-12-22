"use client";

import React from 'react';
import BaseDialog from '@/components/BaseDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Lightbulb,
  Clock,
  CheckCircle2,
  Zap,
  BarChart3,
  Calendar,
  Users,
  Share2,
  ChevronLeft,
  Info,
  CheckSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { AIInsightResponse } from '@/features/goals/types';

interface AIInsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insights: AIInsightResponse | null;
  goalName: string;
  isLoading?: boolean;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'optimization': return <Target className="w-5 h-5" />;
    case 'risk': return <AlertTriangle className="w-5 h-5" />;
    case 'opportunity': return <TrendingUp className="w-5 h-5" />;
    case 'automation': return <Zap className="w-5 h-5" />;
    default: return <Lightbulb className="w-5 h-5" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'optimization': return 'from-blue-500 to-blue-600';
    case 'risk': return 'from-red-500 to-red-600';
    case 'opportunity': return 'from-green-500 to-green-600';
    case 'automation': return 'from-purple-500 to-purple-600';
    default: return 'from-slate-500 to-slate-600';
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

const AIInsightsDialog: React.FC<AIInsightsDialogProps> = ({
  open,
  onOpenChange,
  insights,
  goalName,
  isLoading = false
}) => {

  return (
    <BaseDialog
      isOpen={open}
      setisOpen={onOpenChange}
      title="AI Goal Analysis"
      description={`Comprehensive insights for "${goalName}"`}
      contentClassName="max-w-4xl w-full h-[85vh] flex flex-col"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-6 px-1">
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-40 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          ) : insights ? (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Completion Probability */}
                  <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Success Rate</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {insights.completionProbability}%
                      </div>
                      <Progress value={insights.completionProbability} className="h-2 mb-2" />
                      <p className="text-xs text-blue-700">
                        Est. completion: {new Date(insights.estimatedCompletionDate).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Recommendations Count */}
                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-900">Recommendations</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {insights.recommendations.length}
                      </div>
                      <p className="text-xs text-green-700">
                        {insights.recommendations.filter(r => r.actionable).length} ready to implement
                      </p>
                    </CardContent>
                  </Card>

                  {/* Risk Assessment */}
                  <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-900">Risk Factors</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600 mb-2">
                        {insights.riskFactors.length}
                      </div>
                      <p className="text-xs text-red-700">
                        {insights.bottlenecks.length} active bottlenecks
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Improvements */}
                {insights.suggestionImprovements.length > 0 && (
                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        Quick Wins
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {insights.suggestionImprovements.map((improvement, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-green-800 leading-relaxed">
                              {improvement}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Recommendations */}
                {insights.recommendations.length > 0 && (
                  <Card className="border-slate-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="w-5 h-5 text-indigo-500" />
                        AI Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {insights.recommendations.map((rec, index) => (
                          <motion.div
                            key={rec.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 border border-slate-200 rounded-lg bg-white hover:shadow-sm transition-all duration-200"
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${getTypeColor(rec.type)} text-white`}>
                                {getTypeIcon(rec.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h5 className="font-semibold text-slate-900 text-sm leading-tight">
                                    {rec.title}
                                  </h5>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Badge variant="outline" className={`text-xs ${getImpactColor(rec.impact)}`}>
                                      {rec.impact} impact
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {rec.confidence}%
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                  {rec.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {rec.estimatedTimeToImplement}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <CheckSquare className="w-3 h-3" />
                                      {rec.effort} effort
                                    </div>
                                    {rec.automatable && (
                                      <div className="flex items-center gap-1 text-purple-600">
                                        <Zap className="w-3 h-3" />
                                        Automatable
                                      </div>
                                    )}
                                  </div>
                                  {rec.actionable && (
                                    <div className="flex items-center gap-1 text-xs text-green-600">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Ready to implement
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Risk Factors & Bottlenecks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Risk Factors */}
                  {insights.riskFactors.length > 0 && (
                    <Card className="border-red-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          Risk Factors
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {insights.riskFactors.map((risk, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                            >
                              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-red-800 leading-relaxed">
                                {risk}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Bottlenecks */}
                  {insights.bottlenecks.length > 0 && (
                    <Card className="border-orange-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Clock className="w-5 h-5 text-orange-500" />
                          Current Bottlenecks
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {insights.bottlenecks.map((bottleneck, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                            >
                              <Clock className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-orange-800 leading-relaxed">
                                {bottleneck}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            ) : null}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t border-slate-200">
        <Button 
          variant="outline" 
          onClick={() => onOpenChange(false)}
          className="px-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Close
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Analysis
          </Button>
          <Button 
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Start Implementation
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
};

export default AIInsightsDialog;
