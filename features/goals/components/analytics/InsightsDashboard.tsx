"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Activity,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  Share2,
  RefreshCw,
  Calendar,
  Users,
  Flame,
  Rocket,
  Focus,
  Gauge,
  BarChart2,
  PieChart as PieIcon,
  Layers,
  Battery,
  Compass,
  Map,
  Lightbulb,
  ChevronRight,
  Zap,
  ChevronLeft,
  User,
} from "lucide-react";
import type { Goal } from "@/features/goals/schema";
import type { Subgoal } from "@/features/subGoals/schema";
import type { Todo } from "@/features/todo/schema";
import { AnalyticsFloatingActions } from "./AnalyticsFloatingActions";

// New: types and utils
import type { AIInsightResponse, SmartInsight } from "@/features/goals/types";
import {
  calculateVelocityTrends,
  analyzeProductivityPatterns,
  analyzeCategoryPerformance,
  calculateGoalHealthScores,
  calculatePerformanceMetrics,
  calculateBurndownChart,
  calculateVelocityComparison,
  calculateTimeDistribution,
  calculateProgressTrends,
  analyzePriorityEffectiveness,
  calculateCompletionForecast,
  calculateProductivityHeatmap,
  calculateSprintAnalytics,
  calculateCollaborationMetrics,
  calculateFocusTimeMetrics,
  analyzeDifficultyCorrelation,
  analyzeEnergyPatterns,
  calculateGoalRiskAssessment,
  calculateGoalComparison,
  calculateMilestoneAnalysis,
  calculateCurrentStreak,
  calculateLongestStreak,
} from "./analyticsUtils";

// New: Tab components
import OverviewTab from "./OverviewTab";
import PerformanceTab from "./PerformanceTab";
import TrendsTab from "./TrendsTab";
import InsightsTab from "./InsightsTab";
import PatternsTab from "./PatternsTab";
import ForecastsTab from "./ForecastsTab";

interface EnhancedInsightsDashboardProps {
  goals: Goal[];
  subgoals: Subgoal[];
  todos: Todo[];
  goalId?: number;
}

const EnhancedInsightsDashboard: React.FC<EnhancedInsightsDashboardProps> = ({
  goals,
  subgoals,
  todos,
  goalId
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [aiInsights, setAiInsights] = useState<AIInsightResponse | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [selectedAIRecommendation, setSelectedAIRecommendation] = useState<AIInsightResponse['recommendations'][0] | null>(null);

  // Fetch AI insights
  const fetchAIInsights = async () => {
    if (!goalId || !goals.length) return;
    setIsLoadingAI(true);
    try {
      const response = await fetch('/api/goals/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goals[0], subgoals, todos })
      });
      if (response.ok) {
        const data = await response.json();
        setAiInsights(data);
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    if (goalId && goals.length > 0 && activeTab === 'insights') {
      fetchAIInsights();
    }
  }, [goalId, goals.length, activeTab]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const now = new Date();
    const timeframeDays = { week: 7, month: 30, quarter: 90, year: 365 } as const;
    const periodStart = new Date(now.getTime() - timeframeDays[timeframe] * 24 * 60 * 60 * 1000);

    const periodTodos = todos.filter(todo => {
      const createdDate = new Date(todo.startDate || '');
      const completedDate = todo.isDone ? new Date(todo.endDate || todo.startDate || '') : null;
      return createdDate >= periodStart || (completedDate && completedDate >= periodStart);
    });

    const completedTodos = periodTodos.filter(t => t.isDone);
    const overdueTodos = periodTodos.filter(t => !t.isDone && t.endDate && new Date(t.endDate) < now);
    const inProgressTodos = periodTodos.filter(t => !t.isDone && (!t.endDate || new Date(t.endDate) >= now));

    const velocityData = calculateVelocityTrends(completedTodos, timeframeDays[timeframe]);
    const productivityPatterns = analyzeProductivityPatterns(completedTodos);
    const categoryPerformance = analyzeCategoryPerformance(goals, todos);
    const goalHealthScores = calculateGoalHealthScores(goals, subgoals, todos);
    const performanceMetrics = calculatePerformanceMetrics(todos, goals);
    const burndownData = calculateBurndownChart(todos, goals[0]?.endDate);
    const velocityTrends = calculateVelocityComparison(completedTodos, timeframe);
    const timeDistribution = calculateTimeDistribution(completedTodos);
    const progressTrends = calculateProgressTrends(todos, timeframe);
    const priorityEffectiveness = analyzePriorityEffectiveness(todos);
    const completionForecast = calculateCompletionForecast(todos, goals[0]);
    const productivityHeatmap = calculateProductivityHeatmap(completedTodos);
    const sprintAnalytics = calculateSprintAnalytics(todos, timeframe);
    const collaborationMetrics = calculateCollaborationMetrics(goals, subgoals, todos);
    const focusTimeAnalysis = calculateFocusTimeMetrics(todos, timeframe);
    const difficultyAnalysis = analyzeDifficultyCorrelation(todos);
    const energyPatterns = analyzeEnergyPatterns(todos);
    const riskAssessment = calculateGoalRiskAssessment(goals[0], subgoals, todos);
    const goalComparison = calculateGoalComparison(goals, todos);
    const milestoneAnalysis = calculateMilestoneAnalysis(subgoals, todos);

    const completionRate = periodTodos.length > 0 ? (completedTodos.length / periodTodos.length) * 100 : 0;
    const averageCompletionTime = completedTodos.length > 0 ? Math.round(
      completedTodos.reduce((acc, todo) => {
        if (!todo.startDate || !todo.endDate) return acc;
        const time = (new Date(todo.endDate).getTime() - new Date(todo.startDate).getTime()) / (1000 * 60 * 60 * 24);
        return acc + time;
      }, 0) / completedTodos.length * 10
    ) / 10 : 0;

    const timeToGoal = goals[0]?.endDate ? Math.ceil((new Date(goals[0].endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
    const currentStreak = calculateCurrentStreak(completedTodos);
    const longestStreak = calculateLongestStreak(completedTodos);
    const velocityThisWeek = velocityTrends.current || 0;
    const velocityChange = velocityTrends.change || 0;

    return {
      completedTodos: completedTodos.length,
      totalTodos: periodTodos.length,
      overdueTodos: overdueTodos.length,
      inProgressTodos: inProgressTodos.length,
      completionRate,
      averageCompletionTime,
      timeToGoal,
      currentStreak,
      longestStreak,
      velocityThisWeek,
      velocityChange,
      velocityData,
      productivityPatterns,
      categoryPerformance,
      goalHealthScores,
      performanceMetrics,
      burndownData,
      velocityTrends,
      timeDistribution,
      progressTrends,
      priorityEffectiveness,
      completionForecast,
      productivityHeatmap,
      sprintAnalytics,
      collaborationMetrics,
      focusTimeAnalysis,
      difficultyAnalysis,
      energyPatterns,
      riskAssessment,
      goalComparison,
      milestoneAnalysis,
    };
  }, [goals, subgoals, todos, timeframe]);

  // Smart insights (kept as-is)
  const smartInsights = useMemo(() => {
    const insights: SmartInsight[] = [];
    if (analytics.completionRate >= 85) {
      insights.push({
        id: 'high-performance',
        type: 'achievement',
        priority: 'high',
        title: 'Exceptional Performance',
        description: `Outstanding ${analytics.completionRate.toFixed(1)}% completion rate this ${timeframe}!`,
        impact: 95,
        confidence: 100,
        actionable: false,
        category: 'Performance',
        icon: <Rocket className="w-5 h-5" />, // icon placeholder
        color: 'from-yellow-400 to-orange-500',
        suggestion: 'Keep up the excellent work and consider mentoring others.'
      });
    } else if (analytics.completionRate < 60) {
      insights.push({
        id: 'low-performance',
        type: 'warning',
        priority: 'high',
        title: 'Performance Opportunity',
        description: `Completion rate is ${analytics.completionRate.toFixed(1)}%. Room for improvement detected.`,
        impact: 80,
        confidence: 90,
        actionable: true,
        category: 'Performance',
        icon: <TrendingDown className="w-5 h-5" />,
        color: 'from-red-400 to-red-600',
        suggestion: 'Consider task prioritization and time blocking techniques.',
        estimatedTimeToFix: '1-2 weeks'
      });
    }
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 } as const;
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.impact - a.impact;
    });
  }, [analytics, timeframe]);

  const filteredInsights = smartInsights.filter(insight => filter === 'all' || insight.priority === filter);

  const fadeIn = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto max-w-7xl px-6 md:px-8 py-6 md:py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-6">
          <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 text-white flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent leading-tight">Analytics Dashboard</h1>
                <p className="text-slate-600 mt-1">Deep insights into your productivity patterns and performance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                <SelectTrigger className="w-32 border-slate-200/70 shadow-sm bg-white/80 backdrop-blur-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-28 border-slate-200/70 shadow-sm bg-white/80 backdrop-blur-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-slate-200/70 shadow-sm bg-white/80 backdrop-blur-sm hover:bg-slate-50" onClick={() => { const { exportAnalyticsData } = require('./analyticsExport'); exportAnalyticsData(goals, subgoals, todos, timeframe, 'json'); }}>
                  <Download className="w-4 h-4 mr-2" /> Export JSON
                </Button>
                <Button variant="outline" size="sm" className="border-slate-200/70 shadow-sm bg-white/80 backdrop-blur-sm hover:bg-slate-50" onClick={() => { const { exportAnalyticsData } = require('./analyticsExport'); exportAnalyticsData(goals, subgoals, todos, timeframe, 'csv'); }}>
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
                <Button variant="outline" size="sm" className="border-slate-200/70 shadow-sm bg-white/80 backdrop-blur-sm hover:bg-slate-50" onClick={async () => { const { shareAnalytics, generateAnalyticsSummary } = require('./analyticsExport'); const summary = generateAnalyticsSummary(analytics.completionRate, analytics.velocityThisWeek, analytics.currentStreak, timeframe); await shareAnalytics('Goal Analytics', summary); }}>
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards (kept at top-level) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <motion.div {...fadeIn}>
            <Card className="border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-slate-50 py-5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium text-slate-600">Completion Rate</CardTitle>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-slate-900"><CountUp end={analytics.completionRate} duration={1.5} decimals={1} />%</div>
                {analytics.velocityChange !== 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {analytics.velocityChange > 0 ? (<ArrowUp className="w-3 h-3 text-emerald-600" />) : (<ArrowDown className="w-3 h-3 text-red-600" />)}
                    <span className={`${analytics.velocityChange > 0 ? 'text-emerald-600' : 'text-red-600'} text-xs`}>{Math.abs(analytics.velocityChange)}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.05 }}>
            <Card className="border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-slate-50 py-5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium text-slate-600">Current Streak</CardTitle>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50"><Flame className="w-5 h-5 text-orange-600" /></div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-slate-900"><CountUp end={analytics.currentStreak} duration={1.5} /> days</div>
                <div className="text-xs text-slate-500 mt-1">Best: {analytics.longestStreak} days</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }}>
            <Card className="border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-slate-50 py-5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium text-slate-600">Weekly Velocity</CardTitle>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50"><Rocket className="w-5 h-5 text-blue-600" /></div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-slate-900"><CountUp end={analytics.velocityThisWeek} duration={1.5} /> tasks</div>
                {analytics.velocityChange !== 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {analytics.velocityChange > 0 ? (<ArrowUp className="w-3 h-3 text-blue-600" />) : (<ArrowDown className="w-3 h-3 text-red-600" />)}
                    <span className={`${analytics.velocityChange > 0 ? 'text-blue-600' : 'text-red-600'} text-xs`}>{Math.abs(analytics.velocityChange)}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.15 }}>
            <Card className="border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-slate-50 py-5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium text-slate-600">Tasks Progress</CardTitle>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-50"><Target className="w-5 h-5 text-purple-600" /></div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-slate-900"><CountUp end={analytics.completedTodos} duration={1.5} /> / {analytics.totalTodos}</div>
                <div className="text-xs text-slate-500 mt-1">{analytics.overdueTodos} overdue</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-8">
            <TabsList className="grid w/full h-12 grid-cols-6 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/70 shadow-sm p-1 gap-1">
              <TabsTrigger value="overview" className="flex items-center justify-center whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white gap-2"><Eye className="w-4 h-4" /><span className="hidden sm:inline">Overview</span></TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center justify-center whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white gap-2"><BarChart3 className="w-4 h-4" /><span className="hidden sm:inline">Performance</span></TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center justify-center whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white gap-2"><TrendingUp className="w-4 h-4" /><span className="hidden sm:inline">Trends</span></TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center justify-center whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white gap-2"><Brain className="w-4 h-4" /><span className="hidden sm:inline">AI Insights</span></TabsTrigger>
              <TabsTrigger value="patterns" className="flex items-center justify-center whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white gap-2"><Activity className="w-4 h-4" /><span className="hidden sm:inline">Patterns</span></TabsTrigger>
              <TabsTrigger value="forecasts" className="flex items-center justify-center whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-600 data-[state=active]:text-white gap-2"><Compass className="w-4 h-4" /><span className="hidden sm:inline">Forecasts</span></TabsTrigger>
            </TabsList>
          </div>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-8 mt-6">
            <OverviewTab analytics={analytics} />
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="space-y-8 mt-6">
            <PerformanceTab analytics={analytics} />
          </TabsContent>

          {/* Trends */}
          <TabsContent value="trends" className="space-y-6">
            <TrendsTab analytics={analytics} />
          </TabsContent>

          {/* AI Insights */}
          <TabsContent value="insights" className="space-y-8 mt-6">
            <InsightsTab 
              aiInsights={aiInsights}
              isLoadingAI={isLoadingAI}
              onRefresh={fetchAIInsights}
              onSelectRecommendation={(rec) => { setSelectedAIRecommendation(rec); setShowAIDialog(true); }}
            />
          </TabsContent>

          {/* Patterns */}
          <TabsContent value="patterns" className="space-y-6">
            <PatternsTab analytics={analytics} />
          </TabsContent>

          {/* Forecasts */}
          <TabsContent value="forecasts" className="space-y-6">
            <ForecastsTab analytics={analytics} />
          </TabsContent>
        </Tabs>

        {/* AI Recommendation Dialog (kept) */}
        <Dialog open={showAIDialog && selectedAIRecommendation !== null} onOpenChange={(open) => {
          setShowAIDialog(open);
          if (!open) setSelectedAIRecommendation(null);
        }}>
          <DialogContent className="min-w-5xl max-h-[90vh] overflow-hidden">
            <DialogHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-slate-900">AI Recommendation Analysis</DialogTitle>
                  <DialogDescription className="text-slate-600 mx-3">Comprehensive guidance and implementation strategy</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            {selectedAIRecommendation && (
              <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
                {/* Hero Card */}
                <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-start gap-5">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                      selectedAIRecommendation.type === 'optimization' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' :
                      selectedAIRecommendation.type === 'risk' ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' :
                      selectedAIRecommendation.type === 'opportunity' ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' :
                      'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                    }`}>
                      {selectedAIRecommendation.type === 'optimization' ? <Target className="w-8 h-8" /> :
                       selectedAIRecommendation.type === 'risk' ? <AlertTriangle className="w-8 h-8" /> :
                       selectedAIRecommendation.type === 'opportunity' ? <Lightbulb className="w-8 h-8" /> :
                       <Zap className="w-8 h-8" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">
                        {selectedAIRecommendation.title}
                      </h3>
                      <div className="flex items-center gap-3 mb-4">
                        <Badge 
                          variant={selectedAIRecommendation.impact === 'high' ? 'destructive' : 
                                  selectedAIRecommendation.impact === 'medium' ? 'default' : 'secondary'}
                          className="px-3 py-1"
                        >
                          {selectedAIRecommendation.impact.toUpperCase()} IMPACT
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1">
                          {selectedAIRecommendation.effort.toUpperCase()} EFFORT
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1 bg-purple-50 text-purple-700 border-purple-200">
                          {selectedAIRecommendation.confidence}% CONFIDENCE
                        </Badge>
                        <Badge className="px-3 py-1 bg-emerald-100 text-emerald-700 border-emerald-200">
                          {selectedAIRecommendation.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-lg">
                        {selectedAIRecommendation.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Success Probability */}
                  <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-blue-900">Success Rate</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="text-3xl font-bold text-blue-700">
                          {selectedAIRecommendation.confidence}%
                        </div>
                        <Progress value={selectedAIRecommendation.confidence} className="h-3" />
                        <p className="text-sm text-blue-700">AI confidence level</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Implementation Time */}
                  <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-emerald-900">Timeline</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-emerald-700">
                          {selectedAIRecommendation.estimatedTimeToImplement}
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3].map((level) => (
                            <div
                              key={level}
                              className={`w-4 h-4 rounded-full ${
                                level <= (selectedAIRecommendation.effort === 'quick' ? 1 : 
                                         selectedAIRecommendation.effort === 'medium' ? 2 : 3) 
                                  ? 'bg-emerald-500' : 'bg-slate-200'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-emerald-700 font-medium">
                            {selectedAIRecommendation.effort} effort
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actionability */}
                  <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-purple-900">Readiness</h4>
                      </div>
                      <div className="space-y-3">
                        <div className={`text-2xl font-bold ${selectedAIRecommendation.actionable ? 'text-purple-700' : 'text-slate-600'}`}>
                          {selectedAIRecommendation.actionable ? 'Ready' : 'Prep Needed'}
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedAIRecommendation.actionable ? (
                            <CheckCircle2 className="w-5 h-5 text-purple-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-500" />
                          )}
                          <span className="text-sm text-purple-700">
                            {selectedAIRecommendation.actionable ? 'Can start immediately' : 'Requires preparation'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Implementation Guide */}
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      Implementation Roadmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedAIRecommendation.description.split('.').filter(step => step.trim()).slice(0, 5).map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:shadow-sm transition-all duration-200"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-700 leading-relaxed">
                              {step.trim()}.
                            </p>
                          </div>
                          <div className="w-6 h-6 border-2 border-slate-300 rounded-full flex-shrink-0 mt-2" />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Target className="w-4 h-4 text-white" />
                        </div>
                        Related Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedAIRecommendation.relatedGoalIds.length > 0 ? (
                          selectedAIRecommendation.relatedGoalIds.map((goalId) => (
                            <div key={goalId} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                                {goalId}
                              </div>
                              <span className="text-sm font-medium text-blue-900">Goal #{goalId}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500 italic">No related goals specified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        Metadata
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Created</span>
                          <span className="text-sm font-medium text-slate-900">
                            {new Date(selectedAIRecommendation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Type</span>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {selectedAIRecommendation.type}
                          </Badge>
                        </div>
                        {selectedAIRecommendation.automatable !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Automation</span>
                            <div className="flex items-center gap-2">
                              {selectedAIRecommendation.automatable ? (
                                <Zap className="w-4 h-4 text-green-500" />
                              ) : (
                                <User className="w-4 h-4 text-slate-500" />
                              )}
                              <span className="text-sm text-slate-700">
                                {selectedAIRecommendation.automatable ? 'Automatable' : 'Manual'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAIDialog(false);
                      setSelectedAIRecommendation(null);
                    }}
                    className="px-6"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Insights
                  </Button>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 px-6"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 px-6">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Implemented
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Floating Actions */}
        <AnalyticsFloatingActions
          onExportJSON={() => { const { exportAnalyticsData } = require('./analyticsExport'); exportAnalyticsData(goals, subgoals, todos, timeframe, 'json'); }}
          onExportCSV={() => { const { exportAnalyticsData } = require('./analyticsExport'); exportAnalyticsData(goals, subgoals, todos, timeframe, 'csv'); }}
          onShare={async () => {
            const { shareAnalytics, generateAnalyticsSummary } = require('./analyticsExport');
            const summary = generateAnalyticsSummary(analytics.completionRate, analytics.velocityThisWeek, analytics.currentStreak, timeframe);
            await shareAnalytics('Goal Analytics', summary);
          }}
          onRefresh={() => window.location.reload()}
        />
      </div>
    </div>
  );
};

export default EnhancedInsightsDashboard;
