"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ComposedChart,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle2,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Radar as RadarIcon,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Filter,
  Download,
  Share2,
  RefreshCw,
  Calendar,
  Users,
  Flame,
  Trophy,
  Star,
  ChevronRight,
  Lightbulb,
  MessageSquare,
  ThumbsUp,
  Bookmark,
  Timer,
  Focus,
  Gauge,
  BarChart2,
  LineChart as LineChartIcon,
  PieChart as PieIcon,
  Layers,
  Rocket,
  Crosshair,
  Maximize,
  RotateCcw,
  FastForward,
  Battery,
  Compass,
  Map,
  Workflow,
} from "lucide-react";
import type { Goal } from "@/features/goals/types/goalSchema";
import type { Subgoal } from "@/features/subGoals/subGoalschema";
import type { Todo } from "@/features/todo/todoSchema";

interface EnhancedInsightsDashboardProps {
  goals: Goal[];
  subgoals: Subgoal[];
  todos: Todo[];
}

interface SmartInsight {
  id: string;
  type: 'achievement' | 'warning' | 'opportunity' | 'trend' | 'prediction';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: number; // 1-100
  confidence: number; // 1-100
  actionable: boolean;
  category: string;
  icon: React.ReactNode;
  color: string;
  data?: any;
  suggestion?: string;
  estimatedTimeToFix?: string;
}

interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, icon, className = "", children, subtitle, actionButton }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={className}
  >
    <Card className="p-6 h-full bg-white/80 backdrop-blur-sm border border-gray-200/80 hover:shadow-lg hover:border-gray-300/80 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {actionButton}
      </div>
      {children}
    </Card>
  </motion.div>
);

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  suffix?: string;
  animateValue?: boolean;
  color?: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  suffix = '', 
  animateValue = false,
  color = 'from-blue-500 to-blue-600',
  subtitle
}) => (
  <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200/80 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <h3 className="text-2xl font-bold text-gray-900">
            {animateValue && typeof value === 'number' ? (
              <CountUp end={value} duration={1.5} suffix={suffix} />
            ) : (
              `${value}${suffix}`
            )}
          </h3>
          {change !== undefined && (
            <div className={`flex items-center text-sm font-medium ${
              changeType === 'positive' ? 'text-emerald-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {changeType === 'positive' ? <ArrowUp className="w-3 h-3 mr-1" /> :
               changeType === 'negative' ? <ArrowDown className="w-3 h-3 mr-1" /> :
               <Minus className="w-3 h-3 mr-1" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white`}>
        {icon}
      </div>
    </div>
  </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CHART_COLORS = {
  primary: ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981'],
  secondary: ['#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#f97316'],
  gradients: {
    blue: 'url(#blueGradient)',
    purple: 'url(#purpleGradient)',
    green: 'url(#greenGradient)',
    orange: 'url(#orangeGradient)',
    red: 'url(#redGradient)',
  }
};

const ChartGradients = () => (
  <defs>
    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
    </linearGradient>
    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
    </linearGradient>
    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
    </linearGradient>
    <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
    </linearGradient>
    <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
    </linearGradient>
  </defs>
);

const EnhancedInsightsDashboard: React.FC<EnhancedInsightsDashboardProps> = ({
  goals,
  subgoals,
  todos
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInsight, setSelectedInsight] = useState<SmartInsight | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Enhanced analytics calculations with real user data
  const analytics = useMemo(() => {
    const now = new Date();
    const timeframeDays = { week: 7, month: 30, quarter: 90, year: 365 };
    const periodStart = new Date(now.getTime() - timeframeDays[timeframe] * 24 * 60 * 60 * 1000);

    // Filter data by timeframe using real dates
    const periodTodos = todos.filter(todo => {
      const createdDate = new Date(todo.startDate || '');
      const completedDate = todo.isDone ? new Date(todo.endDate || todo.startDate || '') : null;
      return createdDate >= periodStart || (completedDate && completedDate >= periodStart);
    });

    const completedTodos = periodTodos.filter(t => t.isDone);
    const overdueTodos = periodTodos.filter(t => !t.isDone && t.endDate && new Date(t.endDate) < now);
    const inProgressTodos = periodTodos.filter(t => !t.isDone && (!t.endDate || new Date(t.endDate) >= now));
    
    // Advanced Analytics Calculations
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
    
    // KPI Calculations
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
      // Core metrics
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
      
      // Advanced analytics
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

  // Generate smart insights based on analytics
  const smartInsights = useMemo(() => {
    const insights: SmartInsight[] = [];

    // Performance insights
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
        icon: <Trophy className="w-5 h-5" />,
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

    // Velocity insights
    if (analytics.velocityChange > 20) {
      insights.push({
        id: 'velocity-surge',
        type: 'achievement',
        priority: 'medium',
        title: 'Velocity Surge',
        description: `Task completion velocity increased by ${analytics.velocityChange}%!`,
        impact: 75,
        confidence: 85,
        actionable: false,
        category: 'Velocity',
        icon: <Rocket className="w-5 h-5" />,
        color: 'from-green-400 to-green-600',
        suggestion: 'Your productivity optimizations are working well.'
      });
    } else if (analytics.velocityChange < -20) {
      insights.push({
        id: 'velocity-decline',
        type: 'warning',
        priority: 'medium',
        title: 'Velocity Decline',
        description: `Task velocity dropped by ${Math.abs(analytics.velocityChange)}%. Time to re-energize.`,
        impact: 70,
        confidence: 80,
        actionable: true,
        category: 'Velocity',
        icon: <TrendingDown className="w-5 h-5" />,
        color: 'from-orange-400 to-red-500',
        suggestion: 'Review your energy levels and consider adjusting workload.',
        estimatedTimeToFix: '3-5 days'
      });
    }

    // Streak insights
    if (analytics.currentStreak >= 7) {
      insights.push({
        id: 'epic-streak',
        type: 'achievement',
        priority: 'medium',
        title: 'Epic Streak!',
        description: `Amazing ${analytics.currentStreak}-day completion streak!`,
        impact: 80,
        confidence: 100,
        actionable: false,
        category: 'Consistency',
        icon: <Flame className="w-5 h-5" />,
        color: 'from-orange-400 to-red-500',
        suggestion: 'You\'re building excellent habits. Keep the momentum!'
      });
    }

    // Overdue insights
    if (analytics.overdueTodos > 0) {
      const overdueRate = (analytics.overdueTodos / analytics.totalTodos) * 100;
      insights.push({
        id: 'overdue-tasks',
        type: overdueRate > 25 ? 'warning' : 'opportunity',
        priority: overdueRate > 25 ? 'high' : 'medium',
        title: `${analytics.overdueTodos} Overdue Tasks`,
        description: `${overdueRate.toFixed(1)}% of tasks are past deadline.`,
        impact: Math.min(overdueRate * 2, 100),
        confidence: 100,
        actionable: true,
        category: 'Time Management',
        icon: <Clock className="w-5 h-5" />,
        color: overdueRate > 25 ? 'from-red-400 to-red-600' : 'from-yellow-400 to-orange-500',
        suggestion: 'Reschedule overdue tasks and improve time estimation.',
        estimatedTimeToFix: '1-3 days'
      });
    }

    // Focus time insights
    if (analytics.focusTimeAnalysis.deepWorkPercentage >= 60) {
      insights.push({
        id: 'deep-work-master',
        type: 'achievement',
        priority: 'medium',
        title: 'Deep Work Master',
        description: `${analytics.focusTimeAnalysis.deepWorkPercentage}% of sessions are deep work (2+ hours)`,
        impact: 70,
        confidence: 95,
        actionable: false,
        category: 'Focus',
        icon: <Brain className="w-5 h-5" />,
        color: 'from-indigo-400 to-indigo-600',
        suggestion: 'Your focus discipline is exceptional. Share your techniques!'
      });
    }

    // Risk assessment insights
    if (analytics.riskAssessment.riskLevel === 'high') {
      insights.push({
        id: 'high-risk-goal',
        type: 'warning',
        priority: 'high',
        title: 'Goal at Risk',
        description: `High risk detected (${analytics.riskAssessment.score}/100). Immediate action needed.`,
        impact: 95,
        confidence: 95,
        actionable: true,
        category: 'Risk',
        icon: <AlertTriangle className="w-5 h-5" />,
        color: 'from-red-500 to-red-700',
        suggestion: 'Break down large tasks and eliminate blockers immediately.',
        estimatedTimeToFix: '1-3 days'
      });
    }

    // Priority effectiveness insights
    if (analytics.priorityEffectiveness.alignmentScore < 60) {
      insights.push({
        id: 'priority-misalignment',
        type: 'opportunity',
        priority: 'medium',
        title: 'Priority Optimization',
        description: `Priority alignment at ${analytics.priorityEffectiveness.alignmentScore}%. Refocus on high-impact work.`,
        impact: 75,
        confidence: 85,
        actionable: true,
        category: 'Priority',
        icon: <Target className="w-5 h-5" />,
        color: 'from-blue-400 to-blue-600',
        suggestion: 'Audit task priorities and focus on high-impact activities.',
        estimatedTimeToFix: '2-4 days'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.impact - a.impact;
    });
  }, [analytics, timeframe]);

  const filteredInsights = smartInsights.filter(insight => 
    filter === 'all' || insight.priority === filter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600">Comprehensive insights into your productivity patterns</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <MetricCard
          title="Completion Rate"
          value={analytics.completionRate}
          suffix="%"
          animateValue
          change={analytics.velocityChange}
          changeType={analytics.velocityChange > 0 ? 'positive' : analytics.velocityChange < 0 ? 'negative' : 'neutral'}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="from-emerald-500 to-emerald-600"
        />
        
        <MetricCard
          title="Current Streak"
          value={analytics.currentStreak}
          suffix=" days"
          animateValue
          icon={<Flame className="w-6 h-6" />}
          color="from-orange-500 to-red-500"
          subtitle={`Best: ${analytics.longestStreak} days`}
        />
        
        <MetricCard
          title="Weekly Velocity"
          value={analytics.velocityThisWeek}
          suffix=" tasks"
          animateValue
          change={analytics.velocityChange}
          changeType={analytics.velocityChange > 0 ? 'positive' : analytics.velocityChange < 0 ? 'negative' : 'neutral'}
          icon={<Rocket className="w-6 h-6" />}
          color="from-blue-500 to-blue-600"
        />
        
        <MetricCard
          title="Tasks Completed"
          value={analytics.completedTodos}
          suffix={` / ${analytics.totalTodos}`}
          animateValue
          icon={<Target className="w-6 h-6" />}
          color="from-purple-500 to-purple-600"
          subtitle={`${analytics.overdueTodos} overdue`}
        />
      </motion.div>

      {/* Main Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 bg-white/70 backdrop-blur-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Trends</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">AI Insights</span>
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Patterns</span>
          </TabsTrigger>
          <TabsTrigger value="forecasts" className="flex items-center gap-2">
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Forecasts</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* Velocity Trend Chart */}
            <ChartCard
              title="Task Velocity Trend"
              icon={<Rocket className="w-5 h-5" />}
              subtitle="Tasks completed over time"
              className="xl:col-span-2"
            >
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={analytics.velocityData}>
                  <ChartGradients />
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    fill={CHART_COLORS.gradients.blue}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Weekly Pattern */}
            <ChartCard
              title="Weekly Pattern"
              icon={<Calendar className="w-5 h-5" />}
              subtitle="Productivity by day"
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.productivityPatterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#666" fontSize={10} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="completions" 
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Goal Health Radar */}
            <ChartCard
              title="Goal Health"
              icon={<Target className="w-5 h-5" />}
              subtitle="Multi-dimensional analysis"
              className="xl:col-span-1"
            >
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={analytics.goalHealthScores.slice(0, 6)}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="name" fontSize={10} />
                  <PolarRadiusAxis 
                    domain={[0, 100]} 
                    fontSize={8}
                    angle={90}
                    tickCount={4}
                  />
                  <Radar
                    name="Health Score"
                    dataKey="healthScore"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Burndown Chart */}
            <ChartCard
              title="Burndown Chart"
              icon={<TrendingDown className="w-5 h-5" />}
              subtitle="Progress vs ideal pace"
              className="xl:col-span-2"
            >
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={analytics.burndownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="remaining"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Actual"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ideal"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Ideal"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Priority Distribution */}
            <ChartCard
              title="Priority Distribution"
              icon={<PieIcon className="w-5 h-5" />}
              subtitle="Task priority breakdown"
            >
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={analytics.priorityEffectiveness.effectiveness}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                    label={({ priority, total }) => `${priority}: ${total}`}
                  >
                    {analytics.priorityEffectiveness.effectiveness.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_COLORS.primary[index % CHART_COLORS.primary.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Completion Rate Over Time */}
            <ChartCard
              title="Completion Rate Trend"
              icon={<CheckCircle2 className="w-5 h-5" />}
              subtitle="Completion percentage over time"
            >
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={analytics.progressTrends}>
                  <ChartGradients />
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="completionRate"
                    stroke="#6366f1"
                    fill={CHART_COLORS.gradients.blue}
                    fillOpacity={0.3}
                  />
                  <Line
                    type="monotone"
                    dataKey="completionRate"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Priority Effectiveness */}
            <ChartCard
              title="Priority Effectiveness"
              icon={<Target className="w-5 h-5" />}
              subtitle="Completion rates by priority"
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analytics.priorityEffectiveness.effectiveness}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="priority" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="completionRate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Time Distribution */}
            <ChartCard
              title="Time Distribution"
              icon={<Timer className="w-5 h-5" />}
              subtitle="Task completion times"
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analytics.timeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="range" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Sprint Analytics */}
            <ChartCard
              title="Sprint Analytics"
              icon={<FastForward className="w-5 h-5" />}
              subtitle="Sprint performance metrics"
            >
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={analytics.sprintAnalytics.sprints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="sprint" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="velocity"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Velocity"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="quality"
                    stroke="#6366f1"
                    strokeWidth={2}
                    name="Quality"
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Category Performance Comparison */}
            <ChartCard
              title="Category Performance"
              icon={<Layers className="w-5 h-5" />}
              subtitle="Performance across categories"
              className="lg:col-span-2"
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analytics.categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="completionRate" 
                    fill="#6366f1" 
                    radius={[4, 4, 0, 0]}
                    name="Completion Rate"
                  />
                  <Bar 
                    dataKey="total" 
                    fill="#e5e7eb" 
                    radius={[4, 4, 0, 0]}
                    name="Total Tasks"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Velocity Comparison */}
            <ChartCard
              title="Velocity Comparison"
              icon={<BarChart2 className="w-5 h-5" />}
              subtitle="Current vs previous periods"
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={[analytics.velocityTrends]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="current" fill="#6366f1" radius={[4, 4, 0, 0]} name="Current" />
                  <Bar dataKey="previous" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Previous" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Productivity Heatmap */}
            <ChartCard
              title="Productivity Heatmap"
              icon={<Gauge className="w-5 h-5" />}
              subtitle="Daily productivity intensity"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-1 text-xs text-center">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="font-medium text-gray-600">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {analytics.productivityHeatmap.map((day, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-sm ${
                        day.intensity === 0 ? 'bg-gray-100' :
                        day.intensity <= 0.25 ? 'bg-green-100' :
                        day.intensity <= 0.5 ? 'bg-green-200' :
                        day.intensity <= 0.75 ? 'bg-green-300' : 'bg-green-400'
                      }`}
                      title={`${day.date}: ${day.completions} tasks`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-gray-100 rounded-sm" />
                    <div className="w-3 h-3 bg-green-100 rounded-sm" />
                    <div className="w-3 h-3 bg-green-200 rounded-sm" />
                    <div className="w-3 h-3 bg-green-300 rounded-sm" />
                    <div className="w-3 h-3 bg-green-400 rounded-sm" />
                  </div>
                  <span>More</span>
                </div>
              </div>
            </ChartCard>

            {/* Focus Time Analysis */}
            <ChartCard
              title="Focus Time Analysis"
              icon={<Focus className="w-5 h-5" />}
              subtitle="Deep work patterns"
              className="lg:col-span-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">
                      <CountUp end={analytics.focusTimeAnalysis.averageFocusTime} duration={1.5} decimals={1} />h
                    </div>
                    <div className="text-sm text-gray-600">Average Focus Time</div>
                  </div>
                  <Progress value={analytics.focusTimeAnalysis.deepWorkPercentage} className="h-2" />
                  <div className="text-xs text-gray-500 text-center">
                    {analytics.focusTimeAnalysis.deepWorkPercentage}% Deep Work Sessions
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      <CountUp end={analytics.focusTimeAnalysis.longestSession} duration={1.5} decimals={1} />h
                    </div>
                    <div className="text-sm text-gray-600">Longest Session</div>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(analytics.focusTimeAnalysis).slice(0, 3).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-medium">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      <CountUp end={analytics.focusTimeAnalysis.totalFocusTime} duration={1.5} decimals={1} />h
                    </div>
                    <div className="text-sm text-gray-600">Total Focus Time</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {analytics.focusTimeAnalysis.sessionCount} Sessions
                    </Badge>
                  </div>
                </div>
              </div>
            </ChartCard>

            {/* Energy Patterns */}
            <ChartCard
              title="Energy Patterns"
              icon={<Battery className="w-5 h-5" />}
              subtitle="Peak productivity hours"
              className="lg:col-span-2"
            >
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={analytics.energyPatterns.hourlyPatterns.slice(6, 22)}>
                  <ChartGradients />
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#666" 
                    fontSize={12}
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="completions"
                    stroke="#f59e0b"
                    fill={CHART_COLORS.gradients.orange}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <ScrollArea className="h-[700px]">
            <div className="space-y-4 pr-4">
              <AnimatePresence>
                {filteredInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 ${
                        insight.priority === 'high' ? 'border-l-red-500 bg-red-50/50' :
                        insight.priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50/50' :
                        'border-l-blue-500 bg-blue-50/50'
                      }`}
                      onClick={() => setSelectedInsight(insight)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${insight.color} text-white`}>
                          {insight.icon}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={insight.priority === 'high' ? 'destructive' : 
                                        insight.priority === 'medium' ? 'default' : 'secondary'}
                              >
                                {insight.priority}
                              </Badge>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                          
                          <p className="text-gray-600">{insight.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              Impact: {insight.impact}%
                            </div>
                            <div className="flex items-center gap-1">
                              <Brain className="w-4 h-4" />
                              Confidence: {insight.confidence}%
                            </div>
                            {insight.actionable && (
                              <Badge variant="outline" className="text-xs">
                                Actionable
                              </Badge>
                            )}
                          </div>
                          
                          {insight.suggestion && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <Lightbulb className="w-4 h-4 inline mr-2" />
                                {insight.suggestion}
                              </p>
                              {insight.estimatedTimeToFix && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Estimated time: {insight.estimatedTimeToFix}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* Daily Productivity Pattern */}
            <ChartCard
              title="Daily Productivity"
              icon={<Calendar className="w-5 h-5" />}
              subtitle="Average completion by weekday"
            >
              <div className="space-y-3">
                {analytics.productivityPatterns.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{day.day.slice(0, 3)}</span>
                    <div className="flex items-center gap-2 flex-1 ml-4">
                      <Progress 
                        value={(day.completions / Math.max(...analytics.productivityPatterns.map(p => p.completions), 1)) * 100} 
                        className="flex-1 h-2" 
                      />
                      <span className="text-sm text-gray-600 w-8">{day.completions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* Category Focus Distribution */}
            <ChartCard
              title="Category Focus"
              icon={<PieIcon className="w-5 h-5" />}
              subtitle="Time allocation across categories"
            >
              <div className="space-y-3">
                {analytics.categoryPerformance.slice(0, 5).map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{category.completionRate}%</span>
                        <Badge variant="outline" className="text-xs">
                          {category.total}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={category.completionRate} className="h-2" />
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* Collaboration Metrics */}
            <ChartCard
              title="Collaboration Index"
              icon={<Users className="w-5 h-5" />}
              subtitle="Team interaction patterns"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.collaborationMetrics.sharedGoalsCount}
                    </div>
                    <div className="text-xs text-gray-600">Shared Goals</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.collaborationMetrics.collaborationRate}%
                    </div>
                    <div className="text-xs text-gray-600">Collaboration Rate</div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Team Tasks</span>
                    <span className="font-medium">{analytics.collaborationMetrics.collaborativeTasks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Individual Tasks</span>
                    <span className="font-medium">{analytics.totalTodos - analytics.collaborationMetrics.collaborativeTasks}</span>
                  </div>
                  <Progress value={analytics.collaborationMetrics.teamEfficiency} className="h-2 mt-2" />
                  <div className="text-xs text-gray-500 text-center">
                    Team Efficiency: {Math.round(analytics.collaborationMetrics.teamEfficiency)}%
                  </div>
                </div>
              </div>
            </ChartCard>

            {/* Risk Assessment */}
            <ChartCard
              title="Risk Assessment"
              icon={<AlertTriangle className="w-5 h-5" />}
              subtitle="Goal completion risk factors"
              className="xl:col-span-2"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${
                      analytics.riskAssessment.riskLevel === 'high' ? 'text-red-600' :
                      analytics.riskAssessment.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {analytics.riskAssessment.score}
                    </div>
                    <div className="text-sm text-gray-600">Risk Score</div>
                  </div>
                  <div className="flex-1 ml-8">
                    <Progress 
                      value={analytics.riskAssessment.score} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
                
                {analytics.riskAssessment.riskFactors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Risk Factors:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {analytics.riskAssessment.riskFactors.map((factor, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600 p-2 bg-red-50 rounded">
                          <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                          {factor}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ChartCard>

            {/* Milestone Progress */}
            <ChartCard
              title="Milestone Analysis"
              icon={<Map className="w-5 h-5" />}
              subtitle="Subgoal completion tracking"
            >
              <div className="space-y-3">
                {analytics.milestoneAnalysis.milestones.slice(0, 4).map((milestone, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{milestone.name}</span>
                      <Badge 
                        variant={milestone.status === 'completed' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {milestone.progress}%
                      </Badge>
                    </div>
                    <Progress value={milestone.progress} className="h-2" />
                  </div>
                ))}
                <div className="pt-2 text-center">
                  <div className="text-lg font-bold text-indigo-600">
                    {analytics.milestoneAnalysis.completedMilestones} / {analytics.milestoneAnalysis.totalMilestones}
                  </div>
                  <div className="text-xs text-gray-600">Milestones Completed</div>
                </div>
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        {/* Forecasts Tab */}
        <TabsContent value="forecasts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Completion Forecast */}
            <ChartCard
              title="Completion Forecast"
              icon={<Compass className="w-5 h-5" />}
              subtitle="Predicted goal completion timeline"
            >
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={analytics.completionForecast.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#6366f1"
                    strokeWidth={2}
                    name="Actual Progress"
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Forecast"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Goal Comparison */}
            <ChartCard
              title="Goal Performance Comparison"
              icon={<BarChart2 className="w-5 h-5" />}
              subtitle="Current vs historical performance"
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analytics.goalComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="metric" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="current" fill="#6366f1" radius={[4, 4, 0, 0]} name="Current Goal" />
                  <Bar dataKey="average" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Average" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Performance Prediction Summary */}
            <ChartCard
              title="Performance Predictions"
              icon={<Brain className="w-5 h-5" />}
              subtitle="AI-powered insights and forecasts"
              className="lg:col-span-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-blue-600">
                    {analytics.completionForecast.estimatedCompletionDate ? 
                      new Date(analytics.completionForecast.estimatedCompletionDate).toLocaleDateString() : 
                      'TBD'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Estimated Completion</div>
                  <Badge variant={analytics.completionForecast.confidence >= 70 ? 'default' : 'destructive'}>
                    {analytics.completionForecast.confidence}% confidence
                  </Badge>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-green-600">
                    <CountUp end={analytics.velocityTrends.projected || 0} duration={1.5} />
                  </div>
                  <div className="text-sm text-gray-600">Projected Weekly Velocity</div>
                  <div className="flex items-center justify-center gap-1 text-sm">
                    {analytics.velocityChange > 0 ? (
                      <ArrowUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-red-600" />
                    )}
                    <span className={analytics.velocityChange > 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(analytics.velocityChange)}%
                    </span>
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-purple-600">
                    {analytics.timeToGoal ? `${analytics.timeToGoal}d` : '∞'}
                  </div>
                  <div className="text-sm text-gray-600">Days to Goal</div>
                  <Badge variant={analytics.timeToGoal && analytics.timeToGoal < 30 ? 'destructive' : 'outline'}>
                    {analytics.timeToGoal && analytics.timeToGoal < 0 ? 'Overdue' : 'On Track'}
                  </Badge>
                </div>
              </div>
            </ChartCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Enhanced Helper Functions for Comprehensive Analytics

const calculateVelocityTrends = (completedTodos: Todo[], days: number) => {
  const periods = Math.min(12, Math.floor(days / 7)); // Max 12 periods for better visualization
  const data = [];
  
  for (let i = 0; i < periods; i++) {
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() - (i * 7));
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - 7);
    
    const periodTodos = completedTodos.filter(todo => {
      const todoDate = new Date(todo.endDate || '');
      return todoDate >= periodStart && todoDate <= periodEnd;
    });
    
    data.unshift({
      period: `W${periods - i}`,
      value: periodTodos.length,
      date: periodStart.toISOString().split('T')[0]
    });
  }
  
  return data;
};

const analyzeProductivityPatterns = (completedTodos: Todo[]) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const patterns = days.map(day => ({ day, completions: 0 }));
  
  completedTodos.forEach(todo => {
    if (todo.endDate) {
      const dayIndex = new Date(todo.endDate).getDay();
      patterns[dayIndex].completions++;
    }
  });
  
  return patterns;
};

const analyzeCategoryPerformance = (goals: Goal[], todos: Todo[]) => {
  const categories: Record<string, { total: number; completed: number }> = {};
  
  todos.forEach(todo => {
    const category = todo.category || 'Uncategorized';
    if (!categories[category]) {
      categories[category] = { total: 0, completed: 0 };
    }
    categories[category].total++;
    if (todo.isDone) categories[category].completed++;
  });
  
  return Object.entries(categories).map(([name, stats]) => ({
    name,
    completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    total: stats.total,
    completed: stats.completed
  }));
};

const calculateGoalHealthScores = (goals: Goal[], subgoals: Subgoal[], todos: Todo[]) => {
  return goals.map(goal => {
    const goalSubgoals = subgoals.filter(sg => sg.goal_id === goal.id);
    const goalTodos = todos.filter(t => t.goal_id === goal.id);
    
    let healthScore = 50; // Base score
    
    // Progress factor (40% weight)
    const completedTodos = goalTodos.filter(t => t.isDone).length;
    const progressRate = goalTodos.length > 0 ? (completedTodos / goalTodos.length) * 100 : 0;
    healthScore += (progressRate * 0.4);
    
    // Timeline factor (20% weight)
    if (goal.endDate) {
      const daysLeft = Math.ceil((new Date(goal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft > 0) {
        healthScore += Math.min(daysLeft / 30 * 20, 20);
      } else {
        healthScore -= 30; // Penalty for overdue
      }
    }
    
    // Activity factor (20% weight)
    const recentActivity = goalTodos.filter(t => {
      const activityDate = new Date(t.endDate || t.startDate || '');
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return activityDate >= sevenDaysAgo;
    }).length;
    
    healthScore += Math.min(recentActivity * 5, 20);
    
    // Subgoal completion factor (20% weight)
    const completedSubgoals = goalSubgoals.filter(sg => sg.status.toLowerCase().includes('completed')).length;
    const subgoalProgress = goalSubgoals.length > 0 ? (completedSubgoals / goalSubgoals.length) * 20 : 0;
    healthScore += subgoalProgress;
    
    return {
      name: goal.name,
      healthScore: Math.max(0, Math.min(100, Math.round(healthScore))),
      id: goal.id
    };
  });
};

const calculatePerformanceMetrics = (todos: Todo[], goals: Goal[]) => {
  const completedGoals = goals.filter(g => g.status === 'Completed').length;
  const completedTasks = todos.filter(t => t.isDone).length;
  
  return [
    { metric: 'This Week', goals: completedGoals, tasks: Math.round(completedTasks * 0.3) },
    { metric: 'Last Week', goals: Math.max(0, completedGoals - 1), tasks: Math.round(completedTasks * 0.25) },
    { metric: 'This Month', goals: completedGoals, tasks: completedTasks },
    { metric: 'Last Month', goals: Math.max(0, completedGoals - 1), tasks: Math.round(completedTasks * 0.8) },
  ];
};

const calculateBurndownChart = (todos: Todo[], goalEndDate?: Date | string | null) => {
  if (!goalEndDate) return [];
  
  const endDate = new Date(goalEndDate);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // 30 days back
  
  const totalTasks = todos.length;
  const data = [];
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
    const completedByDate = todos.filter(t => t.isDone && t.endDate && new Date(t.endDate) <= d).length;
    const remaining = Math.max(0, totalTasks - completedByDate);
    
    const weeksFromStart = Math.ceil((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const ideal = Math.max(0, totalTasks - (totalTasks * weeksFromStart / totalWeeks));
    
    data.push({
      date: d.toISOString().split('T')[0],
      remaining,
      ideal: Math.round(ideal)
    });
  }
  
  return data;
};

const calculateVelocityComparison = (completedTodos: Todo[], timeframe: string) => {
  const now = new Date();
  const timeframeDays = { week: 7, month: 30, quarter: 90, year: 365 };
  const days = timeframeDays[timeframe as keyof typeof timeframeDays];
  
  const currentPeriodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const previousPeriodStart = new Date(currentPeriodStart.getTime() - days * 24 * 60 * 60 * 1000);
  
  const currentTodos = completedTodos.filter(t => t.endDate && new Date(t.endDate) >= currentPeriodStart);
  const previousTodos = completedTodos.filter(t => 
    t.endDate && 
    new Date(t.endDate) >= previousPeriodStart && 
    new Date(t.endDate) < currentPeriodStart
  );
  
  const current = currentTodos.length;
  const previous = previousTodos.length;
  const change = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;
  
  return {
    period: timeframe,
    current,
    previous,
    change,
    projected: current + Math.round(current * 0.1) // 10% growth projection
  };
};

const calculateTimeDistribution = (completedTodos: Todo[]) => {
  const ranges = {
    'Quick (< 1h)': 0,
    'Short (1-4h)': 0,
    'Medium (4h-1d)': 0,
    'Long (1-3d)': 0,
    'Extended (3d+)': 0
  };
  
  completedTodos.forEach(todo => {
    if (!todo.startDate || !todo.endDate) return;
    
    const hours = (new Date(todo.endDate).getTime() - new Date(todo.startDate).getTime()) / (1000 * 60 * 60);
    
    if (hours < 1) ranges['Quick (< 1h)']++;
    else if (hours < 4) ranges['Short (1-4h)']++;
    else if (hours < 24) ranges['Medium (4h-1d)']++;
    else if (hours < 72) ranges['Long (1-3d)']++;
    else ranges['Extended (3d+)']++;
  });
  
  return Object.entries(ranges).map(([range, count]) => ({ range, count }));
};

const calculateProgressTrends = (todos: Todo[], timeframe: string) => {
  const periods = timeframe === 'week' ? 4 : timeframe === 'month' ? 6 : 12;
  const data = [];
  
  for (let i = 0; i < periods; i++) {
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() - (i * 7));
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - 7);
    
    const periodTodos = todos.filter(todo => {
      const todoDate = new Date(todo.startDate || '');
      return todoDate >= periodStart && todoDate <= periodEnd;
    });
    
    const completed = periodTodos.filter(t => t.isDone).length;
    const completionRate = periodTodos.length > 0 ? (completed / periodTodos.length) * 100 : 0;
    
    data.unshift({
      period: `P${periods - i}`,
      completionRate: Math.round(completionRate),
      completed,
      total: periodTodos.length
    });
  }
  
  return data;
};

const analyzePriorityEffectiveness = (todos: Todo[]) => {
  const priorityGroups = {
    'High': todos.filter(t => t.priority === 'High'),
    'Medium': todos.filter(t => t.priority === 'Medium'),
    'Low': todos.filter(t => t.priority === 'Low')
  };
  
  const effectiveness = Object.entries(priorityGroups).map(([priority, tasks]) => {
    const completed = tasks.filter(t => t.isDone);
    const completionRate = tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0;
    
    return {
      priority,
      total: tasks.length,
      completed: completed.length,
      completionRate: Math.round(completionRate),
      efficiency: Math.round(completionRate)
    };
  });
  
  // Calculate alignment score (higher priority should have higher completion rate)
  const highPriorityRate = effectiveness.find(e => e.priority === 'High')?.completionRate || 0;
  const mediumPriorityRate = effectiveness.find(e => e.priority === 'Medium')?.completionRate || 0;
  const lowPriorityRate = effectiveness.find(e => e.priority === 'Low')?.completionRate || 0;
  
  const alignmentScore = Math.round(
    (highPriorityRate * 0.5 + mediumPriorityRate * 0.3 + lowPriorityRate * 0.2)
  );
  
  return {
    effectiveness,
    alignmentScore,
    recommendations: alignmentScore < 60 ? 
      ['Focus more on high-priority tasks', 'Review task prioritization'] : 
      ['Good priority management']
  };
};

const calculateCompletionForecast = (todos: Todo[], goal?: Goal) => {
  const completedTodos = todos.filter(t => t.isDone);
  const remainingTodos = todos.filter(t => !t.isDone);
  
  if (completedTodos.length === 0) {
    return {
      estimatedCompletionDate: null,
      confidence: 0,
      timeline: []
    };
  }
  
  // Calculate average completion time
  const avgCompletionTime = completedTodos.reduce((acc, todo) => {
    if (!todo.startDate || !todo.endDate) return acc;
    return acc + (new Date(todo.endDate).getTime() - new Date(todo.startDate).getTime());
  }, 0) / (completedTodos.length * 1000 * 60 * 60 * 24); // days
  
  const estimatedDaysRemaining = remainingTodos.length * Math.max(avgCompletionTime, 1);
  const estimatedCompletionDate = new Date();
  estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDaysRemaining);
  
  // Generate forecast timeline
  const timeline = [];
  const totalTodos = todos.length;
  const startDate = new Date();
  
  for (let i = 0; i <= 10; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (i * 7));
    
    const actualCompleted = completedTodos.filter(t => 
      t.endDate && new Date(t.endDate) <= date
    ).length;
    
    const forecastCompleted = Math.min(
      totalTodos,
      completedTodos.length + Math.round((i * 7) / avgCompletionTime)
    );
    
    timeline.push({
      date: date.toISOString().split('T')[0],
      actual: actualCompleted,
      forecast: forecastCompleted
    });
  }
  
  const confidence = Math.min(100, Math.max(20, 100 - (remainingTodos.length * 5)));
  
  return {
    estimatedCompletionDate: estimatedCompletionDate.toISOString(),
    confidence,
    timeline
  };
};

const calculateProductivityHeatmap = (completedTodos: Todo[]) => {
  const heatmapData = [];
  const maxCompletions = Math.max(...completedTodos.map(t => 1), 1);
  
  // Generate last 42 days (6 weeks)
  for (let i = 41; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const dayCompletions = completedTodos.filter(todo => {
      if (!todo.endDate) return false;
      const todoDate = new Date(todo.endDate);
      return todoDate.toDateString() === date.toDateString();
    }).length;
    
    heatmapData.push({
      date: date.toISOString().split('T')[0],
      completions: dayCompletions,
      intensity: dayCompletions / Math.max(maxCompletions, 1)
    });
  }
  
  return heatmapData;
};

const calculateSprintAnalytics = (todos: Todo[], timeframe: string) => {
  const sprintLength = timeframe === 'week' ? 7 : 14; // 1 or 2 week sprints
  const numberOfSprints = 6;
  const sprints = [];
  
  for (let i = numberOfSprints - 1; i >= 0; i--) {
    const sprintEnd = new Date();
    sprintEnd.setDate(sprintEnd.getDate() - (i * sprintLength));
    const sprintStart = new Date(sprintEnd);
    sprintStart.setDate(sprintStart.getDate() - sprintLength);
    
    const sprintTodos = todos.filter(todo => {
      const todoDate = new Date(todo.startDate || '');
      return todoDate >= sprintStart && todoDate <= sprintEnd;
    });
    
    const completed = sprintTodos.filter(t => t.isDone).length;
    const velocity = completed;
    const quality = sprintTodos.length > 0 ? (completed / sprintTodos.length) * 100 : 0;
    
    sprints.push({
      sprint: `S${numberOfSprints - i}`,
      velocity,
      quality: Math.round(quality),
      planned: sprintTodos.length,
      completed
    });
  }
  
  return {
    sprints,
    averageVelocity: Math.round(sprints.reduce((acc, s) => acc + s.velocity, 0) / sprints.length),
    averageQuality: Math.round(sprints.reduce((acc, s) => acc + s.quality, 0) / sprints.length)
  };
};

const calculateCollaborationMetrics = (goals: Goal[], subgoals: Subgoal[], todos: Todo[]) => {
  const collaborativeKeywords = ['team', 'meeting', 'review', 'discuss', 'collaboration', 'shared'];
  
  const sharedGoals = goals.filter(g => 
    collaborativeKeywords.some(keyword => 
      g.name.toLowerCase().includes(keyword) || 
      (g.description && g.description.toLowerCase().includes(keyword))
    )
  );
  
  const collaborativeTodos = todos.filter(t => 
    collaborativeKeywords.some(keyword => 
      t.name.toLowerCase().includes(keyword) || 
      (t.description && t.description.toLowerCase().includes(keyword))
    )
  );
  
  const collaborationRate = todos.length > 0 ? (collaborativeTodos.length / todos.length) * 100 : 0;
  const teamEfficiency = collaborativeTodos.length > 0 ? 
    (collaborativeTodos.filter(t => t.isDone).length / collaborativeTodos.length) * 100 : 0;
  
  return {
    sharedGoalsCount: sharedGoals.length,
    individualGoalsCount: goals.length - sharedGoals.length,
    collaborativeTasks: collaborativeTodos.length,
    collaborationRate: Math.round(collaborationRate),
    teamEfficiency: Math.round(teamEfficiency)
  };
};

const calculateFocusTimeMetrics = (todos: Todo[], timeframe: string) => {
  const completedTodos = todos.filter(t => t.isDone);
  
  const focusTimes = completedTodos.map(todo => {
    if (!todo.startDate || !todo.endDate) return 0;
    const start = new Date(todo.startDate);
    const end = new Date(todo.endDate);
    return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60)); // Hours
  }).filter(time => time > 0 && time < 24); // Filter realistic work sessions
  
  if (focusTimes.length === 0) {
    return {
      averageFocusTime: 0,
      longestSession: 0,
      shortestSession: 0,
      deepWorkSessions: 0,
      deepWorkPercentage: 0,
      totalFocusTime: 0,
      sessionCount: 0
    };
  }
  
  const averageFocusTime = focusTimes.reduce((a, b) => a + b, 0) / focusTimes.length;
  const longestSession = Math.max(...focusTimes);
  const shortestSession = Math.min(...focusTimes);
  const deepWorkSessions = focusTimes.filter(time => time >= 2).length;
  const deepWorkPercentage = (deepWorkSessions / focusTimes.length) * 100;
  
  return {
    averageFocusTime: Math.round(averageFocusTime * 10) / 10,
    longestSession: Math.round(longestSession * 10) / 10,
    shortestSession: Math.round(shortestSession * 10) / 10,
    deepWorkSessions,
    deepWorkPercentage: Math.round(deepWorkPercentage),
    totalFocusTime: Math.round(focusTimes.reduce((a, b) => a + b, 0) * 10) / 10,
    sessionCount: focusTimes.length
  };
};

const analyzeDifficultyCorrelation = (todos: Todo[]) => {
  const priorityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
  const completedTodos = todos.filter(t => t.isDone);
  
  if (completedTodos.length === 0) {
    return { correlation: 0, insights: [], effectiveness: 0 };
  }
  
  const priorityStats = Object.entries(priorityMap).map(([priority, weight]) => {
    const priorityTodos = todos.filter(t => t.priority === priority);
    const completed = priorityTodos.filter(t => t.isDone);
    const completionRate = priorityTodos.length > 0 ? (completed.length / priorityTodos.length) * 100 : 0;
    
    return {
      priority,
      weight,
      total: priorityTodos.length,
      completed: completed.length,
      completionRate: Math.round(completionRate)
    };
  });
  
  const effectiveness = priorityStats.reduce((acc, stat) => {
    return acc + (stat.completionRate * stat.weight) / 3;
  }, 0) / priorityStats.length;
  
  return {
    correlation: Math.round(effectiveness),
    priorityStats,
    effectiveness: Math.round(effectiveness),
    insights: []
  };
};

const analyzeEnergyPatterns = (todos: Todo[]) => {
  const completedTodos = todos.filter(t => t.isDone && (t.endDate || t.startDate));
  
  const hourlyPatterns = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    completions: 0,
    productivity: 0
  }));
  
  completedTodos.forEach(todo => {
    const completionDate = new Date(todo.endDate || todo.startDate || '');
    const hour = completionDate.getHours();
    hourlyPatterns[hour].completions++;
    
    const priorityWeight = todo.priority === 'High' ? 3 : todo.priority === 'Medium' ? 2 : 1;
    hourlyPatterns[hour].productivity += priorityWeight;
  });
  
  const peakHour = hourlyPatterns.reduce((max, current) => 
    current.completions > max.completions ? current : max
  );
  
  return {
    hourlyPatterns,
    peakHour,
    lowEnergyHours: hourlyPatterns.filter(h => h.completions === 0).map(h => h.hour),
    morningProductivity: hourlyPatterns.slice(6, 12).reduce((acc, h) => acc + h.completions, 0),
    afternoonProductivity: hourlyPatterns.slice(12, 18).reduce((acc, h) => acc + h.completions, 0),
    eveningProductivity: hourlyPatterns.slice(18, 24).reduce((acc, h) => acc + h.completions, 0)
  };
};

const calculateGoalRiskAssessment = (goal: Goal, subgoals: Subgoal[], todos: Todo[]) => {
  if (!goal) return { riskLevel: 'low' as const, riskFactors: [], score: 0 };
  
  let riskScore = 0;
  const riskFactors = [];
  
  // Timeline risk (30% weight)
  if (goal.endDate) {
    const daysLeft = Math.ceil((new Date(goal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const totalTodos = todos.length;
    const completedTodos = todos.filter(t => t.isDone).length;
    const remainingTodos = totalTodos - completedTodos;
    
    if (daysLeft < remainingTodos && remainingTodos > 0) {
      riskScore += 30;
      riskFactors.push('Timeline pressure: More tasks than days remaining');
    }
    
    if (daysLeft < 0) {
      riskScore += 40;
      riskFactors.push('Goal is overdue');
    }
  }
  
  // Progress risk (25% weight)
  const progressRate = todos.length > 0 ? (todos.filter(t => t.isDone).length / todos.length) * 100 : 0;
  if (progressRate < 25) {
    riskScore += 25;
    riskFactors.push('Low progress rate (< 25%)');
  }
  
  // Activity risk (20% weight)
  const recentActivity = todos.filter(t => {
    const activityDate = new Date(t.endDate || t.startDate || '');
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    return activityDate >= threeDaysAgo;
  }).length;
  
  if (recentActivity === 0 && todos.length > 0) {
    riskScore += 20;
    riskFactors.push('No recent activity (last 3 days)');
  }
  
  // Complexity risk (15% weight)
  const highPriorityTasks = todos.filter(t => t.priority === 'High' && !t.isDone).length;
  if (highPriorityTasks > 3) {
    riskScore += 15;
    riskFactors.push('Many high-priority tasks remaining');
  }
  
  // Milestone risk (10% weight)
  const overdueSubgoals = subgoals.filter(sg => 
    sg.status.toLowerCase().includes('overdue') || 
    sg.status.toLowerCase().includes('delayed')
  ).length;
  
  if (overdueSubgoals > 0) {
    riskScore += 10;
    riskFactors.push(`${overdueSubgoals} milestone(s) behind schedule`);
  }
  
  const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';
  
  return {
    riskLevel,
    riskFactors,
    score: Math.min(riskScore, 100),
    recommendations: riskLevel === 'high' ? 
      ['Break down large tasks immediately', 'Review and adjust timeline', 'Remove blockers', 'Increase daily focus time'] :
      riskLevel === 'medium' ? 
      ['Monitor progress closely', 'Adjust schedule if needed', 'Focus on high-priority items'] :
      ['Maintain current momentum', 'Continue good practices']
  };
};

const calculateGoalComparison = (goals: Goal[], todos: Todo[]) => {
  const currentGoal = goals[0];
  if (!currentGoal) return [];
  
  const currentGoalTodos = todos.filter(t => t.goal_id === currentGoal.id);
  const currentCompletionRate = currentGoalTodos.length > 0 ? 
    (currentGoalTodos.filter(t => t.isDone).length / currentGoalTodos.length) * 100 : 0;
  
  // Simulate historical data for comparison
  const avgCompletionRate = 75; // Average from historical goals
  const avgVelocity = 8; // Average tasks per week
  const avgQuality = 85; // Average quality score
  
  const currentVelocity = currentGoalTodos.filter(t => t.isDone).length; // Simplified
  const currentQuality = currentCompletionRate; // Simplified
  
  return [
    { metric: 'Completion Rate', current: Math.round(currentCompletionRate), average: avgCompletionRate },
    { metric: 'Weekly Velocity', current: currentVelocity, average: avgVelocity },
    { metric: 'Quality Score', current: Math.round(currentQuality), average: avgQuality },
    { metric: 'Task Count', current: currentGoalTodos.length, average: 15 }
  ];
};

const calculateMilestoneAnalysis = (subgoals: Subgoal[], todos: Todo[]) => {
  const milestones = subgoals.map(subgoal => {
    const subgoalTodos = todos.filter(t => t.subgoal_id === subgoal.id);
    const completed = subgoalTodos.filter(t => t.isDone).length;
    const progress = subgoalTodos.length > 0 ? (completed / subgoalTodos.length) * 100 : 0;
    
    const status = progress === 100 ? 'completed' : 
                   progress > 50 ? 'in-progress' : 'not-started';
    
    return {
      name: subgoal.name,
      progress: Math.round(progress),
      status,
      totalTasks: subgoalTodos.length,
      completedTasks: completed
    };
  });
  
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = milestones.length;
  
  return {
    milestones,
    completedMilestones,
    totalMilestones,
    completionRate: totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0
  };
};

const calculateCurrentStreak = (completedTodos: Todo[]) => {
  if (completedTodos.length === 0) return 0;
  
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 365; i++) { // Check last year
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    
    const hasCompletion = completedTodos.some(todo => {
      if (!todo.endDate) return false;
      const todoDate = new Date(todo.endDate);
      return todoDate.toDateString() === checkDate.toDateString();
    });
    
    if (hasCompletion) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

const calculateLongestStreak = (completedTodos: Todo[]) => {
  if (completedTodos.length === 0) return 0;
  
  let maxStreak = 0;
  let currentStreak = 0;
  const today = new Date();
  
  for (let i = 365; i >= 0; i--) { // Check last year backwards
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    
    const hasCompletion = completedTodos.some(todo => {
      if (!todo.endDate) return false;
      const todoDate = new Date(todo.endDate);
      return todoDate.toDateString() === checkDate.toDateString();
    });
    
    if (hasCompletion) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return maxStreak;
};

export default EnhancedInsightsDashboard;
