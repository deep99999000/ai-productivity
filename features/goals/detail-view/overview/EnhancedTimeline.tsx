"use client";

import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 

  Target,
  TrendingUp,
  Activity
} from "lucide-react";
import type { Goal } from "@/features/goals/types/goalSchema";
import type { Subgoal } from "@/features/subGoals/subGoalschema";
import type { Todo } from "@/features/todo/todoSchema";

interface TimelineEvent {
  id: string;
  type: 'milestone' | 'task' | 'deadline' | 'achievement';
  date: Date;
  title: string;
  description?: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'overdue';
  relatedId?: number;
  priority?: 'high' | 'medium' | 'low';
}

interface EnhancedTimelineProps {
  goal: Goal;
  subgoals: Subgoal[];
  todos: Todo[];
}

const EnhancedTimeline: React.FC<EnhancedTimelineProps> = ({ goal, subgoals, todos }) => {
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];
    const now = new Date();

    // Add goal deadline
    if (goal.endDate) {
      events.push({
        id: `goal-deadline-${goal.id}`,
        type: 'deadline',
        date: new Date(goal.endDate),
        title: `Goal Deadline: ${goal.name}`,
        status: new Date(goal.endDate) < now ? 'overdue' : 'upcoming',
        relatedId: goal.id
      });
    }

    // Add subgoal milestones
    subgoals.forEach(subgoal => {
      if (subgoal.endDate) {
        const subgoalTodos = todos.filter(t => t.subgoal_id === subgoal.id);
        const completedTodos = subgoalTodos.filter(t => t.isDone);
        const isCompleted = completedTodos.length === subgoalTodos.length && subgoalTodos.length > 0;
        
        events.push({
          id: `subgoal-${subgoal.id}`,
          type: 'milestone',
          date: new Date(subgoal.endDate),
          title: subgoal.name,
          description: subgoal.description || undefined,
          status: isCompleted ? 'completed' : new Date(subgoal.endDate) < now ? 'overdue' : 'upcoming',
          relatedId: subgoal.id
        });
      }
    });

    // Add important task deadlines
    todos
      .filter(todo => todo.endDate && (todo.priority === 'high' || !todo.isDone))
      .forEach(todo => {
        events.push({
          id: `task-${todo.id}`,
          type: 'task',
          date: new Date(todo.endDate!),
          title: todo.name,
          description: todo.description || undefined,
          status: todo.isDone ? 'completed' : new Date(todo.endDate!) < now ? 'overdue' : 'upcoming',
          relatedId: todo.id,
          priority: todo.priority as 'high' | 'medium' | 'low'
        });
      });

    // Add completed achievements
    todos
      .filter(todo => todo.isDone && todo.endDate)
      .slice(0, 5) // Limit to recent achievements
      .forEach(todo => {
        events.push({
          id: `achievement-${todo.id}`,
          type: 'achievement',
          date: new Date(todo.endDate!),
          title: `Completed: ${todo.name}`,
          status: 'completed',
          relatedId: todo.id
        });
      });

    // Sort by date
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [goal, subgoals, todos]);

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'milestone':
        return <Target className="w-5 h-5" />;
      case 'task':
        return <Activity className="w-5 h-5" />;
      case 'deadline':
        return <Calendar className="w-5 h-5" />;
      case 'achievement':
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getEventColor = (event: TimelineEvent) => {
    switch (event.status) {
      case 'completed':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'overdue':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'upcoming':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusBadge = (event: TimelineEvent) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      upcoming: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={`${colors[event.status]} text-xs`}>
        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Calculate progress statistics
  const progressStats = useMemo(() => {
    const totalEvents = timelineEvents.length;
    const completedEvents = timelineEvents.filter(e => e.status === 'completed').length;
    const overdueEvents = timelineEvents.filter(e => e.status === 'overdue').length;
    const upcomingEvents = timelineEvents.filter(e => e.status === 'upcoming').length;

    return {
      totalEvents,
      completedEvents,
      overdueEvents,
      upcomingEvents,
      completionRate: totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0
    };
  }, [timelineEvents]);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header with Progress Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
               Progress Timeline
            </h3>
            <Badge className="bg-indigo-100 text-indigo-800 px-3 py-1">
              {progressStats.completionRate}% Complete
            </Badge>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">{progressStats.completedEvents}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">{progressStats.upcomingEvents}</div>
              <div className="text-xs text-gray-600">Upcoming</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-600">{progressStats.overdueEvents}</div>
              <div className="text-xs text-gray-600">Overdue</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-600">{progressStats.totalEvents}</div>
              <div className="text-xs text-gray-600">Total Events</div>
            </div>
          </div>

          <Progress value={progressStats.completionRate} className="h-2" />
        </div>

        {/* Timeline Events */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {timelineEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No timeline events found. Add milestones and tasks to see your progress timeline.</p>
            </div>
          ) : (
            timelineEvents.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline Line */}
                {index < timelineEvents.length - 1 && (
                  <div className="absolute left-6 top-12 w-px h-8 bg-gradient-to-b from-gray-300 to-transparent" />
                )}
                
                {/* Event Card */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  {/* Event Icon */}
                  <div className={`p-2 rounded-full border-2 ${getEventColor(event)}`}>
                    {getEventIcon(event)}
                  </div>
                  
                  {/* Event Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900 truncate">{event.title}</h4>
                          {getStatusBadge(event)}
                          {event.priority === 'high' && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              High Priority
                            </Badge>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                      
                      {/* Date */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(event.date)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {event.date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Insights Footer */}
        {progressStats.overdueEvents > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Attention Needed</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              You have {progressStats.overdueEvents} overdue item{progressStats.overdueEvents !== 1 ? 's' : ''}. 
              Consider reviewing and adjusting deadlines or priorities.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EnhancedTimeline;
